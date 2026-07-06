// Draft room state machine: snake order, per-pick timer, sleep-break windows,
// auto-pick from queue, and bots that fill empty seats.
import crypto from 'crypto';
import { allItems, TIER_NAMES } from './foods.js';

const DEFAULT_SETTINGS = {
  teams: 10,
  rounds: 7,
  pickSeconds: 60,
  poolSize: 0, // 0 => auto: teams*(rounds+1). All foods available every round.
  breakEnabled: false,
  breakStart: '21:00', // pause the clock overnight (server local time)
  breakEnd: '09:00',
};

const BOT_NAMES = [
  'Sir Eats-a-lot', 'The Gullet', 'Chunder Bot', 'Ralph', 'Gastro',
  'Ironstomach', 'Bottomless', 'Gurgle', 'Chowhound', 'Trashcan Sam',
  'Le Chomp', 'Voidmaw',
];

function distribute(total, buckets) {
  const base = Math.floor(total / buckets);
  const rem = total % buckets;
  return Array.from({ length: buckets }, (_, i) => base + (i < rem ? 1 : 0));
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Is `date` inside the [start,end) break window? Handles overnight windows.
function inBreak(date, startHM, endHM) {
  const [sh, sm] = startHM.split(':').map(Number);
  const [eh, em] = endHM.split(':').map(Number);
  const mins = date.getHours() * 60 + date.getMinutes();
  const s = sh * 60 + sm;
  const e = eh * 60 + em;
  if (s === e) return false;
  if (s < e) return mins >= s && mins < e; // same-day window
  return mins >= s || mins < e; // overnight window
}

// Next Date at which the break ends, from `date`.
function breakEndAt(date, endHM) {
  const [eh, em] = endHM.split(':').map(Number);
  const d = new Date(date);
  d.setSeconds(0, 0);
  d.setHours(eh, em, 0, 0);
  if (d <= date) d.setDate(d.getDate() + 1);
  return d;
}

export class Room {
  constructor({ code, name, ownerId, isMock, settings, emit, onDone }) {
    this.code = code;
    this.name = name || (isMock ? 'Mock Draft' : 'FoodDraft League');
    this.ownerId = ownerId;
    this.isMock = !!isMock;
    this.settings = { ...DEFAULT_SETTINGS, ...(settings || {}) };
    this.emit = emit; // (state) => void
    this.onDone = onDone; // (resultSnapshot) => void — persist completed non-mock drafts
    this.completedAt = null;
    this.members = []; // {id, username, isBot, connected, seat}
    this.seatMap = Array(this.settings.teams).fill(null); // seat -> human memberId | null
    this.status = 'lobby'; // lobby | active | paused | break | done
    this.order = []; // seat index per overall pick
    this.board = []; // flat pool: [item{..., taken, takenBySeat}]
    this.picks = []; // {overall, round, pickInRound, seat, item}
    this.currentOverall = 0;
    this.deadline = null;
    this.queues = {}; // memberId -> [itemId]
    this.autopick = {}; // memberId -> bool
    this.chat = [];
    this.timer = null;
  }

  // ---- membership ---------------------------------------------------------
  addHuman(userId, username) {
    let m = this.members.find((x) => x.id === userId);
    if (m) {
      m.connected = true;
      return m;
    }
    if (this.status === 'lobby' && this.humanCount() < this.settings.teams) {
      m = { id: userId, username, isBot: false, connected: true, seat: null };
      this.members.push(m);
      this.queues[userId] = this.queues[userId] || [];
      // place in first open seat slot
      const idx = this.seatMap.indexOf(null);
      if (idx >= 0) this.seatMap[idx] = userId;
    }
    return m; // may be undefined if full/started
  }

  // Resize/repair seatMap to length `teams`, preserving each human's chosen slot.
  resizeSeatMap() {
    const t = this.settings.teams;
    const next = Array(t).fill(null);
    // keep humans in place where their slot still exists
    for (let i = 0; i < Math.min(t, this.seatMap.length); i++) {
      const id = this.seatMap[i];
      if (id && this.members.find((m) => m.id === id && !m.isBot)) next[i] = id;
    }
    // any human without a slot (new joiner / trimmed off the end) -> first open slot
    const placed = new Set(next.filter(Boolean));
    const orphans = this.members.filter((m) => !m.isBot && !placed.has(m.id)).map((m) => m.id);
    for (const id of orphans) {
      const idx = next.indexOf(null);
      if (idx >= 0) next[idx] = id;
    }
    this.seatMap = next;
  }

  // Owner drag-and-drop reorder of the draft order (pre-draft only).
  setSeatOrder(userId, arr) {
    if (!this.isOwner(userId) || this.status !== 'lobby') return;
    if (!Array.isArray(arr) || arr.length !== this.settings.teams) return;
    const humanIds = this.members.filter((m) => !m.isBot).map((m) => m.id).sort().join(',');
    const provided = arr.filter(Boolean).slice().sort().join(',');
    if (humanIds !== provided) return; // must be exactly the current humans
    this.seatMap = arr.slice();
    this.emitState();
  }

  markDisconnected(userId) {
    const m = this.members.find((x) => x.id === userId);
    if (m) m.connected = false;
  }

  humanCount() {
    return this.members.filter((m) => !m.isBot).length;
  }

  seatMember(seat) {
    return this.members.find((m) => m.seat === seat);
  }

  isOwner(userId) {
    return userId === this.ownerId;
  }

  // ---- settings -----------------------------------------------------------
  updateSettings(patch) {
    if (this.status !== 'lobby') return;
    this.settings = { ...this.settings, ...patch };
    // clamp
    this.settings.teams = Math.max(2, Math.min(16, this.settings.teams | 0));
    this.settings.rounds = Math.max(1, Math.min(20, this.settings.rounds | 0));
    // No real upper limit: 1 second → 100 days. (Timer is chunked so long clocks work.)
    this.settings.pickSeconds = Math.max(1, Math.min(8640000, this.settings.pickSeconds | 0));
    this.settings.poolSize = Math.max(0, Math.min(500, this.settings.poolSize | 0));
    this.resizeSeatMap();
  }

  // ---- lifecycle ----------------------------------------------------------
  start(byUserId) {
    if (!this.isOwner(byUserId) || this.status !== 'lobby') return;
    const { teams, rounds } = this.settings;

    // Seat by the host-set order (seatMap); autofill empty slots with bots.
    this.resizeSeatMap();
    const newMembers = [];
    let botIdx = 0;
    for (let seat = 0; seat < teams; seat++) {
      const id = this.seatMap[seat];
      const human = id && this.members.find((m) => m.id === id && !m.isBot);
      if (human) {
        human.seat = seat;
        newMembers.push(human);
      } else {
        const botId = 'bot-' + crypto.randomUUID();
        newMembers.push({
          id: botId, username: BOT_NAMES[botIdx % BOT_NAMES.length] || `Auto ${seat + 1}`,
          isBot: true, connected: true, seat,
        });
        this.autopick[botId] = true;
        botIdx++;
      }
    }
    this.members = newMembers;

    // Build snake order.
    this.order = [];
    for (let r = 0; r < rounds; r++) {
      const seats = Array.from({ length: teams }, (_, s) => s);
      if (r % 2 === 1) seats.reverse();
      this.order.push(...seats);
    }

    // One flat pool of foods, sampled from ALL tiers. Available on every pick.
    const all = allItems();
    const target = this.settings.poolSize > 0 ? this.settings.poolSize : teams * (rounds + 1);
    const n = Math.min(all.length, Math.max(target, teams * rounds)); // enough to finish
    this.board = shuffle(all).slice(0, n).map((it) => ({ ...it, taken: false, takenBySeat: null }));

    this.status = 'active';
    this.currentOverall = 0;
    this.scheduleNext();
  }

  pause(byUserId) {
    if (!this.isOwner(byUserId)) return;
    if (this.status !== 'active') return;
    clearTimeout(this.timer);
    this.timer = null;
    this.deadline = null;
    this.status = 'paused';
    this.emitState();
  }

  resume(byUserId) {
    if (!this.isOwner(byUserId)) return;
    if (this.status !== 'paused') return;
    this.status = 'active';
    this.scheduleNext();
  }

  finish() {
    clearTimeout(this.timer);
    this.timer = null;
    this.deadline = null;
    this.status = 'done';
    this.completedAt = this.completedAt || Date.now();
    // Persist results for real leagues so they can be viewed later.
    if (!this.isMock && typeof this.onDone === 'function') {
      this.onDone({
        completedAt: this.completedAt,
        settings: this.settings,
        members: this.members,
        picks: this.picks,
        order: this.order,
      });
    }
    this.emitState();
  }

  // Rehydrate a completed draft from a saved snapshot (e.g. after a server restart).
  loadResult(r) {
    this.status = 'done';
    this.completedAt = r.completedAt || Date.now();
    this.settings = { ...this.settings, ...(r.settings || {}) };
    this.members = r.members || [];
    this.picks = r.picks || [];
    this.order = r.order || [];
    this.currentOverall = this.order.length;
    this.board = [];
  }

  // ---- the clock ----------------------------------------------------------
  // setTimeout overflows past ~24.8 days (2^31 ms) and fires instantly. This
  // chunks long delays so multi-hour (or multi-day) pick clocks work correctly.
  armTimer(delayMs, cb) {
    clearTimeout(this.timer);
    const MAX = 2_000_000_000; // < 2^31 ms
    const tick = (remaining) => {
      if (remaining > MAX) this.timer = setTimeout(() => tick(remaining - MAX), MAX);
      else this.timer = setTimeout(cb, Math.max(0, remaining));
    };
    tick(delayMs);
  }

  scheduleNext() {
    clearTimeout(this.timer);
    this.timer = null;
    if (this.currentOverall >= this.order.length) return this.finish();

    // Overnight break: freeze the clock.
    const now = new Date();
    if (this.settings.breakEnabled && inBreak(now, this.settings.breakStart, this.settings.breakEnd)) {
      this.status = 'break';
      this.deadline = null;
      const resumeAt = breakEndAt(now, this.settings.breakEnd);
      this.armTimer(Math.max(1000, resumeAt - now), () => {
        if (this.status === 'break') {
          this.status = 'active';
          this.scheduleNext();
        }
      });
      this.emitState();
      return;
    }

    this.status = 'active';
    const seat = this.order[this.currentOverall];
    const member = this.seatMember(seat);
    const auto = member && (member.isBot || this.autopick[member.id]);
    const delayMs = auto
      ? (member.isBot ? 1200 + Math.random() * 1600 : 800)
      : this.settings.pickSeconds * 1000;
    this.deadline = Date.now() + delayMs;
    this.armTimer(delayMs, () => this.autoPick(seat));
    this.emitState();
  }

  // ---- picking ------------------------------------------------------------
  round() {
    return Math.floor(this.currentOverall / this.settings.teams);
  }

  available() {
    return this.board.filter((it) => !it.taken);
  }

  pickByUser(userId, itemId) {
    if (this.status !== 'active') return;
    const seat = this.order[this.currentOverall];
    const member = this.seatMember(seat);
    if (!member || member.id !== userId) return; // not your turn
    this.commitPick(seat, itemId);
  }

  autoPick(seat) {
    const member = this.seatMember(seat);
    let itemId = null;
    // 1) first queued item still available
    const q = (member && this.queues[member.id]) || [];
    const avail = this.available();
    const availIds = new Set(avail.map((it) => it.id));
    for (const id of q) {
      if (availIds.has(id)) { itemId = id; break; }
    }
    // 2) otherwise pick from the top of the board (best tier first), usually the
    //    very top item with a little randomness among the next few.
    if (!itemId && avail.length) {
      const idIndex = (id) => parseInt(String(id).split('-')[1], 10) || 0;
      const sorted = avail.slice().sort((a, b) => a.tier - b.tier || idIndex(a.id) - idIndex(b.id));
      const r = Math.random();
      const pickIdx = r < 0.7 ? 0 : r < 0.9 ? 1 : 2; // 70% top, 20% 2nd, 10% 3rd
      itemId = sorted[Math.min(pickIdx, sorted.length - 1)].id;
    }
    if (itemId) this.commitPick(seat, itemId);
    else { this.currentOverall++; this.scheduleNext(); } // nothing left (shouldn't happen)
  }

  commitPick(seat, itemId) {
    const r = this.round();
    const item = this.board.find((it) => it.id === itemId && !it.taken);
    if (!item) return;
    item.taken = true;
    item.takenBySeat = seat;
    const pickInRound = (this.currentOverall % this.settings.teams) + 1;
    this.picks.push({
      overall: this.currentOverall + 1,
      round: r,
      pickInRound,
      label: `${r + 1}.${pickInRound}`,
      seat,
      item: { id: item.id, name: item.name, qty: item.qty, type: item.type, tier: item.tier },
    });
    // remove from everyone's queue
    for (const uid of Object.keys(this.queues)) {
      this.queues[uid] = this.queues[uid].filter((x) => x !== itemId);
    }
    this.currentOverall++;
    clearTimeout(this.timer);
    this.scheduleNext();
  }

  setQueue(userId, ids) {
    this.queues[userId] = Array.isArray(ids) ? ids.slice(0, 100) : [];
    this.emitState();
  }

  setAutopick(userId, on) {
    this.autopick[userId] = !!on;
    // If it just became this user's turn with autopick on, honor it fast.
    if (this.status === 'active') {
      const seat = this.order[this.currentOverall];
      const member = this.seatMember(seat);
      if (on && member && member.id === userId) {
        clearTimeout(this.timer);
        this.deadline = Date.now() + 600;
        this.timer = setTimeout(() => this.autoPick(seat), 600);
      }
    }
    this.emitState();
  }

  addChat(username, text) {
    const msg = { id: crypto.randomUUID(), username, text: String(text).slice(0, 500), ts: Date.now() };
    this.chat.push(msg);
    if (this.chat.length > 200) this.chat.shift();
    this.emit({ type: 'chat', message: msg });
  }

  // ---- serialization ------------------------------------------------------
  emitState() {
    this.emit({ type: 'state', state: this.publicState() });
  }

  publicState() {
    const seat = this.status !== 'lobby' ? this.order[this.currentOverall] : null;
    const currentMember = seat != null ? this.seatMember(seat) : null;
    return {
      code: this.code,
      name: this.name,
      isMock: this.isMock,
      ownerId: this.ownerId,
      status: this.status,
      settings: this.settings,
      tierNames: TIER_NAMES,
      members: this.members.map((m) => ({
        id: m.id, username: m.username, isBot: m.isBot, connected: m.connected, seat: m.seat,
      })),
      seatMap: this.seatMap,
      order: this.order,
      board: this.board,
      poolRemaining: this.available().length,
      picks: this.picks,
      currentOverall: this.currentOverall,
      currentSeat: seat,
      currentMemberId: currentMember ? currentMember.id : null,
      round: this.status !== 'lobby' ? this.round() : 0,
      totalPicks: this.order.length,
      completedAt: this.completedAt,
      deadline: this.deadline,
      serverNow: Date.now(),
      queues: this.queues,
      autopick: this.autopick,
      chat: this.chat,
    };
  }
}

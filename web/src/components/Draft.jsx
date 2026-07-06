import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getSocket } from '../socket.js';

const TEAM_COLORS = [
  '#6fbf8e', '#6fb0e0', '#e08a9e', '#e0b07a', '#8f9be0', '#69c3c0',
  '#d98c6a', '#b98fe0', '#9ec46f', '#e0d06a', '#6fc9e0', '#e07a7a',
  '#7ad0a8', '#c78fb8', '#8fb8c7', '#d0a0e0',
];
const colorFor = (seat) => TEAM_COLORS[((seat ?? 0) % TEAM_COLORS.length + TEAM_COLORS.length) % TEAM_COLORS.length];
const typeEmoji = (t) => (t === 'volume' ? '🍔' : '🤢');

function fmt(ms) {
  if (ms == null || ms < 0) ms = 0;
  const s = Math.ceil(ms / 1000);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

// Human label for a clock length in seconds, e.g. "2 hr", "30 min", "45s".
function fmtDuration(sec) {
  if (sec % 3600 === 0) return `${sec / 3600} hr`;
  if (sec % 60 === 0) return `${sec / 60} min`;
  return `${sec}s`;
}

const DUR_UNITS = { seconds: 1, minutes: 60, hours: 3600 };
function deriveDuration(sec) {
  if (sec && sec % 3600 === 0) return { amt: sec / 3600, unit: 'hours' };
  if (sec && sec % 60 === 0) return { amt: sec / 60, unit: 'minutes' };
  return { amt: sec || 1, unit: 'seconds' };
}

export default function Draft({ code, me, onLeave }) {
  const [state, setState] = useState(null);
  const [err, setErr] = useState('');
  const [now, setNow] = useState(Date.now());
  const [tab, setTab] = useState('queue');
  const [search, setSearch] = useState('');
  const [showDrafted, setShowDrafted] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  const [chatText, setChatText] = useState('');
  const [dragIdx, setDragIdx] = useState(null);
  const sock = useRef(null);

  useEffect(() => {
    const s = getSocket();
    sock.current = s;
    const onState = (st) => setState(st);
    const onErr = (m) => setErr(m);
    const onChat = (msg) => setState((p) => (p ? { ...p, chat: [...(p.chat || []), msg] } : p));
    s.on('state', onState);
    s.on('errorMsg', onErr);
    s.on('chat', onChat);
    s.emit('room:join', { code });
    return () => { s.off('state', onState); s.off('errorMsg', onErr); s.off('chat', onChat); };
  }, [code]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, []);

  const emit = (ev, payload) => sock.current && sock.current.emit(ev, payload);

  // ---- derived ----
  const isOwner = state && state.ownerId === me.id;
  const mySeat = state ? (state.members.find((m) => m.id === me.id)?.seat ?? null) : null;
  const myTurn = state && state.status === 'active' && state.currentMemberId === me.id;
  const myQueue = (state?.queues?.[me.id]) || [];
  const myAuto = !!state?.autopick?.[me.id];

  const itemsById = useMemo(() => {
    const map = new Map();
    if (Array.isArray(state?.board)) for (const it of state.board) map.set(it.id, it);
    return map;
  }, [state?.board]);

  if (!state) {
    return <div className="loading">Connecting to draft <b>{code}</b>… {err && <span className="err">{err}</span>}</div>;
  }

  const { settings, status, members, picks } = state;
  const teams = settings.teams;
  const remaining = state.deadline ? state.deadline - now : null;

  // ---- actions ----
  const start = () => emit('draft:start');
  const pause = () => emit('draft:pause');
  const resume = () => emit('draft:resume');
  const pick = (itemId) => myTurn && emit('pick', { itemId });
  const toggleAuto = () => emit('autopick:set', { on: !myAuto });
  const setQueue = (ids) => emit('queue:update', { ids });
  const addToQueue = (id) => { if (!myQueue.includes(id)) setQueue([...myQueue, id]); };
  const removeFromQueue = (id) => setQueue(myQueue.filter((x) => x !== id));
  const moveQueue = (id, dir) => {
    const i = myQueue.indexOf(id); const j = i + dir;
    if (i < 0 || j < 0 || j >= myQueue.length) return;
    const q = myQueue.slice(); [q[i], q[j]] = [q[j], q[i]]; setQueue(q);
  };
  const sendChat = (e) => { e.preventDefault(); if (chatText.trim()) { emit('chat:send', { text: chatText }); setChatText(''); } };

  // ---- lobby view ----
  if (status === 'lobby') {
    return (
      <div className="room">
        <TopBar {...{ state, code, onLeave, isOwner, start, pause, resume, showSettings, setShowSettings, remaining, myTurn }} />
        <div className="lobby-room">
          <div className="panel wide">
            <h2>{state.name} {state.isMock && <span className="pill">MOCK</span>}</h2>
            <p className="muted">Share this code so friends can join:</p>
            <div className="code-badge" onClick={() => navigator.clipboard?.writeText(code)} title="Click to copy">{code} ⧉</div>
            <h3>Draft order ({members.filter((m) => !m.isBot).length}/{teams})</h3>
            {isOwner && <p className="muted small">Drag to reorder the draft. Empty slots fill with bots on start.</p>}
            <div className="seat-grid">
              {(state.seatMap || Array(teams).fill(null)).map((mid, i) => {
                const m = mid ? members.find((x) => x.id === mid) : null;
                const dragProps = isOwner ? {
                  draggable: true,
                  onDragStart: () => setDragIdx(i),
                  onDragOver: (e) => e.preventDefault(),
                  onDrop: () => {
                    if (dragIdx == null || dragIdx === i) return;
                    const arr = (state.seatMap || []).slice();
                    const [moved] = arr.splice(dragIdx, 1);
                    arr.splice(i, 0, moved);
                    emit('order:set', { order: arr });
                    setDragIdx(null);
                  },
                  onDragEnd: () => setDragIdx(null),
                } : {};
                return (
                  <div key={i} className={'seat-chip' + (isOwner ? ' draggable' : '') + (dragIdx === i ? ' dragging' : '')}
                    style={{ borderColor: m ? colorFor(i) : '#2a3140' }} {...dragProps}>
                    <span className="seat-num">{i + 1}</span>
                    <span className="avatar" style={{ background: m ? colorFor(i) : '#232a37' }}>{m ? m.username[0].toUpperCase() : '+'}</span>
                    <span className="seat-label">{m ? m.username : <em className="muted">open → bot</em>}</span>
                    {isOwner && <span className="grip">⣿</span>}
                  </div>
                );
              })}
            </div>
            <p className="muted small">Empty seats are auto-filled with auto-pickers when the draft starts.</p>
            {isOwner ? (
              <button className="btn primary lg" onClick={start}>Start draft</button>
            ) : (
              <p className="muted">Waiting for the room owner to start…</p>
            )}
          </div>
          <SettingsSummary settings={settings} tierNames={state.tierNames} />
        </div>
        {showSettings && <SettingsModal {...{ settings, onClose: () => setShowSettings(false), onSave: (s) => { emit('settings:update', { settings: s }); setShowSettings(false); } }} />}
      </div>
    );
  }

  // ---- active/paused/break/done view ----
  const poolItems = (Array.isArray(state.board) ? state.board : [])
    .filter((it) => showDrafted || !it.taken)
    .filter((it) => typeFilter === 'all' || it.type === typeFilter)
    .filter((it) => it.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.tier - b.tier || (a.ord ?? 0) - (b.ord ?? 0)); // best tier → worst tier

  return (
    <div className="room">
      <TopBar {...{ state, code, onLeave, isOwner, start, pause, resume, showSettings, setShowSettings, remaining, myTurn }} />

      {/* Board */}
      <div className="board-scroll">
        <div className="board" style={{ '--cols': teams }}>
          {/* header row */}
          {Array.from({ length: teams }).map((_, col) => {
            const m = members.find((x) => x.seat === col);
            const onClock = state.currentSeat === col && status === 'active';
            return (
              <div key={'h' + col} className={onClock ? 'team-head clock' : 'team-head'}>
                <span className="avatar sm" style={{ background: m ? colorFor(col) : '#232a37' }}>
                  {m?.isBot ? '🤖' : (m ? m.username[0].toUpperCase() : '')}
                </span>
                <span className="team-name">{m ? m.username : `Team ${col + 1}`}</span>
                {m && !m.isBot && <span className={m.connected ? 'dot on' : 'dot'} />}
              </div>
            );
          })}
          {/* pick cells */}
          {Array.from({ length: settings.rounds }).map((_, r) =>
            Array.from({ length: teams }).map((_, col) => {
              const pickInRound = r % 2 === 0 ? col + 1 : teams - col;
              const label = `${r + 1}.${pickInRound}`;
              const p = picks.find((x) => x.round === r && x.seat === col);
              const onClock = status === 'active' && state.round === r && state.currentSeat === col;
              const isMine = col === mySeat;
              if (p) {
                return (
                  <div key={r + '-' + col} className="cell filled" style={{ background: colorFor(col) }}>
                    <div className="cell-top"><span className="cell-food">{p.item.name}</span><span className="cell-num">{label}</span></div>
                    <div className="cell-sub">{typeEmoji(p.item.type)} {p.item.qty}</div>
                  </div>
                );
              }
              return (
                <div key={r + '-' + col} className={'cell empty' + (onClock ? ' clock' : '') + (isMine ? ' mine' : '')}>
                  <div className="cell-top"><span className="cell-num">{label}</span></div>
                  {onClock && <div className="cell-sub clocklabel">On the clock</div>}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom: food pool + right panel */}
      <div className="bottom">
        <div className="pool">
          <div className="pool-head">
            <input className="inp search" placeholder="Search food…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <div className="type-tabs">
              {[['all', 'All'], ['volume', '🍔 Volume'], ['content', '🤢 Content']].map(([v, l]) => (
                <button key={v} className={typeFilter === v ? 'ttab on' : 'ttab'} onClick={() => setTypeFilter(v)}>{l}</button>
              ))}
            </div>
            <span className="pool-count muted small">{state.poolRemaining} left</span>
            <label className="chk"><input type="checkbox" checked={showDrafted} onChange={(e) => setShowDrafted(e.target.checked)} /> Show drafted</label>
          </div>
          <div className="pool-list">
            <div className="pool-row head">
              <span className="c-add" /><span className="c-food">FOOD</span><span className="c-qty">QTY</span><span className="c-type">TYPE</span><span className="c-act" />
            </div>
            {poolItems.map((it) => (
              <div key={it.id} className={'pool-row' + (it.taken ? ' taken' : '')}>
                <button className="c-add mini" title="Add to queue" disabled={it.taken} onClick={() => addToQueue(it.id)}>＋</button>
                <span className="c-food">{it.name}</span>
                <span className="c-qty">{it.qty}</span>
                <span className="c-type"><span className={it.type === 'volume' ? 'badge v' : 'badge c'}>{typeEmoji(it.type)} {it.type === 'volume' ? 'Volume' : 'Content'}</span></span>
                <span className="c-act">
                  {it.taken ? <span className="muted small">drafted</span>
                    : <button className="btn primary sm" disabled={!myTurn} onClick={() => pick(it.id)}>Draft</button>}
                </span>
              </div>
            ))}
            {poolItems.length === 0 && <div className="empty-pool">No foods match.</div>}
          </div>
        </div>

        <div className="side">
          <div className="side-tabs">
            {['queue', 'roster', 'chat'].map((t) => (
              <button key={t} className={tab === t ? 'stab on' : 'stab'} onClick={() => setTab(t)}>{t.toUpperCase()}</button>
            ))}
            <label className="auto-toggle">
              AUTO-PICK
              <input type="checkbox" checked={myAuto} onChange={toggleAuto} />
              <span className="switch" />
            </label>
          </div>

          {tab === 'queue' && (
            <div className="side-body">
              {myQueue.length === 0 && <div className="side-empty">No foods in your queue.<br /><span className="muted small">Add from the list with ＋</span></div>}
              {myQueue.map((id) => {
                const it = itemsById.get(id);
                if (!it) return null;
                return (
                  <div key={id} className="q-row">
                    <span className="q-name">{typeEmoji(it.type)} {it.name} <span className="muted small">{it.qty}</span></span>
                    <span className="q-actions">
                      <button className="mini" onClick={() => moveQueue(id, -1)}>▲</button>
                      <button className="mini" onClick={() => moveQueue(id, 1)}>▼</button>
                      <button className="mini x" onClick={() => removeFromQueue(id)}>✕</button>
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'roster' && (
            <div className="side-body">
              {picks.filter((p) => p.seat === mySeat).length === 0 && <div className="side-empty">You haven't drafted anything yet.</div>}
              {picks.filter((p) => p.seat === mySeat).map((p) => (
                <div key={p.overall} className="q-row">
                  <span className="q-name">{typeEmoji(p.item.type)} {p.item.name} <span className="muted small">{p.item.qty}</span></span>
                  <span className="muted small">{p.label}</span>
                </div>
              ))}
            </div>
          )}

          {tab === 'chat' && (
            <div className="side-body chat">
              <div className="chat-msgs">
                {(state.chat || []).map((m) => (
                  <div key={m.id} className="chat-msg"><b style={{ color: '#9fb4d6' }}>{m.username}:</b> {m.text}</div>
                ))}
              </div>
              <form onSubmit={sendChat} className="chat-form">
                <input className="inp" placeholder="Message…" value={chatText} onChange={(e) => setChatText(e.target.value)} />
              </form>
            </div>
          )}
        </div>
      </div>

      {showSettings && <SettingsModal {...{ settings, onClose: () => setShowSettings(false), onSave: (s) => { emit('settings:update', { settings: s }); setShowSettings(false); } }} />}
    </div>
  );
}

function TopBar({ state, code, onLeave, isOwner, start, pause, resume, showSettings, setShowSettings, remaining, myTurn }) {
  const status = state.status;
  const statusLabel = { lobby: 'Lobby', active: 'Drafting', paused: 'Paused', break: 'Break (clock frozen)', done: 'Complete' }[status];
  const onClockName = state.currentMemberId ? state.members.find((m) => m.id === state.currentMemberId)?.username : null;
  return (
    <div className="topbar">
      <div className="tb-left">
        <button className="btn ghost sm" onClick={onLeave}>← Leave</button>
        <span className="tb-name">{state.name}</span>
        <span className="code-badge sm" onClick={() => navigator.clipboard?.writeText(code)} title="Copy code">{code}</span>
      </div>
      <div className="tb-center">
        <span className={'status-pill ' + status}>{statusLabel}</span>
        {status === 'active' && onClockName && (
          <span className="clock-info">
            <b className={myTurn ? 'you-turn' : ''}>{myTurn ? 'YOUR PICK' : onClockName}</b>
            {remaining != null && <span className="timer">{fmt(remaining)}</span>}
          </span>
        )}
        {(status === 'active' || status === 'paused' || status === 'break') && <span className="muted small">Round {state.round + 1} / {state.settings.rounds}</span>}
        {status === 'done' && state.completedAt && <span className="muted small">Completed {new Date(state.completedAt).toLocaleString()}</span>}
      </div>
      <div className="tb-right">
        {isOwner && status === 'lobby' && <button className="btn ghost sm" onClick={() => setShowSettings(true)}>⚙ Settings</button>}
        {isOwner && status === 'lobby' && <button className="btn primary sm" onClick={start}>Start</button>}
        {isOwner && status === 'active' && <button className="btn warn sm" onClick={pause}>Pause</button>}
        {isOwner && status === 'paused' && <button className="btn primary sm" onClick={resume}>Resume</button>}
      </div>
    </div>
  );
}

function SettingsSummary({ settings, tierNames }) {
  return (
    <div className="panel">
      <h3>Draft settings</h3>
      <ul className="kv">
        <li><span>Teams</span><b>{settings.teams}</b></li>
        <li><span>Rounds</span><b>{settings.rounds}</b></li>
        <li><span>Pick clock</span><b>{fmtDuration(settings.pickSeconds)}</b></li>
        <li><span>Food pool size</span><b>{settings.poolSize > 0 ? settings.poolSize : `auto (${settings.teams * (settings.rounds + 1)})`}</b></li>
        <li><span>Sleep break</span><b>{settings.breakEnabled ? `${settings.breakStart}–${settings.breakEnd}` : 'off'}</b></li>
      </ul>
      <div className="muted small">Tiers: {tierNames.join(' → ')}</div>
    </div>
  );
}

function SettingsModal({ settings, onClose, onSave }) {
  const [s, setS] = useState({ ...settings });
  const upd = (k, v) => setS((p) => ({ ...p, [k]: v }));
  const initDur = deriveDuration(settings.pickSeconds);
  const [pickAmt, setPickAmt] = useState(initDur.amt);
  const [pickUnit, setPickUnit] = useState(initDur.unit);
  const setPick = (amt, unit) => {
    setPickAmt(amt); setPickUnit(unit);
    upd('pickSeconds', Math.max(1, Math.round((Number(amt) || 0) * DUR_UNITS[unit])));
  };
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Draft settings</h2>
        <div className="form-grid">
          <label>Teams <input type="number" min="2" max="16" value={s.teams} onChange={(e) => upd('teams', +e.target.value)} /></label>
          <label>Rounds <input type="number" min="1" max="20" value={s.rounds} onChange={(e) => upd('rounds', +e.target.value)} /></label>
          <label>Pick clock
            <div className="dur-row">
              <input type="number" min="1" value={pickAmt} onChange={(e) => setPick(e.target.value, pickUnit)} />
              <select value={pickUnit} onChange={(e) => setPick(pickAmt, e.target.value)}>
                <option value="seconds">seconds</option>
                <option value="minutes">minutes</option>
                <option value="hours">hours</option>
              </select>
            </div>
          </label>
          <label>Food pool size <input type="number" min="0" max="500" value={s.poolSize} onChange={(e) => upd('poolSize', +e.target.value)} placeholder="0 = auto" /><span className="hint">0 = auto (draft + 1 round). All foods available every pick.</span></label>
        </div>
        <label className="chk big"><input type="checkbox" checked={s.breakEnabled} onChange={(e) => upd('breakEnabled', e.target.checked)} /> Overnight sleep break (freeze the clock)</label>
        {s.breakEnabled && (
          <div className="form-grid">
            <label>Pause at <input type="time" value={s.breakStart} onChange={(e) => upd('breakStart', e.target.value)} /></label>
            <label>Resume at <input type="time" value={s.breakEnd} onChange={(e) => upd('breakEnd', e.target.value)} /></label>
          </div>
        )}
        <div className="modal-actions">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={() => onSave(s)}>Save</button>
        </div>
      </div>
    </div>
  );
}

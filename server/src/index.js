import express from 'express';
import cors from 'cors';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Server } from 'socket.io';
import { store } from './store.js';
import { Room } from './draft.js';
import { TIER_NAMES } from './foods.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4100;
const JWT_SECRET = process.env.JWT_SECRET || 'fooddraft-dev-secret-change-me';
const WEB_DIST = path.join(__dirname, '..', '..', 'web', 'dist');

// Seed the admin account (username ADMIN / password 1234) if it doesn't exist.
if (!store.getUserByName('ADMIN')) store.createUser('ADMIN', bcrypt.hashSync('1234', 10));
const isAdmin = (user) => user && user.username === 'ADMIN';

const app = express();
app.use(cors());
app.use(express.json());

// In production, serve the built frontend from this same process.
const hasBuild = fs.existsSync(path.join(WEB_DIST, 'index.html'));
if (hasBuild) app.use(express.static(WEB_DIST));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// ---- live rooms (in memory) ------------------------------------------------
const rooms = new Map(); // code -> Room

function makeCode() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code;
  do {
    code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (rooms.has(code) || store.getLeague(code));
  return code;
}

function roomEmitter(code) {
  return (payload) => {
    if (payload.type === 'chat') io.to(code).emit('chat', payload.message);
    else io.to(code).emit('state', payload.state);
  };
}

// Persist a completed league draft's results so they can be viewed later.
function saveResult(code) {
  return (result) => store.updateLeague(code, { result });
}

// Recreate a Room from a persisted league (e.g., after server restart).
function getOrCreateRoom(code) {
  if (rooms.has(code)) return rooms.get(code);
  const league = store.getLeague(code);
  if (!league) return null;
  const room = new Room({
    code, name: league.name, ownerId: league.ownerId, isMock: false,
    settings: league.settings, emit: roomEmitter(code), onDone: saveResult(code),
  });
  // If this league's draft already finished, rehydrate its saved results.
  if (league.result) room.loadResult(league.result);
  rooms.set(code, room);
  return room;
}

// ---- auth ------------------------------------------------------------------
function signToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });
}

function authFromToken(token) {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return store.getUserById(payload.id) || null;
  } catch {
    return null;
  }
}

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password || username.length < 2 || password.length < 4)
    return res.status(400).json({ error: 'Username (2+) and password (4+) required.' });
  if (store.getUserByName(username)) return res.status(409).json({ error: 'Username taken.' });
  const passHash = await bcrypt.hash(password, 10);
  const user = store.createUser(username.trim(), passHash);
  res.json({ token: signToken(user), user: { id: user.id, username: user.username } });
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body || {};
  const user = store.getUserByName(username || '');
  if (!user || !(await bcrypt.compare(password || '', user.passHash)))
    return res.status(401).json({ error: 'Wrong username or password.' });
  res.json({ token: signToken(user), user: { id: user.id, username: user.username } });
});

function requireAuth(req, res, next) {
  const user = authFromToken((req.headers.authorization || '').replace('Bearer ', ''));
  if (!user) return res.status(401).json({ error: 'Not authenticated.' });
  req.user = user;
  next();
}

app.get('/api/me', requireAuth, (req, res) => {
  const leagues = store.leaguesForUser(req.user.id).map((l) => ({
    code: l.code, name: l.name, ownerId: l.ownerId,
  }));
  res.json({ user: { id: req.user.id, username: req.user.username, isAdmin: isAdmin(req.user) }, leagues });
});

// ---- editable food list (review + admin) -----------------------------------
function requireAdmin(req, res, next) {
  if (!isAdmin(req.user)) return res.status(403).json({ error: 'Admins only.' });
  next();
}

function sanitizeItem(it) {
  return {
    name: String(it?.name || '').slice(0, 120).trim(),
    qty: String(it?.qty || '').slice(0, 60).trim(),
    type: it?.type === 'volume' ? 'volume' : 'content',
    tier: Math.max(0, Math.min(TIER_NAMES.length - 1, it?.tier | 0)),
  };
}

function applyOp(op) {
  if (op.kind === 'add') store.addFood(op.item);
  else if (op.kind === 'edit') store.editFood(op.targetId, op.item);
  else if (op.kind === 'delete') store.deleteFood(op.targetId);
}

// Anyone signed in can view the list + pending proposals.
app.get('/api/foods', requireAuth, (req, res) => {
  res.json({ foods: store.getFoods(), proposals: store.getProposals(), tierNames: TIER_NAMES });
});

// Anyone signed in can submit proposed changes (replaces the pending set).
app.post('/api/foods/proposals', requireAuth, (req, res) => {
  const raw = Array.isArray(req.body?.ops) ? req.body.ops.slice(0, 2000) : [];
  const ops = raw
    .filter((o) => ['add', 'edit', 'delete'].includes(o.kind))
    .map((o) => ({
      id: crypto.randomUUID(),
      kind: o.kind,
      targetId: o.targetId || null,
      item: o.kind === 'delete' ? null : sanitizeItem(o.item),
      by: req.user.id,
      byName: req.user.username,
      at: Date.now(),
    }));
  store.setProposals(ops);
  res.json({ ok: true, proposals: store.getProposals() });
});

// Admin-only: approve (apply + clear) or reject (clear) proposals.
app.post('/api/foods/approve', requireAuth, requireAdmin, (req, res) => {
  const all = store.getProposals();
  const ids = req.body?.ids === 'all' ? all.map((p) => p.id) : (Array.isArray(req.body?.ids) ? req.body.ids : []);
  const set = new Set(ids);
  for (const op of all) if (set.has(op.id)) applyOp(op);
  store.setProposals(store.getProposals().filter((p) => !set.has(p.id)));
  res.json({ ok: true, foods: store.getFoods(), proposals: store.getProposals() });
});

app.post('/api/foods/reject', requireAuth, requireAdmin, (req, res) => {
  const all = store.getProposals();
  const ids = req.body?.ids === 'all' ? all.map((p) => p.id) : (Array.isArray(req.body?.ids) ? req.body.ids : []);
  const set = new Set(ids);
  store.setProposals(all.filter((p) => !set.has(p.id)));
  res.json({ ok: true, proposals: store.getProposals() });
});

// Create a persistent league.
app.post('/api/leagues', requireAuth, (req, res) => {
  const { name, settings } = req.body || {};
  const code = makeCode();
  const league = {
    code, name: name || `${req.user.username}'s League`, ownerId: req.user.id,
    memberIds: [req.user.id], settings: settings || {},
  };
  store.createLeague(league);
  const room = new Room({ code, name: league.name, ownerId: req.user.id, isMock: false, settings: league.settings, emit: roomEmitter(code), onDone: saveResult(code) });
  rooms.set(code, room);
  res.json({ code });
});

// Create an ephemeral mock draft.
app.post('/api/mock', requireAuth, (req, res) => {
  const { settings } = req.body || {};
  const code = makeCode();
  const room = new Room({ code, name: 'Mock Draft', ownerId: req.user.id, isMock: true, settings: settings || {}, emit: roomEmitter(code) });
  rooms.set(code, room);
  res.json({ code });
});

// Does a room/league exist for this code?
app.get('/api/rooms/:code', requireAuth, (req, res) => {
  const code = req.params.code.toUpperCase();
  const room = getOrCreateRoom(code);
  if (!room) return res.status(404).json({ error: 'No draft found for that code.' });
  res.json({ code, name: room.name, isMock: room.isMock, status: room.status });
});

// ---- sockets ---------------------------------------------------------------
io.use((socket, next) => {
  const user = authFromToken(socket.handshake.auth?.token);
  if (!user) return next(new Error('unauthorized'));
  socket.userId = user.id;
  socket.username = user.username;
  next();
});

io.on('connection', (socket) => {
  let joinedCode = null;

  socket.on('room:join', ({ code }) => {
    code = (code || '').toUpperCase();
    const room = getOrCreateRoom(code);
    if (!room) return socket.emit('errorMsg', 'No draft found for that code.');
    // persistent leagues: track membership
    const league = store.getLeague(code);
    if (league && !league.memberIds.includes(socket.userId)) {
      league.memberIds.push(socket.userId);
      store.updateLeague(code, { memberIds: league.memberIds });
    }
    room.addHuman(socket.userId, socket.username);
    socket.join(code);
    joinedCode = code;
    room.emitState();
  });

  socket.on('settings:update', ({ settings }) => {
    const room = rooms.get(joinedCode);
    if (!room || !room.isOwner(socket.userId)) return;
    room.updateSettings(settings || {});
    room.emitState();
  });

  socket.on('order:set', ({ order }) => {
    const room = rooms.get(joinedCode);
    if (room) room.setSeatOrder(socket.userId, order);
  });

  socket.on('draft:start', () => {
    const room = rooms.get(joinedCode);
    if (room) room.start(socket.userId);
  });
  socket.on('draft:pause', () => {
    const room = rooms.get(joinedCode);
    if (room) room.pause(socket.userId);
  });
  socket.on('draft:resume', () => {
    const room = rooms.get(joinedCode);
    if (room) room.resume(socket.userId);
  });

  socket.on('pick', ({ itemId }) => {
    const room = rooms.get(joinedCode);
    if (room) room.pickByUser(socket.userId, itemId);
  });
  socket.on('queue:update', ({ ids }) => {
    const room = rooms.get(joinedCode);
    if (room) room.setQueue(socket.userId, ids);
  });
  socket.on('autopick:set', ({ on }) => {
    const room = rooms.get(joinedCode);
    if (room) room.setAutopick(socket.userId, on);
  });
  socket.on('chat:send', ({ text }) => {
    const room = rooms.get(joinedCode);
    if (room && text?.trim()) room.addChat(socket.username, text.trim());
  });

  socket.on('disconnect', () => {
    const room = rooms.get(joinedCode);
    if (room) {
      room.markDisconnected(socket.userId);
      room.emitState();
    }
  });
});

// SPA fallback: any non-API GET returns index.html (socket.io is handled at the
// HTTP-server level, so it never reaches Express).
if (hasBuild) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(WEB_DIST, 'index.html'));
  });
}

server.listen(PORT, () => console.log(`FoodDraft server on :${PORT}`));

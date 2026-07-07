// Tiny JSON-file store for users + persisted leagues. No native deps.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { buildSeedFoods } from './foods.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '..', 'data.json');

let data = { users: [], leagues: [], foods: [], proposals: [] };
try {
  if (fs.existsSync(DATA_FILE)) data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
} catch (e) {
  console.error('Failed to read data.json, starting fresh:', e.message);
}

// Seed the editable food list from the tiers, and additively reconcile on every
// startup: new seed items (by name) are added on deploy, but items already seeded
// (and possibly deleted by an admin) are NOT resurrected.
{
  const seed = buildSeedFoods();
  if (!Array.isArray(data.foods) || data.foods.length === 0) {
    data.foods = seed;
    data.seededNames = seed.map((f) => f.name);
  } else {
    const existing = new Set(data.foods.map((f) => f.name));
    // Pre-migration data.json has no seededNames — treat current items as already
    // seeded so we don't resurrect anything an admin removed before this existed.
    const seen = new Set(Array.isArray(data.seededNames) ? data.seededNames : [...existing]);
    let maxOrd = data.foods.reduce((m, f) => Math.max(m, f.ord || 0), 0);
    for (const item of seed) {
      if (seen.has(item.name)) continue;
      seen.add(item.name);
      if (!existing.has(item.name)) {
        data.foods.push({ ...item, ord: ++maxOrd });
        existing.add(item.name);
      }
    }
    data.seededNames = [...seen];
  }
}
if (!Array.isArray(data.proposals)) data.proposals = [];

function save() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}
save();

export const store = {
  getUserByName(username) {
    return data.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  },
  getUserById(id) {
    return data.users.find((u) => u.id === id);
  },
  createUser(username, passHash) {
    const user = { id: crypto.randomUUID(), username, passHash };
    data.users.push(user);
    save();
    return user;
  },
  createLeague(league) {
    data.leagues.push(league);
    save();
    return league;
  },
  getLeague(code) {
    return data.leagues.find((l) => l.code === code);
  },
  updateLeague(code, patch) {
    const l = data.leagues.find((x) => x.code === code);
    if (l) {
      Object.assign(l, patch);
      save();
    }
    return l;
  },
  leaguesForUser(userId) {
    return data.leagues.filter((l) => l.memberIds?.includes(userId) || l.ownerId === userId);
  },

  // ---- editable food list -------------------------------------------------
  getFoods() {
    return data.foods;
  },
  getProposals() {
    return data.proposals;
  },
  setProposals(ops) {
    data.proposals = ops;
    save();
  },
  addFood({ name, qty, type, tier }) {
    const ord = data.foods.reduce((m, f) => Math.max(m, f.ord || 0), 0) + 1;
    const f = { id: crypto.randomUUID(), ord, name, qty, type, tier };
    data.foods.push(f);
    save();
    return f;
  },
  editFood(id, patch) {
    const f = data.foods.find((x) => x.id === id);
    if (f) { Object.assign(f, patch); save(); }
    return f;
  },
  deleteFood(id) {
    data.foods = data.foods.filter((x) => x.id !== id);
    save();
  },
};

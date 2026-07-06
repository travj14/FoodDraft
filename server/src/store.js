// Tiny JSON-file store for users + persisted leagues. No native deps.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '..', 'data.json');

let data = { users: [], leagues: [] };
try {
  if (fs.existsSync(DATA_FILE)) data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
} catch (e) {
  console.error('Failed to read data.json, starting fresh:', e.message);
}

function save() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

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
};

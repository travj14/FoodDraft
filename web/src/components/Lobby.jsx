import React, { useEffect, useState } from 'react';
import { api, href } from '../api.js';

export default function Lobby({ user, onEnterRoom, onLogout }) {
  const [leagues, setLeagues] = useState([]);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function refresh() {
    try {
      const { leagues } = await api.me();
      setLeagues(leagues);
    } catch (e) { /* token maybe stale */ }
  }
  useEffect(() => { refresh(); }, []);

  async function createLeague() {
    setErr(''); setBusy(true);
    try {
      const { code } = await api.createLeague(name || `${user.username}'s League`);
      onEnterRoom(code);
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  }
  async function createMock() {
    setErr(''); setBusy(true);
    try {
      const { code } = await api.createMock();
      onEnterRoom(code);
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  }
  async function join(c) {
    setErr(''); setBusy(true);
    const cc = (c || code).trim().toUpperCase();
    try {
      await api.checkRoom(cc);
      onEnterRoom(cc);
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  }

  return (
    <div className="lobby">
      <header className="lobby-top">
        <div className="brand"><span className="brand-emoji">🍔🤢</span> FoodDraft</div>
        <div className="who">
          <span>{user.username}</span>
          <button className="btn ghost sm" onClick={onLogout}>Log out</button>
        </div>
      </header>

      <div className="lobby-grid">
        <section className="panel">
          <h2>Join a draft</h2>
          <p className="muted">Enter your league's code to jump into the draft board.</p>
          <div className="row">
            <input className="inp code-inp" placeholder="ABC123" maxLength={6}
              value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
            <button className="btn primary" disabled={busy || code.length < 4} onClick={() => join()}>Join</button>
          </div>
          {err && <div className="err">{err}</div>}
        </section>

        <section className="panel">
          <h2>New league</h2>
          <p className="muted">Create a league, share the code with friends, run the real draft.</p>
          <div className="row">
            <input className="inp" placeholder="League name" value={name} onChange={(e) => setName(e.target.value)} />
            <button className="btn primary" disabled={busy} onClick={createLeague}>Create</button>
          </div>
        </section>

        <section className="panel accent">
          <h2>Mock draft 🤖</h2>
          <p className="muted">Practice against auto-pickers. Invite friends by sharing the code, or draft solo — empty seats fill with bots on start.</p>
          <button className="btn accent-btn" disabled={busy} onClick={createMock}>Start a mock draft</button>
        </section>

        <section className="panel">
          <h2>Your leagues</h2>
          {leagues.length === 0 && <p className="muted">No leagues yet.</p>}
          <ul className="league-list">
            {leagues.map((l) => (
              <li key={l.code}>
                <div>
                  <div className="lg-name">{l.name}</div>
                  <div className="lg-code">{l.code}{l.ownerId === user.id ? ' · owner' : ''}</div>
                </div>
                <button className="btn ghost sm" onClick={() => join(l.code)}>Enter</button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <footer className="lobby-foot muted small">
        <a href={href('/review')}>Review &amp; suggest food changes →</a>
        <a href={href('/admin')}>Admin</a>
      </footer>
    </div>
  );
}

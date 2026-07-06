import React, { useState } from 'react';
import { api, setAuth } from '../api.js';

export default function Login({ onAuthed }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const fn = mode === 'login' ? api.login : api.register;
      const { token, user } = await fn(username.trim(), password);
      setAuth(token, user);
      onAuthed(user);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="brand"><span className="brand-emoji">🍔🤢</span> FoodDraft</div>
        <p className="auth-tag">Draft your poison. Loser eats the lineup.</p>
        <div className="tab-row">
          <button className={mode === 'login' ? 'tab on' : 'tab'} onClick={() => setMode('login')}>Log in</button>
          <button className={mode === 'register' ? 'tab on' : 'tab'} onClick={() => setMode('register')}>Sign up</button>
        </div>
        <form onSubmit={submit}>
          <input className="inp" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
          <input className="inp" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {err && <div className="err">{err}</div>}
          <button className="btn primary full" disabled={busy}>
            {busy ? '…' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { getUser, getToken, logout, BASE, href } from './api.js';
import { resetSocket } from './socket.js';
import Login from './components/Login.jsx';
import Lobby from './components/Lobby.jsx';
import Draft from './components/Draft.jsx';
import Review from './components/Review.jsx';
import Admin from './components/Admin.jsx';

function currentRoute() {
  let p = window.location.pathname;
  if (BASE && p.startsWith(BASE)) p = p.slice(BASE.length);
  p = p.replace(/\/+$/, '');
  if (p === '/review') return 'review';
  if (p === '/admin') return 'admin';
  return 'main';
}

export default function App() {
  const [user, setUser] = useState(getToken() ? getUser() : null);
  const [roomCode, setRoomCode] = useState(null);
  const route = currentRoute();

  function onLogout() {
    logout();
    resetSocket();
    setRoomCode(null);
    setUser(null);
  }

  // ---- subpages: /review and /admin (both require sign-in) ----
  if (route === 'review') {
    if (!user) return <Login onAuthed={setUser} subtitle="Sign in to suggest food changes." />;
    return <Review user={user} onLogout={onLogout} />;
  }
  if (route === 'admin') {
    if (!user) return <Login onAuthed={setUser} subtitle="Sign in as ADMIN to review changes." />;
    if (!user.isAdmin && user.username !== 'ADMIN') return <AdminDenied user={user} onLogout={onLogout} />;
    return <Admin user={user} onLogout={onLogout} />;
  }

  // ---- main app ----
  if (!user) return <Login onAuthed={setUser} />;
  if (roomCode) return <Draft code={roomCode} me={user} onLeave={() => { resetSocket(); setRoomCode(null); }} />;
  return <Lobby user={user} onEnterRoom={setRoomCode} onLogout={onLogout} />;
}

function AdminDenied({ user, onLogout }) {
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="brand"><span className="brand-emoji">🔒</span> Admin only</div>
        <p className="auth-tag">You're signed in as <b>{user.username}</b>. The admin page requires the <b>ADMIN</b> account.</p>
        <button className="btn primary full" onClick={onLogout}>Log out & sign in as ADMIN</button>
        <a className="btn ghost full" style={{ marginTop: 8, textAlign: 'center' }} href={href('/')}>← Back to FoodDraft</a>
      </div>
    </div>
  );
}

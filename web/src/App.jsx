import React, { useEffect, useState } from 'react';
import { getUser, getToken, logout } from './api.js';
import { resetSocket } from './socket.js';
import Login from './components/Login.jsx';
import Lobby from './components/Lobby.jsx';
import Draft from './components/Draft.jsx';

export default function App() {
  const [user, setUser] = useState(getUser());
  const [roomCode, setRoomCode] = useState(null); // when set, we're in a draft room

  useEffect(() => {
    if (!getToken()) setUser(null);
  }, []);

  function onAuthed(u) {
    setUser(u);
  }
  function onLogout() {
    logout();
    resetSocket();
    setRoomCode(null);
    setUser(null);
  }

  if (!user) return <Login onAuthed={onAuthed} />;
  if (roomCode) return <Draft code={roomCode} me={user} onLeave={() => { resetSocket(); setRoomCode(null); }} />;
  return <Lobby user={user} onEnterRoom={setRoomCode} onLogout={onLogout} />;
}

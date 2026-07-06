const API = '/api';

export function getToken() {
  return localStorage.getItem('fd_token');
}
export function setAuth(token, user) {
  localStorage.setItem('fd_token', token);
  localStorage.setItem('fd_user', JSON.stringify(user));
}
export function getUser() {
  try { return JSON.parse(localStorage.getItem('fd_user')); } catch { return null; }
}
export function logout() {
  localStorage.removeItem('fd_token');
  localStorage.removeItem('fd_user');
}

async function req(path, method, body) {
  const res = await fetch(API + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: 'Bearer ' + getToken() } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  register: (username, password) => req('/register', 'POST', { username, password }),
  login: (username, password) => req('/login', 'POST', { username, password }),
  me: () => req('/me', 'GET'),
  createLeague: (name, settings) => req('/leagues', 'POST', { name, settings }),
  createMock: (settings) => req('/mock', 'POST', { settings }),
  checkRoom: (code) => req('/rooms/' + code, 'GET'),
};

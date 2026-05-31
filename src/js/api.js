const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export function register(name, email, password) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export function login(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function getProfile() {
  return request('/users/profile');
}

export function updateProfile(data) {
  return request('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteAccount() {
  return request('/users/profile', { method: 'DELETE' });
}

export function getTodos() {
  return request('/todos');
}

export function createTodo(text) {
  return request('/todos', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

export function updateTodo(id, updates) {
  return request(`/todos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export function deleteTodo(id) {
  return request(`/todos/${id}`, { method: 'DELETE' });
}

export function adminGetUsers() {
  return request('/users/admin/users');
}

export function adminDeleteUser(id) {
  return request(`/users/admin/users/${id}`, { method: 'DELETE' });
}

export function adminUpdateUser(id, data) {
  return request(`/users/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

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

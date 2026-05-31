import * as api from './api.js';
import * as auth from './auth.js';
import { renderTodos, removeTodoItem } from './ui.js';
import { setupEventHandlers } from './events.js';
import { initGestures } from './gestures.js';
import { initTheme, toggleTheme } from './theme.js';

let todos = [];
let adminUsers = [];

function showAuth() {
  document.getElementById('auth-forms').classList.remove('hidden');
  document.getElementById('todo-app').classList.add('hidden');
  document.getElementById('settings-panel').classList.add('hidden');
  document.getElementById('admin-panel').classList.add('hidden');
}

function showApp() {
  document.getElementById('auth-forms').classList.add('hidden');
  document.getElementById('todo-app').classList.remove('hidden');
  document.getElementById('settings-panel').classList.add('hidden');
  document.getElementById('admin-panel').classList.add('hidden');
  const user = auth.getUser();
  document.getElementById('user-name').textContent = user?.name || 'User';
  document.getElementById('admin-btn').classList.toggle('hidden', user?.role !== 'admin');
}

async function loadTodos() {
  try {
    const res = await api.getTodos();
    todos = res.data;
    renderTodos(todos);
  } catch (err) {
    alert('Failed to load todos: ' + err.message);
  }
}

async function addTodo() {
  const input = document.getElementById('todo-input');
  const text = input.value.trim();
  if (!text) return;

  try {
    const res = await api.createTodo(text);
    todos.unshift(res.data);
    renderTodos(todos);
    input.value = '';
    input.focus();
  } catch (err) {
    alert('Failed to add todo: ' + err.message);
  }
}

async function toggleTodo(index) {
  const todo = todos[index];
  try {
    const res = await api.updateTodo(todo.id, { completed: !todo.completed });
    todos[index] = res.data;
    renderTodos(todos);
  } catch (err) {
    alert('Failed to update todo: ' + err.message);
  }
}

async function deleteTodo(index) {
  const todo = todos[index];
  if (!confirm(`Delete "${todo.text}"?`)) return;

  const list = document.getElementById('todo-list');
  const li = list.querySelector(`[data-index="${index}"]`);
  if (li) {
    removeTodoItem(li, async () => {
      try {
        await api.deleteTodo(todo.id);
        todos.splice(index, 1);
        renderTodos(todos);
      } catch (err) {
        alert('Failed to delete todo: ' + err.message);
        loadTodos();
      }
    });
  } else {
    try {
      await api.deleteTodo(todo.id);
      todos.splice(index, 1);
      renderTodos(todos);
    } catch (err) {
      alert('Failed to delete todo: ' + err.message);
    }
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;

  try {
    const res = await api.register(name, email, password);
    auth.saveAuth(res.data);
    showApp();
    await loadTodos();
  } catch (err) {
    alert(err.message);
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    const res = await api.login(email, password);
    auth.saveAuth(res.data);
    showApp();
    await loadTodos();
  } catch (err) {
    alert(err.message);
  }
}

function handleLogout() {
  auth.clearAuth();
  todos = [];
  document.getElementById('login-form').reset();
  document.getElementById('reg-form').reset();
  showAuth();
}

function switchForm(form) {
  document.getElementById('login-form').classList.toggle('hidden', form !== 'login');
  document.getElementById('reg-form').classList.toggle('hidden', form !== 'register');
}

function showSettings() {
  document.getElementById('todo-app').classList.add('hidden');
  document.getElementById('admin-panel').classList.add('hidden');
  document.getElementById('settings-panel').classList.remove('hidden');
  const user = auth.getUser();
  document.getElementById('settings-name').value = user?.name || '';
  document.getElementById('settings-email').value = user?.email || '';
}

function showTodoApp() {
  document.getElementById('settings-panel').classList.add('hidden');
  document.getElementById('admin-panel').classList.add('hidden');
  document.getElementById('todo-app').classList.remove('hidden');
}

async function handleSettingsSave(e) {
  e.preventDefault();
  const name = document.getElementById('settings-name').value.trim();
  const email = document.getElementById('settings-email').value.trim();
  const currentPassword = document.getElementById('settings-current-pw').value;
  const newPassword = document.getElementById('settings-new-pw').value;

  const data = {};
  if (name) data.name = name;
  if (email) data.email = email;
  if (currentPassword && newPassword) {
    data.currentPassword = currentPassword;
    data.newPassword = newPassword;
  }

  if (Object.keys(data).length === 0) return;

  try {
    const res = await api.updateProfile(data);
    const user = auth.getUser();
    auth.saveAuth({ user: { ...user, ...res.data }, token: auth.getToken() });
    alert('Profile updated!');
    showTodoApp();
  } catch (err) {
    alert(err.message);
  }
}

async function handleDeleteAccount() {
  if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
  if (!confirm('All your data including todos will be permanently deleted. Continue?')) return;

  try {
    await api.deleteAccount();
    auth.clearAuth();
    todos = [];
    showAuth();
    alert('Account deleted.');
  } catch (err) {
    alert(err.message);
  }
}

async function showAdminPanel() {
  document.getElementById('todo-app').classList.add('hidden');
  document.getElementById('settings-panel').classList.add('hidden');
  document.getElementById('admin-panel').classList.remove('hidden');
  await loadAdminUsers();
}

async function loadAdminUsers() {
  try {
    const res = await api.adminGetUsers();
    adminUsers = res.data.users;
    renderAdminUsers(adminUsers, res.data.total);
  } catch (err) {
    alert('Failed to load users: ' + err.message);
  }
}

function renderAdminUsers(users, total) {
  document.getElementById('admin-user-count').textContent = `Total users: ${total}`;
  const list = document.getElementById('admin-user-list');
  list.innerHTML = '';

  users.forEach(user => {
    const div = document.createElement('div');
    div.className = 'admin-user-item';
    div.innerHTML = `
      <div class="admin-user-info">
        <strong>${user.name}</strong>
        <span>${user.email}</span>
        <span class="admin-user-role ${user.role}">${user.role}</span>
      </div>
      <div class="admin-user-actions">
        <button class="admin-delete-btn" data-id="${user.id}" data-name="${user.name}">Delete</button>
      </div>
    `;
    list.appendChild(div);
  });

  list.querySelectorAll('.admin-delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      if (confirm(`Delete user "${name}"? This will delete all their todos too.`)) {
        try {
          await api.adminDeleteUser(id);
          await loadAdminUsers();
        } catch (err) {
          alert(err.message);
        }
      }
    });
  });
}

initTheme();
document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

document.getElementById('reg-form').addEventListener('submit', handleRegister);
document.getElementById('login-form').addEventListener('submit', handleLogin);
document.getElementById('logout-btn').addEventListener('click', handleLogout);
document.getElementById('show-login').addEventListener('click', () => switchForm('login'));
document.getElementById('show-register').addEventListener('click', () => switchForm('register'));

document.getElementById('settings-btn')?.addEventListener('click', showSettings);
document.getElementById('admin-btn')?.addEventListener('click', showAdminPanel);
document.getElementById('settings-back-btn')?.addEventListener('click', showTodoApp);
document.getElementById('admin-back-btn')?.addEventListener('click', showTodoApp);
document.getElementById('settings-form')?.addEventListener('submit', handleSettingsSave);
document.getElementById('delete-account-btn')?.addEventListener('click', handleDeleteAccount);

setupEventHandlers({ add: addTodo, toggle: toggleTodo, delete: deleteTodo });
initGestures('#todo-list', (index) => deleteTodo(index));

if (auth.isAuthenticated()) {
  showApp();
  loadTodos();
} else {
  showAuth();
}

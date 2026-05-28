import * as api from './api.js';
import * as auth from './auth.js';
import { renderTodos, removeTodoItem } from './ui.js';
import { setupEventHandlers } from './events.js';
import { initGestures } from './gestures.js';
import { initTheme, toggleTheme } from './theme.js';

let todos = [];

function showAuth() {
  document.getElementById('auth-forms').classList.remove('hidden');
  document.getElementById('todo-app').classList.add('hidden');
}

function showApp() {
  document.getElementById('auth-forms').classList.add('hidden');
  document.getElementById('todo-app').classList.remove('hidden');
  document.getElementById('user-name').textContent = auth.getUser()?.name || 'User';
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

initTheme();
document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

document.getElementById('reg-form').addEventListener('submit', handleRegister);
document.getElementById('login-form').addEventListener('submit', handleLogin);
document.getElementById('logout-btn').addEventListener('click', handleLogout);
document.getElementById('show-login').addEventListener('click', () => switchForm('login'));
document.getElementById('show-register').addEventListener('click', () => switchForm('register'));

setupEventHandlers({ add: addTodo, toggle: toggleTodo, delete: deleteTodo });
initGestures('#todo-list', (index) => deleteTodo(index));

if (auth.isAuthenticated()) {
  showApp();
  loadTodos();
} else {
  showAuth();
}

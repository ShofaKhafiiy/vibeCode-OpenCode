import { loadTodos, saveTodos } from './storage.js';
import { renderTodos, removeTodoItem } from './ui.js';
import { setupEventHandlers } from './events.js';
import { initGestures } from './gestures.js';
import { initTheme, toggleTheme } from './theme.js';

let todos = loadTodos();

function addTodo() {
  const input = document.getElementById('todo-input');
  const text = input.value.trim();
  if (!text) return;

  todos.push({ text, completed: false });
  saveTodos(todos);
  renderTodos(todos);
  input.value = '';
  input.focus();
}

function toggleTodo(index) {
  todos[index].completed = !todos[index].completed;
  saveTodos(todos);
  renderTodos(todos);
}

function deleteTodo(index) {
  if (!confirm(`Delete "${todos[index].text}"?`)) return;
  const list = document.getElementById('todo-list');
  const li = list.querySelector(`[data-index="${index}"]`);
  if (!li) {
    todos.splice(index, 1);
    saveTodos(todos);
    renderTodos(todos);
    return;
  }
  removeTodoItem(li, () => {
    todos.splice(index, 1);
    saveTodos(todos);
    renderTodos(todos);
  });
}

initTheme();
document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
setupEventHandlers({ add: addTodo, toggle: toggleTodo, delete: deleteTodo });
initGestures('#todo-list', (index) => {
  if (!confirm(`Delete "${todos[index].text}"?`)) return;
  const list = document.getElementById('todo-list');
  const li = list.querySelector(`[data-index="${index}"]`);
  if (!li) {
    todos.splice(index, 1);
    saveTodos(todos);
    renderTodos(todos);
    return;
  }
  removeTodoItem(li, () => {
    todos.splice(index, 1);
    saveTodos(todos);
    renderTodos(todos);
  });
});
renderTodos(todos);

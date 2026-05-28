import { loadTodos, saveTodos } from './storage.js';
import { renderTodos } from './ui.js';
import { setupEventHandlers } from './events.js';

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
  todos.splice(index, 1);
  saveTodos(todos);
  renderTodos(todos);
}

setupEventHandlers({ add: addTodo, toggle: toggleTodo, delete: deleteTodo });
renderTodos(todos);

export function renderTodos(todos) {
  const list = document.getElementById('todo-list');
  list.innerHTML = '';

  if (todos.length === 0) {
    list.appendChild(createEmptyState());
    return;
  }

  const fragment = document.createDocumentFragment();
  todos.forEach((todo, index) => {
    fragment.appendChild(createTodoItem(todo, index));
  });
  list.appendChild(fragment);
}

export function removeTodoItem(li, callback) {
  li.classList.add('removing');
  li.addEventListener('animationend', () => callback(), { once: true });
}

function createEmptyState() {
  const li = document.createElement('li');
  li.className = 'empty-state';
  li.textContent = 'No tasks yet. Add one above!';
  return li;
}

function createTodoItem(todo, index) {
  const li = document.createElement('li');
  li.className = 'todo-item' + (todo.completed ? ' completed' : '');
  li.dataset.index = index;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'todo-checkbox';
  checkbox.checked = todo.completed;

  const span = document.createElement('span');
  span.className = 'todo-text';
  span.textContent = todo.text;

  const delBtn = document.createElement('button');
  delBtn.className = 'delete-btn';
  delBtn.innerHTML = '&times;';

  li.append(checkbox, span, delBtn);
  return li;
}

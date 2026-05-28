export function setupEventHandlers(actions) {
  const input = document.getElementById('todo-input');
  const addBtn = document.getElementById('add-btn');

  addBtn.addEventListener('click', actions.add);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') actions.add();
  });

  document.getElementById('todo-list').addEventListener('click', (e) => {
    const li = e.target.closest('.todo-item');
    if (!li) return;
    const index = Number(li.dataset.index);

    if (e.target.classList.contains('delete-btn')) {
      actions.delete(index);
    } else if (e.target.classList.contains('todo-checkbox')) {
      actions.toggle(index);
    }
  });
}

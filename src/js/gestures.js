export function initGestures(containerSelector, onSwipeDelete) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  let startX = 0;
  let currentItem = null;
  let currentX = 0;

  container.addEventListener('touchstart', (e) => {
    const li = e.target.closest('.todo-item');
    if (!li || e.target.closest('.delete-btn')) return;
    currentItem = li;
    startX = e.touches[0].clientX;
    currentX = 0;
    li.style.transition = 'none';
  }, { passive: true });

  container.addEventListener('touchmove', (e) => {
    if (!currentItem) return;
    currentX = e.touches[0].clientX - startX;
    if (currentX < 0) {
      currentItem.style.transform = `translateX(${currentX}px)`;
      currentItem.style.opacity = 1 - Math.abs(currentX) / 200;
    }
  }, { passive: true });

  container.addEventListener('touchend', () => {
    if (!currentItem) return;
    currentItem.style.transition = 'transform 0.2s ease, opacity 0.2s ease';

    if (currentX < -80) {
      currentItem.style.transform = 'translateX(-120%)';
      currentItem.style.opacity = '0';
      const index = Number(currentItem.dataset.index);
      setTimeout(() => onSwipeDelete(index), 200);
    } else {
      currentItem.style.transform = '';
      currentItem.style.opacity = '';
    }

    currentItem = null;
    startX = 0;
    currentX = 0;
  }, { passive: true });
}

---
name: responsive-layout
description: Optimize Todo app for mobile-first responsive design with touch gesture support
---

# Responsive Layout Skill

## Rules

- Mobile-first: write base styles for mobile, add `@media (min-width: ...)` for larger screens
- Use relative units (rem, %, vh/vw) over fixed px where appropriate
- Support touch gestures (swipe to delete) without external libraries
- Minimum touch target size: 44x44px (WCAG)
- Keep container max-width reasonable (480px) for readability
- Hairline borders and subtle shadows look best on mobile
- Test with viewport 375px (iPhone SE) as baseline

## Architecture

```
src/
 ├── css/
 │   └── style.css           (update with responsive + touch styles)
 ├── js/
 │   ├── app.js              (import gesture module)
 │   ├── gestures.js          (CREATED — swipe-to-delete logic)
 │   ├── ui.js               (add touch data attributes)
 │   └── events.js           (unchanged)
 └── index.html              (add meta viewport — already present)
```

## Files to Modify

| File | Change |
|---|---|
| `src/css/style.css` | Mobile-first responsive layout; larger touch targets |
| `src/js/gestures.js` | **CREATE** — swipe-to-delete gesture handler |
| `src/js/app.js` | Import and init gesture support |
| `src/js/ui.js` | Add `.todo-item` data attributes for gestures |
| `src/js/events.js` | Optional: add touch event delegation |

## Workflow

### 1. Mobile-First CSS (style.css)

Base styles should target mobile first. Add breakpoints only for tablets+.

```css
/* Base — mobile first (≤ 480px) */
body {
  padding: 1rem 0.75rem;
  min-height: 100dvh; /* dynamic viewport height — better on mobile */
}

.container {
  border-radius: 0; /* full-width on mobile looks cleaner */
  box-shadow: none;
  padding: 1.25rem;
}

/* Tablet+ (≥ 640px) */
@media (min-width: 640px) {
  body {
    padding: 2rem 1rem;
  }
  .container {
    border-radius: 12px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
    padding: 2rem;
  }
}
```

**Touch-friendly sizing:**
```css
#todo-input {
  padding: 0.75rem 1rem;  /* slightly taller for fat fingers */
  font-size: 1rem;        /* 16px minimum to prevent iOS zoom */
}

#add-btn {
  padding: 0.75rem 1.25rem;
  min-width: 64px;        /* minimum touch target */
}

.todo-checkbox {
  width: 24px;
  height: 24px;
  min-width: 24px;
}

.delete-btn {
  padding: 0.5rem;
  font-size: 1.25rem;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### 2. Swipe Gesture Module (gestures.js)

Implement simple swipe-to-delete using `touchstart` / `touchmove` / `touchend` events. Use `translateX` to visually push the item, then delete on threshold.

```js
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
```

### 3. Update app.js

```js
import { initGestures } from './gestures.js';

initGestures('#todo-list', (index) => {
  if (confirm(`Delete "${todos[index].text}"?`)) {
    todos.splice(index, 1);
    saveTodos(todos);
    renderTodos(todos);
  }
});
```

### 4. Visual swipe indicator (CSS)

Add a red overlay that appears behind the item as it's swiped:

```css
.todo-item {
  position: relative;
  overflow: hidden;
}

.todo-item::before {
  content: 'Delete';
  position: absolute;
  right: -60px;
  top: 0;
  height: 100%;
  width: 60px;
  background: #ef4444;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 500;
  border-radius: 0 8px 8px 0;
  transition: right 0.2s;
}

.todo-item.swiping::before {
  right: 0;
}
```

### 5. Prevent iOS double-tap zoom

Add to CSS or inline in `<head>`:
```css
* { touch-action: manipulation; }
```

## Verification

- [ ] Layout looks correct at 320px, 375px, 480px widths
- [ ] No horizontal scroll on any viewport
- [ ] Touch targets ≥ 44x44px
- [ ] iOS Safari does not zoom on input focus (font-size ≥ 16px)
- [ ] Swipe left reveals delete action
- [ ] Swipe past threshold deletes the todo
- [ ] Swipe under threshold snaps back
- [ ] Swipe works smoothly (no jank)
- [ ] Desktop still works with mouse (no regression)

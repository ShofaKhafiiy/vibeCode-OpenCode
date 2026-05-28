---
name: ui-enhancement
description: Add dark mode with CSS variables, localStorage toggle, and smooth animations for add/delete
---

# UI Enhancement Skill

## Rules

- Use CSS custom properties (variables) for theming
- Persist theme preference in localStorage
- Use CSS transitions and keyframe animations
- Keep animation durations under 300ms for utility, 500ms for emphasis
- Respect `prefers-color-scheme` for initial theme detection
- Never break existing layout or functionality
- Keep JS theme toggle in its own module

## Architecture

```
src/
 ├── css/
 │   └── style.css          (update with CSS variables + animations)
 ├── js/
 │   ├── app.js             (import theme.js, init on load)
 │   ├── theme.js           (CREATED — dark mode toggle + persistence)
 │   ├── ui.js              (add animation classes on render)
 │   └── storage.js         (unchanged)
 └── index.html             (add theme toggle button)
```

## Files to Modify

| File | Change |
|---|---|
| `src/css/style.css` | Refactor to CSS variables; add dark theme vars; add animations |
| `src/index.html` | Add theme toggle button in `.container` |
| `src/js/theme.js` | **CREATE** — ThemeManager class or functions |
| `src/js/app.js` | Import and init theme |
| `src/js/ui.js` | Add animation class to new `.todo-item` elements |

## Workflow

### 1. CSS Variables (style.css)

Define all colors as CSS custom properties on `:root`. Create a `[data-theme="dark"]` override block. Keep all color values in one place.

```css
:root {
  --bg-body: #f1f5f9;
  --bg-container: #ffffff;
  --bg-item: #f8fafc;
  --bg-item-hover: #f1f5f9;
  --border-light: #e2e8f0;
  --text-primary: #0f172a;
  --text-muted: #94a3b8;
  --accent: #3b82f6;
  --accent-hover: #2563eb;
  --danger: #ef4444;
}

[data-theme="dark"] {
  --bg-body: #0f172a;
  --bg-container: #1e293b;
  --bg-item: #334155;
  --bg-item-hover: #475569;
  --border-light: #475569;
  --text-primary: #f1f5f9;
  --text-muted: #94a3b8;
  --accent: #60a5fa;
  --accent-hover: #3b82f6;
}
```

Replace all hardcoded colors with `var(--variable-name)`.

### 2. Animations (style.css)

Add keyframes for adding and removing todo items:

```css
@keyframes slideIn {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes slideOut {
  from { opacity: 1; transform: translateX(0); }
  to   { opacity: 0; transform: translateX(30px); }
}

.todo-item {
  animation: slideIn 0.25s ease-out;
}

.todo-item.removing {
  animation: slideOut 0.2s ease-in forwards;
}
```

Add a smooth transition for body background on theme switch:

```css
body, .container, .todo-item, #todo-input, #add-btn {
  transition: background-color 0.3s, border-color 0.3s, color 0.3s;
}
```

### 3. Theme Module (theme.js)

Create a small module that handles:
- Reading `localStorage` for saved theme
- Falling back to `prefers-color-scheme` media query
- Applying `data-theme` attribute on `<html>`
- Exposing a `toggleTheme()` function
- Saving preference to localStorage

```js
const THEME_KEY = 'theme';

function getPreferredTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function initTheme() {
  const theme = getPreferredTheme();
  document.documentElement.setAttribute('data-theme', theme);
  updateToggleButton(theme);
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(THEME_KEY, next);
  updateToggleButton(next);
}

function updateToggleButton(theme) {
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}
```

### 4. Update app.js

```js
import { initTheme, toggleTheme } from './theme.js';

initTheme();
document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
```

### 5. Update ui.js

Add animation classes:
- On create: the `slideIn` animation plays automatically via CSS on `.todo-item`
- On delete: add `.removing` class, wait for animation to end, then actually remove

```js
export function renderTodos(todos, onDelete) {
  // ... existing render logic ...
}

export function removeTodoItem(li, callback) {
  li.classList.add('removing');
  li.addEventListener('animationend', () => callback(), { once: true });
}
```

Update `deleteTodo` in `app.js` to use `removeTodoItem` instead of immediate splice.

### 6. Update index.html

Add toggle button inside `.container`:

```html
<div class="container">
  <div class="header">
    <h1>Todo List</h1>
    <button id="theme-toggle" class="theme-toggle">🌙</button>
  </div>
  <!-- rest unchanged -->
</div>
```

Add CSS for `.header` and `.theme-toggle`.

## Verification

- [ ] Theme persists across page reload
- [ ] Respects system dark mode on first visit
- [ ] Toggle button switches icon/text correctly
- [ ] All colors switch smoothly
- [ ] New todos slide in
- [ ] Deleted todos slide out before removal
- [ ] No flash of wrong theme on load (inline script or early init)

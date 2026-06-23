# Theme & Dark Mode

## Tech

Uses Tailwind v4's `@variant dark` directive — no CSS variables, no `tailwind.config.js`. Dark mode is toggled by adding/removing the `.dark` class on `<html>`.

## Implementation

### Tailwind Config (v4)

```css
/* src/index.css */
@import "tailwindcss";
@variant dark (&:where(.dark, .dark *));
```

### Toggle

In `SettingsProvider.jsx`:
```js
useEffect(() => {
  document.documentElement.classList.toggle("dark", theme === "dark");
}, [theme]);
```

The `useEffect` runs synchronously on settings load — no flash because the default theme is `"light"`.

### Default

Default theme is `"light"` (changed from `"dark"` to prevent a light→dark flash before settings loaded). Both signup and SetupWizard save `"light"` as the initial theme.

## Usage Pattern

```jsx
<div className="bg-white dark:bg-[#1a1a2e] text-gray-900 dark:text-gray-100">
```

Always use the `dark:` variant on every color property. The dark background palette centers on `#1a1a2e` (deep navy).

## Theme Values

| Property | Light | Dark |
|---|---|---|
| Background | `bg-white` / `bg-slate-100` | `dark:bg-[#1a1a2e]` / `dark:bg-[#1e1e3a]` |
| Text | `text-gray-900` | `dark:text-gray-100` |
| Muted text | `text-gray-500` | `dark:text-gray-400` |
| Card bg | `bg-white` | `dark:bg-[#1e1e3a]` |
| Border | `border-gray-200` | `dark:border-gray-700` |
| Sidebar | `bg-white` | `dark:bg-[#16162a]` |

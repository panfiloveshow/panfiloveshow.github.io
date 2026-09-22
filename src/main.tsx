import { StrictMode, startTransition } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import { track } from './lib/analytics';

// В метрику уходит только тип ошибки. Тексты исключений могут содержать ПДн.
window.addEventListener('error', (event) => {
  if (import.meta.env.DEV) console.warn('[sellico] JS error', event.error);
  track('js_error', { type: 'error' });
});
window.addEventListener('unhandledrejection', (event) => {
  if (import.meta.env.DEV) console.warn('[sellico] Unhandled promise rejection', event.reason);
  track('js_error', { type: 'unhandledrejection' });
});

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found');

// Первый рендер — переход: пока грузится ленивый чанк страницы (над ним нет Suspense),
// React ничего не коммитит и пререндеренный HTML остаётся на экране. Иначе подвал
// на мгновение прыгает под шапку и обратно — CLS 0.7–1.0 на всех контентных страницах.
startTransition(() => {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});

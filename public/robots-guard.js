(() => {
  const normalizedPath = window.location.pathname.length > 1
    ? window.location.pathname.replace(/\/+$/, '')
    : window.location.pathname;
  // Список пересобирается пререндером из scripts/site-routes.mjs; здесь — значение для dev.
  const publicPages = new Set(['/', '/privacy', '/personal-data-consent', '/pricing', '/features', '/marketplaces', '/wildberries', '/ozon', '/yandex-market']);
  if (!publicPages.has(normalizedPath)) {
    const robots = document.querySelector('meta[name="robots"]');
    if (robots) robots.setAttribute('content', 'noindex, nofollow');
  }
})();

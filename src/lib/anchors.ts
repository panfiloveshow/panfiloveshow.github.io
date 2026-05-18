export const SECTION_IDS = {
  hero: 'hero',
  features: 'features',
  wow: 'wow',
  how: 'how',
  demo: 'demo',
  proof: 'proof',
  pricing: 'pricing',
  cta: 'cta',
} as const;

export const APP_URL = 'https://sellico.ru';
export const LOGIN_URL = `${APP_URL}/login`;
export const REGISTER_URL = `${APP_URL}/register`;

export function scrollToSection(id: string): void {
  const el = document.getElementById(id);
  if (!el) {
    window.location.href = `/#${id}`;
    return;
  }
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function scrollToHashOnReady(): void {
  const hash = window.location.hash.replace('#', '');
  if (!hash) return;

  window.requestAnimationFrame(() => {
    const el = document.getElementById(hash);
    if (!el) return;
    el.scrollIntoView({ behavior: 'auto', block: 'start' });
  });
}

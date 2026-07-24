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

export function scrollToHashOnReady(): () => void {
  const hash = window.location.hash.replace('#', '');
  if (!hash) return () => undefined;

  let frame = 0;
  let attempts = 0;
  let observer: ResizeObserver | undefined;
  const timers: number[] = [];
  let stopped = false;

  const stop = () => {
    if (stopped) return;
    stopped = true;
    window.cancelAnimationFrame(frame);
    observer?.disconnect();
    timers.forEach((timer) => window.clearTimeout(timer));
    window.removeEventListener('wheel', stop);
    window.removeEventListener('touchstart', stop);
    window.removeEventListener('pointerdown', stop);
    window.removeEventListener('keydown', stop);
  };

  const alignTarget = (el: HTMLElement) => {
    if (stopped) return;
    const scrollMargin = Number.parseFloat(window.getComputedStyle(el).scrollMarginTop) || 0;
    if (Math.abs(el.getBoundingClientRect().top - scrollMargin) > 4) {
      el.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  };

  const findAndScroll = () => {
    const el = document.getElementById(hash);
    if (el) {
      alignTarget(el);
      observer = new ResizeObserver(() => {
        window.requestAnimationFrame(() => alignTarget(el));
      });
      observer.observe(document.body);
      [120, 400, 900, 1600, 2600].forEach((delay) => {
        timers.push(window.setTimeout(() => alignTarget(el), delay));
      });
      timers.push(window.setTimeout(stop, 3200));
      window.addEventListener('wheel', stop, { passive: true });
      window.addEventListener('touchstart', stop, { passive: true });
      window.addEventListener('pointerdown', stop, { passive: true });
      window.addEventListener('keydown', stop);
      return;
    }
    attempts += 1;
    if (attempts < 120) frame = window.requestAnimationFrame(findAndScroll);
  };

  frame = window.requestAnimationFrame(findAndScroll);
  return stop;
}

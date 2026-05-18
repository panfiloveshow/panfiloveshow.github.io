import { useEffect, useState } from 'react';

function getScrollProgress(): number {
  const { documentElement, body } = document;
  const scrollTop = window.scrollY || documentElement.scrollTop || body.scrollTop || 0;
  const scrollHeight = Math.max(documentElement.scrollHeight, body.scrollHeight);
  const viewportHeight = window.innerHeight || documentElement.clientHeight;
  const maxScroll = scrollHeight - viewportHeight;

  if (maxScroll <= 0) return 0;
  return Math.min(1, Math.max(0, scrollTop / maxScroll));
}

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      setProgress(getScrollProgress());
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, []);

  return (
    <div
      style={{ transform: `scaleX(${progress})` }}
      aria-hidden
      className="scroll-progress fixed inset-x-0 top-0 z-[60] h-[2px] origin-left transform-gpu bg-gradient-to-r from-brand-500 via-accent to-brand-400 shadow-glow-soft transition-transform duration-75"
    />
  );
}

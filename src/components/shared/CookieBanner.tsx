import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import {
  ANALYTICS_CONSENT_KEY,
  initAnalytics,
  OPEN_ANALYTICS_CONSENT_EVENT,
  readAnalyticsConsent,
} from '@/lib/analytics';
import { PRIVACY_POLICY_VERSION } from '@/lib/legal';

type CookieConsent = 'accepted' | 'declined';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const consent = readAnalyticsConsent();
        if (consent === 'accepted') initAnalytics();
        else if (!consent) setVisible(true);
      } catch {
        setVisible(true);
      }
    }, 800);
    const showSettings = () => setVisible(true);
    window.addEventListener(OPEN_ANALYTICS_CONSENT_EVENT, showSettings);

    return () => {
      clearTimeout(t);
      window.removeEventListener(OPEN_ANALYTICS_CONSENT_EVENT, showSettings);
    };
  }, []);

  const saveChoice = (choice: CookieConsent) => {
    const wasAccepted = readAnalyticsConsent() === 'accepted';
    try {
      localStorage.setItem(ANALYTICS_CONSENT_KEY, JSON.stringify({
        choice,
        documentVersion: PRIVACY_POLICY_VERSION,
        decidedAt: new Date().toISOString(),
      }));
    } catch {
      /* ignore */
    }
    setVisible(false);
    if (choice === 'accepted') initAnalytics();
    else if (wasAccepted) window.location.reload();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="region"
          aria-label="Согласие на использование cookie"
          initial={reducedMotion ? false : { y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { y: 60, opacity: 0 }}
          transition={reducedMotion ? { duration: 0 } : { type: 'spring', damping: 22, stiffness: 240 }}
          className="fixed bottom-3 right-3 z-50 w-[min(calc(100vw-1.5rem),252px)] sm:bottom-4 sm:right-4"
        >
          <div className="glass-light rounded-xl border border-ink-950/[0.06] p-2 shadow-card">
            <div className="flex items-start gap-2">
              <p className="min-w-0 flex-1 text-[10px] leading-snug text-ink-500">
                Cookies и аналитика.{' '}
                <a href="/privacy/" className="font-semibold text-brand-800 underline-offset-2 hover:underline">
                  Политика
                </a>
                .
              </p>
              <button
                type="button"
                onClick={() => saveChoice('declined')}
                aria-label="Отказать в аналитике"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-ink-600 transition-colors hover:bg-ink-950/5 hover:text-ink-950"
              >
                <X size={13} />
              </button>
            </div>
            <div className="mt-1.5 grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => saveChoice('accepted')}
                className="h-7 rounded-md bg-brand-800 px-2 text-[10px] font-semibold text-white shadow-[0_8px_18px_-12px_rgba(17,84,63,0.9)] transition-colors hover:bg-brand-900"
              >
                Разрешить
              </button>
              <button
                type="button"
                onClick={() => saveChoice('declined')}
                className="h-7 rounded-md border border-ink-950/15 bg-white px-2 text-[10px] font-semibold text-ink-700 transition-colors hover:border-ink-950/30 hover:text-ink-950"
              >
                Отказать
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type YandexMetrika = ((id: number, action: string, ...args: unknown[]) => void) & {
  a?: unknown[][];
  l?: number;
};

declare global {
  interface Window {
    ym?: YandexMetrika;
    dataLayer?: unknown[];
  }
}

export const ANALYTICS_CONSENT_KEY = 'sellico-cookie-consent';
export const OPEN_ANALYTICS_CONSENT_EVENT = 'sellico:open-cookie-settings';

export type AnalyticsConsentChoice = 'accepted' | 'declined';

export function readAnalyticsConsent(): AnalyticsConsentChoice | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
    if (stored === 'accepted' || stored === 'declined') return stored;
    if (!stored) return null;

    const parsed = JSON.parse(stored) as { choice?: unknown };
    return parsed.choice === 'accepted' || parsed.choice === 'declined' ? parsed.choice : null;
  } catch {
    return null;
  }
}

const configuredCounterId = Number(import.meta.env.VITE_YM_COUNTER_ID ?? 0);
export const YM_COUNTER_ID = Number.isFinite(configuredCounterId) ? configuredCounterId : 0;

export type AnalyticsEvent =
  | 'cta_click_hero'
  | 'cta_click_pricing'
  | 'cta_click_final'
  | 'cta_click_header_register'
  | 'cta_click_header_login'
  | 'pricing_select'
  | 'demo_request'
  | 'faq_open'
  | 'feature_open'
  | 'lead_submit'
  | 'banner_cta_click'
  | 'banner_dot_click'
  | 'scroll_50'
  | 'scroll_75'
  | 'scroll_100'
  | 'ai_referral'
  | 'js_error';

let initialized = false;
let webVitalsStarted = false;

export function hasAnalyticsConsent(): boolean {
  return readAnalyticsConsent() === 'accepted';
}

function detectAiReferral(): { source: string; referrerHost: string } | null {
  const utmSource = new URLSearchParams(window.location.search).get('utm_source')?.toLowerCase() ?? '';
  const referrerHost = document.referrer ? new URL(document.referrer).hostname.toLowerCase() : '';
  const candidate = `${utmSource} ${referrerHost}`;

  const sources: [RegExp, string][] = [
    [/chatgpt|openai/, 'chatgpt'],
    [/perplexity/, 'perplexity'],
    [/claude|anthropic/, 'claude'],
    [/gemini|bard/, 'gemini'],
    [/copilot|bing\.com/, 'copilot'],
  ];
  const match = sources.find(([pattern]) => pattern.test(candidate));
  return match ? { source: match[1], referrerHost: referrerHost || 'utm' } : null;
}

function installMetrikaQueue(): void {
  if (window.ym) return;
  const queue = ((...args: unknown[]) => {
    (queue.a ??= []).push(args);
  }) as YandexMetrika;
  queue.l = Date.now();
  window.ym = queue;
}

function startWebVitalsMonitoring(): void {
  if (webVitalsStarted || !window.ym || !YM_COUNTER_ID) return;
  webVitalsStarted = true;

  void import('web-vitals')
    .then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
      const report = (metric: {
        name: string;
        value: number;
        delta: number;
        id: string;
        rating: string;
        navigationType: string;
      }) => {
        const isCls = metric.name === 'CLS';
        const normalize = (value: number) => (isCls ? Number(value.toFixed(4)) : Math.round(value));

        window.ym?.(YM_COUNTER_ID, 'params', {
          params: {
            web_vitals: {
              [metric.name.toLowerCase()]: {
                value: normalize(metric.value),
                delta: normalize(metric.delta),
                rating: metric.rating,
                metric_id: metric.id,
                navigation_type: metric.navigationType,
                path: window.location.pathname,
              },
            },
          },
        });
      };

      onCLS(report);
      onFCP(report);
      onINP(report);
      onLCP(report);
      onTTFB(report);
    })
    .catch((error: unknown) => {
      if (import.meta.env.DEV) console.warn('[analytics] web-vitals unavailable', error);
    });
}

export function initAnalytics(): void {
  if (initialized || !YM_COUNTER_ID || !hasAnalyticsConsent() || typeof document === 'undefined') return;
  initialized = true;

  installMetrikaQueue();
  window.ym?.(YM_COUNTER_ID, 'init', {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: true,
  });

  if (!document.querySelector('script[data-sellico-metrika]')) {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://mc.yandex.ru/metrika/tag.js';
    script.dataset.sellicoMetrika = 'true';
    document.head.append(script);
  }

  const aiReferral = detectAiReferral();
  if (aiReferral) track('ai_referral', aiReferral);
  startWebVitalsMonitoring();
}

export function track(event: AnalyticsEvent, payload?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || !hasAnalyticsConsent()) return;
  if (window.ym && YM_COUNTER_ID) {
    window.ym(YM_COUNTER_ID, 'reachGoal', event, payload);
  }
  if (import.meta.env.DEV) {
    console.info('[track]', event, payload ?? {});
  }
}

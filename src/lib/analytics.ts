declare global {
  interface Window {
    ym?: (id: number, action: string, ...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export const YM_COUNTER_ID = 0;

export type AnalyticsEvent =
  | 'cta_click_hero'
  | 'cta_click_pricing'
  | 'cta_click_final'
  | 'cta_click_header'
  | 'pricing_select'
  | 'demo_request'
  | 'faq_open'
  | 'feature_open'
  | 'lead_submit'
  | 'banner_cta_click'
  | 'banner_dot_click'
  | 'scroll_50'
  | 'scroll_75'
  | 'scroll_100';

export function track(event: AnalyticsEvent, payload?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  if (window.ym && YM_COUNTER_ID) {
    window.ym(YM_COUNTER_ID, 'reachGoal', event, payload);
  }
  if (import.meta.env.DEV) {
    console.info('[track]', event, payload ?? {});
  }
}

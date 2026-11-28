const REGISTRATION_PREFILL_STORAGE_KEY = 'sellico:registration-prefill';
const REGISTRATION_PREFILL_TTL_MS = 15 * 60 * 1000;

export const LEGAL_DOCUMENTS = {
  privacy: {
    path: '/privacy/',
    version: '2026-09-02',
    updatedAt: '2 сентября 2026 года',
  },
  consent: {
    path: '/personal-data-consent/',
    version: '2026-09-01',
    updatedAt: '1 сентября 2026 года',
  },
} as const;

export function saveRegistrationPrefill(email: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(
      REGISTRATION_PREFILL_STORAGE_KEY,
      JSON.stringify({
        email,
        consentAt: new Date().toISOString(),
        consentVersion: LEGAL_DOCUMENTS.consent.version,
        privacyPolicyVersion: LEGAL_DOCUMENTS.privacy.version,
        expiresAt: Date.now() + REGISTRATION_PREFILL_TTL_MS,
      }),
    );
  } catch {
    // Регистрация останется доступна без автозаполнения.
  }
}

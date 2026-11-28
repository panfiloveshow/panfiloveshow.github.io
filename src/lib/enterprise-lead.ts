import { LEGAL_DOCUMENTS } from './legal.ts';

export type EnterpriseLead = {
  name: string;
  email: string;
  contact: string;
  company: string;
  teamSize: string;
  stores: string;
  marketplaces: string[];
  goal: string;
};

export async function submitEnterpriseLead(lead: EnterpriseLead, requestId: string): Promise<number> {
  const response = await fetch('/api/public/landing-applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      ...lead,
      name: lead.name.trim(), company: lead.company.trim(), email: lead.email.trim(),
      contact: lead.contact.trim(), goal: lead.goal.trim(), request_id: requestId,
      personal_data_consent: true,
      personal_data_consent_version: LEGAL_DOCUMENTS.consent.version,
      privacy_policy_version: LEGAL_DOCUMENTS.privacy.version,
    }),
    signal: AbortSignal.timeout(15_000),
  });
  const result = await response.json().catch(() => null) as { saved?: boolean; id?: number } | null;
  if (!response.ok || result?.saved !== true || !Number.isSafeInteger(result.id) || Number(result.id) <= 0) {
    throw new Error(response.status === 429
      ? 'Слишком много попыток. Повторите отправку через минуту.'
      : response.status === 422
        ? 'Проверьте заполнение полей и согласие на обработку данных.'
        : 'Не удалось подтвердить сохранение заявки. Повторите отправку — заполненные поля сохранены.');
  }
  return result.id!;
}

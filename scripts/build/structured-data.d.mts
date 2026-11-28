export const organizationAddress: Record<string, string>;
export const homeDirectAnswer: { title: string; text: string; points: string[] };
export function subscriptionOffers(): Record<string, unknown>[];
export function subscriptionService(options?: {
  id?: string;
  name?: string;
  url?: string;
  description?: string;
  image?: string;
}): Record<string, unknown>;
export function synchronizeHomeStructuredData(html: string): string;
export function speakableSpecification(route: Record<string, unknown>): Record<string, unknown> | undefined;
export function comparisonItemList(route: Record<string, unknown>): Record<string, unknown>;

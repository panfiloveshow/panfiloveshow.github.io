import editorialData from '@/content/editorial.json';

export type EditorialSource = {
  name: string;
  url: string;
  publisher: string;
};

export const EDITORIAL_AUTHOR = editorialData.author;
export const EDITORIAL_METHODOLOGY_URL = editorialData.methodologyUrl;

export function getEditorialSources(path: string): EditorialSource[] {
  const groupName = editorialData.pages[path as keyof typeof editorialData.pages];
  if (!groupName) return [];

  const sourceIds = editorialData.groups[groupName as keyof typeof editorialData.groups] ?? [];
  return sourceIds.map((sourceId) => editorialData.sources[sourceId as keyof typeof editorialData.sources]);
}

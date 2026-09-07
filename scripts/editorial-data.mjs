import editorialData from '../src/content/editorial.json' with { type: 'json' };

export const editorialAuthor = editorialData.author;
export const editorialMethodologyUrl = editorialData.methodologyUrl;

export function getEditorialSources(path) {
  const groupName = editorialData.pages[path];
  if (!groupName) return [];
  return (editorialData.groups[groupName] ?? []).map((sourceId) => editorialData.sources[sourceId]);
}

import type { Article } from "../../services/api/healthResourcesApi";

export function estimateReadingMinutes(content: string) {
  return Math.max(
    1,
    Math.ceil(content.trim().split(/\s+/).filter(Boolean).length / 200),
  );
}

export function readSavedArticleIds(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value)
      ? [
          ...new Set(
            value.filter(
              (id): id is string =>
                typeof id === "string" && /^[\w-]{1,64}$/.test(id),
            ),
          ),
        ].slice(0, 40)
      : [];
  } catch {
    return [];
  }
}

export function filterSavedArticles(
  articles: Article[],
  term: string,
  category: string,
  hindi: boolean,
) {
  const search = term.trim().toLocaleLowerCase();
  return articles
    .filter(
      (article) =>
        (!category || article.category === category) &&
        (!search ||
          [
            article.title_en,
            article.title_hi,
            article.excerpt_en,
            article.excerpt_hi,
            article.category,
            article.category_hi,
          ]
            .join(" ")
            .toLocaleLowerCase()
            .includes(search)),
    )
    .map((article) => ({
      article,
      title: (hindi && article.title_hi) || article.title_en,
    }));
}

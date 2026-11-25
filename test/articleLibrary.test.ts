import { test } from "node:test";
import assert from "node:assert/strict";
import { articleBodyLines, articleImageCandidates } from "../src/features/articles/articlePresentation.ts";
import {
  readSavedArticleIds,
  filterSavedArticles,
  estimateReadingMinutes,
} from "../src/features/articles/articleLibraryModel.ts";

test("tries uploaded and article-specific images before category covers", () => {
  const api = "https://backend.arogio.com/api/v1";
  const upload = "/api/v1/public/articles/00000000-0000-0000-0000-000000000001/thumbnail?v=revision";
  const cover = "/admin-assets/article-thumbnails/sleep.jpg";
  const image = "https://images.example.test/article.jpg";
  assert.deepEqual(articleImageCandidates(api, upload, image), [new URL(upload, api).href, image]);
  assert.deepEqual(articleImageCandidates(api, cover, image), [image, new URL(cover, api).href]);
  assert.deepEqual(articleImageCandidates(api, image, image), [image]);
  assert.deepEqual(articleImageCandidates(api, "//other.example.test/image.jpg", "http://images.example.test/article.jpg"), []);
});

test("formats two-hash lines as bold and preserves other lines and blank space", () => {
  assert.deepEqual(articleBodyLines("Introduction\r\n## Rest well\r\n\r\n  ##अगला भाग\nBody ## marker\n### Other\n##"), [
    { text: "Introduction", bold: false },
    { text: "Rest well", bold: true },
    { text: "", bold: false },
    { text: "अगला भाग", bold: true },
    { text: "Body ## marker", bold: false },
    { text: "### Other", bold: false },
    { text: "##", bold: false },
  ]);
});

test("restores a bounded, unique reading list without accepting malformed storage", () => {
  assert.deepEqual(readSavedArticleIds("{broken"), []);
  assert.deepEqual(readSavedArticleIds('{"id":"a"}'), []);
  assert.deepEqual(
    readSavedArticleIds(
      JSON.stringify([
        "article-1",
        null,
        2,
        "../unsafe",
        "article-1",
        "article-2",
      ]),
    ),
    ["article-1", "article-2"],
  );
  assert.equal(
    readSavedArticleIds(
      JSON.stringify(Array.from({ length: 100 }, (_, i) => `article-${i}`)),
    ).length,
    40,
  );
});

test("saved article search and category filtering work together across both languages", () => {
  const articles = [
    {
      id: "a",
      title_en: "Sleep and rest",
      title_hi: "नींद और आराम",
      excerpt_en: "Daily habits",
      excerpt_hi: "",
      category: "Sleep",
      category_hi: "नींद",
      thumbnail_url: "",
      image_url: "",
      author_name: "",
      created_at: "",
    },
  ];
  assert.equal(
    filterSavedArticles(articles, "नींद", "Sleep", true)[0].title,
    "नींद और आराम",
  );
  assert.equal(
    filterSavedArticles(articles, "  SLEEP ", "Sleep", false)[0].title,
    "Sleep and rest",
  );
  assert.equal(
    filterSavedArticles(articles, "sleep", "Nutrition", false).length,
    0,
  );
  assert.equal(
    filterSavedArticles(articles, "not present", "", false).length,
    0,
  );
});

test("reading duration uses complete text and rounds up at the 200-word boundary", () => {
  assert.equal(estimateReadingMinutes(""), 1);
  assert.equal(estimateReadingMinutes("???? ".repeat(200)), 1);
  assert.equal(estimateReadingMinutes("word ".repeat(201)), 2);
});

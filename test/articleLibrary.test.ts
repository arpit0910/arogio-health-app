import { test } from "node:test";
import assert from "node:assert/strict";
import {
  readSavedArticleIds,
  filterSavedArticles,
  estimateReadingMinutes,
} from "../src/features/articles/articleLibraryModel.ts";

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

# Article categories and thumbnails

Updated 1 November 2026. This extends the existing Arogio visual system; `PRODUCT.md`, `DESIGN.md` and `.impeccable/design.json` remain the brand authority.

## Using the mobile library

Open Articles from the app menu or **Browse all articles** on Home. Swipe the topic photographs horizontally and select a topic to filter. **All topics** removes only the topic selection. Topic counts include published articles; the result count reflects the current search and category together.

Enter a title or category in English or Hindi, then use the keyboard Search action or the arrow button. Clearing the search field removes the search. Open the sort control beside the result count for **Newest first**, **Oldest first**, **Title A–Z** or **Title Z–A**. Search, category, sort and reading language apply before pagination. Each page contains up to 12 articles; changing these controls returns to page 1. **Clear filters** clears search/category and restores newest first.

The header reading-language action switches article/topic labels and title sorting between English and Hindi. Missing Hindi text falls back to English. The article reader also offers a language switch when Hindi content exists. Open an article row to read its selectable content; use Android system Back to return. Retry controls handle failed article or topic requests; no matches offers Clear filters. Pull to refresh reloads articles and topics.

Every topic and article has a photograph. Image precedence is article override, category override, then bundled topic image. Nine sourced Unsplash photos cover the 17 supplied topics; related topics share images. These are illustrative photographs, not unique illustrations or endorsements. Default images are bundled in the app and work offline; failed custom image requests fall back to a local topic photo. Article data still requires a successful API request or existing query cache; this is not a complete offline library.

## Maintaining content

In Admin, open **Articles → Manage categories**. Add a category or edit its Hindi name, English description and public HTTPS image URL. The English category name is an immutable key. To reclassify an article, edit its category in the article editor. Categories with no published articles remain manageable in Admin but are absent from public topic browsing.

Leave an article image blank to inherit its category image; leave a category image blank to use the topic default. A custom URL must be publicly accessible HTTPS. Mobile requests load the supplied image directly; this feature does not upload or host custom photographs. The server stores the editable override separately from the resolved display thumbnail.

The supplied `Arogio_Final_Health_Articles_284.xlsx` contains 284 bilingual articles, 17 category names/Hindi names, English descriptions and no images. The original is preserved in backend `imports/`. Content, authorship, dates and publication flags are preserved; implementation has not clinically reviewed or rewritten the workbook.

Preview the original workbook in Admin, review 284 rows/17 categories and any errors, then Apply import. Keep its Articles, Categories and Read Me sheets intact. Valid prefixed SpreadsheetML and table metadata are normalized for the values-only reader. Formula/hyperlink/error cells and unsupported workbook structures are rejected. Existing CSV/single-sheet formats still work. Optional article/category `image_url` columns accept overrides; blank or omitted imported image values preserve existing custom images. Re-imports upsert export IDs, and writes are atomic.

## Deployment and technical handoff

Deploy the backend first, including its thumbnail assets and migration. Run `npm run db:migrate:production` before using the updated Admin/API. Migration `0012_jazzy_princess_powerful.sql` creates category metadata, adds article image overrides and indexes category/publication. It does not import articles. Then use Admin Preview/Apply on the original workbook and distribute the updated app. No production deployment or import has been performed in this implementation session. See backend `ARTICLE_CATEGORIES.md` for operational steps and validation details.

`src/features/directory/ArticlesScreen.tsx` owns topic/search/sort/pagination and the reader; `api.ts` validates responses and sends query parameters; `ArticleThumbnail.tsx` maps topic defaults and handles failed remote images. Navigation uses the screen's `useRouter()` instance. The shared header memoizes its navigation row so local filter state does not redraw it; the menu icon uses native bars while other shared icons retain their SVG rendering.

Authenticated `GET /api/v1/article-categories` returns published category metadata/counts. `GET /api/v1/articles` accepts `search`, exact `category`, `sort`, `language`, `page` and `limit`; drafts remain private. Responses retain legacy `categories` and add `categoryDetails`, `total`, `category_hi` and `thumbnail_url`. Hindi title sorting falls back to English, with UUID tie-breakers. Admin category listing/upsert remains super-admin protected and audited.

## Verification and remaining limits

Reported checks: frontend check suite (119 tests); backend lint/build and 108 unit tests; 21 selected directory/application HTTP tests; Drizzle migration check. Import coverage includes the exact workbook, repeat-import idempotency, custom-image preservation and combined search/category/sort. These are implementation checks, not a production import.

Independent full review returned **ship**, with no material fixes, within the Android emulator, Admin UI and engineering scope. The 14 accepted PNG captures in `.impeccable/review/article-categories/` are `qa-library`, `qa-category`, `qa-sort`, `qa-sorted`, `qa-hindi`, `qa-reader`, `qa-reader-repeat`, `qa-small` (320dp, 130% text), `qa-tablet` (1067dp), `qa-dark`, `qa-dark-reader`, `admin-articles`, `admin-categories` and `admin-category-editor`. Other captures are superseded development evidence. Repeated reader navigation after language changes, stable shared navigation rendering and centered search-arrow alignment were verified.

The verified local APK is `dist/apk-qa/arogio-build36-local.apk`: package `com.arogio.health`, version 1.0.1 (36), ARM64/ARMv7, Android API 26+, 65,631,372 bytes. SHA-256: `57b958021f66a04167be811f8f5326ac224ca3373ba3db4f65f5a7f2f364b8f9`. Archive CRC and APK signature checks passed. Certificate SHA-256 `da57724f3a0c612c29f82b4f0e0f0c256cd3d8eacfddaf18aff7755df9eeb637` matches the prior local debug/test key. The production API URL is present and the emulator API URL absent. All nine bundled JPEG resources and their Unsplash provenance were verified despite obfuscated resource names. This is a local test build, not a store release or a physical-device runtime verification.

The emulator snapshot `arogio-before-article-categories` was restored successfully. Original renderer properties were restored before final QA, and the disposable local QA backend was stopped. No production deployment, import or production database write occurred.

Validation remains limited to Android emulators and the tested Admin UI/engineering paths. iOS, physical-device behavior, screen-reader operation and clinical content review have not been verified.

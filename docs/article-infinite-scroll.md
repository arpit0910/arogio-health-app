# Infinite article browsing

4 November 2026. Articles now use a virtualized FlatList with automatic next-page loading near the end of the scroll. Pages append without resetting scroll position; overlapping article IDs are deduplicated. Search, topic, sort and language each identify a separate feed and reset the list to page one. Pull-to-refresh revalidates the loaded feed. Failed next-page requests retain the existing articles and expose Retry; empty or terminal pages stop loading. Previous/Next buttons and page labels are removed from Articles. Home's preview and bank pagination are unchanged.

AppScreen has an opt-in non-scrolling container so the article list owns its vertical scroll rather than nesting a virtualized list in a vertical ScrollView. Other screens keep the existing default.

Lint, typecheck and 136 tests pass. New screen-level tests use the real TanStack InfiniteQueryObserver to verify appending, duplicate end-of-list signals, deduplication, terminal pages, failure/retry and search/category resets. Light English (320) and dark Hindi (390) compositions are under `.impeccable/review/ui-system/articles-*`. Native-device scroll acceptance remains a phone check. The Android artifact is recorded in the build-41 log.

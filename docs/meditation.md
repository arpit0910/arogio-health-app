# Meditation and breathing

The library is now administered by the backend. Published videos and guided practices are loaded from `/meditation/content`, including bilingual copy, timed steps, repeat counts, sections and display order. Content refreshes on page entry and pull-to-refresh, with further pages available through More practices & videos. A successful empty library stays empty; first-load API failure offers a labelled built-in fallback. See `D:/arogio_health_backend/MEDITATION_MODULE.md` for deployment details. The four practices and two original supplied videos below are the initial seeded content.

The landing page also contains an Affirmations section with the two supplied YouTube videos (`s2NISyShKXM` and `fG1oNm2tCro`). Thumbnail cards open the original video in YouTube or the browser on tap, without autoplay. Failed thumbnail loads retain the title and watch action; failed link opens show a retry message. Internet is required for video viewing. The first video uses a neutral label because its title could not be verified. Both entries and section copy support Hindi.

The Meditation tab offers four offline, silent written practices: gentle breathing (2 minutes), breath awareness (3 minutes), body scan (5 minutes), and sensory grounding (2 minutes). Each has preparation, a full readable guide, and a timed sequence with start, pause, resume, end and restart. Completing a timer makes no health or adherence claim; sessions are not stored or uploaded.

Elapsed time derives from a timestamp rather than counting interval callbacks. Leaving the route or backgrounding pauses the session; returning requires Resume. There are no breath holds, forced deep breaths, audio, new permissions or dependencies.

Content was informed by [NHS comfortable breathing guidance](https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/breathing-exercises-for-stress/) and [NCCIH mindfulness information](https://www.nccih.nih.gov/health/meditation-and-mindfulness-effectiveness-and-safety/). The written sequences are app-authored introductory wellness exercises, not clinical treatment protocols. Users are told to stop for dizziness, breathlessness or distress, and may keep their eyes open or skip a practice.

Preview the actual screen using `node scripts/preview-ui-system.cjs 320 meditation light en` (composition only). Native timer, background and screen-reader checks remain device acceptance work.

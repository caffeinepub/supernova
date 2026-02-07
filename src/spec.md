# Specification

## Summary
**Goal:** Make cooking answers (e.g., “How do I bake cookies?”) consistently structured, plain-English, and easy to follow, even when retrieved snippets are messy or incomplete.

**Planned changes:**
- Update cooking-answer generation to output clearly labeled sections (e.g., **Ingredients:**, **Steps:**, **Tips:**), with **Steps** as an ordered list of short, concrete actions.
- Ensure cookie-baking answers include essential specifics (oven temperature guidance, approximate bake-time range, and doneness cues) without requiring users to read linked sources.
- Improve the cooking-response formatter to clean/normalize extracted content (remove clipping/HTML artifacts, avoid partial keyword context, dedupe boilerplate) while preserving existing ConversationThread structured-cooking rendering behavior.
- Add fallback behavior so cooking prompts still produce a helpful structured guide when sources are sparse or not cleanly extractable.

**User-visible outcome:** When users ask cooking questions, they see a clear, step-by-step guide with readable sections (including key details like temps/timing/doneness), rather than truncated or unstructured excerpts—even if retrieval results are imperfect.

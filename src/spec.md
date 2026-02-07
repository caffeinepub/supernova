# Specification

## Summary
**Goal:** Add photo attachments to chat messages so users can upload images from the composer and see them persisted and rendered in conversation history and exports.

**Planned changes:**
- Add a photo upload control to the chat composer with image file picking (PNG/JPG/WebP), thumbnail previews, and per-image removal before sending.
- Update message sending to support optional photo attachments and render attached photos inline with the corresponding user message in the conversation thread.
- Extend backend conversation entry storage and APIs to persist optional photo attachments (bytes, content-type, filename when available) and update frontend save/fetch hooks to use the updated API.
- Include photo attachment data in the existing user data export output.

**User-visible outcome:** Users can attach one or more photos to a chat message, preview/remove them before sending, and later see the same photos when reopening conversation history or exporting their data.

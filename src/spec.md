# Specification

## Summary
**Goal:** Persist per-user multi-conversation chat history across canister upgrades and allow authenticated users to export their full data as a downloadable JSON file.

**Planned changes:**
- Update the Motoko backend to store each authenticated user’s conversation history as multiple separate conversations in stable state, with APIs to create, list, fetch, append to, and delete conversations (with per-user access control).
- Update the frontend chat UI/flow to support multiple conversations end-to-end (sidebar list, “New chat” creates/switches, sending appends to active conversation, switching loads correct thread).
- Add a user data export feature: backend API returns the authenticated user’s export payload (profile + conversations + entries + sources) and frontend provides an “Export data” control that downloads a `.json` file locally.

**User-visible outcome:** Logged-in users can manage multiple persistent chat threads (create, switch, and delete conversations), and can download an exportable JSON file containing their profile (if present) plus all conversations, messages, and source metadata.

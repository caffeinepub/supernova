# Specification

## Summary
**Goal:** Make the app usable without login by preventing unauthorized backend calls, adding a clear guest mode experience, and improving Internet Identity login reliability and error feedback.

**Planned changes:**
- Gate authenticated React Query hooks (queries/mutations) on Internet Identity authentication state so unauthenticated sessions do not call protected backend methods or trigger authorization traps/retries.
- Add a first-class Guest mode UX: keep chat composer enabled for unauthenticated users, label the session as Guest, and clearly indicate that history/saving/export require login.
- Improve header login control behavior: stable loading state, actionable English error messages on failures (including “User is already authenticated”), and prevent any infinite login/logout loop.

**User-visible outcome:** Users can continue chatting in Guest mode without crashes or backend authorization errors, and can log in (even mid-session) to unlock history/saving/export with clearer, more reliable login feedback.

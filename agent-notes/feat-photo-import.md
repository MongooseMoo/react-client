# Photo import button

## Goal
Q, 2026-10-29: take pictures of real things and turn them into MOO objects. This branch is the client part: a Photo button that sends a resized JPEG to the MOO. The MOO side is `$photo_import` (`/api/photos/upload`, `@photo` review and accept), live since 2026-10-30. Full plan: the Mongoose hub's `agent-notes/photo-ingestion.md`.

## State
- `src/photoUpload.ts`:
  - `prepareJpeg` decodes the photo, scales its long edge to at most 1568 px, and re-encodes it as JPEG 0.85 through a canvas, which drops EXIF.
  - `uploadPhoto` gets the `Client.WebPush` token and POSTs to `/api/photos/upload`.
- `src/components/PhotoPanel.tsx`, its own sidebar tab "Photos" (Q, 2026-10-30: "on its own tab I'd reckon"). It is last, so existing tab numbers are unchanged.
  - A file input with no `capture` attribute, so a phone offers camera or library.
  - A `role="status"` line keeps the last result. It is the only announcement, to avoid speaking it twice.
- The first version was a button beside the voice button; it was replaced by the tab and `input.tsx` is back as it was.
- `sidebar.test.tsx` counts Photos: the 7th of six base tabs, and 10th (`Control+Shift+0`) with MIDI and Haptics.
- Tests: `src/photoUpload.test.ts`.

## Decisions and why
- No new GMCP package: the MOO tells the player in game when the draft is ready.
- Share target not wired: it feeds FileTransfer staging, and changing that flow was not asked for.
- Error reasons come from the MOO's JSON. Caddy's 413 has no body, so the status names it.

## Next step
Merge after CI. Then live acceptance: a builder takes a photo on a phone, gets the in-game "Your photo is read" line, and runs `@photo` and `@photo accept`.

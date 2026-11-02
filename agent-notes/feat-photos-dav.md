# feat/photos-dav: Photos tab sends to the photos folder

## Goal
Q, 2026-11-01: photo upload merged with WebDAV, with no binary data pushed through the MOO. The Photos tab now PUTs each picture into the player's own `/dav/photos/` folder (served by Caddy from disk; the MOO only authorizes each request and is told when a file arrived). Full plan and evidence: the Mongoose hub's `agent-notes/dav-uploads.md`.

## State
- `src/photoUpload.ts`: `uploadPhotos` gets one push token, prepares every picture first, then PUTs one picture as `/dav/photos/<uuid>.jpg`, or several as `MKCOL /dav/photos/<uuid>/` and `001.jpg`, `002.jpg` ... (the MOO makes a subfolder one album once it has been quiet for 5 s, so the pictures are sent back to back). Refusals: 413 is "too large"; the MOO's plain-text reason (403 builders only) is passed on. `uploadPhoto` and the `?set=&count=` query are gone.
- `src/apiOrigin.ts`: `/dav/` paths go to the API origin like `/api/`. `vite.config.ts`: dev proxy for `/dav` to https://mongoose.world (Caddy serves the folder, not the MOO's port).
- Tests rewritten in `src/photoUpload.test.ts`, one added in `src/apiOrigin.test.ts`. Local `npm ci` refuses in this worktree (`--allow-scripts is not allowed in project-scoped installs`); CI on the PR is the check.

## Decisions and why
- Prepare all, then send: a slow phone preparing the next picture could otherwise leave a gap longer than the MOO's 5 s wait and split an album.
- The browser's CORS preflight is answered by the MOO (`$httpd:handle_request`), which now allows PUT and MKCOL.

## Next step
CI, merge, deploy; then the MOO's old `/api/photos/upload` path is deleted.

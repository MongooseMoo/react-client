# Photo import: camera-frame files and spoken results

## Goal
Q, 2026-10-30: "I just uploaded doorbell.jpg from the downloads folder, nothing, no error, nothing."

## State
- Cause 1: the file begins `--frameboundary`, a doorbell camera's stream frame with the JPEG after its header. `createImageBitmap` refuses it ("The source image could not be decoded"). This was reproduced in Chrome with the real file through the real input.
  - Fix: `jpegStart` in `src/photoUpload.ts` finds `FF D8 FF` in the first 4 KB, and `prepareJpeg` decodes from there.
- Cause 2: the error went only to a polite `role="status"` paragraph in the sidebar, and Q heard nothing.
  - Fix: `PhotoPanel` speaks every result through `announce(text, "assertive")`, as the rest of the client does. The paragraph keeps the last result, without a live role, so nothing is spoken twice.
- Tests: two `jpegStart` cases in `src/photoUpload.test.ts`.

## Next step
CI on the PR. After it deploys, retry Q's `doorbell.jpg` through the live Photos tab.

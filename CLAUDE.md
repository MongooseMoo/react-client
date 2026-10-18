# Mongoose Web Client

## Visual Screenshots

Screenshot tool for visual comparison during UI work:
- Script: `scripts/take-screenshot.mjs`
- Usage: `node scripts/take-screenshot.mjs <label>`
- Output: `screenshots/<label>-desktop.png` (1280x800 viewport)
- Requires: Dev server running at localhost:5173
- Auto-login: Uses `?username=guest&password=guest`
- Screenshots dir is gitignored (do not commit screenshots)

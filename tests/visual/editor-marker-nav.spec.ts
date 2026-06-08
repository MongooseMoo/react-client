import { expect, test } from '@playwright/test';

// Piece 3 (editor a11y): PROOF that F8 / Shift+F8 navigate between diagnostic
// markers in our Monaco editor AND that each jump is announced to assistive tech.
//
// We add NO keybindings here. F8 (editor.action.marker.nextInFiles) and
// Shift+F8 (editor.action.marker.prevInFiles) ship with the standalone Monaco
// build we load, together with their built-in `aria.status` announcement that
// renders the gotoError peek widget. This spec drives the real editor end to end
// and asserts the built-in behavior actually works for a blind user.

const EDITOR_REFERENCE = '#1:test';

// MOO source that yields exactly two parser ERRORS on different lines:
//   L2: `frobnicate(player);`  -> unknown-builtin  (frobnicate is not a builtin)
//   L4: `endif`                -> unexpected-close  (endif without matching if)
// Both are synchronous parser diagnostics (no tree-sitter needed), so the
// markers are pushed via setModelMarkers as soon as the model loads.
const MOO_SOURCE_LINES = [
  'notify(player, "start");',
  'frobnicate(player);',
  'notify(player, "middle");',
  'endif',
  'notify(player, "done");',
];

const FIRST_MARKER_MESSAGE = 'frobnicate is not a known ToastStunt builtin.';
const SECOND_MARKER_MESSAGE = 'Unexpected endif without a matching if.';

test.describe('Editor marker navigation (F8 / Shift+F8)', () => {
  test('F8/Shift+F8 navigate between diagnostics and announce them', async ({ page }) => {
    // Monaco is fetched from a CDN at runtime; give the editor room to load.
    test.setTimeout(90_000);
    // 1. Open the editor route directly, then deliver the document the way the
    //    app does in production: a BroadcastChannel('editor') `load` message.
    await page.goto(`/editor?reference=${encodeURIComponent(EDITOR_REFERENCE)}`);

    // Monaco is loaded from a CDN at runtime; wait for the real editor to mount.
    // (In this SR-optimized build the input element is `textarea.ime-text-area`.)
    const editorTextarea = page.locator('.monaco-editor textarea').first();
    await expect(editorTextarea).toBeVisible({ timeout: 60_000 });

    // Deliver content via the same channel the parent window uses.
    await page.evaluate(
      ({ reference, lines }) => {
        const channel = new BroadcastChannel('editor');
        channel.postMessage({
          type: 'load',
          clientId: 'e2e-marker-nav',
          session: {
            contents: lines,
            name: reference,
            reference,
            type: 'moo-code',
          },
        });
        channel.close();
      },
      { reference: EDITOR_REFERENCE, lines: MOO_SOURCE_LINES },
    );

    // 2. The two parser errors must reach Monaco as markers. We prove they were
    //    pushed by asserting the app's own problems panel lists both messages.
    const problems = page.locator('.editor-problems');
    await expect(problems).toBeVisible({ timeout: 30_000 });
    await expect(
      problems.locator('.editor-problem-message', { hasText: FIRST_MARKER_MESSAGE }),
    ).toBeVisible();
    await expect(
      problems.locator('.editor-problem-message', { hasText: SECOND_MARKER_MESSAGE }),
    ).toBeVisible();

    // Focus the code surface so the editor-scoped F8 keybinding is in effect.
    // Click the visible text region (the hidden ime-text-area cannot be clicked);
    // Monaco routes keyboard events through its focus tracker once focused.
    await page.locator('.monaco-editor .view-lines').click();
    await expect(page.locator('.monaco-editor.focused')).toBeVisible();

    // The gotoError peek widget Monaco opens on navigate. Its `.message` block is
    // `role="alert" aria-live="assertive"` — the element AT reads aloud. We assert
    // against the concrete message text per marker, not merely "a widget exists".
    const peekMessage = page.locator('.monaco-editor .peekview-widget .message[role="alert"]');

    // 3. Press F8 -> navigate to the first marker (line 2, frobnicate). The peek
    //    appears and announces that marker's message.
    await page.keyboard.press('F8');
    await expect(peekMessage).toBeVisible({ timeout: 15_000 });
    await expect(peekMessage).toContainText(FIRST_MARKER_MESSAGE);
    await expect(page.locator('.monaco-editor .peekview-title')).toContainText('of 2');

    // 4. Press F8 again -> advance to the second marker (line 4, endif). The same
    //    announcement element now reads the next marker's message.
    await page.keyboard.press('F8');
    await expect(peekMessage).toContainText(SECOND_MARKER_MESSAGE);

    // 5. Press Shift+F8 -> move BACK to the first marker. Announcement reverts.
    await page.keyboard.press('Shift+F8');
    await expect(peekMessage).toContainText(FIRST_MARKER_MESSAGE);
  });
});

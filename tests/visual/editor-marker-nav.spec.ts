import { expect, test } from '@playwright/test';

// Browser keyboard and live-region DOM evidence. This test does not run a
// screen reader or establish what users actually hear. F8/Shift+F8 are Monaco
// commands; the application does not add competing marker keybindings.

const EDITOR_REFERENCE = '#1:test';

// MOO source with two lexical errors on different lines:
//   L2: `frobnicate(player);`  -> unknown-builtin  (frobnicate is not a builtin)
//   L4: `endif`                -> unexpected-close  (endif without matching if)
// Lexical diagnostics are debounced after load; parser diagnostics may add
// further markers. Assertions identify the relevant messages rather than
// assuming a fixed total from every diagnostic source.
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
  test('F8/Shift+F8 navigate diagnostics and update the error live-region DOM', async ({ page }) => {
    // Monaco is fetched from a CDN at runtime; give the editor room to load.
    test.setTimeout(90_000);
    // 1. Open the editor route directly, then deliver the document the way the
    //    app does in production: a BroadcastChannel('editor') `load` message.
    // Register the sender before navigation, responding to the editor's ready
    // handshake. The editor only mounts after receiving this load message.
    await page.addInitScript(
      ({ reference, lines }) => {
        const channel = new BroadcastChannel('editor');
        channel.addEventListener('message', event => {
          if (event.data.type !== 'ready' || event.data.id !== reference) return;
          channel.postMessage({
            type: 'load',
            id: reference,
            clientId: 'e2e-marker-nav',
            session: {
              contents: lines,
              name: reference,
              reference,
              type: 'moo-code',
            },
          });
        });
      },
      { reference: EDITOR_REFERENCE, lines: MOO_SOURCE_LINES },
    );
    const origin = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5173';
    await page.goto(new URL(`/editor?reference=${encodeURIComponent(EDITOR_REFERENCE)}`, origin).href);
    const editorInput = page.getByRole('textbox', { name: `MOO code editor for ${EDITOR_REFERENCE}` });
    await expect(editorInput).toBeVisible({ timeout: 60_000 });
    await expect(editorInput).toHaveAttribute('aria-describedby', 'editor-statusbar');

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
    // The optimized focus surface can be a DIV; do not target a hidden textarea.
    await editorInput.focus();
    await expect(editorInput).toBeFocused();

    // The gotoError peek widget's message exposes alert semantics. Assert its
    // concrete DOM text, not presumed speech.
    const peekMessage = page.locator('.monaco-editor .peekview-widget .message[role="alert"]');

    // 3. Press F8 -> navigate to the first marker (line 2, frobnicate). The peek
    //    exposes that marker's message in the peek widget.
    await page.keyboard.press('F8');
    await expect(peekMessage).toBeVisible({ timeout: 15_000 });
    await expect(peekMessage).toContainText(FIRST_MARKER_MESSAGE);

    // 4. Press F8 again -> advance to the second marker (line 4, endif). The same
    //    live-region element contains the next marker's message.
    await page.keyboard.press('F8');
    await expect(peekMessage).toContainText(SECOND_MARKER_MESSAGE);

    // 5. Press Shift+F8 -> move BACK to the first marker. DOM text reverts.
    await page.keyboard.press('Shift+F8');
    await expect(peekMessage).toContainText(FIRST_MARKER_MESSAGE);
  });
});

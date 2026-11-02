# Interact mode: let the player type a menu choice's missing text

## Goal

Q, 2026-11-01: interact mode "will say one thing and interact with another", right after a menu.

## State

Reproduced on the live client (bundle `index-BV_5Naxg.js`) as a guest: chose "give <anything> to Morava_Guest" from Morava's interact menu; the server waited in `$command_utils:read` for the text; keys mode was still on, so typing was blocked; Tab said "Anadolu_Guest, 6 of 13" and Ctrl+I sent `interact #2272`, which the server took as the missing text ("I see no "interact #2272" here.").

Fix in this branch: `MenuPrompt` pauses keys mode (`pauseKeysMode`) when the chosen label contains `<anything>`; `Keystrokes.ts` keeps the interact cursor through that pause and does not handle Tab/Ctrl+I/Escape while paused; `input.tsx`'s existing `commandSent()` turns keys mode back on after the text is sent. Tests in `MenuPrompt.test.tsx` and `Keystrokes.test.ts`; contract in `docs/keystrokes.md`.

## Decisions and why

- Reuse the staged-command pause (`resumeOnSend`) instead of a new mechanism.
- Key on `<anything>` in the label: that is how the MOO's `interact_choices` marks a choice that will ask for text.

## Next step

PR, CI, merge per Q, live check, then remove worktree and branch.

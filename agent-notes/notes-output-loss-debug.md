# Output text loss bug

## User report
After a while a "N new messages" badge appears. Clicking it does nothing.
After restart the text is gone for good (never persisted).

## Ruled out
- Uncommitted fileTransferPeers change (unrelated).
- telnet/client byte path in fec4a87 (same logic; tests pass).
- Simple case: full 3000-line buffer, at bottom, 12 new lines -> rendered fine.

## Current lead
The badge means addToOutput ran (totalLinesAdded bumped) but the user was not
at the bottom. Next: find why the lines neither render nor persist:
the localStorage quota path in saveOutput, and exceptions in
addToOutput/handleOutputStoreEntries.

## ROOT CAUSE (confirmed by test)
handleOutputStoreEntries advanced lastOutputEntryId only AFTER handling succeeded.
If one entry throws, every later flush retries it, throws again, and drops everything
behind it forever (not rendered, not saved). Scratch test: "before" rendered,
after1..3 never did.
Also a badge race: componentDidUpdate checked isScrolledToBottom() before the rAF
scroll ran, so the badge came up even while at the bottom.

## Fix in progress (src/components/output.tsx)
- advance id first; try/catch per entry; plain-text fallback ('plain' sourceType)
- announce + autoLog wrapped so they can't abort a line
- badge uses the wasScrolledToBottom snapshot
- TODO: per-line guard in loadOutput, regression test, remove src/__scratch
- Still unknown: WHICH real message throws. The console.error now logs it.

## DONE (uncommitted)
Fix + loadOutput guard + regression test "keeps delivering output after one entry
fails to render" (fails on old code, passes now). Full suite 1126/1126. Live dev:
3 commands at the bottom, responses shown, no bogus badge.
Open: which real message throws. Look for "Failed to render output entry" in the console.

## REAL EVIDENCE (user's production console, 2026-09-23)
Repeating: TypeError reading 'removeAttribute' of undefined at freezeOverflow <- componentDidUpdate.
frozenHiddenCount > frozenDiv.children.length (counters drifted from the DOM). The throw
happens before scheduleSave, so nothing persists after the first one = text gone on restart.
How the drift happens is still unknown: 3 fuzz runs (growth, bursts, toggles, clear,
scroll-up/badge) never reproduced it.
Fix: freezeOverflow rebuilds when its container or child count doesn't match the counters
(console.warn with details); componentDidUpdate try/catch so the save always runs.
Writing the regression test: the persisted-history preload isn't loading in the test (debugging).
DONE: drift fix plus regression test "keeps rendering and saving when the frozen container
falls out of sync". Old code: no save after the drift (matches prod). New code: rebuilt and saved.
Full suite 1127/1127, tsc clean for output. Uncommitted. Root cause of the drift itself
still unknown; the console.warn "Frozen output container out of sync" will log details.

## ROUND 2 (after PR #130 deployed, still broken)
Production console: Preact internals throw "Cannot create property '__e' on string ' '" and
"insertBefore ... not a child of this node".
ROOT CAUSE REPRODUCED: reviewRecentOutputLine/copyRecentOutputLine (the Alt+number keys) call
renderToStaticMarkup(line.content) on a vnode that's mounted in the live window. Preact
vnodes are mutable; render-to-string corrupts them, and when the line leaves the live window
the unmount crashes -> DOM desync, lost text, likely the frozen drift too.
Test "reviewing and copying live lines does not corrupt them" reproduces the exact error;
without the review/copy calls it passes.
Fix: renderLineMarkup() builds fresh vnodes from source via recreateContentFromSource.
Use it everywhere: review, copy, freeze, announce.
Round-2 fix applied: renderLineMarkup (fresh vnodes from source) used for freeze, announce,
review and copy; one OutputLine per message (fixes multi-part HTML duplicating on restart).
Full suite 1133/1133, tsc clean. The corruption test fails on deployed master with the
exact '__e' error. Next: branch, PR, CI, merge.

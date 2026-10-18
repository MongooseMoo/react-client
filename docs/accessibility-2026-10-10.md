# Accessibility audit and cleanup

The audit reviewed command entry, sidebar tasks, output/history, Preferences,
startup, logs, the real Monaco editor, voice, MIDI, haptics and transfers. Parallel
source reviews were followed by production browser journeys and an independent
review. The objective was task completion with fewer avoidable gestures and
short, useful feedback. Each cleanup has its own commit.

## Findings and resulting behavior

| Task / audit finding | Cleanup and acceptance evidence |
| --- | --- |
| Leaving a command draft intercepted Tab and altered input | Tab and Shift+Tab leave the field in one gesture while preserving the draft; ordinary multiline caret movement works. |
| Sidebar shortcuts failed for hidden/current destinations; inserted tabs changed selection | One Ctrl+Shift+digit chord reveals and focuses a stable destination, including reselection. Selection survives tab insertion. Optional destinations retain fixed slots; help is collapsed in Keyboard Preferences. |
| Reordered/removed list entries could disagree with the action card | Selection and cards use stable IDs; removal recovers a surviving selection and useful focus. Typeahead supports finding entries. Player actions have distinct shortcuts and short names. |
| Excluded history still exposed focus stops; unread and review keys interfered with nested controls | Excluded history is inert. Revealed history retains Copy. Unread is a native button; jumping starts review at current output. Review follows stable entries, keeps its highlight and respects reduced motion. Nested inputs retain their own keys. |
| Quotation/log copying included UI text or lost actions in frozen history | Copy controls remain usable in revealed history, outside quotation text. Log copying preserves line boundaries and excludes interface text. Results are brief; failures persist for recovery. |
| Loading Preferences could leave focus outside or override user navigation | Cold and cached opens focus the loaded selected tab; navigation during loading is respected and closing restores the opener. Numeric settings retain intermediate drafts and validate before saving. Short names and separate help describe sliders. |
| Database selection needed pointer input; joining/loading failures lost useful state | Native Choose database works with keyboard. Join retains Room ID, associates errors and returns focus to the field; database boot failures keep recovery available. Startup layouts fit narrow widths. |
| A growing log list added repeated navigation stops | One selector plus a bounded action area. From the first of twenty logs, End then Enter opens the last. Export is two Tabs from the entry heading. Cancelling deletion retains the session; successful deletion focuses the selector. |
| Editor status did not describe the actual focused Monaco surface; problem filters added stops | Actual code inputs reference concise editor context while native Find help stays intact. Problem filters use arrow/Home/End navigation. Real F8/Shift+F8 markers, editing, Save, Revert, Undo/Redo and quick fixes are exercised in the production fixture. |
| Voice failures and device changes lacked usable outcomes | Voice retry/dismiss survives failed disconnects; stable callbacks avoid reconnecting during feedback. MIDI actions have explicit names and report in-use device loss/restoration. Haptic scan, cancellation and recovery have useful outcomes. Existing transfer acceptance/progress contracts are retained. |
| Automatic speech could duplicate incoming messages | Browser speech ownership is captured when a message is emitted and carried through queued output. Routine system messages no longer pollute heading navigation. Feedback does not repeat whole messages or narrate routine state changes. |
| Muted text, selected entries and output links were difficult to read | Theme colors provide readable secondary text, selection, links and filled-button text. Focus is visible on links, toggles and sliders; panels reflow. Copy feedback does not overlap content. |
| Escape destroyed sounds and loop progress | Escape pauses the shared engine, holds sound positions and pending starts, and parks segment timers. Explicit Resume continues held playback. Repeated Escape stays paused. Incoming voice and virtual MIDI honor the same policy. Failed transitions retain retryable ownership; independently stopped sources stay stopped. Haptic emergency stop remains available. |

## Verification

Run the locked install and checks:

```sh
npm ci --no-audit --no-fund
npm run typecheck
npm test
npm run test:audio-cache
npm run test:a11y
```

The production audio/cache fixture builds the bundle and exercises the real
Monaco editor and lazy feature recovery. The accessibility fixture serves that
bundle locally, blocks external connections, seeds protocol/IndexedDB data and
uses native keyboard input. A real audio source verifies an unchanged clock
during Escape pause and advancing playback after Resume.

The accessibility fixture checks all Preferences sections, Inventory, MIDI,
haptics, twenty logs, hidden/revealed history, Join and database selection. It
checks narrow widths, expanded text spacing, and actual Chromium browser zoom at
200% and 400% via an isolated fixture extension. Axe 4.10.3 asserts no violations
in its selected WCAG A/AA rules for these fixtures; this is bounded automated
evidence, not a claim of complete conformance. Set `A11Y_REPORT_DIR` to retain
screenshots, accessibility trees, full axe results (including incomplete rules)
and a journey summary. CI runs both production fixtures after the unit tests.

Actual screen-reader speech, physical MIDI/haptic devices, live voice calls and
OS notification delivery were not exercised. Browser semantics and marker alert
DOM are not a screen-reader transcript. A follow-up AT pass should use real
devices and review announcement ordering, interruption, focus recovery and
practical task effort across these same journeys before making broader claims.

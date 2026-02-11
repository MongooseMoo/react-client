# Output Virtualization Issues

This report captures the current issues observed in the virtualized output
implementation and why they can make behavior feel "almost right" but still
off. References point to the relevant code locations.

## Issues

1) Competing scroll containers
   - The `.output` wrapper is still scrollable (`overflow-y: auto`), while
     `react-virtuoso` manages its own internal scroller. The new-lines badge is
     rendered as a sibling, so the outer `.output` can become the actual scroll
     container. This desynchronizes Virtuoso's `atBottomStateChange` and
     `followOutput` callbacks, leading to jumpy or inconsistent auto-scroll.
   - References: `src/components/output.css:1`, `src/components/output.tsx:612`,
     `src/components/output.tsx:617`

2) Unstable item keys for virtualization
   - `OutputLine.id` is generated, but Virtuoso isn't given `computeItemKey`,
     so it defaults to index-based keys. When the output is trimmed or filtered
     (local echo), indices shift and Virtuoso can reuse cached measurements for
     the wrong item, causing flicker, incorrect heights, or unexpected jumps.
   - References: `src/components/output.tsx:387`, `src/components/output.tsx:398`,
     `src/components/output.tsx:593`, `src/components/output.tsx:617`

3) New-lines counter breaks after trimming
   - `componentDidUpdate` counts new lines using `slice(prevState.output.length)`.
     When the log trims from the front to enforce `MAX_OUTPUT_LENGTH`, the new
     array length equals the old length and the slice is empty, so `newLinesCount`
     stops incrementing even though new lines are arriving.
   - References: `src/components/output.tsx:276`, `src/components/output.tsx:398`

4) Click handler can throw on text nodes
   - `handleDataTextClick` calls `.closest()` on `event.target` assuming it is
     an `HTMLElement`. If the user clicks text inside a link, the target can be a
     `Text` node, which does not implement `.closest()`, causing a runtime error
     and breaking the handler in the virtualized scroller.
   - References: `src/components/output.tsx:504`

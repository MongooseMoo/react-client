# Task: Investigate Sidebar Layout Issue

## Context
The Mongoose MUD client has a layout problem visible in a screenshot. The right sidebar (Inventory, Users, MIDI, Files, Audio tabs) appears to be taking up horizontal space but showing empty/collapsed content. There's wasted space between the main text output area and the sidebar tabs.

## Objective
Answer these specific questions and report findings:

1. How is the sidebar's visibility/width controlled? (state variable name, where defined)
2. What CSS controls the sidebar width? (min-width, flex-basis, fixed width?)
3. What's the flex/grid structure between main output and sidebar?
4. Is there a "Hide Sidebar" toggle? What does it actually do to the DOM/styles?
5. Why might the sidebar take up space even when empty?

## Files to Investigate
Start with these likely locations:
- `src/App.tsx` - main layout structure
- `src/App.css` or similar - layout CSS
- Any component with "sidebar", "layout", or "panel" in the name
- Look for state like `sidebarVisible`, `sidebarCollapsed`, `showSidebar`

## Method
1. Find the main layout component
2. Trace how sidebar width/visibility is controlled
3. Check CSS for width constraints (min-width, flex-shrink, etc.)
4. Identify the specific cause of wasted horizontal space

## Output
Write findings to `./reports/layout-investigation-report.md` with:
- Answers to each question above
- The specific files/lines where layout is defined
- Your diagnosis of what's causing the layout issue
- Suggested fix approach (do NOT implement, just describe)

## CRITICAL: File Modified Error Workaround
If Edit/Write fails with "file unexpectedly modified":
1. Read the file again with Read tool
2. Retry the Edit
3. Try path formats: `./relative`, `C:/forward/slashes`, `C:\back\slashes`
4. NEVER use cat, sed, echo - always Read/Edit/Write
5. If all formats fail, STOP and report

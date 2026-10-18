# Task: Investigate Chat Blocks / Blockquotes

## Objective
Research the chat output blocks - the "Generic Janet recites:" sections with Copy buttons. These are apparently dynamic/complex. Understand the full picture. DO NOT MAKE CHANGES - research only.

## Questions to Answer
1. What component renders these blocks? Where defined?
2. How are they styled? What CSS files?
3. What makes them "dynamic"? (React state? GMCP? streaming?)
4. How does the Copy button work? Where positioned?
5. Are these actual <blockquote> elements or divs?
6. What triggers their creation? (MUD output parsing?)
7. Are there different types of blocks? (quotes, code, etc.)
8. What would styling changes affect? (all blocks? specific types?)

## Deliverable
Write a report to `./reports/investigate-chat-blocks.md` with:
- Component architecture for output/chat rendering
- How blocks are created and typed
- CSS files and selectors involved
- The Copy button implementation
- What "dynamic" means specifically
- Complexity map (what touches what)
- Risks of styling changes
- Suggested approach if we want to improve visual containment

## Rules
- READ ONLY - no edits
- This is the complex one - be thorough
- Trace from MUD output to rendered React component

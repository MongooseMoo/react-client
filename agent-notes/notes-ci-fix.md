# Master CI fix (2026-09-26)

- Cause: #136 (bbc34a4) needs tree-sitter-moocode 0.3.0 `line_comment`; package.json pinned ^0.2.0. Local node_modules was a symlink to ../tree-sitter-moocode (0.3.0), masking it.
- Done: merged grammar PR #3, tagged v0.3.0 → published to npm (release run 36273595852 went red only at the 60s verify step; grammar PR #2 fixes that). Created GH release v0.3.0 manually.
- react-client PR #137 bumps to ^0.3.0. Full suite passes locally (1160/1160). Waiting on PR CI.

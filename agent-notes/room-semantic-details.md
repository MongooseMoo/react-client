# Room semantic details

## Goal

Implement Q's authorized todo 4: render native body orientation/front, exposed support relationships, room finishes and applicable device state. The MOO owns meaning and state. The preceding fronted capability already supplies local front and heading. Selectable prose, new form/colour authoring and selection/Enlarge redesign are excluded.

## State

Implementation underway against the default branch in an isolated worktree. The coordinated MOO work and current decisions are recorded in C:/Users/Q/projects/mongoose/agent-notes/room-view-improvements.md. No MOO publisher is activated for this contract yet. Preserve the open avatar-face PR's figureMesh and portrait work; those files are not edited here.

## Decisions and why

Room.Layout stays the sole complete physical scene; Room.LayoutUpdate changes existing matching room/object incarnations with body records. Native membership/state events refresh snapshots. Remove acoustic visual membership and translation writers; keep audio entities/listener unchanged. Reuse current meshes, figures and camera. World shapes are already oriented and are never rotated again. Intrinsic body geometry uses its supplied pose. Surface names without authored colours stay neutral and are named in words.

## Surprises

The existing surface registry supplies species and acoustic coefficients, not authored visual colours. Power state has a read-only native getter; projection must not refresh or settle electronics. Fronted eligibility is distinct from the default body axis.

## Next step

Client contract, native pose/front rendering, support/state/finish words, rigid-body mesh reuse and browser coverage are implemented. Publish the branch and use PR CI for verification: local npm install failed with EALLOWSCRIPTS because the user allow-scripts policy is forwarded into Git dependency preparation (npm upstream issue 9783). No script policy was changed and no product test has run locally. Stage the client before activating the MOO publisher. Verify native saved source, production deployment and the affected journey before marking the task complete.

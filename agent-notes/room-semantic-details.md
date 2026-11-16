# Room semantic details

## Goal

Implement Q's authorized todo 4: render native body orientation/front, exposed support relationships, room finishes and applicable device state. The MOO owns meaning and state. The preceding fronted capability already supplies local front and heading. Selectable prose, new form/colour authoring and selection/Enlarge redesign are excluded.

## State

Client implementation is published in PR 247; current PR CI and production build pass. The branch includes the merged avatar-face work without editing figureMesh or portrait owners. The MOO snapshot now supplies this contract through one body constructor; geometry and finish mutation owners announce generic events. Room publication remains disconnected pending client deployment. Native state, source review and activation work are tracked in C:/Users/Q/projects/mongoose/agent-notes/room-view-improvements.md. MOO outcomes remain in conversation and the existing runner history.

## Decisions and why

Room.Layout stays the sole complete physical scene; Room.LayoutUpdate changes existing matching room/object incarnations with body records. Native membership/state events refresh snapshots. Remove acoustic visual membership and translation writers; keep audio entities/listener unchanged. Reuse current meshes, figures and camera. World shapes are already oriented and are never rotated again. Intrinsic body geometry uses its supplied pose. Surface names without authored colours stay neutral and are named in words.

## Surprises

Review also found that Plan still drew axis-aligned world bounds for a turned box. It now projects the intrinsic body's corners through the supplied quaternion and transforms existing form marks in that same frame; custom world shapes remain unchanged. Added an area/bounds regression for a quarter-diagonal body.

First PR CI identified stale movement expectations (the supplied physical delta puts y at 0.0..0.4) and scene construction leaving parent world matrices stale until the first render. Corrected the expectations and update world matrices when construction finishes, so geometry queries and labels see the same transforms as drawing.

The existing surface registry supplies species and acoustic coefficients, not authored visual colours. Power state has a read-only native getter; projection must not refresh or settle electronics. Fronted eligibility is distinct from the default body axis.

## Next step

Client contract, native pose/front rendering, support/state/finish words, rigid-body mesh reuse and browser coverage are implemented. Publish the branch and use PR CI for verification: local npm install failed with EALLOWSCRIPTS because the user allow-scripts policy is forwarded into Git dependency preparation (npm upstream issue 9783). No script policy was changed and no product test has run locally. Stage the client before activating the MOO publisher. Verify native saved source, production deployment and the affected journey before marking the task complete.

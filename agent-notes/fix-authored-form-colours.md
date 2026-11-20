# Authored form colours

## Goal

Draw the colour the MOO supplies for each part of a constructed object in the room viewer.

## State

The live Room.Layout producer resolves visible colour names through the MOO palette. Its optional `colour` record carries the original name and the sRGB hex value. The room scene uses that value on the individual mesh and falls back to its usual material when the value is absent or unreadable.

## Decisions and why

The MOO maps green to `#00ff00`. Resolving names in the world keeps both camera modes consistent with builder-authored colours and avoids substituting a browser palette.

## Surprises

The guest Room.Layout packet carries red (#ff0000) on the Mill Road charge valve, black (#000000) on the drain valve, and blue (#0000ff) on the rig lever. The proposed client change is in PR #264.

## Next step

Verify the scene regression in PR CI and the deployed client on the Mill Road handwheels.

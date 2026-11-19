# Authored room parts

## Goal

Let a player inspect visible authored parts from the room view using the same native look command as a text player.

## State

The client reads occurrence roles, labels and local axes from Room.Layout and Room.LayoutUpdate. A fitted drawer keeps its native open or close control. The build and the three edited test files passed. The ordinary guest's trestle record from the wire is the roomLayout.trestle.sample.json fixture.

## Decisions and why

Address the occurrence by host, lifetime and role. Labels can repeat. Apply the three supplied edge directions as a matrix so nested rotations under unequal scales retain their geometry.

## Surprises

The earlier wire format carried centres and extents only and remains readable. The trestle's authored slab is 1.4 metres wide, although the host's physical box is 1.2 metres wide. Drawing the supplied edges preserves that difference.

## Next step

Typing, pressing Enter on the slab button and clicking the slab in Dollhouse returned its native text. A private builder selected the foldout camera through @autoform and the guest inspected its screen while staying in the room. Re-selecting the shoulder camera removed the screen. Two guests separately opened and closed a fitted drawer, stored a letter, reopened the drawer graphically and retrieved the same letter. All browser checks used local assets against the live MOO. Public client delivery is pending.

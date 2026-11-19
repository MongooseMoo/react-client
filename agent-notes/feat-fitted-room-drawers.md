# Fitted drawers in the room view

## Goal

Open the same office desk drawer by ordinary text, keyboard or 3D picking and retrieve the same letter.

## State

The native maple desk in the superintendant's office has four independent containers. The live MOO includes the host's fitted drawer geometry, actions and visible contents in Room.Layout and its body updates. The local client draws and picks these parts, and the Things list offers keyboard actions. Two ordinary guest connections exercised the same temporary letter through typing, keyboard activation, an actual canvas click and retrieval. The raw native desk body is in the map fixtures.

## Decisions and why

Use the existing viewer-specific Room.Layout snapshot and ordinary player command transport. Draw the fitted host's authored boxes in its native body frame. Show the same fitting actions and visible contents in the keyboard-accessible list. The MOO owns all state and command resolution.

## Surprises

The fitted container's ordinary coordinates do not identify the authored occurrence inside the desk. Use the placement from the selected construction. The office desk's authored drawer fronts originally sat inside solid pedestals. The MOO now places them beyond the pedestal face and moves them forward when opened.

## Next step

Two repeated visits after the live Room.Info correction held the office through keyboard and pointer actions. The 3D desk label displayed the letter while visible and removed it after retrieval. Taking an item returns keyboard focus to its drawer. After merge, verify the public build with two guests in the office.

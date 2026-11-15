# GMCP Message: `Room.Layout`

In a spatial room the server tells the client what the room looks like inside: how big it is,
where its doorways are, and where each thing and person stands. The client draws it to scale in
the Map tab, north up, and says the same in words beside the picture.

## From the server

### `Room.Layout`

Sent with `Room.Info` whenever that `Room.Info` is for a spatial room. Not sent for other rooms.
It holds only what the recipient can see.

```json
{
  "num": 1234,
  "size": [3.81, 5.13, 2.44],
  "exits": [{"name": "west", "to": 1235, "at": [-1.905, -1.282, 0.0], "width": 0.9}],
  "things": [
    {"id": "#5678", "name": "oak table", "kind": "object", "fixed": false, "mounted": false,
     "shapes": [{"box": [[-0.5, 0.5], [0.2, 1.0], [0.0, 0.75]]}, {"sphere": [[0.1, 0.4, 0.9], 0.15]}],
     "origin": [0.0, 0.6, 0.375]}
  ]
}
```

All lengths are metres in the room's own frame: x east, y north, z up. x and y are measured from
the middle of the room, so it spans `-width/2..width/2` and `-depth/2..depth/2`; z = 0 is the floor.

| Field | Meaning |
|---|---|
| `num` | The room's object number, the same as `Room.Info` `num`. |
| `size` | `[width, depth, height]`: east to west, north to south, floor to ceiling. |
| `exits[].name` | The exit's name, the same key `Room.Info` `exits` uses. It is the command that takes it. |
| `exits[].to` | Where it leads (object number). |
| `exits[].at` | The middle of the doorway. The server puts a wall's doorway up to 5% of the room in from that wall (`$spatial_utils:coords_for_edge`); the client draws a point that close to exactly one wall as a doorway in it, and any other point (a corner, a hatch, a ladder, stairs) as a marked square where it is. |
| `exits[].width` | How wide the doorway is along its wall. |
| `things[].id` | `tostr(obj)`, the same id `Client.Spatial` uses for the thing. |
| `things[].name` | What to call it. |
| `things[].kind` | `player`, `person` (a living body that is not a player) or `object`. |
| `things[].fixed` | It cannot be picked up. |
| `things[].mounted` | It hangs on a wall or ceiling. |
| `things[].shapes` | Its solid parts: boxes `{"box": [[x0,x1],[y0,y1],[z0,z1]]}` and spheres `{"sphere": [[x,y,z], r]}`. May be empty; such a thing is listed but not drawn. |
| `things[].origin` | Where `Client.Spatial` placed this thing when the layout was built (its sound origin). |

## Keeping it current

The layout is not resent when things move. The client moves a thing's shapes by how far its
`Client.Spatial` position has gone from `origin`, and stops drawing a thing when `Client.Spatial`
sends `EntityLeave` for its id. A new `Room.Info` for a different room drops the layout; one for
the same room keeps it until the next `Room.Layout` replaces it.

## In the client

The Map tab shows the room under "Room layout":

- The drawing: walls; doorways as gaps in the walls with their exit names outside; each thing's
  footprint from above (boxes as rectangles, spheres as circles); people in their own colour; you
  ringed; fixed things outlined heavier; mounted things dashed; a floor grid, a scale bar and a
  north arrow. Labels move aside so they do not cover each other.
- Zoom with the wheel, a pinch, the Zoom in / Zoom out buttons, or `+` and `-` on the picture;
  drag or use the arrow keys to pan; `0` or Whole room shows the whole room.
- Clicking a doorway sends its exit name, as the exit buttons above it do.
- Save as SVG downloads the whole room as a standalone SVG file in the current colours.
- To a screen reader the drawing is one image whose name gives the room's size and how many
  exits, people and things it holds. Below it, headed lists give the size, each exit
  ("west: 0.9 m doorway in the west wall, 1.3 m from the south wall") and each person and thing
  ("oak table, 1.2 m from the north wall, near the west wall"). Moves update the lists quietly;
  nothing is announced and focus never moves.

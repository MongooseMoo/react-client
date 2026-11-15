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
| `things[].name` | What to call it (`title()`; colour markup such as `[red]` is removed for display). |
| `things[].kind` | `player`, `person` (a living body that is not a player) or `object`. |
| `things[].fixed` | It cannot be picked up. |
| `things[].mounted` | It hangs on a wall or ceiling. |
| `things[].shapes` | Its solid parts: boxes `{"box": [[x0,x1],[y0,y1],[z0,z1]]}` and spheres `{"sphere": [[x,y,z], r]}`. May be empty; such a thing is listed but not drawn. |
| `things[].origin` | `thing:sound_origin()`: where `Client.Spatial` placed this thing when the layout was built. A thing without it is drawn where its shapes are and not moved. |
| `things[].classes` | Optional. The registered `$` names of the thing's ancestors, nearest first, without the `$` (`["table", "furniture", "thing"]`). The client draws a thing by the first name it knows. |
| `things[].capabilities` | Optional. The capability names the thing declares (`furniture_seating`, `support_surface`). |
| `things[].material` | Optional. What it is made of: `[{"species": "wood", "fraction": 0.9}, …]`. The client colours a thing by its largest fraction. |
| `things[].appearance` | Optional, `player` and `person` only; absent when the character has no appearance record. How the person looks to this recipient (below). The person's height is their box's height in `shapes`, not repeated here. |

### `things[].appearance`

Every key is optional; a missing key means nothing remarkable and is drawn plainly. Colours are
`{"name": "navy", "hex": "#01153e"}` from the MOO's palette, so the words and the picture agree.

```json
{"label": "the short red-haired woman", "posture": "standing", "build": "thin", "age_years": 24,
 "skin": {"name": "fair", "hex": "#f3e7db"},
 "hair": {"length_cm": 40, "texture": "straight", "style": "loose", "name": "red", "hex": "#9a3001"},
 "eyes": {"name": "green", "hex": "#3a7d44"},
 "face": {"shape": "heart", "nose": "button", "lips": "full", "brows": "arched", "ears": "average"},
 "garments": [{"name": "a navy jumper", "areas": ["torso", "arms"], "layer": 2,
               "colour": {"name": "navy", "hex": "#01153e"}}]}
```

| Key | Meaning |
|---|---|
| `label` | The shortest phrase that tells this person from the others present, worked out by the server for this recipient. Shown as text; the client never computes one. |
| `posture` | `standing`, `sitting` or `reclining`. |
| `body_plan`, `traits` | Species or body plan, and traits. The figure adds parts for `tail`, `wings`, `antlers`, `horns` and `pointed ears`. |
| `build` | `average`, `athletic`, `thin`, `curvy`, `chunky`, `pudgy`, `muscular` or `dumpy`; anything else is drawn as average. |
| `age_years` | A child's head is drawn larger for their height. |
| `skin`, `eyes` | Colours. |
| `hair` | `length_cm` (under 1 none, under 8 short, under 25 medium, longer long), `texture` (`straight`, `wavy`, `curly`, `coily`), `style`, and its colour. Absent when bald or covered. |
| `facial_hair` | `kind` (`none`, `stubble`, `moustache`, `goatee`, `beard`) and its colour; without a colour, the hair's. |
| `face` | `shape` (`oval`, `round`, `square`, `long`, `heart`), `nose`, `lips`, `brows`, `ears`. |
| `face_hidden` | `true` when a form hides the face; no eyes, brows, mouth or facial hair are drawn. |
| `marks` | `[{"kind": "scar", "area": "cheek"}]`, uncovered marks only. The portrait shows those on the head and neck. |
| `garments` | Worn things: `areas` they cover (`head`, `neck`, `torso`, `arms`, `hands`, `waist`, `legs`, `feet`), `layer` (higher is outside) and `colour` when it has one. Each area is drawn in its outermost garment's colour, plain cloth grey when that garment has no colour, skin when bare. |

The client checks none of these on arrival; anything missing or of the wrong type is treated as
unremarkable.

## Keeping it current

Room.Layout is sent only with Room.Info, never again for moves or arrivals. The client:

- moves a thing's shapes by its `Client.Spatial` position minus its `origin`;
- draws an entity that `Client.Spatial` says entered (`EntityEnter`) and is not in the layout as a
  small marker at its position with its name (in the person colour for `player` and `person`),
  lists it, and moves it with `Client.Spatial`;
- stops drawing a thing or arrival when `Client.Spatial` sends `EntityLeave` for its id.

A new `Room.Layout` replaces the layout and forgets the arrivals. A new `Room.Info` for a different
room drops both; one for the same room keeps them.

## In the client

The Map tab shows the room under "Room layout", in one of three views chosen with the View radio
buttons (the choice is kept across rooms):

- **Plan**: the drawing from above, described below.
- **Dollhouse**: the room in 3D, seen from above one corner. Drag to turn it, the wheel or a pinch
  to zoom; on the picture the arrow keys turn it, `+` and `-` zoom and `0` returns to the start.
  Walls on the camera's side are cut low so they never hide the room.
- **Your eyes**: the room in 3D from where you stand (your `Client.Spatial` position), facing
  your `Client.Spatial` forward, turning as you turn.

In every view things are drawn by what they are, from the first of their `classes` the client
knows: a table as a top on legs, a chair or other furniture as a seat with its back to the
nearest wall, a bookshelf or cabinet as a tall box with shelves, a moving photograph as a framed
picture, a TV as a dark screen, a door leaf as a door, a book or note as a flat block; anything
else as its boxes and spheres. In 3D they are coloured by their largest material (wood and pine brown, lcd
near-black, paper cream, foam and cotton fabric blue, plastic grey, metal and steel steel-grey, anything
else a neutral stone). People are figures: head, body, arms and legs sized by their height and
build, painted with their skin, hair, eye and garment colours, with hair by length and texture,
facial hair, a head garment, and parts for their traits; standing, sitting or lying as `posture`
says, and turned to face their `Client.Spatial` forward (south when there is none). Where two
neighbouring colours fall below 3:1 contrast, a thin dark or light band outlines the seam. A
person without `appearance` is the same figure in the person colour, you in blue. The plan marks tables' legs, seats' backs and doors' swing. The 3D views are
one image to a screen reader with the same name as the plan, and clicking a doorway in them
sends its exit too.

- The drawing: walls; doorways as gaps in the walls with their exit names outside; each thing's
  footprint from above (boxes as rectangles, spheres as circles); people as round tokens, in
  their main garment's colour (or skin) with their head in hair or head-covering colour when they
  send `appearance`, otherwise in the person colour; you ringed; fixed things outlined heavier; mounted things dashed; a floor grid, a scale bar and a
  north arrow. Labels move aside so they do not cover each other.
- Zoom with the wheel, a pinch, the Zoom in / Zoom out buttons, or `+` and `-` on the picture;
  drag or use the arrow keys to pan; `0` or Whole room shows the whole room.
- Clicking a doorway sends its exit name, as the exit buttons above it do.
- Save as SVG downloads the whole room as a standalone SVG file in the current colours.
- To a screen reader the drawing is one image whose name gives the room's size and how many
  exits, people and things it holds. Below it, headed lists give the size, each exit
  ("west: 0.9 m doorway in the west wall, 1.3 m from the south wall") and each person and thing
  ("oak table, 1.2 m from the north wall, near the west wall"; with `classes` and `material`,
  "coffee table (table, wood), …"; a person with a `label`, "Ann (the tall red-haired woman), …").
  Each person in the list, and the selected player's card in the Room tab (matched by name), shows
  a small head-and-shoulders portrait drawn from `appearance`; it is decoration, hidden from
  screen readers, and the label beside it is ordinary text. Moves update the lists quietly;
  nothing is announced and focus never moves.

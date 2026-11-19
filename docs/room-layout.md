# GMCP Message: `Room.Layout`

In a spatial room the server tells the client what the room looks like inside: how big it is,
where its doorways are, and where each thing and person stands. The client draws it to scale in
the Map tab, north up, and says the same in words beside the picture.

## From the server

### `Room.Layout`

Sent with `Room.Info` for a spatial room, and after committed membership, public state or finish changes. Not sent for other rooms.
It holds only what the recipient can see.

```json
{
  "num": 1234,
  "size": [3.81, 5.13, 2.44],
  "exits": [{"name": "west", "to": 1235, "at": [-1.905, -1.282, 0.0], "width": 0.9, "facing": [-1.0, 0.0, 0.0]}],
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
| `exits[].facing` | The way the exit faces out of the room, a unit vector `[x, y, z]` stored on the exit when it was made (north `[0, 1, 0]`, up `[0, 0, 1]`); `[]` when it faces no way (`in`, a named door). A doorway not placed by hand sits at the point its facing gives, so `at` already agrees with it; a hand-placed doorway's `at` is where the builder put it. `Room.Info` carries the same as a word under `directions` (below). |

`Room.Info` also has `directions`: under the same keys as its `exits`, the compass word or `up`/`down`
nearest each exit's facing (`"gate": "west"`). Exits that face no way have no entry. The area map steps
by it, and by the exit's own name when it is absent.
| `things[].id` | `tostr(obj)`, the same id `Client.Spatial` uses for the thing. |
| `things[].name` | What to call it (`title()`; colour markup such as `[red]` is removed for display). |
| `things[].kind` | `player`, `person` (a living body that is not a player) or `object`. |
| `things[].fixed` | It cannot be picked up. |
| `things[].mounted` | It hangs on a wall or ceiling. |
| `things[].shapes` | Its solid parts: boxes `{"box": [[x0,x1],[y0,y1],[z0,z1]]}` and spheres `{"sphere": [[x,y,z], r]}`. May be empty; such a thing is listed but not drawn. |
| `things[].origin` | Acoustic snapshot origin, retained for other consumers. It never moves physical drawings. |
| `room_lifetime`, `things[].lifetime` | Native incarnation identifiers, preventing delayed updates from changing recycled replacements. |
| `things[].pose` | Native `centre_m`, intrinsic `dimensions_m`, and `body_quaternion` in wxyz order. `box` says there are no custom collision shapes. People may supply native unposed `figure_height_m` and physical `posture`, even without an appearance record. |
| `things[].front` | Present only with native `fronted`: local `axis`, floor heading `yaw`, and native compass `direction`. Gaze is separate. |
| `things[].relation` | Viewer-identifiable support: native `kind`, target ID and readable `text`. |
| `things[].state` | Applicable public `opened`, `lit`, and electronics `mode`; unknown fields are omitted. Projection never settles electronics. |
| `finishes` | Native floor, wall and ceiling surface names. Missing visual colours remain unspecified. |
| `things[].classes` | Optional. The registered `$` names of the thing's ancestors, nearest first, without the `$` (`["table", "furniture", "thing"]`). The client draws a thing by the first name it knows. |
| `things[].capabilities` | Optional. The capability names the thing declares (`furniture_seating`, `support_surface`). |
| `things[].material` | Optional. What it is made of: `[{"species": "wood", "fraction": 0.9}, …]`. The client colours a thing by its largest fraction. |
| `things[].appearance` | Optional, `player` and `person` only; absent when the character has no appearance record. How the person looks to this recipient (below). The person's height is their box's height in `shapes`, not repeated here. |

### `things[].appearance`

Every key is optional; a missing key means nothing remarkable and is drawn plainly. Colours are
`{"name": "navy", "hex": "#01153e"}` from the MOO's palette, so the words and the picture agree.

```json
{"label": "the red-haired woman", "posture": "standing", "build": "thin", "age_years": 24,
 "skin": {"name": "fair", "hex": "#f3e7db"},
 "hair": {"length_cm": 40, "texture": "straight", "style": "loose", "name": "red", "hex": "#9a3001"},
 "eyes": {"name": "green", "hex": "#3a7d44"},
 "face": {"shape": "heart", "nose": "button", "lips": "full", "brows": "arched", "ears": "average"},
 "features": ["freckles"],
 "garments": [{"name": "a navy jumper", "areas": ["torso", "arms"], "layer": 2,
               "colour": {"name": "navy", "hex": "#01153e"}}]}
```

| Key | Meaning |
|---|---|
| `label` | The shortest phrase that tells this person from the others present, worked out by the server for this recipient: "the tall man", "the red-haired woman", "the woman in navy", or "a woman" when nobody else is present. Shown as text; the client never computes one. |
| `posture` | `standing`, `sitting` or `reclining`. |
| `body_plan`, `traits` | Species or body plan, and traits. The figure adds parts for `tail`, `wings`, `antlers` and `horns`; `pointed ears` draws the ears pointed, as `face.ears` `pointed` does. The wire gives these no colour: horns and antlers are drawn in one bone tone (`#d6c9a8`), wings and tail in the hair colour (the skin's when there is no hair). |
| `build` | `average`, `slender`, `thin`, `athletic`, `muscular`, `curvy`, `stocky`, `chunky`, `pudgy` or `dumpy`; anything else is drawn as average. The figure's shoulders, waist, hips and limbs follow it; the portrait shows it in the shoulders, neck and fullness of the face. |
| `age_years` | A child's head is drawn larger for their height. |
| `skin`, `eyes` | Colours. Without `skin`, a person is drawn in a neutral light warm grey (`#b9b0a6`), the same in the portrait, the 3D figure and the plan token; it is not a human skin tone. |
| `hair` | `length_cm`, drawn by the game's length bands (`$appearance.hair_lengths`), each band up to just under its highest as the game names it: shaved (under 1.5 cm, a shadow of the hair's colour over the scalp), cropped (under 5, a close cap with a higher hairline), short (under 13, fuller on top with a fringe over the forehead; on the figure close at the sides, so the ears show), chin-length (under 24, falling to the jaw), shoulder-length (under 40, to the shoulders), long (under 65, past them) and waist-length (to the waist); 0 is bald, and the game then sends no `hair`, `texture` (`straight`, `wavy`, `curly`, `coily`), `style`, and its colour. Curly, coily and wavy hair stands out further than straight hair the longer it is: a little when cropped, more when short, its full mass from chin length. Absent when bald or covered. `style` is one of `loose` (hair as it falls, also when absent or unknown), `ponytail` (tied back into a hanging tail), `braided` (two braids), `bun` (a bun on the crown), `topknot` (a small knot on top), `dreadlocks` (ropes hanging round the head), `spiky` (spikes standing up), `mohawk` (shaved sides, one crest), `swept_back` (combed back off a high forehead), `brushed` (a side parting) or `voluminous` (standing well out and falling wide); the portrait and the figure draw each its own way, and hanging braids, locks and tails reach down by `length_cm`. Hair shorter than the game offers a style for (spiky, mohawk and brushed from 2.5 cm; swept back, voluminous and dreadlocks from 8; braided, ponytail and topknot from 18; bun from 30), which a form can cause, is drawn loose: the plain drawing for its length. Only loose, brushed, swept-back and voluminous hair falls round the head. |
| `facial_hair` | `kind` (`none`, `stubble`, `moustache`, `goatee`, `beard`), `length_cm` for a beard (from the game's bands: short 2 to 3, full 6 to 12, long 20 to 30, very long 40 and more), and its colour; without a colour, the hair's. A beard is drawn by its length: a short one close along the jaw, a full one standing out further, a longer one hanging below the chin (in the portrait to the bottom of the picture at 40 cm, on the figure down the chest by its length beyond 10 cm, narrowing to its end). Without `length_cm`, a beard is drawn along the jaw. |
| `face` | `shape` (`oval`, `round`, `square`, `heart`, `long`, `angular`), `nose` (`average`, `button`, `hooked`, `previously_broken`, `pudgy`, `broad`, `upturned`), `lips` (`average`, `thin`, `full`, `narrow`, `chapped`), `brows` (`average`, `thick`, `thin`, `arched`, `bushy`, `heavy`), `ears` (`average`, `small`, `large`, `pointed`). The portrait draws each of these its own way; `average` (and `oval`) is the plain drawing, as is a value it does not know. Values are matched exactly as the game spells them. Of these the 3D figure draws the ears: one on each side of the head, small, average, large or pointed, shaded on their front toward a tone of the skin that stands 3:1 off it so they show on any skin. The ears are left out, in the portrait and the figure alike (one rule), under a hood or hat, under voluminous hair, under hair worn down past the jaw (chin-length and longer), and under a curly, coily or wavy cap of chin length or longer; cropped and short hair of every texture shows them. Otherwise its face has eyes, brows, a mouth and a small nose for facing, the same for everyone. |
| `features` | A list of keys for small features. The portrait draws `freckles`, `glasses`, `sunglasses`, `eyepatch`, `earrings`, `beauty_mark` and `dimples`, in black or white, whichever stands out more on the skin (as are the pupils, nose, mouth and face marks); other keys are ignored. The 3D figure draws `glasses`, `sunglasses`, `eyepatch` and `earrings` in the same colour; `freckles`, `beauty_mark` and `dimples` are too small to read at figure size and appear only in the portrait. |
| `face_hidden` | `true` when a form hides the face; no eyes, brows, mouth, facial hair or face features are drawn. |
| `marks` | `[{"kind": "scar", "area": "cheek"}]`, uncovered marks only. The portrait shows those on the head and neck. |
| `garments` | Worn things: `areas` they cover (`head`, `neck`, `torso`, `arms`, `hands`, `waist`, `legs`, `feet`), `layer` (higher is outside) and `colour` when it has one. Each area is drawn in its outermost garment's colour, plain cloth grey when that garment has no colour, skin when bare. With no `garments` at all, the torso, arms, waist, legs and feet are drawn in a neutral dark slate (`#4b5262`), so the person looks dressed. A person with no `appearance` at all keeps the plain figure in the person colour (you in blue). |

The client checks none of these on arrival; anything missing or of the wrong type is treated as
unremarkable.

## Keeping it current

Room.Layout is the complete viewer-specific physical scene, including exposed surface children.
The sibling `Room.LayoutUpdate` carries `{num, room_lifetime, bodies}`. Each body contains
`id`, `lifetime`, `pose`, refreshed exact world `shapes`, and applicable `front` and `relation`.
Only existing matching identities in the matching room incarnation are updated. A body packet
cannot create a drawing. Omitted optional body fields clear their prior values.

Shapes are already in the room frame. Custom world shapes are never rotated again; intrinsic
box forms use their body pose. Acoustic presence and movement remain in Client.Spatial for audio
and the listener's eyes. They cannot create, remove or translate physical drawings.

A new Room.Layout replaces the scene. Room.Info for another room clears it. Ordinary native
setters announce geometry, membership, state and finish changes; raw administrative property
assignments do not promise automatic publication.

## In the client

### Using a fitted drawer

In the Map tab, open **Room layout** and find the desk under **Things**. Focus
**Open upper-left drawer** and press Enter. Visible contents appear immediately
after the drawer button. **Get** takes the named object. In Dollhouse and Your
eyes, clicking the visible drawer face activates the same button. A person
using ordinary text commands can open, close or empty the drawer while you watch.

For a host with fitted drawers, the MOO sends `form_boxes` on the body's
snapshot and movement update. Each `center` and `size` is in metres along the
host's local axes, relative to its pose centre. A bound box also carries
`fitting` with the real drawer's `id`, `lifetime`, `name`, `opened`, current
`command` and visible `contents`. Each visible item has its own identity and
get command. A closed drawer has an empty contents list. An empty command
disables the corresponding control.

### Room views

The Map tab shows the room under "Room layout", in one of three views chosen with the View radio
buttons (the choice is kept across rooms):

- **Plan**: the drawing from above, described below.
- **Dollhouse**: the room in 3D, seen from above one corner, far enough out for the whole room
  however large. Drag, or one finger, to turn it. The wheel zooms toward what is under the
  pointer, and a pinch toward what is between the two fingers where it began: a person's face
  when that point is on or within 12 CSS pixels of a person's name label as shown (the nearest
  label; it wins over anyone else's head nearer the point), else when a person is drawn within
  12 CSS pixels of it (the nearest one; in both cases only if nothing hides their face; half the
  24 px minimum target of WCAG 2.2 criterion 2.5.8, so a person a pixel tall in a large room can
  still be picked), else the thing or wall there, else the room's floor there. Pointing over the
  walls or through a doorway into the dark heads for nothing new: the zoom goes on toward the
  point the view turns round, which is in the room or on its walls. So a zoom never heads for a point outside
  the room and never takes the camera through a wall. Either brings it to
  the middle of the picture as it comes closer (about twenty wheel notches from the whole-room
  view to a person close up, in a room of any size; a pinch comes as much closer as the fingers
  spread apart), and stops short of it: never nearer than 0.5 m, and never inside a person it
  zooms onto (their box and 15 cm round it).
  Turning then goes round it, so you can turn until a person faces you. On the picture the arrow keys turn
  it, `+` and `-` zoom toward and away from your own figure (the room's middle when you are not in
  the layout), and `0` returns to the start. Walls on the camera's side are cut low so they never hide the room.
- **Your eyes**: the room in 3D from where you stand (your `Client.Spatial` position), facing
  your `Client.Spatial` forward, turning as you turn. `+` and `-` on the picture, or the wheel,
  narrow and widen the view (up to about seven times closer); `0` returns to the normal view.

In both 3D views a wheel event counts as at most one notch, and a smaller one in proportion to a
notch of 100 pixels, 3 lines or a page, so a trackpad or a high-resolution wheel zooms smoothly.
That makes every notch of a mouse wheel one notch as browsers send it (read in their source, not
measured): Chromium sends 100 px on Windows at the default 3 lines at any display scale (200 px at
6 lines) and 120 px on Linux; Firefox sends 3 lines (6 with its own speed-up) when the page reads
`deltaMode` first, as this view does. Chromium divides a notch by the page zoom (50 px at 200%),
which the event alone cannot tell from a trackpad's delta, so there a notch counts as that fraction.

In both 3D views a name label sits just above the top of the head as drawn (hair, hat or antlers
included), or above the middle of a thing's top, at every zoom. No label, a person's or a
thing's, is placed over anyone's head as drawn, so none covers a face. Where a label would
overlap another label or someone else's head, the later one (people first, you first among them)
moves up, or a little sideways, by the least that frees it, its bottom never more than two of its
own heights above that top. Sideways, a thing's label goes only while its text still spans the
middle of the thing; a person's label only while its own middle stays over that person's head as
drawn, so it never sits over the space beside them and reads as a neighbour's. One with no such
place is left out until zooming makes room (the lists below still name it). Labels are
placed by their size as drawn, and two side by side keep a few pixels apart.

In every view things are drawn by what they are, from the first of their `classes` the client
knows: a table as a top on legs, a chair or other furniture as a seat with a back only when its
native front is supplied, a bookshelf or cabinet as a tall box with shelves, a moving photograph as a framed
picture, a TV as a dark screen, a door leaf as a door, a book or note as a flat block; anything
else as its boxes and spheres. In 3D they are coloured by their largest material (wood and pine brown, lcd
near-black, paper cream, foam and cotton fabric blue, plastic grey, metal and steel steel-grey, anything
else a neutral stone). People are figures: head, body, arms and legs sized by their height and
build, painted with their skin, hair, eye and garment colours, with hair by length and texture,
facial hair, a head garment, and parts for their traits; standing, sitting or lying as `posture`
says, and turned by their native physical body quaternion. Where two
neighbouring colours fall below 3:1 contrast, a thin dark or light line lying close to the body
outlines the seam, whatever their hues: colours told apart by hue alone look alike to someone
with red-green colour blindness. At a beard's edge that line is a tone of the
hair itself, moved toward light or dark until it stands 3:1 off the skin, about 5 mm wide and lying
on the hair, so it reads as the hair's edge (a grey edge on black hair over dark skin), not as a
band. At the hairline the same tone is drawn on the hair itself: across the forehead and temples
the hair's last rows are shaded in strands of different lengths toward it, fading out a little way up, with no separate
line, band or row of points, and not on to the sides of the head. The hair's edge comes in to lie on the head all
round, so even full curly and coily hair meets the forehead and temples with nothing showing between hair and head,
and its rim is closed in to the head by a narrow band, so from a little above and up to 40 degrees to either side
the eye never looks in under it to the room behind. From behind, nothing shows through hair worn down: its front
edges lie just inside the hair over the crown where that hair is, and on the head below it.
The collar line on the neck is the clothing's colour toned off the neck the same way. Brows
are the hair's colour toned the same way, set below the hair's front edge and clear of it; eyes
have a white and an iris in the eye colour, or a dark pupil when there is no eye colour, and on skin
nearly as pale as the white (very pale to light) a lid round the white in the skin's tone off it;
the white and the iris are shallow round domes on the face and the lid a round ring, never six-sided. Cropped hair lies close; short hair stands plainly fuller over the crown. A beard or stubble covers the cheeks and chin up to the
sideburns, leaving the mouth; a beard is shaded in strands toward its own tone off the skin, so a
beard of the skin's darkness or paleness shows as a beard; stubble is a shadow plus a stipple of
points toned off the skin. Curly, coily and wavy hair is
raised in curls or waves whose peaks catch a sheen of the hair's colour (lighter on dark hair,
darker on light hair), on loose and tied styles alike; a wave's crest swings up and down round the
head rather than lying level; a bun stands clear of the head with a lit
crown and a tie. Brushed hair has a parting on the left with the scalp showing along it and a
combed fringe sweeping from it down toward the right temple; a mohawk's crest stands up as a ridge
along the middle of the head from the forehead to the nape. Hair worn down past the jaw follows
the back of the head, comes in at the nape and spreads out over the shoulders; straight hair shows
strands and uneven ends, wavy hair waves down it in broad slanting waves broken a little strand by
strand. It starts lying on the hair over the crown, as
close to the head at the sides as that hair is, and comes out to its own outline below, without a
seam or step; toward the face its top comes down and its front edges lie on the head past the ears,
then come forward beside the cheek and jaw and go back in toward the neck below the jaw, each edge
strand by its own amount.
Curly and coily hair to the jaw carries on the round and the curls of the hair over the crown and
closes in from the hair's own width to end above the jaw: one rounded mass that never stands out
past the head at the ears. Curly and coily hair past the jaw hangs in ringlets: locks side by side
with open grooves between them, each with its own twist rate, phase, width and length, so no
pattern repeats from lock to lock and no row of highlights lines up across them, their sheen softer
than the curls over the crown, and each coming in below the crown at its own height; coils in
narrower, tighter locks than curls. A figure is kept under 5,000 triangles
with every feature and trait. The portrait outlines skin and clothing in the dark or light line, and hair in
the hair's own edge tone along its outer edge only, never along the hairline across the forehead
(that line made dark hair on dark skin look like a cap). A shaved scalp and a mohawk's sides are a
shadow of the hair over the whole crown, edged the same way, with a stipple of stubble points in
that edge tone; cropped curls and coils end in curls along the forehead, and from chin length on
they come down each temple and end in curls across the forehead, never a straight edge like a
hat's brim; long and waist-length curly and coily locks in front of the face start inside the hair
over the crown at the temples and spread out below it, never jutting out beside it. Short hair
stands higher and wider than cropped. Behind curly and coily hair worn down,
the hair behind the head stays inside the curls over the crown and the locks in front, so its
outline never shows beside them. A mohawk's crest and brushed hair show
their light as lines, not as a lighter copy of themselves. Hair over the head is one mass reaching over the crown, so no bare
crown or head outline shows above it on any face shape: straight hair carries combed strands,
wavy hair waves, and curly and coily hair a scalloped edge (round curls, smaller coils) with
curl marks inside, never a ring of separate curls. Marks are in the hair's sheen; hair close to
the skin's colour shows its light that way (other hair shapes of it, such as hair falling behind
the head, are shaded toward the sheen), and such a beard carries strands in its edge tone. A bun
sits on the crown with nothing drawn inside it (a curly or coily bun has a scalloped edge). It
draws texture on tied styles' caps, the same toned brows and beard edge, short beards
along the face shape's own jaw, swept-back hair standing high off a high forehead, brushed hair
with a parting (the scalp's shadow, under the head's outline) and a swept fringe, and hair worn
down as locks beside the face, in the hair's texture, that end where the hair ends. Each band of
hair worn down hangs fuller than the one before, and long and waist-length hair falls in front of
the face's sides and in over the neck, so the bands also differ in the People list, which shows
only the head inside a circle. A
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
  "coffee table (table, wood), …"; a person with a `label`, "Ann (the red-haired woman), …").
  Each person in the list, and the selected player's card in the Room tab (matched by name), shows
  a small head-and-shoulders portrait drawn from `appearance`; it is decoration, hidden from
  screen readers, and the label beside it is ordinary text. Moves update the lists quietly;
  nothing is announced and focus never moves.

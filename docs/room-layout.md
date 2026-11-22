# GMCP Message: `Room.Layout`

In a spatial room the server tells the client what the room looks like inside: how big it is,
where its doorways are, and where each thing and person stands. The client draws it to scale at
the top of the Room tab, north up, and says the same in words in the lists under the picture.

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
| `body_plan`, `traits` | Species or body plan, and traits. The figure adds parts for `tail`, `wings`, `antlers` and `horns`; `pointed ears` draws the ears pointed, as `face.ears` `pointed` does. Antlers branch in 3D and in the portrait (a beam and two tines each side). The wire gives these no colour: horns and antlers are drawn in one bone tone (`#d6c9a8`), wings and tail in the hair colour (the skin's when there is no hair). How `body_plan` is drawn is in "Body plans" below. |
| `covering` | Sent only while a whole-body form is active: the form's own look, `{"kind": "fur", "colours": [{"name": "grey", "hex": "#9a9893"}, {"name": "dark brown", "hex": "#3b2417"}]}`. `kind` is `skin`, `fur`, `hide`, `feathers`, `scales` or `crystal`; `colours` holds one to three palette colours, main first. How a body plan uses them is in "Body plans" below. The form's `eyes` come in `eyes`. |
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

### Body plans

A character in a whole-body form arrives with the form's species as `body_plan`, none of their own
record (no `skin`, `hair`, `facial_hair`, `face`, `features`, `build` or `age_years`), and the form's look in
`covering` and `eyes`. The one exception is the shark head (below), built on the person's own body. The 3D figure
(Dollhouse and Your eyes), the plan token and the portrait (People list, player card) all follow the same rules:

- No `body_plan`, or `"human body"`: the human figure, exactly as described above.
- A plan the client knows (`src/avatar/bodyPlan.ts`, one entry each): its own look. Humanoid plans use the human
  figure's skeleton with their own stance, proportions, head and colours: `werewolf` (grey-brown fur, a wolf's head
  with muzzle and tall pointed ears on a thick neck, a tail, leaning forward from the hips, standing on its toes on
  long legs with a high knee and a raised heel), `zombie` (grey-green skin, slack, head drooping, arms hanging
  forward), `rakghoul` (pale, hairless, a heavy jaw), `devolved primate` (mid-brown fur with a lighter face, chest,
  hands and feet, a brow ridge, long arms, short legs), `quartz-crystallized body` (pale blue cut crystal: six-sided
  trunk, flat faces shaded lighter and darker, crystal points on the shoulders and back, drawn glossy with a faint
  cool glow) and `human with a transfigured shark head` (a human body with a grey shark's head: black eyes standing
  out of the snout's sides, a dark mouth curving round the white underside, nostrils, a dorsal fin, and the head
  narrowing into the neck with gill slits). Animal plans get their own figures facing the way the person faces: the
  `mallard duck` fitted evenly inside the person's box (its height and its width and depth in `shapes`, or the
  pose's `dimensions_m`); the `song bird` scaled evenly to the box's height, or less if that would make it wider
  than the box, its beak-to-tail length its own (the game's box for it is 0.08 x 0.06 x 0.12 m, shallower than a
  bird 12 cm tall is long: fitted to that depth it was drawn 5 cm tall). The song bird is a plump body with its
  breast standing out in front, a small round head with a pointed beak and an eye each side, folded wings
  reaching back toward a raised tail, and short legs. The `snake` is built to its box, never scaled down: its length is the box's
  longest side whichever way it lies (the game's box for a snake has stood on end, 0.16 x 0.16 m and 3.08 m tall),
  at least 0.6 m; its body is 2.2% of its length in radius and never under 3 cm, so it shows from the Dollhouse's
  whole-room view; in a box at least 0.8 of its length front to back it lies in an S along it, otherwise coiled flat
  round the box's middle; its head rises on its neck by 10 to 15% of its length, above a box too low for that.
  Their portraits show the whole animal from the side, inside the round backdrop, at every size; people's portraits
  show the head alone below 48 px.
- Any other plan: a plain rounded pillar sized by the box, in the plain person colour (you in blue); the plan token is
  the plain person token and the portrait a plain grey silhouette. No human skin, hair or eye colour is filled in.

For a body plan the figure reads no hair, facial hair, face or features and fills in no neutral skin or clothing
(the shark head's body, the person's own, is the exception: below). Colours come from the form's look, by one rule
for the 3D figure, the portrait and the plan token alike:

- `covering.colours[0]` is the body's colour (fur, skin, hide, feathers, scales or crystal).
- The second and third colours go where the plan has a natural place for them, in order: the werewolf's muzzle and
  jaw (and the ruff in the portrait), the zombie's sunken lids and mouth, the rakghoul's jaw, the primate's bare face, quartz's light-catching
  facets and spur, the shark's underside; the mallard's head, then its wings; the song bird's breast, then its wings
  and tail; the snake's bands.
- A place with no colour sent, when the main colour is sent, is a tone of the main colour: the werewolf's, zombie's,
  rakghoul's, primate's, quartz's, song bird's and snake's accent 35% toward the light or dark ink; an animal's head
  12% and its wings 25% toward the dark ink. So a snake sent in brown is brown with darker brown bands and head, and a
  song bird sent in brown has a lighter brown breast, in 3D and in the portrait.
- Marks of the species keep the plan's own colours whatever is sent: bills, beaks, the snake's tongue, legs and
  feet, eyes when `eyes` is not sent, the mallard's white neck ring and the shark's white underside when no second
  colour is sent.
- With no `covering` colour sent at all, every place keeps the plan's own colour.
- `covering.kind`: `fur` gives a bushy tail, `crystal` cuts any humanoid body into flat facets; the others are smooth.
- `eyes` colours the eyes.
- A colour that is missing or not a `#rrggbb` leaves that place to the plan's own colour; positions do not shift.
  A `covering` sent as a plain word (`"fur"`) is taken as its kind alone; any other shape counts as not sent.
- The shark head (`human with a transfigured shark head`) covers only the head: its body is the person's own, drawn
  from the record's `skin`, `build` and `garments`, and `covering` colours only the shark's head (main colour) and
  underside (second). With no `garments` sent it wears the same neutral clothing (`#4b5262`) as a person with none,
  never bare skin; garments sent are drawn as sent. `age_years` changes nothing, since it only sizes a human head.
  Its portrait's shoulders and neck follow the build, as a human portrait's do.

`garments`
are drawn on humanoid plans when sent; `traits` add their parts to humanoid plans; `posture` applies to humanoid
plans (animals always stand). The portrait shows `marks` on humanoid plans' heads. Accessible names and titles still
come from `label` ("a werewolf"), shown as sent in the Room tab's People list ("Name (label)") and on the player card; the
client adds no words of its own for a body plan, so a new label from the game shows as it arrives.

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

### The Room tab: one picture, one list of things, one list of people, one selection

The Room tab holds, from the top: the room's name and area; in a spatial room the picture
("Room layout", below) with its size and finishes; then **Exits**, **Things** and **People**. A
room that is not spatial has no picture and the same three lists. The Map tab holds only the area
map: Here, Go to and its picture.

**Exits** is one list. Each `Room.Info` exit is a button that sends it, followed in a spatial
room by where its doorway is ("west", then "0.9 m doorway in the west wall, 1.3 m from the south
wall"); the doorway is the `Room.Layout` exit whose `name` is the same key. An exit the layout
gives no doorway for is its button alone, as every exit is in a room with no layout. A doorway
the layout draws that `Room.Info` lists no exit for comes last, in words with its name and no
button ("hatch: not in a wall, …").

Each thing and each person is listed once. The lists are joined by id from three messages:
`Char.Items` (the room's items, with their `verbs` and `earcon`), `Room.Layout` (`things`, the
same ids) and `Room.Players` (names only).

- **Things** keeps the order of the room's item list, followed by things only the layout holds
  (a biscuit on a plate). A row is the thing's name and where it is: "portable radio, on the low
  table". Where is the server's `relation.text` when it sends one; otherwise the place by the
  walls ("1.2 m from the north wall, near the west wall"), or "no size or place given" for a
  thing sent without shapes. After that come "mounted 1.2 m up" or "fixed in place", and the
  native details (`faces north`, `open`/`closed`, `lit`/`unlit`, the electronics `mode`). An item
  the layout does not hold is listed by its name alone. Each thing on a surface has its own row.
- **People** are those the layout calls `player` or `person`, you included ("Ondine (you)"),
  plus any `Room.Players` entry the layout does not hold, in name order. A row is a small
  head-and-shoulders portrait drawn from `appearance` (decoration, hidden from screen readers),
  the name, and the server's `label` in brackets: "Ann (the red-haired woman)". In a room with no
  layout, a player is told from a thing by matching the item's name to a `Room.Players` full
  name, as before.

There is **one selection**, kept in the items store (`selected`: the id, with the thing's layout
`lifetime` when it has one). The selected row in either list, the outlined thing in the picture,
the selected row in the Inventory tab and the thing interact mode is on (`docs/keystrokes.md`)
are all that one value. It is set by arrowing to or clicking a row, by clicking a thing or person
in the picture, by interact mode's Tab, or by activating a name in the room's text ("Names in the
room's text", below). Selecting never sends a command. The selection clears
when its thing leaves the list, the layout or the room, when the layout sends the same id with
another `lifetime`, and when `Room.Info` names another room (something you carry stays selected).

Under each list is the selected row's card:

- A thing's card: its name, where it is, what it is and is made of when the layout says
  (`classes` and `material`: "table, wood"), and one button for each verb the server listed in
  `Char.Items` and no others. A thing only the layout holds has no buttons. Under the card are
  the thing's parts and drawers (next two sections).
- A player's card: portrait, name, the server's `label`, where they are, and Page, Say To, Look
  and Follow. The commands use the player's `Room.Players` name, found by matching it to the
  layout's name for them, because `Room.Players` carries no id.
- Anyone else's card (a person who is not a player, or you): name, where they are, and the verbs
  the server listed for them.

Rows and cards follow `Room.Layout` and `Room.LayoutUpdate` quietly: nothing is announced and
focus never moves. When the selected thing leaves while focus is in its card, focus returns to
its list, which then selects the row now in that place; when focus is on the list itself, the
list selects that row at once. With focus anywhere else the selection just clears. The Inventory
tab's list does the same.

#### Names in the room's text

In a room description sent as an HTML line (`Client.Html` `Add_html`), the server may bind a name
to what it names:

```html
On the low table are <a class="thing" data-thing="#29612">portable radio</a> and a plate holding
<a class="thing" data-thing="#29613 #29614 #29615 #29616">four biscuits</a>.
```

`data-thing` is one or more object ids, each `#` and digits, separated by single spaces: the same
ids `Char.Items` and `Room.Layout` use. A grouped phrase lists its members. The server sends no
`href` and no other attribute. On telnet, and in an ANSI line, the same sentence is plain words;
the client never matches words to things itself.

The client keeps `data-thing` only on `a.thing` and only when the whole value has that form
(`src/components/serverHtml.tsx`); any other value, and `data-thing` on any other element, is
removed and the name stays as plain text. A name it keeps gets `href="#"`, so it is an ordinary
link in the transcript: a screen reader lists and announces it as a link named by its text
("portable radio, link"), Tab reaches it, and Enter or a click activates it. Nothing is added to
what is spoken.

Activating a bound name never sends a command and never changes the input. It takes the name's ids
in order and finds the first that is here now: in the Things or People list of the Room tab (the
room's items and the layout's things), or carried. That one becomes the selection; the sidebar is
shown (and expanded) with the Room tab, and focus moves to the list that holds it, Things or
People, with its row selected and its card and the server's actions under the list. For a grouped
phrase the members are that list's rows: the first is selected and the arrow keys reach the
others. A name whose thing you are carrying lands in the Inventory tab's list instead. When none
of the ids is here any more (an old line, or the thing has left), nothing is selected, focus stays
on the link, and "portable radio: no longer here" is announced politely.

A bound name works the same in older transcript lines and after a reload, because lines are kept
as their source and rebuilt. Copied text and the saved log hold the name as plain words.

### Inspecting a construction

Select an object under **Things** in the Room tab. Under its card, each visible construction part
has an **Inspect** button unless it has a drawer control. Press Enter to read
the MOO's description. Dollhouse and Your eyes also let you click the part: that selects the
object and presses the same button.
On the trestle writing desk in the Balmoral Towers office, inspecting the slab
sends the same command as typing `look writing-slab on trestle writing desk`.
When two parts on one host share a label, their buttons include their role paths.

The MOO sends each host's visible `form_parts` in room snapshots and body
updates. Each part has a stable `role` path, a display `label`, and a `center`
in metres relative to the host's pose centre. The three values in `size` give
the part's box in metres. Each corresponding `basis` vector (a unit column)
points along that side in host-local coordinates. A builder can change the parts
by choosing a different construction in `@autoform`. Anyone watching receives the new parts.

Every part has a `shape`: `box`, `cylinder`, `sphere`, `capsule`, `cone`, `lathe`, `extrude`, `sweep` or `loft`.
Each shape fills its box. Its axis is basis 3, from `-size[2]/2` (bottom) to
`+size[2]/2` (top). A round shape's cross-section is an ellipse `size[0]` by `size[1]` across.

- `cylinder`: an elliptic cylinder.
- `sphere`: an ellipsoid of diameters `size`.
- `capsule`: a cylinder with half-ellipsoid end caps, each `min(size[0], size[1])/2` high, `size[2]` long in all.
- `cone`: a frustum. `top` (0 to 1) is the top diameter over the bottom one; 0 is a point.
- `lathe`: `profile`, a list of `[r, z]` pairs, is revolved about the axis. `r` is the radius as a
  fraction of the half-extent (0 to 1, scaled by `size[0]/2` and `size[1]/2`); `z` is the height
  fraction from the bottom (0 to 1). The client draws it from bottom to top and closes an end
  whose radius is not 0.
- `extrude`: `outline`, 3 to 128 `[x, y]` fractions of the box (0 the low face, 1 the high),
  a simple anticlockwise polygon, carried through the box's whole height (along basis 3). Optional
  `bevel` `[inset, depth]`, metres: each face is the outline moved in by `inset`, joined by a
  chamfer to the full outline `depth` in from that face (`depth` at most half the height). Where
  the outline is too narrow for the inset, the client insets it as far as it stays a simple
  outline: a blade whose inset reaches its middle, with `depth` half its thickness, ends in a sharp
  edge all round.
- `sweep`: `path`, 2 to 32 `[x, y, z]` fractions of the box, and `radius`, one value per point,
  metres: half the section's thickness there; `aspect` (default 1) is its width over its thickness,
  so its half-width is `radius * aspect`. The width lies across the path in the x-y plane (level)
  wherever the path is not upright, and never flips from one point to the next. With `smooth` true
  the path is a curve through the points (centripetal Catmull-Rom), the radius changing evenly
  between them; otherwise it runs straight between points and the section turns about each joint,
  so a bend is rounded on its outside. Each end is closed round: half an ellipsoid reaching
  `radius` past the end along the path. The box is the tube's bounds; a smooth curve may bulge a
  little past it.
- `loft`: `sections`, 2 to 16 of `{"z": fraction, "outline": [[x, y], ...]}`, z rising, every
  outline the same number of points (3 to 48) and anticlockwise; point i of each section is joined
  to point i of the next, in straight lines or, with `smooth` true, curves through the sections.
  `caps` (`both` when absent, `none`, `top`, `bottom`) says which end outlines are closed. `holes`
  lists openings `[s0, s1, i0, i1]` (zero-based): the skin between sections s0 and s1 and between
  points i0 and i1 is left out, wrapping past the last point when i0 > i1 (arm, neck and face
  openings). With `wall` the loft is a shell that thick, set in from its skin, with every opening
  and open end edged; without a wall a loft with an opening or an open end is a bare skin, drawn
  from both sides.
- A `box` may carry `round`, metres: its edges and corners are rounded to that radius (at most half
  its shortest side). With `wall` as well it is open at the top, and its cavity's edges are
  rounded to `round` less the wall (square when the wall is thicker).
- A `cylinder`, `cone`, `sphere`, `capsule` or `lathe` may carry `arc` `[start, sweep]`, radians
  about its axis from basis 1 toward basis 2, `sweep` between 0 and a whole turn (exclusive). Only
  that part of the turn is drawn, and its two cut faces are closed. For an elliptic section the
  angles are those of the circle the ellipse is stretched from, so an arc keeps `sweep / 2π` of the
  shape's volume. With `wall` it is a curved plate: a `sphere` or `capsule` shell (a visor, a
  pauldron) shows its inside and its cut edges; an open-topped shape keeps its cavity.

The shapes are shaded round where their surface turns by less than 40 degrees between neighbouring
faces and drawn with an edge where it turns more.

An optional `wall` `[wx, wy, wz]`, metres along basis 1, 2 and 3, makes the part hollow.
A `box`, `cylinder`, `cone` or `lathe` is open at the top: its cavity is the same shape
`[a - 2wx, b - 2wy, c - wz]` with its floor `wz` above the bottom, and Dollhouse and Your eyes
draw its outside, rim and inside, so a cup or a bowl reads as hollow. A `sphere` or `capsule` is
a closed shell (cavity `[a - 2wx, b - 2wy, c - 2wz]`, same centre); only its outside is drawn.

A part may carry `material`: `{"species": "steel", "family": "metal"}`, what it is made of and that
species' family (`$material_engine.profiles[species]["family"]`; the family's own name when the part
names a family). The families the game has are `metal`, `glass`, `wood`, `leather`, `cloth`, `stone`,
`ceramic`, `plastic`, `flesh`, `plant`, `earth`, `liquid` and `energy field`; the client also knows
`ice`, `fungal_ingredient` and `grain_meal`. Dollhouse and Your eyes give each family its own surface:
metal mirrors the room, glass is clear and glossy (see-through, both faces drawn), ceramic is glazed,
wood is varnished, leather has a soft sheen, cloth is fully matte with a fabric sheen, stone and earth
are rough, plastic is smooth, liquid and ice are glossy and partly clear, and an energy field glows. A
part's colour is its `colour` when sent, else its species' colour where the client knows the species,
else its family's colour, else the host's. A part without `material` takes the host's largest
material's family where the client knows it. A `material` that is not an object with a non-empty
`species` and `family` is ignored; the part is still drawn.

A part that moves carries a `joint`. Its `center` and `basis` are then its rest pose:

- `type`: `hinge` or `slide`.
- `axis`: a unit vector in the host-local frame, the same frame as `center` and `basis`.
- `origin`: the hinge's pivot, host-local metres. Hinges only.
- `range`: `[min, max]`, radians for a hinge, metres for a slide.
- `position`: where the part is now, inside `range`.

A hinge turns the part `position` radians about `axis` through `origin` (right-hand rule: a
positive turn about an axis pointing up is anticlockwise seen from above). A slide moves it
`position` metres along `axis`. An open drawer arrives at rest with a slide joint whose position
is how far it is pulled out; a part that is not seen is not sent.

Every view draws a jointed part where its joint has it now. When a new Layout moves a part of the
same thing (matched by its `role`, or by its drawer when it has no role), Dollhouse and Your eyes
swing or slide it there from where it was drawn, in a quarter of a second. With reduced motion
asked for in the system settings, it is drawn at once in its new place.

A list holding any part the client cannot draw (no or unknown `shape`, a cone without `top`, a lathe
without at least two `[r, z]` pairs in 0 to 1, a wall as thick as its part, a joint with an unknown
type, an axis that is not a unit vector, a hinge without `origin`, or a `position` outside `range`;
an extrude whose outline is not 3 to 128 fractions running anticlockwise without crossing itself, or
whose bevel is deeper than half its height; a sweep whose path is not 2 to 32 points of fractions
with one positive radius each, or whose aspect is not positive; a loft whose sections are not 2 to
16 rising outlines of the same 3 to 48 points, none clockwise, whose caps are another word, or whose
holes are not whole numbers inside its sections and points; a `wall` on an extrude or a sweep; a
`round` other than on a box, or more than half its shortest side; an `arc` other than on a turned
shape, or not less than a whole turn; `smooth` that is not true or false) is not drawn at all.

The Plan draws a thing with parts as its parts seen from above, the highest over the rest: an
upright round part as an ellipse the size of its widest ring, any other part as its outline (the
convex outline round it: an arc's wedge, an extrude's outline, a sweep's tube, a loft's sections).
It draws no table, seat or door symbol over such a thing; its parts show what it is.

### Previewing forms

To look at a form before any live object uses it, draw it headless with the client's own scene code:

```
uv run --no-project --python 3.12 python C:/Users/Q/code/devtools/private_desktop.py run LayoutPreview -- node scripts/preview-layout.mjs <in.json> <outdir>
```

Run it from the repository's root; `private_desktop.py` keeps it off the visible desktop, and the browser it starts
is headless anyway. `<in.json>` is either a Room.Layout as the game sends it (with `size` and `things`; people in
it are drawn as figures), or one thing: its box `"size": [w, d, h]` in metres, and any other keys of a Room.Layout
thing, exactly as Room.Layout sends them, for example
`{"size": [0.2, 0.05, 1.1], "name": "sword", "form_parts": [...], "material": [{"species": "steel", "fraction": 1}]}`,
or a person: `{"size": [0.5, 0.3, 1.75], "kind": "player", "appearance": {...}}`. A key the game adds to things later
is taken the same way. The thing stands on the floor in the middle of an empty room.

The script writes `front.png`, `three-quarter.png`, `side.png`, `back.png` and `top.png` (960 by 720) into
`<outdir>`: front from the south, side from the east, back from the north, top straight down with north up, each
framing everything drawn, with the room's walls and ceiling left out and its floor, lights, materials and shadows
kept. It prints a line per thing: `#1 sword: 4 parts, drawn`, or, when the client would not draw its parts (one part
it cannot draw drops the whole list; see above), the decoder's reason, naming the first part it rejects by number and
role:

```
#1 sword: 4 parts, NOT DRAWN: part 0 (blade): "bevel" must be [inset, depth] in metres, neither negative, depth at most half the height (0.0035)
```

It exits 0 when everything is drawn; 1 when a part list is not drawn, the file is not JSON or not one of the two
forms above (each said in a line), or the page reports an error; 2 when the command line is wrong. The page it
loads, `src/preview/layoutPreview.html`, is not part of the app or its build.

### Using a fitted drawer

In the Room tab, select the desk under **Things**. Under its card, focus
**Open upper-left drawer** and press Enter. Visible contents appear immediately
after the drawer button. **Get** takes the named object. In Dollhouse and Your
eyes, clicking the visible drawer face selects the desk and activates the same button. A person
using ordinary text commands can open, close or empty the drawer while you watch.

A part bound to a drawer also carries
`fitting` with the real drawer's `id`, `lifetime`, `name`, `opened`, current
`command` and visible `contents`. Each visible item has its own identity and
get command. A closed drawer has an empty contents list. An empty command
disables the corresponding control.

### Room views

The Room tab shows the room under "Room layout", in one of three views chosen with the View radio
buttons (the choice is kept across rooms). The room is drawn once; three.js is loaded only when
Dollhouse or Your eyes is the chosen view and the Room tab is showing. While another sidebar tab
shows, or the sidebar is collapsed or hidden, a 3D view is not kept: nothing is loaded, built or
drawn. Coming back to the Room tab draws it again in the same view with the same selection; the
Dollhouse starts again from its whole-room view. The Plan stays as it was, zoom included.

In every view, clicking or tapping a thing or a person selects it (the one selection, above); a
click that dragged the view more than 4 CSS pixels selects nothing, and moving the pointer over
the picture selects nothing. The selected thing or person is marked by shape as well as colour:
in the Plan a dashed frame round its footprint (a dashed ring round a person's token) with its
label bold and underlined; in Dollhouse and Your eyes a thing's own shapes lit white (a thin sword
among other blades is the bright one; what stands in front of it still hides it, so the mark never
covers its neighbours) and, round its box, a thin bracket at each corner, drawn over whatever stands
in front so it can be found; a person gets the brackets only. Its label is bold, underlined and boxed.
In every view the selected thing's or person's label is placed first, so it always shows where
there is any room. The mark follows the thing when it moves and stays through a change of view. You, in
Your eyes, are not drawn and so not outlined. A saved SVG carries no selection mark.

The three views:

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
  zooms onto (their box and 15 cm round it). A person in an animal form (a duck, snake or song bird) is
  drawn smaller than their box, or coiled beside a thin one: they are picked by the figure as drawn, the
  zoom heads for the middle of that figure, not a person's head height, and stops where the whole animal
  fits the picture (its bounding sphere in the field of view, with a tenth to spare), never so near that the
  camera's near plane (5 cm) cuts it. An animal that fits nearer than 0.5 m (a song bird 12 cm tall fits at about
  a quarter of a metre) lets the camera come that near, and each notch toward it goes as much faster as brings the camera
  there in the same twenty notches that bring it from the whole-room view to a person close up; as many notches
  back out return as far. A person, a duck and a snake zoom exactly as before.
  Turning then goes round it, so you can turn until a person faces you. A person whose figure is drawn under
  16 CSS pixels tall (a song bird across a 10 m room, anyone in a very large room) gets a thin ring on the floor
  round it, about 11 px across on screen, in the colour of their name label, at full strength under 10 px and
  fading out as they grow to 16 px; the figure itself is drawn at its true size. Your eyes show no rings. On the picture the arrow keys turn
  it, `+` and `-` zoom toward and away from your own figure (its middle when you are an animal form, as near as it
  fits when that is under 0.5 m; the room's middle when you are not in the layout), and `0` returns to the start. Walls on the camera's side are cut low so they never hide the room.
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
place is left out until zooming makes room (the Room tab's lists still name it). Labels are
placed by their size as drawn; two side by side keep a few pixels apart and two one above the
other a third of a line, so a crowded shelf shows fewer names, each readable.

In the Plan a thing's label goes on its thing or just beside it, never over a shelf, table or
other thing it is not on and nearer that than its own; a name wider than a shelf against a wall
slides back inside the room. A label with no such place is left out (the lists still name it).

In every view things are drawn by what they are, from the first of their `classes` the client
knows: a table as a top on legs, a chair or other furniture as a seat with a back only when its
native front is supplied, a bookshelf or cabinet as a tall box with shelves, a moving photograph as a framed
picture, a TV as a dark screen, a door leaf as a door, a book or note as a flat block; anything
else as its boxes and spheres. In 3D they are coloured by their largest material (wood and pine brown, lcd
near-black, paper cream, foam and cotton fabric blue, plastic grey, metal and steel steel-grey, and the
other common species in `SPECIES` in `src/map/roomScene.ts`; anything else a neutral stone), with that
species' family's surface (see `material` on form parts). The room is lit by a soft sky light, a key
light high over the south-east that casts soft shadows (things and people cast them; floor, walls,
things and people take them; the ceiling and see-through things cast none), and a studio room that
surfaces mirror, metal most. The shadows are redrawn only when the room or something in it changes,
never while the view turns. People are figures: head, body, arms and legs sized by their height and
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
round, so even full curly and coily hair meets the forehead and temples with nothing showing between hair and head; the
hair over the head is lit smoothly all the way round, with no line in its shading down one side,
and its rim is closed in to the head by a narrow band, so from a little above and up to 40 degrees to either side
the eye never looks in under it to the room behind. From behind, nothing shows through hair worn down: its front
edges come out from just inside the hair over the crown, and lie on the head below it; curls and coils to
the jaw lie clear of the curls over the crown, which never show through them.
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
seam or step; toward the face its top comes down (straight hair no lower than just under the edge of the hair over
the head beside it, so no wedge of the head shows between them at ear height) and its front edges lie on the head past the ears,
then come forward beside the cheek and jaw and go back in toward the neck below the jaw, each edge
strand by its own amount. Wavy, curly and coily hair worn down (past the jaw, or wavy to it) carries
the waves, curls or coils of the hair over the crown on into its top round the back of the head, at
full strength and in the same shading, and its own waves or locks take over a little lower, lock by
lock; there each lock starts a little up the crown, by its own height, so where the hair worn down
begins is a ragged line, never one level edge right round the back of the head. Wavy hair worn down hangs from the
outline of the hair over the crown: where it starts it does not swell out past the crown in a band round the back of
the head, and at the sides its outline widens from the crown's gradually, without a step. Curly and coily hair past the
jaw starts higher up the crown round the sides of the head, where the hair over the crown is still near its widest, and
lies on it there with the same curls and shading, so from behind and to one side there is no ledge where it begins; its
front edges stay forward beside the face down to the shoulders and go back in toward the neck only below them.
Curly and coily hair to the jaw carries on the round and the curls of the hair over the crown and
closes in from the hair's own width to end above the jaw: one rounded mass that never stands out
past the head at the ears; curls to the jaw close in from where they start, so from behind they are no wider than the
hair over the crown. Curly and coily hair past the jaw hangs in ringlets: locks side by side
with open grooves between them, each with its own twist rate, phase, width and length, so no
pattern repeats from lock to lock and no row of highlights lines up across them, each turning every two
(coils) or two and a half (curls) rows of the fall so it reads as curls rather than a rope or a smooth fall, their sheen softer
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
sends its exit too. A click in a 3D view lands on the nearest thing drawn under it: a thing
standing in front of a doorway is selected, and the doorway behind it is not taken.

- The drawing: walls; doorways as gaps in the walls with their exit names outside; each thing's
  footprint from above (boxes as rectangles, spheres as circles); people as round tokens, in
  their main garment's colour (or skin) with their head in hair or head-covering colour when they
  send `appearance`, otherwise in the person colour; you ringed; fixed things outlined heavier; mounted things dashed; a floor grid, a scale bar and a
  north arrow. Labels move aside so they do not cover each other.
- Zoom with the wheel, a pinch, the Zoom in / Zoom out buttons, or `+` and `-` on the picture;
  drag or use the arrow keys to pan; `0` or Whole room shows the whole room.
- Clicking a doorway sends its exit name, as the exit buttons under the picture do.
- Save as SVG downloads the whole room as a standalone SVG file in the current colours.
- To a screen reader the drawing is one image whose name gives the room's size and how many
  exits, people and things it holds. Below it come the size and the finishes. The exits, things
  and people are the Room tab's lists (above), where each thing and person can be selected from
  the keyboard; the picture
  itself is selected in only with a pointer. Moves update the picture and the lists quietly;
  nothing is announced and focus never moves.

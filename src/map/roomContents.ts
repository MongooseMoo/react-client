import type { Item } from "../gmcp/Char/Items";
import type { LayoutThing, RoomLayout, RoomPlayer } from "../gmcp/Room";
import { stripMudAnsiTags } from "../stripMudAnsiTags";
import { describeWhere, displayName, isPerson, layoutPersonNamed, placeThings } from "./roomLayout";

/**
 * One thing or person in the room, joined from what the server sends about it: its `Char.Items`
 * room item (verbs, earcon), its `Room.Layout` thing (place, parts, appearance) and, for a player,
 * their `Room.Players` entry (the name commands use). Items and layout things share one id.
 */
export interface RoomEntry {
  /** The id the one selection uses: the server's, or a player's Room.Players name when nothing gives them one. */
  id: string;
  /** The name as shown: colour markup removed, "(you)" after your own. */
  name: string;
  person: boolean;
  item?: Item;
  thing?: LayoutThing;
  player?: RoomPlayer;
  /** Where it is, in words (`describeWhere`); "" when no layout says. */
  where: string;
}

/** The stored layout when it is this room's: one sent for another room than Room.Info names is not drawn or listed. */
export const layoutOfRoom = (layout: RoomLayout | null, info: { num: number } | null): RoomLayout | null =>
  layout && (!info || layout.num === info.num) ? layout : null;

const plainName =(name: string) => (stripMudAnsiTags(name) || name).trim().toLowerCase();

/**
 * The room's things and people, each once. Things keep the server's item order, then those only the
 * layout holds (a biscuit on a plate). People are whoever the layout calls a `player` or `person`,
 * plus players it does not hold; in a room with no layout a player is told from a thing by matching
 * the item's name to a Room.Players full name. People are in name order.
 */
export function roomContents(
  items: Item[],
  players: RoomPlayer[],
  layout: RoomLayout | null,
  youId: string,
): { things: RoomEntry[]; people: RoomEntry[] } {
  const bounds = new Map(layout ? placeThings(layout).map((placed) => [placed.thing.id, placed.bounds]) : []);
  const things = new Map(layout?.things.map((thing) => [thing.id, thing]));
  const entries = new Map<string, RoomEntry>();
  const add = (id: string, item: Item | undefined, thing: LayoutThing | undefined) => entries.set(id, {
    id,
    name: displayName(item ?? thing ?? { id, name: id }, youId),
    person: thing ? isPerson(thing) : false,
    item,
    thing,
    where: thing && layout ? describeWhere(thing, bounds.get(id), layout.size) : "",
  });
  for (const item of items) add(item.id, item, things.get(item.id));
  for (const thing of layout?.things ?? []) if (!entries.has(thing.id)) add(thing.id, undefined, thing);

  for (const player of players) {
    const inLayout = layoutPersonNamed(layout, [player.name, player.fullname]);
    const entry = (inLayout && entries.get(inLayout.id)) ??
      [...entries.values()].find((candidate) => !candidate.player && candidate.item && plainName(candidate.item.name) === plainName(player.fullname));
    if (entry) {
      entry.player = player;
      entry.person = true;
    } else {
      entries.set(player.name, { id: player.name, name: stripMudAnsiTags(player.fullname) || player.fullname, person: true, player, where: "" });
    }
  }

  const all = [...entries.values()];
  return {
    things: all.filter((entry) => !entry.person),
    people: all.filter((entry) => entry.person).sort((a, b) => a.name.localeCompare(b.name)),
  };
}

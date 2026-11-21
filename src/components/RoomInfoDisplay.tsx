import type React from "react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type MudClient from "../client";
import type { RoomPlayer } from "../gmcp/Room";
import { useRoomStore } from "../stores/roomStore";
import type { Item } from "../gmcp/Char/Items";
import { type ItemAction, performItemAction } from "../itemActions";
import { useItemsStore } from "../stores/itemsStore";
import { useSpatialStore } from "../stores/spatialStore";
import { stripMudAnsiTags } from "../stripMudAnsiTags";
import { compareDirections, directionLabel } from "../map/directions";
import { type RoomEntry, roomContents } from "../map/roomContents";
import { personLabel, thingKind } from "../map/roomLayout";
import AvatarPortrait from "../avatar/portrait";
import AccessibleList from "./AccessibleList";
import ItemCard from "./ItemCard";
import PlayerCard from "./PlayerCard";
import RoomLayoutView from "./RoomLayoutView";
import RoomThingControls, { fittingKey, inspectKey } from "./RoomThingControls";
import "./RoomInfoDisplay.css";

interface RoomInfoDisplayProps {
  client: MudClient;
}

const EMPTY_ITEMS: Item[] = [];

const renderThing = (entry: RoomEntry) => <span>{entry.where ? `${entry.name}, ${entry.where}` : entry.name}</span>;
const renderPerson = (entry: RoomEntry) => {
  const label = entry.thing && personLabel(entry.thing);
  return (
    <span>
      <AvatarPortrait appearance={entry.thing?.appearance} size={32} className="room-person-portrait" />
      {label ? `${entry.name} (${label})` : entry.name}
    </span>
  );
};
const thingClassName = () => "room-item-li";
const personClassName = () => "room-player-li";
const entryTextValue = (entry: RoomEntry) => entry.name.toLowerCase();

/**
 * The Room tab: the room's name and exits, the room drawn (in a spatial room), then one list of
 * things and one of people, each joined by id from Char.Items, Room.Layout and Room.Players. The
 * selected row is the items store's one selection, the same the picture outlines and interact mode
 * is on; its card shows where it is and the actions the server listed.
 */
const RoomInfoDisplay: React.FC<RoomInfoDisplayProps> = ({ client }) => {
  // Room info and players come from the room store (single source of truth).
  const roomInfo = useRoomStore((state) => state.roomInfo);
  const roomPlayers = useRoomStore((state) => state.roomPlayers);
  const storedLayout = useRoomStore((state) => state.roomLayout);
  const roomItems = useItemsStore((state) => state.itemsByLocation.room ?? EMPTY_ITEMS);
  const selectedId = useItemsStore((state) => state.selected?.id ?? null);
  const select = useItemsStore((state) => state.select);
  const youId = useSpatialStore((state) => state.listenerEntityId);
  const layout = storedLayout && (!roomInfo || storedLayout.num === roomInfo.num) ? storedLayout : null;

  const charItemsHandler = client.gmcp.handlers['Char.Items'];

  const { things, people } = useMemo(
    () => roomContents(roomItems, roomPlayers, layout, youId),
    [roomItems, roomPlayers, layout, youId],
  );
  const selectedThing = things.find((entry) => entry.id === selectedId) ?? null;
  const selectedPerson = people.find((entry) => entry.id === selectedId) ?? null;

  // Request the room's item list once on mount. Room info/players are now
  // subscribed from the room store above rather than fed by client events.
  useEffect(() => {
    if (charItemsHandler) {
      charItemsHandler.sendRoom("");
    }
  }, [charItemsHandler]);

  const sendCommand = useCallback((command: string) => client.sendCommand(command), [client]);

  const handleItemAction = useCallback((action: ItemAction) => {
    performItemAction(client, action);
  }, [client]);

  const handleLookAtPlayer = useCallback((player: RoomPlayer) => {
    client.sendCommand(`look ${player.name}`);
  }, [client]);

  const handleFollowPlayer = useCallback((player: RoomPlayer) => {
    client.sendCommand(`follow ${player.name}`);
  }, [client]);

  // A part or drawer clicked in a 3D view: its thing becomes the selection, and once its controls
  // are drawn the same button a keyboard user presses is focused and pressed.
  const controlButtons = useRef(new Map<string, HTMLButtonElement>());
  const pendingPress = useRef<{ thingId: string; key: string } | null>(null);
  const [pressRequests, setPressRequests] = useState(0);
  const press = useCallback((thingId: string | undefined, key: string) => {
    if (!thingId) return;
    pendingPress.current = { thingId, key };
    select(thingId);
    setPressRequests((count) => count + 1);
  }, [select]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs after each request and each selection change, when the controls may have appeared.
  useLayoutEffect(() => {
    const pending = pendingPress.current;
    // Until the thing is the selection its controls are not drawn; once it is, they are there or never will be.
    if (!pending || pending.thingId !== selectedId) return;
    pendingPress.current = null;
    const button = controlButtons.current.get(pending.key);
    button?.focus({ preventScroll: true });
    button?.click();
  }, [pressRequests, selectedId]);
  const handleInspect = useCallback((id: string, lifetime: string, role: string) => press(id, inspectKey(id, lifetime, role)), [press]);
  const handleFitting = useCallback((lifetime: string) => {
    const host = layout?.things.find((thing) => thing.form_boxes?.some((box) => box.fitting?.lifetime === lifetime));
    press(host?.id, fittingKey(lifetime));
  }, [layout, press]);

  const headingId = "room-info-heading";
  const contentsHeadingId = "room-contents-heading";
  const contentsListId = "room-contents-list";
  const playersHeadingId = "room-players-heading";
  const playersListId = "room-players-list";

  if (!roomInfo && !layout && things.length === 0) {
    return (
      <div
        className="room-info-display"
        role="region"
        aria-labelledby={headingId}
      >
        <h4 id={headingId}>Room Info</h4>
        <p>Waiting for room data...</p>
      </div>
    );
  }

  const exits = roomInfo?.exits ? Object.entries(roomInfo.exits).sort(([dirA], [dirB]) => compareDirections(dirA, dirB)) : [];
  // Strip before the fallback checks so a name that is only markup still
  // renders the placeholder rather than an empty heading.
  const roomName = roomInfo?.name ? stripMudAnsiTags(roomInfo.name) : "";
  const roomArea = roomInfo?.area ? stripMudAnsiTags(roomInfo.area) : "";

  return (
    <div
      className="room-info-display"
      role="region"
      aria-labelledby={headingId}
    >
      <h4 id={headingId}>{roomName || "Current Room"}</h4>
      {roomArea && <p className="room-area">Area: {roomArea}</p>}

      {layout && (
        <RoomLayoutView
          layout={layout}
          roomName={roomInfo?.name ?? ""}
          onCommand={sendCommand}
          onInspect={handleInspect}
          onFitting={handleFitting}
        />
      )}

      {exits.length > 0 && (
        <div className="room-exits">
          <h5>Exits</h5>
          <ul aria-label="Room Exits">
            {exits.map(([direction, roomId]) => (
              <li key={direction}>
                <button
                  type="button"
                  onClick={() => sendCommand(direction)}
                  title={`Go ${directionLabel(direction)} (to room ${roomId})`}
                  aria-label={`Go ${directionLabel(direction)}`}
                >
                  {directionLabel(direction)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="room-contents-section">
        <h5 id={contentsHeadingId} tabIndex={-1}>Things</h5>
        {things.length === 0 ? (
          <p>Nothing here.</p>
        ) : (
          <AccessibleList
            items={things}
            renderItem={renderThing}
            listId={contentsListId}
            labelledBy={contentsHeadingId}
            className="room-items-accessible-list"
            itemClassName={thingClassName}
            getItemTextValue={entryTextValue}
            selectedId={selectedThing?.id ?? null}
            onSelect={select}
            focusReturnId={contentsHeadingId}
          />
        )}
      </div>

      {selectedThing && (
        <div className="selected-room-item-card-container" style={{ marginTop: '1rem' }}>
          <ItemCard
            item={selectedThing.item ?? { id: selectedThing.id, name: selectedThing.name }}
            where={selectedThing.where}
            kind={selectedThing.thing && thingKind(selectedThing.thing)}
            onAction={handleItemAction}
            focusReturnId={contentsListId}
            focusFallbackId={contentsHeadingId}
          />
          {selectedThing.thing && (
            <RoomThingControls thing={selectedThing.thing} name={selectedThing.name} onCommand={sendCommand} buttons={controlButtons} />
          )}
        </div>
      )}

      <div className="room-players-section">
        <h5 id={playersHeadingId} tabIndex={-1}>People</h5>
        {people.length === 0 ? (
          <p>No one else here.</p>
        ) : (
          <AccessibleList
            items={people}
            renderItem={renderPerson}
            listId={playersListId}
            labelledBy={playersHeadingId}
            className="room-players-accessible-list"
            itemClassName={personClassName}
            getItemTextValue={entryTextValue}
            selectedId={selectedPerson?.id ?? null}
            onSelect={select}
            focusReturnId={playersHeadingId}
          />
        )}
      </div>

      {selectedPerson && (
        <div className="selected-player-card-container" style={{ marginTop: '1rem' }}>
          {selectedPerson.player ? (
            <PlayerCard
              player={selectedPerson.player}
              appearance={selectedPerson.thing?.appearance}
              where={selectedPerson.where}
              onLook={handleLookAtPlayer}
              onFollow={handleFollowPlayer}
              focusReturnId={playersListId}
              focusFallbackId={playersHeadingId}
            />
          ) : (
            // Someone who is not a player (or you): only what the server lists for them.
            <ItemCard
              item={selectedPerson.item ?? { id: selectedPerson.id, name: selectedPerson.name }}
              where={selectedPerson.where}
              onAction={handleItemAction}
              focusReturnId={playersListId}
              focusFallbackId={playersHeadingId}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default RoomInfoDisplay;

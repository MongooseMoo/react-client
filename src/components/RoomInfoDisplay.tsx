import React, { useCallback, useEffect, useState, useMemo } from "react";
import MudClient from "../client";
import type { RoomPlayer } from "../gmcp/Room";
import { useRoomStore } from "../stores/roomStore";
import type { Item, ItemLocation } from "../gmcp/Char/Items";
import AccessibleList from "./AccessibleList"; // Import AccessibleList
import ItemCard from "./ItemCard"; // Import ItemCard
import PlayerCard from "./PlayerCard"; // Import PlayerCard
import "./RoomInfoDisplay.css"; 

interface RoomInfoDisplayProps {
  client: MudClient;
}

const RoomInfoDisplay: React.FC<RoomInfoDisplayProps> = ({ client }) => {
  // Room info and players come from the room store (single source of truth).
  const roomInfo = useRoomStore((state) => state.roomInfo);
  const roomPlayers = useRoomStore((state) => state.roomPlayers);
  const [roomItems, setRoomItems] = useState<Item[]>([]);
  const [selectedRoomItem, setSelectedRoomItem] = useState<Item | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<RoomPlayer | null>(null);

  const charItemsHandler = client.gmcp.handlers['Char.Items'];

  // Helper function to check if an item name matches a player name
  const isPlayerItem = useCallback((item: Item, players: RoomPlayer[]): boolean => {
    return players.some(player => 
      item.name.toLowerCase() === player.fullname.toLowerCase()
    );
  }, []);

  // Filter room items to exclude players that appear in the players list
  const filteredRoomItems = useMemo(() => {
    return roomItems.filter(item => !isPlayerItem(item, roomPlayers));
  }, [roomItems, roomPlayers, isPlayerItem]);

  // Request the room's item list once on mount. Room info/players are now
  // subscribed from the room store above rather than fed by client events.
  useEffect(() => {
    if (charItemsHandler?.sendRoomRequest) {
      charItemsHandler.sendRoomRequest();
    }
  }, [charItemsHandler]);


  const updateRoomItemsList = useCallback((location: ItemLocation, newItems: Item[]) => {
    if (location === 'room') {
      setRoomItems(newItems);
      if (selectedRoomItem && !newItems.find(item => item.id === selectedRoomItem.id)) {
        setSelectedRoomItem(null);
      }
    }
  }, [selectedRoomItem]);

  const addRoomItem = useCallback((location: ItemLocation, item: Item) => {
    if (location === 'room') {
      setRoomItems(prev => prev.some(i => i.id === item.id) ? prev : [...prev, item]);
    }
  }, []);

  const removeRoomItem = useCallback((location: ItemLocation, itemToRemove: Item) => {
    if (location === 'room') {
      setRoomItems(prev => prev.filter(item => item.id !== itemToRemove.id));
      if (selectedRoomItem?.id === itemToRemove.id) {
        setSelectedRoomItem(null);
      }
    }
  }, [selectedRoomItem]);

  useEffect(() => {
    const handleList = (data: { location: ItemLocation, items: Item[] }) => updateRoomItemsList(data.location, data.items);
    const handleAdd = (data: { location: ItemLocation, item: Item }) => addRoomItem(data.location, data.item);
    const handleRemove = (data: { location: ItemLocation, item: Item }) => removeRoomItem(data.location, data.item);

    client.on('itemsList', handleList);
    client.on('itemAdd', handleAdd);
    client.on('itemRemove', handleRemove);

    return () => {
      client.off('itemsList', handleList);
      client.off('itemAdd', handleAdd);
      client.off('itemRemove', handleRemove);
    };
  }, [client, updateRoomItemsList, addRoomItem, removeRoomItem]);

  // Clear the player selection if the selected player has left the room.
  useEffect(() => {
    if (selectedPlayer && !roomPlayers.some((p) => p.name === selectedPlayer.name)) {
      setSelectedPlayer(null);
    }
  }, [roomPlayers, selectedPlayer]);

  const handleExitClick = (direction: string) => {
    client.sendCommand(direction); 
  };

  const handleSelectItemFromRoom = (index: number) => {
    setSelectedRoomItem(index > -1 && filteredRoomItems[index] ? filteredRoomItems[index] : null);
  };

  const handleGetItem = useCallback((itemToGet: Item) => {
    client.sendCommand(`get ${itemToGet.id}`);
  }, [client]);

  const handleSelectPlayer = (index: number) => {
    setSelectedPlayer(index > -1 && roomPlayers[index] ? roomPlayers[index] : null);
  };


  const handleLookAtPlayer = useCallback((player: RoomPlayer) => {
    client.sendCommand(`look ${player.name}`);
  }, [client]);

  const handleFollowPlayer = useCallback((player: RoomPlayer) => {
    client.sendCommand(`follow ${player.name}`);
  }, [client]);

  const renderRoomItem = (item: Item) => <span>{item.name}</span>;
  const getRoomItemClassName = () => "room-item-li"; // For styling list items
  const getRoomItemTextValue = (item: Item) => item.name.toLowerCase();

  const renderPlayerItem = (player: RoomPlayer) => <span>{player.fullname}</span>;
  const getPlayerItemClassName = () => "room-player-li"; // For styling list items
  const getPlayerTextValue = (player: RoomPlayer) => player.fullname.toLowerCase();

  const headingId = "room-info-heading";
  const contentsHeadingId = "room-contents-heading";
  const contentsListId = "room-contents-list";
  const playersHeadingId = "room-players-heading";
  const playersListId = "room-players-list";

  if (!roomInfo && filteredRoomItems.length === 0) {
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

  const exits = roomInfo?.exits ? Object.entries(roomInfo.exits).sort(([dirA], [dirB]) => dirA.localeCompare(dirB)) : [];

  return (
    <div
      className="room-info-display"
      role="region"
      aria-labelledby={headingId}
    >
      {roomInfo && (
        <>
          <h4 id={headingId}>{roomInfo.name || "Current Room"}</h4>
          {roomInfo.area && <p className="room-area">Area: {roomInfo.area}</p>}
          {exits.length > 0 && (
            <div className="room-exits">
              <h5>Exits</h5>
              <ul aria-label="Room Exits">
                {exits.map(([direction, roomId]) => (
                  <li key={direction}>
                    <button
                      type="button"
                      onClick={() => handleExitClick(direction)}
                      title={`Go ${direction} (to room ${roomId})`}
                      aria-label={`Go ${direction}`}
                    >
                      {direction.toUpperCase()}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <div className="room-contents-section">
        <h5 id={contentsHeadingId} tabIndex={-1}>Contents</h5>
        {filteredRoomItems.length === 0 ? (
          <p>Nothing on the ground.</p>
        ) : (
          <AccessibleList
            items={filteredRoomItems}
            renderItem={renderRoomItem}
            listId={contentsListId}
            labelledBy={contentsHeadingId}
            className="room-items-accessible-list"
            itemClassName={getRoomItemClassName}
            getItemTextValue={getRoomItemTextValue}
            onSelectedIndexChange={handleSelectItemFromRoom}
          />
        )}
      </div>

      {selectedRoomItem && (
        <div className="selected-room-item-card-container" style={{ marginTop: '1rem' }}>
          <ItemCard
            item={selectedRoomItem}
            onGet={handleGetItem}
            // No onDrop, onWear, onRemove for items on the ground via RoomInfoDisplay
          />
        </div>
      )}

      <div className="room-players-section">
        <h5 id={playersHeadingId} tabIndex={-1}>Players in Room</h5>
        {roomPlayers.length === 0 ? (
          <p>No other players here.</p>
        ) : (
          <AccessibleList
            items={roomPlayers.map(player => ({ ...player, id: player.name }))}
            renderItem={renderPlayerItem}
            listId={playersListId}
            labelledBy={playersHeadingId}
            className="room-players-accessible-list"
            itemClassName={getPlayerItemClassName}
            getItemTextValue={getPlayerTextValue}
            onSelectedIndexChange={handleSelectPlayer}
          />
        )}
      </div>

      {selectedPlayer && (
        <div className="selected-player-card-container" style={{ marginTop: '1rem' }}>
          <PlayerCard
            player={selectedPlayer}
            onLook={handleLookAtPlayer}
            onFollow={handleFollowPlayer}
          />
        </div>
      )}
    </div>
  );
};

export default RoomInfoDisplay;

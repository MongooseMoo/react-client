import React, { useCallback, useEffect, useState, useMemo } from "react";
import MudClient from "../client";
import { GMCPMessageRoomInfo, RoomPlayer } from "../gmcp/Room";
import { Item, ItemLocation, GMCPCharItems } from "../gmcp/Char/Items"; // Import Item, ItemLocation, GMCPCharItems
import AccessibleList from "./AccessibleList"; // Import AccessibleList
import ItemCard from "./ItemCard"; // Import ItemCard
import PlayerCard from "./PlayerCard"; // Import PlayerCard
import "./RoomInfoDisplay.css"; 

interface RoomInfoDisplayProps {
  client: MudClient;
}

const RoomInfoDisplay: React.FC<RoomInfoDisplayProps> = ({ client }) => {
  // Initialize state directly from the client's stored info
  const [roomInfo, setRoomInfo] = useState<GMCPMessageRoomInfo | null>(
    client.currentRoomInfo
  );
  const [roomItems, setRoomItems] = useState<Item[]>([]);
  const [selectedRoomItem, setSelectedRoomItem] = useState<Item | null>(null);
  const [roomPlayers, setRoomPlayers] = useState<RoomPlayer[]>(client.worldData.roomPlayers || []);
  const [selectedPlayer, setSelectedPlayer] = useState<RoomPlayer | null>(null);

  const charItemsHandler = client.gmcpHandlers['Char.Items'] as GMCPCharItems | undefined;

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

  const handleRoomInfo = useCallback((data: GMCPMessageRoomInfo) => {
    setRoomInfo(data);
  }, []);

  useEffect(() => {
    client.on("roomInfo", handleRoomInfo);
    if (charItemsHandler?.sendRoomRequest) {
      charItemsHandler.sendRoomRequest();
    }
    return () => {
      client.off("roomInfo", handleRoomInfo);
    };
  }, [client, charItemsHandler, handleRoomInfo]);


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

  // Player event handlers
  const handleRoomPlayers = useCallback((players: RoomPlayer[]) => {
    setRoomPlayers(players);
    if (selectedPlayer && !players.find(p => p.name === selectedPlayer.name)) {
      setSelectedPlayer(null);
    }
  }, [selectedPlayer]);

  const handleAddPlayer = useCallback((player: RoomPlayer) => {
    setRoomPlayers(prev => prev.some(p => p.name === player.name) ? prev : [...prev, player]);
  }, []);

  const handleRemovePlayer = useCallback((playerName: string) => {
    setRoomPlayers(prev => prev.filter(p => p.name !== playerName));
    if (selectedPlayer?.name === playerName) {
      setSelectedPlayer(null);
    }
  }, [selectedPlayer]);

  useEffect(() => {
    client.on('roomPlayers', handleRoomPlayers);
    client.on('roomAddPlayer', handleAddPlayer);
    client.on('roomRemovePlayer', handleRemovePlayer);

    return () => {
      client.off('roomPlayers', handleRoomPlayers);
      client.off('roomAddPlayer', handleAddPlayer);
      client.off('roomRemovePlayer', handleRemovePlayer);
    };
  }, [client, handleRoomPlayers, handleAddPlayer, handleRemovePlayer]);

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

import React, { useState, useEffect } from 'react';
import { MudClient } from '../client';

interface RoomEventData {
  // Define the structure of your event data here
  [key: string]: any;
}

interface Props {
  client: MudClient;
}

const RoomEventTable: React.FC<Props> = ({ client }) => {
  const [roomData, setRoomData] = useState<RoomEventData | null>(null);

  useEffect(() => {
    const handleRoomEvent = (data: RoomEventData) => {
      setRoomData(data);
    };

    client.on('room', handleRoomEvent);

    return () => {
      client.off('room', handleRoomEvent);
    };
  }, [client]);

  return (
    <div>
      {roomData && (
        <table>
          <thead>
            <tr>
              {Object.keys(roomData).map(key => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {Object.values(roomData).map((value, index) => (
                <td key={index}>{value}</td>
              ))}
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RoomEventTable;


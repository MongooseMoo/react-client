import React from 'react';
import { RoomPlayer } from '../gmcp/Room';
import { setInputTextAndFocus } from '../InputStore';
import './PlayerCard.css';

interface PlayerCardProps {
  player: RoomPlayer;
  onLook: (player: RoomPlayer) => void;
  onFollow: (player: RoomPlayer) => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ 
  player, 
  onLook, 
  onFollow 
}) => {
  const handlePageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInputTextAndFocus(`page ${player.name} `);
  };

  const handleSayToClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInputTextAndFocus(`-${player.name} `);
  };

  const handleLookClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLook(player);
  };

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFollow(player);
  };

  return (
    <div className="player-card" title={player.fullname} data-player-name={player.name}>
      <div className="player-details">
        <div className="player-name">{player.fullname}</div>
      </div>
      <div className="player-actions">
        <button
          className="player-page-button"
          onClick={handlePageClick}
          aria-label={`Page ${player.fullname}`}
          tabIndex={0}
          accessKey="p"
        >
          Page
        </button>
        <button
          className="player-sayto-button"
          onClick={handleSayToClick}
          aria-label={`Say to ${player.fullname} (using -${player.name})`}
          title={`Say to ${player.fullname} (uses -${player.name} command)`}
          tabIndex={0}
          accessKey="s"
        >
          Say To
        </button>
        <button
          className="player-look-button"
          onClick={handleLookClick}
          aria-label={`Look at ${player.fullname}`}
          tabIndex={0}
          accessKey="l"
        >
          Look
        </button>
        <button
          className="player-follow-button"
          onClick={handleFollowClick}
          aria-label={`Follow ${player.fullname}`}
          tabIndex={0}
          accessKey="f"
        >
          Follow
        </button>
      </div>
    </div>
  );
};

export default PlayerCard;
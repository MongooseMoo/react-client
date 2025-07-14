import React from 'react';
import { RoomPlayer } from '../gmcp/Room';
import './PlayerCard.css';

interface PlayerCardProps {
  player: RoomPlayer;
  onPage: (player: RoomPlayer) => void;
  onSayTo: (player: RoomPlayer) => void;
  onLook: (player: RoomPlayer) => void;
  onFollow: (player: RoomPlayer) => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ 
  player, 
  onPage, 
  onSayTo, 
  onLook, 
  onFollow 
}) => {
  const handlePageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPage(player);
  };

  const handleSayToClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSayTo(player);
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
          aria-label={`Say to ${player.fullname}`}
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
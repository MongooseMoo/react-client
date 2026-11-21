import React from 'react';
import type { RoomPlayer } from '../gmcp/Room';
import { setInputTextAndFocus } from '../inputFocus';
import './PlayerCard.css';
import { useFocusRecovery } from '../hooks/useFocusRecovery';
import { appearanceLabel } from '../avatar/figure';
import AvatarPortrait from '../avatar/portrait';

interface PlayerCardProps {
  player: RoomPlayer;
  onLook: (player: RoomPlayer) => void;
  onFollow: (player: RoomPlayer) => void;
  focusReturnId?: string;
  focusFallbackId?: string;
  /** The player's Room.Layout appearance, when the room has a layout with them in it. */
  appearance?: unknown;
  /** Where the player is, in words, when the room's layout says. */
  where?: string;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  appearance,
  where,
  onLook,
  onFollow,
  focusReturnId,
  focusFallbackId,
}) => {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const label = appearanceLabel(appearance);
  useFocusRecovery(cardRef, focusReturnId, focusFallbackId);
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
    <div ref={cardRef} className="player-card" title={player.fullname} data-player-name={player.name}>
      <div className="player-details">
        <AvatarPortrait appearance={appearance} size={48} className="player-portrait" />
        <div className="player-name">{player.fullname}</div>
        {label && <div className="player-label">{label}</div>}
        {where && <div className="player-label player-where">{where}</div>}
      </div>
      <div className="player-actions">
        <button
          type="button"
          className="player-page-button"
          onClick={handlePageClick}
          aria-label={`Page ${player.fullname}`}
          tabIndex={0}
          accessKey="g"
        >
          Page
        </button>
        <button
          type="button"
          className="player-sayto-button"
          onClick={handleSayToClick}
          aria-label={`Say to ${player.fullname}`}
          title={`Say to ${player.fullname} (uses -${player.name} command)`}
          tabIndex={0}
          accessKey="s"
        >
          Say To
        </button>
        <button
          type="button"
          className="player-look-button"
          onClick={handleLookClick}
          aria-label={`Look at ${player.fullname}`}
          tabIndex={0}
          accessKey="k"
        >
          Look
        </button>
        <button
          type="button"
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

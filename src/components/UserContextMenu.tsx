import React, { useRef } from 'react';
import { ContextMenu, MenuItem } from './contextMenu';
import { UserlistPlayer } from '../mcp';
import MudClient from '../client';
import { IoMdChatboxes, IoMdShare } from 'react-icons/io';

interface UserContextMenuProps {
  user: UserlistPlayer;
  client: MudClient;
  children: React.ReactElement;
}

export const UserContextMenu: React.FC<UserContextMenuProps> = ({ user, client, children }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = () => {
    // TODO: Implement message sending
    console.log(`Sending message to ${user.Name}`);
  };

  const handleSendFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      client.sendFile(file, user.Object)
        .catch(error => {
          console.error('Failed to send file:', error);
          // TODO: Show error to user
        });
    }
    // Reset input so the same file can be selected again
    event.target.value = '';
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
      <ContextMenu trigger={children}>
        <MenuItem icon={IoMdChatboxes} onClick={handleSendMessage}>
          Send Message
        </MenuItem>
        <MenuItem icon={IoMdShare} onClick={handleSendFile}>
          Send File
        </MenuItem>
      </ContextMenu>
    </>
  );
};

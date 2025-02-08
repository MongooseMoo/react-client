import React from "react";
import Tabs from "./tabs";
import Userlist from "./userlist";
import FileTransferUI from "./FileTransfer";
import AudioChat from "./audioChat";
import { UserlistPlayer } from "../mcp";
import MudClient from "../client";

interface SidebarProps {
  users: UserlistPlayer[];
  client: MudClient;
  fileTransferExpanded: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  users,
  client,
  fileTransferExpanded,
}) => {
  const tabs = [
    {
      label: "Users",
      content: <Userlist users={users} />,
    },
    {
      label: "File Transfer",
      content: (
        <FileTransferUI client={client} expanded={fileTransferExpanded} />
      ),
    },
    {
      label: "Audio",
      content: <AudioChat client={client} />,
    },
  ];

  return (
    <div className="sidebar-content">
      <Tabs tabs={tabs} />
    </div>
  );
};

export default Sidebar;

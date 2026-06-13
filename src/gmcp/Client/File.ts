import type MudClient from "../../client";
import { inbound } from "../../protocol/messages";
import { gmcpJsonMessage } from "../messages";
import { GMCPMessage, GMCPPackage } from "../package";

export class FileDownload extends GMCPMessage {
  url: string = "";
}

const fileDownload = gmcpJsonMessage<"Download", FileDownload>("Download");

const GMCPClientFileBase = GMCPPackage.with({
  packageName: "Client.File",
  messages: [inbound(fileDownload)] as const,
});

export class GMCPClientFile extends GMCPClientFileBase {
  constructor(client: MudClient) {
    super(client);
    this.on("download", (data) => this.handleDownload(data));
  }

  handleDownload(data: FileDownload): void {
    console.log("[GMCPClientFile] Received download request:", data);
    if (data.url) {
      window.open(data.url, "_blank");
    }
  }
}

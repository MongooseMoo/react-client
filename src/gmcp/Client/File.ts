import type MudClient from "../../client";
import { GMCPMessage, GMCPPackage } from "../package";

export class FileDownload extends GMCPMessage {
  url: string = "";
}

export class GMCPClientFile extends GMCPPackage {
  public packageName: string = "Client.File";

  constructor(client: MudClient) {
    super(client);
  }

  handleDownload(data: FileDownload): void {
    console.log("[GMCPClientFile] Received download request:", data);
    if (data.url) {
      window.open(data.url, "_blank");
    }
  }
}
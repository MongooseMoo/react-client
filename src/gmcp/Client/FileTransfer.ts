import type MudClient from "../../client";
import { GMCPMessage, GMCPPackage } from "../package";

export class GMCPMessageClientFileTransferOffer extends GMCPMessage {
  sender: string = "";
  filename: string = "";
  filesize: number = 0;
  offerSdp: string = "";
}

export class GMCPMessageClientFileTransferAccept extends GMCPMessage {
  sender: string = "";
  filename: string = "";
  answerSdp: string = "";
}

export class GMCPMessageClientFileTransferReject extends GMCPMessage {
  sender: string = "";
  filename: string = "";
}

export class GMCPMessageClientFileTransferCancel extends GMCPMessage {
  sender: string = "";
  filename: string = "";
}

export class GMCPClientFileTransfer extends GMCPPackage {
  public packageName: string = "Client.FileTransfer";

  constructor(client: MudClient) {
    super(client);
  }

  handleOffer(data: GMCPMessageClientFileTransferOffer): void {
    console.log("[GMCPClientFileTransfer] Received offer:", data);
    this.client.fileTransferManager.pendingOffers.set(`${data.sender}-${data.filename}`, data);
    this.client.onFileTransferOffer(
      data.sender,
      data.filename,
      data.filesize,
      data.offerSdp
    );
  }

  handleAccept(data: GMCPMessageClientFileTransferAccept): void {
    this.client.onFileTransferAccept(
      data.sender,
      data.filename,
      data.answerSdp
    );
  }

  handleReject(data: GMCPMessageClientFileTransferReject): void {
    this.client.onFileTransferReject(data.sender, data.filename);
  }

  handleCancel(data: GMCPMessageClientFileTransferCancel): void {
    this.client.onFileTransferCancel(data.sender, data.filename);
  }

  sendOffer(
    recipient: string,
    filename: string,
    filesize: number,
    offerSdp: string
  ): void {
    this.sendData("Offer", { recipient, filename, filesize, offerSdp });
  }

  sendAccept(sender: string, filename: string, answerSdp: string): void {
    this.sendData("Accept", { sender, filename, answerSdp });
  }

  sendReject(sender: string, filename: string): void {
    this.sendData("Reject", { sender, filename });
  }

  sendCancel(recipient: string, filename: string): void {
    this.sendData("Cancel", { recipient, filename });
  }

  sendRequestResend(sender: string, filename: string): void {
    this.sendData("RequestResend", { sender, filename });
  }
}

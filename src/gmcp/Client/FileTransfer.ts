import { GMCPMessage, GMCPPackage } from "../package";

export class GMCPMessageClientFileTransferOffer extends GMCPMessage {
  sender: string = "";
  filename: string = "";
  filesize: number = 0;
}

export class GMCPMessageClientFileTransferAccept extends GMCPMessage {
  sender: string = "";
  filename: string = "";
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

  handleOffer(data: GMCPMessageClientFileTransferOffer): void {
    this.client.emit("fileTransferOffer", data);
  }

  handleAccept(data: GMCPMessageClientFileTransferAccept): void {
    this.client.emit("fileTransferAccepted", data);
  }

  handleReject(data: GMCPMessageClientFileTransferReject): void {
    this.client.emit("fileTransferRejected", data);
  }

  handleCancel(data: GMCPMessageClientFileTransferCancel): void {
    this.client.emit("fileTransferCancelled", data);
  }

  sendOffer(recipient: string, filename: string, filesize: number): void {
    this.client.sendGmcp("Comm.FileTransfer.Offer", {
      recipient,
      filename,
      filesize,
    });
  }

  sendAccept(sender: string, filename: string): void {
    this.client.sendGmcp("Comm.FileTransfer.Accept", { sender, filename });
  }

  sendReject(sender: string, filename: string): void {
    this.client.sendGmcp("Comm.FileTransfer.Reject", { sender, filename });
  }

  sendCancel(recipient: string, filename: string): void {
    this.client.sendGmcp("Comm.FileTransfer.Cancel", { recipient, filename });
    this.client.fileTransferManager.cancelTransfer(filename);
  }
}

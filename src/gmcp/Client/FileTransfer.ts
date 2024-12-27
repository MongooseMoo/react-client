import type MudClient from "../../client";
import { GMCPMessage, GMCPPackage } from "../package";

export class GMCPMessageClientFileTransferOffer extends GMCPMessage {
  sender: string = "";
  filename: string = "";
  filesize: number = 0;
  offerSdp: string = "";
  hash: string = "";
}

export class GMCPMessageClientFileTransferAccept extends GMCPMessage {
  sender: string = "";
  hash: string = "";
  filename: string = "";
  answerSdp: string = "";
}

export class GMCPMessageClientFileTransferReject extends GMCPMessage {
  sender: string = "";
  hash: string = "";
}

export class GMCPMessageClientFileTransferCancel extends GMCPMessage {
  sender: string = "";
  hash: string = "";
}

export class GMCPClientFileTransfer extends GMCPPackage {
  public packageName: string = "Client.FileTransfer";

  sendCandidate(recipient: string, candidate: RTCIceCandidate): void {
    this.sendData("Candidate", {
      recipient,
      candidate: JSON.stringify(candidate)
    });
  }

  handleCandidate(data: { sender: string, candidate: string }): void {
    const candidate = JSON.parse(data.candidate);
    this.client.webRTCService.handleIceCandidate(candidate);
  }

  handleOffer(data: GMCPMessageClientFileTransferOffer): void {
    console.log("[GMCPClientFileTransfer] Received offer:", data);
    this.client.fileTransferManager.pendingOffers.set(`${data.hash}`, data);
    this.client.onFileTransferOffer(
      data.sender,
      data.hash,
      data.filename,
      data.filesize,
      data.offerSdp
    );
  }

  handleAccept(data: GMCPMessageClientFileTransferAccept): void {
    this.client.onFileTransferAccept(
      data.sender,
      data.hash,
      data.filename,
      data.answerSdp
    );
  }

  handleReject(data: GMCPMessageClientFileTransferReject): void {
    this.client.onFileTransferReject(data.sender, data.hash);
  }

  handleCancel(data: GMCPMessageClientFileTransferCancel): void {
    this.client.onFileTransferCancel(data.sender, data.hash);
  }

  sendOffer(
    recipient: string,
    filename: string,
    filesize: number,
    offerSdp: string,
    hash: string
  ): void {
    this.sendData("Offer", { recipient, filename, filesize, offerSdp, hash });
  }

  sendAccept(sender: string, hash: string, filename: string, answerSdp: string): void {
    this.sendData("Accept", { sender, hash, filename, answerSdp });
  }

  sendReject(sender: string, hash: string): void {
    this.sendData("Reject", { sender, hash });
  }

  sendCancel(recipient: string, hash: string): void {
    this.sendData("Cancel", { recipient, hash });
  }

  sendRequestResend(sender: string, hash: string): void {
    this.sendData("RequestResend", { sender, hash });
  }
}

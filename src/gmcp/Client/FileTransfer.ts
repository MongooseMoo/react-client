import type MudClient from "../../client";
import { GMCPMessage, GMCPPackage } from "../package";

export class FileTransferOffer extends GMCPMessage {
  sender: string = "";
  filename: string = "";
  filesize: number = 0;
  offerSdp: string = "";
  hash: string = "";
}

export class FileTransferAccept extends GMCPMessage {
  sender: string = "";
  hash: string = "";
  filename: string = "";
  answerSdp: string = "";
}

export class FileTransferReject extends GMCPMessage {
  sender: string = "";
  hash: string = "";
}

export class FileTransferCancel extends GMCPMessage {
  sender: string = "";
  hash: string = "";
}

// The signaling interface that all signalers conform to
export interface FileTransferSignaler {
  handleAccept(data: FileTransferAccept): void;
  handleCancel(data: FileTransferCancel): void;
  handleCandidate(data: { sender: string; candidate: string }): void;
  handleOffer(data: FileTransferOffer): void;
  handleReject(data: FileTransferReject): void;
  sendAccept(
    sender: string,
    hash: string,
    filename: string,
    answerSdp: string
  ): void;
  sendCancel(recipient: string, hash: string): void;
  sendCandidate(recipient: string, candidate: RTCIceCandidate): void;
  sendOffer(
    recipient: string,
    filename: string,
    filesize: number,
    offerSdp: string,
    hash: string
  ): void;
  sendReject(sender: string, hash: string): void;
  sendRequestResend(sender: string, hash: string): void;
}

export class GMCPClientFileTransfer extends GMCPPackage implements FileTransferSignaler {
  public packageName: string = "Client.FileTransfer";

  sendCandidate(recipient: string, candidate: RTCIceCandidate): void {
    this.sendData("Candidate", {
      recipient,
      candidate: JSON.stringify(candidate),
    });
  }

  handleCandidate(data: { sender: string; candidate: string }): void {
    const candidate = JSON.parse(data.candidate);
    this.client.webRTCService.handleIceCandidate(candidate);
  }

  handleOffer(data: FileTransferOffer): void {
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

  handleAccept(data: FileTransferAccept): void {
    this.client.onFileTransferAccept(
      data.sender,
      data.hash,
      data.filename,
      data.answerSdp
    );
  }

  handleReject(data: FileTransferReject): void {
    this.client.onFileTransferReject(data.sender, data.hash);
  }

  handleCancel(data: FileTransferCancel): void {
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

  sendAccept(
    sender: string,
    hash: string,
    filename: string,
    answerSdp: string
  ): void {
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

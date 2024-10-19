import MudClient from "../../client";
import { GMCPMessage, GMCPPackage } from "../package";
import { EventEmitter } from "eventemitter3";

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
  private emitter: EventEmitter;

  constructor(client: MudClient) {
    super(client);
    this.emitter = new EventEmitter();
  }

  handleOffer(data: GMCPMessageClientFileTransferOffer): void {
    this.client.webRTCService.handleOffer(JSON.parse(data.offerSdp));
    this.emitter.emit("offer", data);
  }

  async handleAccept(data: GMCPMessageClientFileTransferAccept): Promise<void> {
    await this.client.webRTCService.handleAnswer(JSON.parse(data.answerSdp));
    this.emitter.emit("accept", data);
  }

  handleReject(data: GMCPMessageClientFileTransferReject): void {
    this.emitter.emit("reject", data);
  }

  handleCancel(data: GMCPMessageClientFileTransferCancel): void {
    this.emitter.emit("cancel", data);
  }

  handleSignal(data: { sender: string; signal: string }): void {
    this.client.handleWebRTCSignal(data.sender, data.signal);
  }

  async sendOffer(recipient: string, filename: string, filesize: number): Promise<void> {
    const offer = await this.client.webRTCService.createOffer();
    this.sendData("Offer", { recipient, filename, filesize, offerSdp: JSON.stringify(offer) });
  }

  async sendAccept(sender: string, filename: string): Promise<void> {
    const answer = await this.client.webRTCService.createAnswer();
    this.sendData("Accept", { sender, filename, answerSdp: JSON.stringify(answer) });
  }

  sendReject(sender: string, filename: string): void {
    this.sendData("Reject", { sender, filename });
  }

  sendCancel(recipient: string, filename: string): void {
    this.sendData("Cancel", { recipient, filename });
  }

  sendSignal(recipient: string, signal: string): void {
    this.sendData("Signal", { recipient, signal });
  }

  on(event: string, listener: (...args: any[]) => void): void {
    this.emitter.on(event, listener);
  }

  off(event: string, listener: (...args: any[]) => void): void {
    this.emitter.off(event, listener);
  }
}

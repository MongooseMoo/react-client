import EventEmitter from 'eventemitter3';
import { GMCPMessage, GMCPPackage } from '../package';

export class FileTransferOffer extends GMCPMessage {
  sender: string = '';
  filename: string = '';
  filesize: number = 0;
  offerSdp: string = '';
  hash: string = '';
}

export class FileTransferAccept extends GMCPMessage {
  sender: string = '';
  hash: string = '';
  filename: string = '';
  answerSdp: string = '';
}

export class FileTransferReject extends GMCPMessage {
  sender: string = '';
  hash: string = '';
}

export class FileTransferCancel extends GMCPMessage {
  sender: string = '';
  hash: string = '';
}

export interface FileTransferCandidate {
  sender: string;
  candidate: string;
}

interface FileTransferTransportEvents {
  accept: (data: FileTransferAccept) => void;
  cancel: (data: FileTransferCancel) => void;
  candidate: (data: FileTransferCandidate) => void;
  offer: (data: FileTransferOffer) => void;
  reject: (data: FileTransferReject) => void;
}

// The signaling interface that all signalers conform to
export interface FileTransferSignaler {
  handleAccept(data: FileTransferAccept): void;
  handleCancel(data: FileTransferCancel): void;
  handleCandidate(data: { sender: string; candidate: string }): void;
  handleOffer(data: FileTransferOffer): void;
  handleReject(data: FileTransferReject): void;
  sendAccept(sender: string, hash: string, filename: string, answerSdp: string): void;
  sendCancel(recipient: string, hash: string): void;
  sendCandidate(recipient: string, candidate: RTCIceCandidate): void;
  sendOffer(
    recipient: string,
    filename: string,
    filesize: number,
    offerSdp: string,
    hash: string,
  ): void;
  sendReject(sender: string, hash: string): void;
  sendRequestResend(sender: string, hash: string): void;
}

export class GMCPClientFileTransfer extends GMCPPackage implements FileTransferSignaler {
  public packageName: string = 'Client.FileTransfer';
  private readonly signals = new EventEmitter<FileTransferTransportEvents>();

  on<EventName extends keyof FileTransferTransportEvents>(
    event: EventName,
    listener: FileTransferTransportEvents[EventName],
  ): this {
    this.signals.on(
      event,
      listener as EventEmitter.EventListener<FileTransferTransportEvents, EventName>,
    );
    return this;
  }

  off<EventName extends keyof FileTransferTransportEvents>(
    event: EventName,
    listener: FileTransferTransportEvents[EventName],
  ): this {
    this.signals.off(
      event,
      listener as EventEmitter.EventListener<FileTransferTransportEvents, EventName>,
    );
    return this;
  }

  sendCandidate(recipient: string, candidate: RTCIceCandidate): void {
    this.sendData('Candidate', {
      recipient,
      candidate: JSON.stringify(candidate),
    });
  }

  handleCandidate(data: FileTransferCandidate): void {
    this.signals.emit('candidate', data);
  }

  handleOffer(data: FileTransferOffer): void {
    console.log('[GMCPClientFileTransfer] Received offer:', data);
    this.signals.emit('offer', data);
  }

  handleAccept(data: FileTransferAccept): void {
    this.signals.emit('accept', data);
  }

  handleReject(data: FileTransferReject): void {
    this.signals.emit('reject', data);
  }

  handleCancel(data: FileTransferCancel): void {
    this.signals.emit('cancel', data);
  }

  sendOffer(
    recipient: string,
    filename: string,
    filesize: number,
    offerSdp: string,
    hash: string,
  ): void {
    this.sendData('Offer', { recipient, filename, filesize, offerSdp, hash });
  }

  sendAccept(sender: string, hash: string, filename: string, answerSdp: string): void {
    this.sendData('Accept', { sender, hash, filename, answerSdp });
  }

  sendReject(sender: string, hash: string): void {
    this.sendData('Reject', { sender, hash });
  }

  sendCancel(recipient: string, hash: string): void {
    this.sendData('Cancel', { recipient, hash });
  }

  sendRequestResend(sender: string, hash: string): void {
    this.sendData('RequestResend', { sender, hash });
  }
}

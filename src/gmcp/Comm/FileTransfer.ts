import { GMCPMessage, GMCPPackage } from "../package";

export class GMCPMessageCommFileTransferOffer extends GMCPMessage {
    sender: string = "";
    filename: string = "";
    filesize: number = 0;
}

export class GMCPMessageCommFileTransferAccept extends GMCPMessage {
    sender: string = "";
    filename: string = "";
}

export class GMCPMessageCommFileTransferReject extends GMCPMessage {
    sender: string = "";
    filename: string = "";
}

export class GMCPMessageCommFileTransferCancel extends GMCPMessage {
    sender: string = "";
    filename: string = "";
}

export class GMCPCommFileTransfer extends GMCPPackage {
    public packageName: string = "Comm.FileTransfer";

    handleOffer(data: GMCPMessageCommFileTransferOffer): void {
        this.client.emit("fileTransferOffer", data);
    }

    handleAccept(data: GMCPMessageCommFileTransferAccept): void {
        this.client.emit("fileTransferAccepted", data);
    }

    handleReject(data: GMCPMessageCommFileTransferReject): void {
        this.client.emit("fileTransferRejected", data);
    }

    handleCancel(data: GMCPMessageCommFileTransferCancel): void {
        this.client.emit("fileTransferCancelled", data);
    }

    sendOffer(recipient: string, filename: string, filesize: number): void {
        this.client.sendGmcp("Comm.FileTransfer.Offer", { recipient, filename, filesize });
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

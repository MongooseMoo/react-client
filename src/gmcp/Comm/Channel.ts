import { GMCPMessage, GMCPPackage } from "../package";

export class GMCPMessageCommChannelText extends GMCPMessage {
    public readonly channel!: string;
    public readonly talker!: string;
    public readonly text!: string;
}


export class GMCPCommChannel extends GMCPPackage {
    public packageName: string = "Comm.Channel";
    public channels: string[] = [];

    handleList(data: string[]): void {
        this.channels = data;

    }

    sendList(): void {
        this.sendData("List");
    }

    handleText(data: GMCPMessageCommChannelText): void {
        if (data.channel === "say_to_you") {
            if (!document.hasFocus()) {
                this.client.sendNotification(`Message from ${data.talker}`, `${data.text}`);
            }
        }
    }
}

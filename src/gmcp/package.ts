import type MudClient from "../client";

export abstract class GMCPMessage { }


export class GMCPPackage {
    public readonly packageName!: string;
    public readonly packageVersion?: number = 1;
    protected readonly client: MudClient;

    constructor(client: MudClient) {
        this.client = client;
    }

    sendData(messageName: string, data?: any): void {
        this.client.sendGmcp(
            this.packageName + "." + messageName,
            JSON.stringify(data)
        );
    }

    shutdown() {
        // Do nothing
    }
}



import type MudClient from "../client";
import {
    createProtocolIO,
    type AnyDirectedProtocolMessage,
    type ProtocolIO,
} from "../protocol/messages";

export abstract class GMCPMessage { }

interface GMCPPackageConfig<Messages extends readonly AnyDirectedProtocolMessage[]> {
    packageName: string;
    messages: Messages;
}

export class GMCPPackage {
    public readonly packageName!: string;
    public readonly packageVersion?: number = 1;
    protected readonly client: MudClient;

    constructor(client: MudClient) {
        this.client = client;
    }

    static with<const Messages extends readonly AnyDirectedProtocolMessage[]>(
        config: GMCPPackageConfig<Messages>,
    ): new (client: MudClient) => GMCPPackage & ProtocolIO<Messages> {
        const RegisteredGMCPPackage = class extends GMCPPackage {
            public readonly packageName = config.packageName;

            constructor(client: MudClient) {
                super(client);
                createProtocolIO(
                    config.messages,
                    (wireName, payload) => this.sendData(wireName, payload),
                    this,
                );
            }
        };

        return RegisteredGMCPPackage as unknown as new (
            client: MudClient,
        ) => GMCPPackage & ProtocolIO<Messages>;
    }

    get enabled(): boolean {
        return true;
    }

    sendData(messageName: string, data?: unknown): void {
        this.client.gmcp.send(
            `${this.packageName}.${messageName}`,
            JSON.stringify(data)
        );
    }

    shutdown() {
        // Do nothing
    }

    protected emitRegisteredMessage(wireName: string, payload: unknown): boolean {
        const receiver = (this as { receive?: (name: string, data: unknown) => boolean })
            .receive;
        return receiver?.call(this, wireName, payload) ?? false;
    }
}

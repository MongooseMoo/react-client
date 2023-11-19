import { GMCPMessage, GMCPPackage } from "./package";


export class GMCPMessageCoreClient extends GMCPMessage {
    public readonly name: string;
    public readonly version: string;

    constructor(name: string, version: string) {
        super();
        this.name = name;
        this.version = version;
    }
}


export class GMCPCore extends GMCPPackage {
    public packageName: string = "Core";

    sendHello(): void {
        this.sendData("Hello", { client: "Mongoose Client", version: "0.1" });
    }
}

export class GMCPCoreSupports extends GMCPPackage {
    packageName = "Core.Supports";

    sendSet() {
        const packages = Object.values(this.client.gmcpHandlers).map(
            (p) => p.packageName + " " + p.packageVersion!.toString()
        );
        this.sendData("Set", packages);
    }
}

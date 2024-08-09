import type MudClient from "../../client";
import { GMCPMessage, GMCPPackage } from "../package";

class GMCPMessageClientHtmlAddHtml extends GMCPMessage {
    public readonly data!: string[];
}

export class GMCPClientHtml extends GMCPPackage {
    public packageName: string = "Client.Html";

    constructor(client: MudClient) {
        super(client);
    }

    public handleAdd_html(data: GMCPMessageClientHtmlAddHtml): void {
        this.client.emit("html", data.data.join("\n"));
    }
}

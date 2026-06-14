import { inbound } from "../../protocol/messages";
import { gmcpJsonMessage } from "../messages";
import { GMCPMessage, GMCPPackage } from "../package";

class GMCPMessageClientHtmlAddHtml extends GMCPMessage {
    public readonly data!: string[];
}

const htmlAddHtml = gmcpJsonMessage<"Add_html", GMCPMessageClientHtmlAddHtml>("Add_html");
const htmlAddMarkdown = gmcpJsonMessage<"Add_markdown", GMCPMessageClientHtmlAddHtml>("Add_markdown");

const GMCPClientHtmlBase = GMCPPackage.with({
    packageName: "Client.Html",
    messages: [
        inbound(htmlAddHtml),
        inbound(htmlAddMarkdown),
    ] as const,
});

export class GMCPClientHtml extends GMCPClientHtmlBase {
}

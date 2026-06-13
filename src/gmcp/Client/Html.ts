import { inbound } from "../../protocol/messages";
import { gmcpJsonMessage } from "../messages";
import { GMCPMessage, GMCPPackage } from "../package";
import { marked } from 'marked';

// Configure marked options
marked.setOptions({
    breaks: true,  // Convert single \n to <br> (more intuitive for chat-like content)
    gfm: true,     // GitHub Flavored Markdown (already default)
});

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
    constructor(client: ConstructorParameters<typeof GMCPClientHtmlBase>[0]) {
        super(client);
        this.on("addHtml", (data) => this.handleAddHtml(data));
        this.on("addMarkdown", (data) => this.handleAddMarkdown(data));
    }

    public handleAddHtml(data: GMCPMessageClientHtmlAddHtml): void {
        this.client.emit("html", data.data.join("\n"));
    }

    public handleAddMarkdown(data: GMCPMessageClientHtmlAddHtml): void {
        const markdown = data.data.join("\n");
        const html = marked(markdown);
        // marked adds trailing \n to all block elements - strip it
        this.client.emit("html", typeof html === 'string' ? html.trimEnd() : html);
    }
}

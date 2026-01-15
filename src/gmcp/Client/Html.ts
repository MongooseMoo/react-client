import type MudClient from "../../client";
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

export class GMCPClientHtml extends GMCPPackage {
    public packageName: string = "Client.Html";

    constructor(client: MudClient) {
        super(client);
    }

    public handleAdd_html(data: GMCPMessageClientHtmlAddHtml): void {
        this.client.emit("html", data.data.join("\n"));
    }

    public handleAdd_markdown(data: GMCPMessageClientHtmlAddHtml): void {
        const markdown = data.data.join("\n");
        const html = marked(markdown);
        // marked adds trailing \n to all block elements - strip it
        this.client.emit("html", typeof html === 'string' ? html.trimEnd() : html);
    }
}

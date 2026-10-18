import { inbound, outbound } from "../../protocol/messages";
import { gmcpJsonMessage } from "../messages";
import { GMCPPackage } from "../package";

export interface Achievement {
    name: string;
    value: string; // Example shows string, could be number
}

export interface UrlInfo {
    url: string;
    window: string;
}

const miscRemindVote = gmcpJsonMessage<"RemindVote", string>("RemindVote");
const miscAchievement = gmcpJsonMessage<"Achievement", Achievement[]>("Achievement");
const miscURL = gmcpJsonMessage<"URL", UrlInfo[]>("URL");
const miscTip = gmcpJsonMessage<"Tip", string>("Tip");
const miscVoted = gmcpJsonMessage<"Voted", never, string>("Voted");

const GmcPIREMiscBase = GMCPPackage.with({
    packageName: "IRE.Misc",
    messages: [
        inbound(miscRemindVote),
        inbound(miscAchievement),
        inbound(miscURL).asEvent("url"),
        inbound(miscTip),
        outbound(miscVoted),
    ] as const,
});

export class GmcPIREMisc extends GmcPIREMiscBase {
    constructor(client: ConstructorParameters<typeof GmcPIREMiscBase>[0]) {
        super(client);
        this.on("remindVote", (data) => this.handleRemindVote(data));
        this.on("achievement", (data) => this.handleAchievement(data));
        this.on("url", (data) => this.handleURL(data));
        this.on("tip", (data) => this.handleTip(data));
    }

    // --- Server Messages ---
    handleRemindVote(url: string): void {
        console.log(`Received IRE.Misc.RemindVote: ${url}`);
        // TODO: Display a reminder to vote, possibly with the URL
    }

    handleAchievement(achievements: Achievement[]): void {
        console.log("Received IRE.Misc.Achievement:", achievements);
        // TODO: Update achievement status
    }

    handleURL(urls: UrlInfo[]): void {
        console.log("Received IRE.Misc.URL:", urls);
        // TODO: Provide clickable URLs, potentially opening in specific windows/tabs
    }

    handleTip(tip: string): void {
        console.log(`Received IRE.Misc.Tip: ${tip}`);
        // TODO: Display the tip to the user
    }
}

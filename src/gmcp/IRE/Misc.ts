import { GMCPMessage, GMCPPackage } from "../package";

export interface Achievement {
    name: string;
    value: string; // Example shows string, could be number
}

export interface UrlInfo {
    url: string;
    window: string;
}

export class GmcPIREMisc extends GMCPPackage {
    public packageName: string = "IRE.Misc";

    // --- Server Messages ---
    handleRemindVote(url: string): void {
        console.log(`Received IRE.Misc.RemindVote: ${url}`);
        // TODO: Display a reminder to vote, possibly with the URL
        this.client.emit("miscRemindVote", url);
    }

    handleAchievement(achievements: Achievement[]): void {
        console.log("Received IRE.Misc.Achievement:", achievements);
        // TODO: Update achievement status
        this.client.emit("miscAchievement", achievements);
    }

    handleURL(urls: UrlInfo[]): void {
        console.log("Received IRE.Misc.URL:", urls);
        // TODO: Provide clickable URLs, potentially opening in specific windows/tabs
        this.client.emit("miscURL", urls);
    }

    handleTip(tip: string): void {
        console.log(`Received IRE.Misc.Tip: ${tip}`);
        // TODO: Display the tip to the user
        this.client.emit("miscTip", tip);
    }

    // --- Client Messages ---
    sendVoted(): void {
        this.sendData("Voted", ""); // Empty body as per docs
    }
}

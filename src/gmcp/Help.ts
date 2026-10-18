import { announce } from "@react-aria/live-announcer";
import { inbound, outbound } from "../protocol/messages";
import { useHelpStore } from "../stores/helpStore";
import { gmcpJsonMessage } from "./messages";
import { GMCPMessage, GMCPPackage } from "./package";

export type HelpStatus = "ok" | "none" | "ambiguous" | "shown" | "broken";

export class GMCPMessageHelpGet extends GMCPMessage {
    /** Empty for the front page; `index`, `search <words>`, or a topic name. */
    public readonly topic!: string;
}

export class GMCPMessageHelpTopic extends GMCPMessage {
    public readonly topic!: string;
    public readonly query!: string;
    public readonly db!: string;
    public readonly audience!: string;
    public readonly status!: HelpStatus;
    /** Plain text; leading spaces are alignment. */
    public readonly lines!: string[];
    public readonly choices!: string[];
}

const helpGet = gmcpJsonMessage<"Get", never, GMCPMessageHelpGet>("Get");
const helpTopic = gmcpJsonMessage<"Topic", GMCPMessageHelpTopic>("Topic");

const GMCPHelpBase = GMCPPackage.with({
    packageName: "Help",
    messages: [
        outbound(helpGet),
        inbound(helpTopic),
    ] as const,
});

/** The heading for a result: Help for the front page, else the topic or what was asked. */
export function helpTitle(result: GMCPMessageHelpTopic): string {
    if (result.query.trim() === "") return "Help";
    return result.topic || result.query;
}

const STATUS_MEANING: Partial<Record<HelpStatus, string>> = {
    none: "no help found",
    shown: "printed in the game output",
    broken: "this help topic is broken",
};

/** What a screen reader hears when a result arrives. */
export function describeHelpTopic(result: GMCPMessageHelpTopic): string {
    const title = helpTitle(result);
    const meaning = STATUS_MEANING[result.status];
    return meaning ? `${title}: ${meaning}` : title;
}

export class GMCPHelp extends GMCPHelpBase {
    constructor(client: ConstructorParameters<typeof GMCPHelpBase>[0]) {
        super(client);
        this.on("topic", (data) => this.handleTopic(data));
    }

    handleTopic(data: GMCPMessageHelpTopic): void {
        useHelpStore.getState().show(data);
        announce(describeHelpTopic(data), "polite");
    }
}

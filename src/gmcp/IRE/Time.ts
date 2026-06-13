import { inbound, outbound } from "../../protocol/messages";
import { gmcpJsonMessage } from "../messages";
import { GMCPPackage } from "../package";

export interface TimeInfo {
    day: string;
    mon: string; // Month number
    month: string; // Month name
    year: string;
    hour: string; // Example shows "41", likely minutes within the hour? Or total minutes? Needs clarification.
    daynight: string; // Example shows "80", likely percentage or similar indicator.
}

const timeList = gmcpJsonMessage<"List", TimeInfo>("List");
const timeUpdate = gmcpJsonMessage<"Update", Partial<TimeInfo>>("Update");
const timeRequest = gmcpJsonMessage<"Request", never, void>("Request");

const GmcPIRETimeBase = GMCPPackage.with({
    packageName: "IRE.Time",
    messages: [
        inbound(timeList),
        inbound(timeUpdate),
        outbound(timeRequest),
    ] as const,
});

export class GmcPIRETime extends GmcPIRETimeBase {
    constructor(client: ConstructorParameters<typeof GmcPIRETimeBase>[0]) {
        super(client);
        this.on("list", (data) => this.handleList(data));
        this.on("update", (data) => this.handleUpdate(data));
    }

    // --- Server Messages ---
    handleList(timeInfo: TimeInfo): void {
        console.log("Received IRE.Time.List:", timeInfo);
        // TODO: Update time/date/day-night display
        this.client.emit("timeList", timeInfo);
    }

    handleUpdate(timeUpdate: Partial<TimeInfo>): void {
        // Assuming Update sends only changed values
        console.log("Received IRE.Time.Update:", timeUpdate);
        // TODO: Update specific time elements
        this.client.emit("timeUpdate", timeUpdate);
    }
}

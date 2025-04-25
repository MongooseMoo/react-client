import { GMCPMessage, GMCPPackage } from "../package";

export interface TimeInfo {
    day: string;
    mon: string; // Month number
    month: string; // Month name
    year: string;
    hour: string; // Example shows "41", likely minutes within the hour? Or total minutes? Needs clarification.
    daynight: string; // Example shows "80", likely percentage or similar indicator.
}

export class GmcPIRETime extends GMCPPackage {
    public packageName: string = "IRE.Time";

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

    // --- Client Messages ---
    sendRequest(): void {
        this.sendData("Request"); // No body needed
    }
}

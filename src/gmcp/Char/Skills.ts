import { GMCPMessage, GMCPPackage } from "../package";

export interface SkillGroupInfo {
    name: string;
    rank: string;
}

export class GMCPMessageCharSkillsGroups extends GMCPMessage {
    groups: SkillGroupInfo[] = [];
}

export class GMCPMessageCharSkillsList extends GMCPMessage {
    group: string = "";
    list: string[] = [];
    descs?: string[]; // Optional based on example
}

export class GMCPMessageCharSkillsInfo extends GMCPMessage {
    group: string = "";
    skill: string = "";
    info: string = "";
}

export class GMCPCharSkills extends GMCPPackage {
    public packageName: string = "Char.Skills";

    // --- Server Messages ---

    handleGroups(data: SkillGroupInfo[]): void {
        console.log("Received Char.Skills.Groups:", data);
        // TODO: Update skill groups list
        this.client.emit("skillGroups", data);
    }

    handleList(data: GMCPMessageCharSkillsList): void {
        console.log(`Received Char.Skills.List for ${data.group}:`, data);
        // TODO: Update skill list for the specified group
        this.client.emit("skillList", data);
    }

    handleInfo(data: GMCPMessageCharSkillsInfo): void {
        console.log(`Received Char.Skills.Info for ${data.group}.${data.skill}:`, data.info);
        // TODO: Store/display detailed skill info
        this.client.emit("skillInfo", data);
    }

    // --- Client Messages ---

    sendGetRequest(group?: string, name?: string): void {
        const requestData: { group?: string; name?: string } = {};
        if (group) requestData.group = group;
        if (name) requestData.name = name;
        this.sendData("Get", requestData);
    }
}

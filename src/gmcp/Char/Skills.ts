import { inbound, outbound } from "../../protocol/messages";
import { useSkillsStore } from "../../stores/skillsStore";
import { gmcpJsonMessage } from "../messages";
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

const skillsGroups = gmcpJsonMessage<"Groups", SkillGroupInfo[]>("Groups");
const skillsList = gmcpJsonMessage<"List", GMCPMessageCharSkillsList>("List");
const skillsInfo = gmcpJsonMessage<"Info", GMCPMessageCharSkillsInfo>("Info");
const skillsGet = gmcpJsonMessage<"Get", never, { group?: string; name?: string }>("Get");

const GMCPCharSkillsBase = GMCPPackage.with({
    packageName: "Char.Skills",
    messages: [
        inbound(skillsGroups),
        inbound(skillsList),
        inbound(skillsInfo),
        outbound(skillsGet),
    ] as const,
});

export class GMCPCharSkills extends GMCPCharSkillsBase {
    constructor(client: ConstructorParameters<typeof GMCPCharSkillsBase>[0]) {
        super(client);
        this.on("groups", (data) => this.handleGroups(data));
        this.on("list", (data) => this.handleList(data));
        this.on("info", (data) => this.handleInfo(data));
    }

    // --- Server Messages ---

    handleGroups(data: SkillGroupInfo[]): void {
        console.log("Received Char.Skills.Groups:", data);
        useSkillsStore.getState().setGroups(data);
    }

    handleList(data: GMCPMessageCharSkillsList): void {
        console.log(`Received Char.Skills.List for ${data.group}:`, data);
        useSkillsStore.getState().setList(data);
    }

    handleInfo(data: GMCPMessageCharSkillsInfo): void {
        console.log(`Received Char.Skills.Info for ${data.group}.${data.skill}:`, data.info);
        useSkillsStore.getState().setInfo(data);
    }
}

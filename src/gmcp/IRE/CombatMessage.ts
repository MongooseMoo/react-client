import { GMCPMessage, GMCPPackage } from "../package";

// Structure based on Starmourn example: { ["skill name"] = { target="...", message="...", caster="..." } }
// This is Lua table syntax, translating to JSON is tricky.
// Option 1: Assume the outer key is the message name and data is the inner object.
// Option 2: Assume the entire thing is sent as a complex JSON object/string.
// Let's assume Option 1 for now, where the GMCP message name includes the skill.
// e.g., IRE.CombatMessage.skirmishing_kick { target="...", message="...", caster="..." }

export interface CombatMessageData {
    target: string;
    message: string;
    caster: string;
}

export class GmcPIRECombatMessage extends GMCPPackage {
    public packageName: string = "IRE.CombatMessage";

    // This handler might need adjustment depending on how the server actually sends the data.
    // It assumes the skill name is part of the GMCP message name handled dynamically.
    handleSkillAttack(skillName: string, data: CombatMessageData): void {
        console.log(`Received IRE.CombatMessage for ${skillName}:`, data);
        // TODO: Process combat message (e.g., display, trigger reflexes)
        this.client.emit("combatMessage", { skill: skillName, ...data });
    }

    // Override handleGmcp to dynamically handle skill names if needed
    // handleGmcp(messageName: string, data: any): void {
    //     if (messageName.startsWith(this.packageName + ".")) {
    //         const skillName = messageName.substring(this.packageName.length + 1);
    //         this.handleSkillAttack(skillName, data as CombatMessageData);
    //     } else {
    //         super.handleGmcp(messageName, data); // Or appropriate base class method
    //     }
    // }

    // No client messages defined
}

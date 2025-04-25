import { GMCPMessage, GMCPPackage } from "../package";

export interface TaskItem {
    id: string; // Docs say numeric, example shows string
    name: string;
    desc: string;
    type: "quests" | "tasks" | "achievements" | string; // Allow other strings
    cmd: string;
    status: string; // "0" or "1" based on example
    group: string;
}

export class GmcPIRETasks extends GMCPPackage {
    public packageName: string = "IRE.Tasks";

    // --- Server Messages ---
    handleList(tasks: TaskItem[]): void {
        console.log("Received IRE.Tasks.List:", tasks);
        // TODO: Update tasks/quests/achievements display
        this.client.emit("tasksList", tasks);
    }

    handleUpdate(task: TaskItem): void {
        // Assuming Update sends a single item like other similar packages
        console.log("Received IRE.Tasks.Update:", task);
        // TODO: Update a specific task/quest/achievement in the display
        this.client.emit("taskUpdate", task);
    }

    handleCompleted(task: TaskItem): void {
        // Assuming Completed sends a single item
        console.log("Received IRE.Tasks.Completed:", task);
        // TODO: Mark a task/quest/achievement as completed
        this.client.emit("taskCompleted", task);
    }

    // --- Client Messages ---
    sendRequest(): void {
        this.sendData("Request"); // No body needed
    }
}

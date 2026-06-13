import { inbound, outbound } from "../../protocol/messages";
import { gmcpJsonMessage } from "../messages";
import { GMCPPackage } from "../package";

export interface TaskItem {
    id: string; // Docs say numeric, example shows string
    name: string;
    desc: string;
    type: "quests" | "tasks" | "achievements" | string; // Allow other strings
    cmd: string;
    status: string; // "0" or "1" based on example
    group: string;
}

const tasksList = gmcpJsonMessage<"List", TaskItem[]>("List");
const tasksUpdate = gmcpJsonMessage<"Update", TaskItem>("Update");
const tasksCompleted = gmcpJsonMessage<"Completed", TaskItem>("Completed");
const tasksRequest = gmcpJsonMessage<"Request", never, void>("Request");

const GmcPIRETasksBase = GMCPPackage.with({
    packageName: "IRE.Tasks",
    messages: [
        inbound(tasksList),
        inbound(tasksUpdate),
        inbound(tasksCompleted),
        outbound(tasksRequest),
    ] as const,
});

export class GmcPIRETasks extends GmcPIRETasksBase {
    constructor(client: ConstructorParameters<typeof GmcPIRETasksBase>[0]) {
        super(client);
        this.on("list", (data) => this.handleList(data));
        this.on("update", (data) => this.handleUpdate(data));
        this.on("completed", (data) => this.handleCompleted(data));
    }

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
}

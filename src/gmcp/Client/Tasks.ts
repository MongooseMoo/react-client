import { announce } from "@react-aria/live-announcer";
import { duplex, inbound, outbound } from "../../protocol/messages";
import { useTasksStore } from "../../stores/tasksStore";
import { gmcpJsonMessage } from "../messages";
import { GMCPMessage, GMCPPackage } from "../package";

/** What kind of queued task: a one-shot or repeating timer, any other queued or suspended task, one reading input, or one waiting on a program. */
export type ClientTasksKind = "once" | "every" | "task" | "input" | "exec";

/** One group of the player's queued tasks: those of one owner running the same thing, as @tasks shows them. */
export class GMCPMessageClientTasksGroupSummary extends GMCPMessage {
    public readonly key!: string;
    /** What the tasks run, such as "#4143:cycle" or "dispatch_event on 35 objects". */
    public readonly label!: string;
    public readonly owner!: string;
    public readonly kind!: ClientTasksKind;
    public readonly count!: number;
    /** When the soonest one runs, in Unix seconds by the server's clock; -1 while reading input. */
    public readonly next!: number;
}

export class GMCPMessageClientTasksList extends GMCPMessage {
    /** The server's clock when it answered, in Unix seconds, so times are counted from it. */
    public readonly now!: number;
    public readonly total!: number;
    public readonly groups!: GMCPMessageClientTasksGroupSummary[];
}

/** One queued task. */
export class GMCPMessageClientTasksTask extends GMCPMessage {
    public readonly id!: number;
    public readonly start!: number;
    public readonly owner!: string;
    public readonly kind!: ClientTasksKind;
    public readonly label!: string;
    /** The name of the object it calls, when it has one. */
    public readonly name!: string;
    public readonly line!: number;
    /** Seconds between runs, for a repeating task. */
    public readonly interval!: number;
}

export class GMCPMessageClientTasksGroup extends GMCPMessage {
    public readonly key!: string;
    public readonly now!: number;
    public readonly tasks!: GMCPMessageClientTasksTask[];
}

export class GMCPMessageClientTasksGroupRequest extends GMCPMessage {
    public readonly key!: string;
}

export class GMCPMessageClientTasksInfo extends GMCPMessage {
    public readonly id!: number;
    /** What @task-info shows: owner, verb and call stack. */
    public readonly lines!: string[];
}

export class GMCPMessageClientTasksInfoRequest extends GMCPMessage {
    public readonly id!: number;
}

export class GMCPMessageClientTasksKill extends GMCPMessage {
    public readonly ids!: number[];
}

export class GMCPMessageClientTasksResult extends GMCPMessage {
    public readonly ok!: number;
    public readonly message!: string;
}

type Empty = Record<string, never>;

const tasksList = gmcpJsonMessage<"List", GMCPMessageClientTasksList, Empty>("List");
const tasksGroup = gmcpJsonMessage<"Group", GMCPMessageClientTasksGroup, GMCPMessageClientTasksGroupRequest>("Group");
const tasksInfo = gmcpJsonMessage<"Info", GMCPMessageClientTasksInfo, GMCPMessageClientTasksInfoRequest>("Info");
const tasksKill = gmcpJsonMessage<"Kill", never, GMCPMessageClientTasksKill>("Kill");
const tasksResult = gmcpJsonMessage<"Result", GMCPMessageClientTasksResult>("Result");

const GMCPClientTasksBase = GMCPPackage.with({
    packageName: "Client.Tasks",
    messages: [duplex(tasksList), duplex(tasksGroup), duplex(tasksInfo), outbound(tasksKill), inbound(tasksResult)] as const,
});

/**
 * Client.Tasks: the player's queued tasks (a wizard's: everyone's), grouped as
 * @tasks shows them, each group's tasks, a task's call stack, and killing
 * tasks with the player's own permissions. See docs/GMCP/client-tasks.md.
 */
export class GMCPClientTasks extends GMCPClientTasksBase {
    constructor(client: ConstructorParameters<typeof GMCPClientTasksBase>[0]) {
        super(client);
        this.on("list", (data) => useTasksStore.getState().setList(data));
        this.on("group", (data) => useTasksStore.getState().setGroup(data));
        this.on("info", (data) => useTasksStore.getState().setInfo(data));
        this.on("result", (data) => {
            useTasksStore.getState().setResult(data);
            announce(data.message, "polite");
        });
    }

    reset(): void {
        useTasksStore.getState().reset();
    }
}

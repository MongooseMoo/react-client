import { create } from "zustand";
import type {
  GMCPMessageClientTasksGroup,
  GMCPMessageClientTasksInfo,
  GMCPMessageClientTasksList,
  GMCPMessageClientTasksResult,
} from "../gmcp/Client/Tasks";

/** What the Tasks tab shows, from Client.Tasks. */
interface TasksState {
  list: GMCPMessageClientTasksList | null;
  /** Server clock minus this browser's, in seconds, from the last List or Group, so countdowns follow the server. */
  clockOffset: number;
  /** Tasks of each opened group, by group key. */
  groups: Record<string, GMCPMessageClientTasksGroup>;
  /** Call stacks asked for, by task id. */
  info: Record<number, string[]>;
  result: GMCPMessageClientTasksResult | null;
  /** True once the player has had a task this session; the tab stays shown after that. */
  everHadTasks: boolean;
  setList: (list: GMCPMessageClientTasksList) => void;
  setGroup: (group: GMCPMessageClientTasksGroup) => void;
  setInfo: (info: GMCPMessageClientTasksInfo) => void;
  setResult: (result: GMCPMessageClientTasksResult) => void;
  reset: () => void;
}

const browserNow = () => Date.now() / 1000;

export const useTasksStore = create<TasksState>((set) => ({
  list: null,
  clockOffset: 0,
  groups: {},
  info: {},
  result: null,
  everHadTasks: false,
  setList: (list) =>
    set((state) => {
      // Drop opened groups that no longer exist.
      const keys = new Set((list.groups ?? []).map((group) => group.key));
      const groups = Object.fromEntries(Object.entries(state.groups).filter(([key]) => keys.has(key)));
      return {
        list,
        groups,
        clockOffset: list.now - browserNow(),
        everHadTasks: state.everHadTasks || list.total > 0,
      };
    }),
  setGroup: (group) =>
    set((state) => ({ groups: { ...state.groups, [group.key]: group }, clockOffset: group.now - browserNow() })),
  setInfo: (info) => set((state) => ({ info: { ...state.info, [info.id]: info.lines ?? [] } })),
  setResult: (result) => set({ result }),
  reset: () => set({ list: null, clockOffset: 0, groups: {}, info: {}, result: null, everHadTasks: false }),
}));

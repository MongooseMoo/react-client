import { create } from "zustand";

import type {
  GMCPMessageCharSkillsInfo,
  GMCPMessageCharSkillsList,
  SkillGroupInfo,
} from "../gmcp/Char/Skills";

export interface SkillDetails extends GMCPMessageCharSkillsList {
  isLoading?: boolean;
}

interface SkillsState {
  groups: SkillGroupInfo[];
  skillsByGroup: Record<string, SkillDetails>;
  infoBySkill: Record<string, GMCPMessageCharSkillsInfo>;
  setGroups: (groups: SkillGroupInfo[]) => void;
  setList: (data: GMCPMessageCharSkillsList) => void;
  setInfo: (data: GMCPMessageCharSkillsInfo) => void;
  setGroupLoading: (group: string) => void;
  reset: () => void;
}

export const useSkillsStore = create<SkillsState>((set) => ({
  groups: [],
  skillsByGroup: {},
  infoBySkill: {},
  setGroups: (groups) => set({ groups }),
  setList: (data) =>
    set((state) => ({
      skillsByGroup: {
        ...state.skillsByGroup,
        [data.group]: { ...data, isLoading: false },
      },
    })),
  setInfo: (data) =>
    set((state) => ({
      infoBySkill: {
        ...state.infoBySkill,
        [skillInfoKey(data.group, data.skill)]: data,
      },
    })),
  setGroupLoading: (group) =>
    set((state) => {
      const current = state.skillsByGroup[group] ?? { group, list: [] };
      return {
        skillsByGroup: {
          ...state.skillsByGroup,
          [group]: { ...current, isLoading: true },
        },
      };
    }),
  reset: () => set({ groups: [], skillsByGroup: {}, infoBySkill: {} }),
}));

function skillInfoKey(group: string, skill: string): string {
  return `${group}:${skill}`;
}

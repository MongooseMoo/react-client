import { create } from 'zustand';

export interface RecentServerUrl {
  id: number;
  url: string;
  receivedAt: number;
}

interface ServerLinksState {
  homeUrl: string;
  helpUrl: string;
  recentUrls: RecentServerUrl[];
  setServerInfo: (info: { homeUrl: string; helpUrl: string }) => void;
  addRecentUrl: (url: string, receivedAt?: number) => void;
  clearRecentUrls: () => void;
  reset: () => void;
}

let nextUrlId = 1;

export const useServerLinksStore = create<ServerLinksState>((set) => ({
  homeUrl: '',
  helpUrl: '',
  recentUrls: [],
  setServerInfo: ({ homeUrl, helpUrl }) => set({ homeUrl, helpUrl }),
  addRecentUrl: (url, receivedAt = Date.now()) =>
    set((state) => ({
      recentUrls: [
        { id: nextUrlId++, url, receivedAt },
        ...state.recentUrls.filter((entry) => entry.url !== url),
      ].slice(0, 10),
    })),
  clearRecentUrls: () => set({ recentUrls: [] }),
  reset: () => set({ homeUrl: '', helpUrl: '', recentUrls: [] }),
}));

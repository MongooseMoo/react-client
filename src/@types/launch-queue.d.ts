export {};

// File Handling and Launch Handler APIs (WICG), not yet in TypeScript's DOM lib.
declare global {
  interface LaunchParams {
    readonly targetURL?: string;
    readonly files: readonly FileSystemHandle[];
  }

  interface LaunchQueue {
    setConsumer(consumer: (params: LaunchParams) => void): void;
  }

  interface Window {
    launchQueue?: LaunchQueue;
  }
}

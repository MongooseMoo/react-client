import type MudClient from '../client';
export { };

/// <reference types="vite-plugin-pwa/client" />

declare global {
    interface Window {
        mudClient: MudClient;
    }
}

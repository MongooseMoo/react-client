import type MudClient from '../client';
export { };

declare global {
    interface Window {
        mudClient: MudClient;
    }
}
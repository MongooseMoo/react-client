import type MudClient from "../../client";
import { GMCPMessage, GMCPPackage } from "../package";

interface KeyBinding {
    key: string;
    modifiers: string[];
    command: string;
    autosend: boolean;
}

class GMCPMessageClientKeystrokesBind extends GMCPMessage {
    public readonly key!: string;
    public readonly modifiers!: string[];
    public readonly command!: string;
    public readonly autosend!: boolean;
}

class GMCPMessageClientKeystrokesUnbind extends GMCPMessage {
    public readonly key!: string;
    public readonly modifiers!: string[];
}

class GMCPMessageClientKeystrokesBindAll extends GMCPMessage {
    public readonly bindings!: KeyBinding[];
}

class GMCPMessageClientKeystrokesUnbindAll extends GMCPMessage {
    // No specific properties needed for this message
}

export class GMCPClientKeystrokes extends GMCPPackage {
    public packageName: string = "Client.Keystrokes";
    private bindings: KeyBinding[] = [];
    // Store the bound handler function
    private boundKeyDownHandler: (event: KeyboardEvent) => void;

    constructor(client: MudClient) {
        super(client);
        // Bind the handler once and store it
        this.boundKeyDownHandler = this.handleKeydown.bind(this);
        document.addEventListener('keydown', this.boundKeyDownHandler);
    }

    private handleKeydown(event: KeyboardEvent): void {
        const binding = this.findBinding(event);
        if (binding) {
            event.preventDefault();
            const commandInput = this.client.getInput();
            const command = this.parseCommand(binding.command, commandInput);
            if (binding.autosend) {
                this.client.sendCommand(command);
            } else {
                this.placeInInputField(command);
            }
        }
    }

    shutdown() {
        // Use the stored handler reference for removal
        document.removeEventListener('keydown', this.boundKeyDownHandler);
    }

    private findBinding(event: KeyboardEvent): KeyBinding | undefined {
        try {
            return this.bindings.find(binding => {
                // Compare key (case-insensitive)
                if (binding.key.toLowerCase() !== event.key.toLowerCase()) {
                    return false;
                }

                // Get pressed modifiers and convert to lowercase
                const eventModifiers = new Set(
                    [
                        event.altKey && "alt",
                        event.ctrlKey && "control",
                        event.shiftKey && "shift",
                        event.metaKey && "meta",
                    ].filter(Boolean) as string[] // Filter out false values and assert as string array
                );

                // Get required modifiers for the binding and convert to lowercase
                const requiredModifiers = new Set(
                    (binding.modifiers || []).map(mod => mod.toLowerCase())
                );

                // Check if the set of pressed modifiers exactly matches the set of required modifiers
                if (eventModifiers.size !== requiredModifiers.size) {
                    return false; // Different number of modifiers pressed than required
                }

                // Check if all required modifiers (now lowercase) are present in the pressed modifiers (now lowercase)
                return Array.from(requiredModifiers).every(modifier =>
                    eventModifiers.has(modifier) // .has() is case-sensitive, but both sets are now lowercase
                );
            });
        } catch (error) {
            console.error("Error in finding key binding: ", error);
            return undefined;
        }
    }

    private parseCommand(commandTemplate: string, commandInput: string): string {
        const inputWords = commandInput.trim().split(/\s+/);
        return commandTemplate.replace(/%(\d+|\*)/g, (match, number) => {
            if (number === '*') {
                return commandInput;
            }
            const index = parseInt(number, 10) - 1;
            return index >= 0 && index < inputWords.length ? inputWords[index] : match;
        });
    }

    private placeInInputField(command: string): void {
        this.client.setInput(command);
    }

    public bindKey(data: GMCPMessageClientKeystrokesBind): void {
        const binding: KeyBinding = {
            key: data.key,
            modifiers: data.modifiers,
            command: data.command,
            autosend: data.autosend
        };
        this.bindings.push(binding);
    }

    public unbindKey(data: GMCPMessageClientKeystrokesUnbind): void {
        const dataModifiersLower = new Set((data.modifiers || []).map(mod => mod.toLowerCase()));
        this.bindings = this.bindings.filter(binding => {
            const bindingModifiersLower = new Set((binding.modifiers || []).map(mod => mod.toLowerCase()));
            // Check key (case-insensitive, matching findBinding logic)
            if (binding.key.toLowerCase() !== data.key.toLowerCase()) {
                return true; // Keep binding if keys don't match
            }
            // Check modifier count
            if (bindingModifiersLower.size !== dataModifiersLower.size) {
                return true; // Keep binding if modifier counts differ
            }
            // Check if all modifiers match (case-insensitive)
            const allModifiersMatch = Array.from(dataModifiersLower).every(mod => bindingModifiersLower.has(mod));
            return !allModifiersMatch; // Remove binding only if all modifiers match
        });
    }

    public unbindAll(): void {
        this.bindings = [];
    }

    public handleBind(data: GMCPMessageClientKeystrokesBind): void {
        this.bindKey(data);
    }

    public handleUnbind(data: GMCPMessageClientKeystrokesUnbind): void {
        this.unbindKey(data);
    }

    public handleBind_all(data: GMCPMessageClientKeystrokesBindAll): void {
        this.bindings = data.bindings.map(binding => ({ ...binding }));
    }

    public listBindings(): KeyBinding[] {
        return [...this.bindings];
    }
}

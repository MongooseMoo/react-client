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

export class GMCPClientKeystrokes extends GMCPPackage {
    public packageName: string = "Client.Keystrokes";
    private bindings: KeyBinding[] = [];

    constructor(client: MudClient) {
        super(client);
        document.addEventListener('keyup', this.handleKeyup.bind(this));
    }

    private handleKeyup(event: KeyboardEvent): void {
        const binding = this.findBinding(event);
        if (binding) {
            const commandInput = this.client.getInput();
            const command = this.parseCommand(binding.command, commandInput);
            if (binding.autosend) {
                this.sendCommand(command);
            } else {
                this.placeInInputField(command);
            }
        }
    }

    shutdown() {
        document.removeEventListener('keyup', this.handleKeyup.bind(this));
    }


    private findBinding(event: KeyboardEvent): KeyBinding | undefined {
        return this.bindings.find(binding =>
            binding.key === event.key &&
            binding.modifiers.every(modifier => (event as any)[`${modifier}Key`])
        );
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

    private sendCommand(command: string): void {
        this.sendData("ExecuteCommand", { command });
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
        this.bindings = this.bindings.filter(binding =>
            binding.key !== data.key ||
            !binding.modifiers.every(modifier => data.modifiers.includes(modifier))
        );
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
        this.bindings = data.bindings;
    }

    public listBindings(): KeyBinding[] {
        return this.bindings;
    }
}

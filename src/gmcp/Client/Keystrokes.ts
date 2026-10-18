import { announce } from "@react-aria/live-announcer";
import { inbound, outbound } from "../../protocol/messages";
import { GMCPMessage, GMCPPackage } from "../package";
import { useInputStore } from "../../stores/inputStore";
import {
    findBinding,
    resolveLayer,
    type KeystrokeBinding,
    type KeystrokeLayer,
    useKeystrokesStore,
} from "../../stores/keystrokesStore";
import { usePreferences } from "../../stores/preferencesStore";
import { chordsEqual, parseChord } from "../../keystrokeChords";
import { gmcpJsonMessage } from "../messages";

/** A binding as it arrives on the wire. */
interface WireBinding {
    key: string;
    modifiers: string[];
    command: string;
    label?: string;
    autosend?: boolean;
}

class GMCPMessageClientKeystrokesLayer extends GMCPMessage {
    public readonly id!: string;
    public readonly label!: string;
    public readonly modal?: boolean;
    public readonly bindings!: WireBinding[];
}

class GMCPMessageClientKeystrokesRemoveLayer extends GMCPMessage {
    public readonly id!: string;
}

class GMCPMessageClientKeystrokesBind extends GMCPMessage {
    public readonly key!: string;
    public readonly modifiers!: string[];
    public readonly command!: string;
    public readonly label?: string;
    public readonly autosend?: boolean;
}

class GMCPMessageClientKeystrokesUnbind extends GMCPMessage {
    public readonly key!: string;
    public readonly modifiers!: string[];
}

class GMCPMessageClientKeystrokesBindAll extends GMCPMessage {
    public readonly bindings!: WireBinding[];
}

class GMCPMessageClientKeystrokesUnbindAll extends GMCPMessage {}

class GMCPMessageClientKeystrokesListBindings extends GMCPMessage {}

type ListedBinding = KeystrokeBinding & { id: string };

const keystrokesLayer = gmcpJsonMessage<"Layer", GMCPMessageClientKeystrokesLayer>("Layer");
const keystrokesRemoveLayer = gmcpJsonMessage<"RemoveLayer", GMCPMessageClientKeystrokesRemoveLayer>("RemoveLayer");
const keystrokesBind = gmcpJsonMessage<"Bind", GMCPMessageClientKeystrokesBind>("Bind");
const keystrokesUnbind = gmcpJsonMessage<"Unbind", GMCPMessageClientKeystrokesUnbind>("Unbind");
const keystrokesBindAll = gmcpJsonMessage<"Bind_all", GMCPMessageClientKeystrokesBindAll>("Bind_all");
const keystrokesUnbindAll = gmcpJsonMessage<"UnbindAll", GMCPMessageClientKeystrokesUnbindAll>("UnbindAll");
const keystrokesListBindings = gmcpJsonMessage<"ListBindings", GMCPMessageClientKeystrokesListBindings>("ListBindings");
const keystrokesBindingsList = gmcpJsonMessage<"BindingsList", never, ListedBinding[]>("BindingsList");

const GMCPClientKeystrokesBase = GMCPPackage.with({
    packageName: "Client.Keystrokes",
    messages: [
        inbound(keystrokesLayer),
        inbound(keystrokesRemoveLayer),
        inbound(keystrokesBind),
        inbound(keystrokesUnbind),
        inbound(keystrokesBindAll),
        inbound(keystrokesUnbindAll),
        inbound(keystrokesListBindings),
        outbound(keystrokesBindingsList),
    ] as const,
});

/** The layer older Bind/Unbind/Bind_all messages act on. */
const SERVER_KEYS_ID = "";
const SERVER_KEYS_LABEL = "Server keys";

function toBinding(wire: WireBinding): KeystrokeBinding {
    return {
        key: wire.key,
        modifiers: wire.modifiers,
        command: wire.command,
        label: wire.label,
        autosend: wire.autosend ?? true,
    };
}

function sameKey(binding: { key: string; modifiers: string[] }, other: { key: string; modifiers: string[] }): boolean {
    const left = parseChord(binding.key, binding.modifiers).chord;
    const right = parseChord(other.key, other.modifiers).chord;
    return left !== undefined && right !== undefined && chordsEqual(left, right);
}

function isTextField(element: Element): boolean {
    return element.matches("input, textarea, select") ||
        (element instanceof HTMLElement && element.isContentEditable);
}

/** Bindings fire only in the command input, in the output, or with focus on nothing. */
function keysWorkAt(target: EventTarget | null): boolean {
    if (!(target instanceof Element)) return true;
    if (target === document.body || target === document.documentElement) return true;
    if (target.id === "command-input") return true;
    return target.closest('.output[role="region"]') !== null && !isTextField(target);
}

/** Alt+Shift+K by physical key, which Alt changes the character of on a Mac. */
function isKeysModeToggle(event: KeyboardEvent): boolean {
    return event.altKey && event.shiftKey && !event.ctrlKey && !event.metaKey && event.code === "KeyK";
}

function say(message: string): void {
    announce(message, "assertive", 2000);
}

export class GMCPClientKeystrokes extends GMCPClientKeystrokesBase {
    private readonly boundKeyDownHandler = (event: KeyboardEvent) => this.handleKeydown(event);

    constructor(client: ConstructorParameters<typeof GMCPClientKeystrokesBase>[0]) {
        super(client);
        this.on("layer", (data) => this.handleLayer(data));
        this.on("removeLayer", (data) => this.handleRemoveLayer(data));
        this.on("bind", (data) => this.handleBind(data));
        this.on("unbind", (data) => this.handleUnbind(data));
        this.on("bindAll", (data) => this.handleBindAll(data));
        this.on("unbindAll", () => this.handleUnbindAll());
        this.on("listBindings", () => this.sendBindingsList(this.listBindings()));
        // Capture, so a binding runs before the input's or output's own key handling.
        document.addEventListener("keydown", this.boundKeyDownHandler, true);
    }

    shutdown() {
        this.reset();
        document.removeEventListener("keydown", this.boundKeyDownHandler, true);
    }

    override reset(): void {
        useKeystrokesStore.getState().clearLayers();
    }

    private handleKeydown(event: KeyboardEvent): void {
        if (event.repeat || event.isComposing || !keysWorkAt(event.target)) return;

        if (isKeysModeToggle(event)) {
            event.preventDefault();
            event.stopPropagation();
            this.toggleKeysMode();
            return;
        }

        const { layers, keysMode } = useKeystrokesStore.getState();
        const found = findBinding(layers, usePreferences.getState().keystrokes, keysMode, event);
        if (!found) return;

        event.preventDefault();
        event.stopPropagation();
        const command = this.parseCommand(found.binding.command, useInputStore.getState().text);
        if (found.binding.autosend) {
            this.client.sendCommand(command);
        } else {
            useInputStore.getState().setText(command);
        }
    }

    private toggleKeysMode(): void {
        const store = useKeystrokesStore.getState();
        if (store.keysMode) {
            store.setKeysMode(false);
            say("Keys mode off");
            return;
        }
        store.setKeysMode(true);
        const labels = store.layers.filter((layer) => layer.modal).map((layer) => layer.label);
        say(labels.length > 0 ? `Keys mode on: ${labels.join(", ")}` : "Keys mode on");
    }

    private parseCommand(commandTemplate: string, commandInput: string): string {
        const inputWords = commandInput.trim().split(/\s+/);
        return commandTemplate.replace(/%(\d+|\*)/g, (match, number) => {
            if (number === "*") {
                return commandInput;
            }
            const index = parseInt(number, 10) - 1;
            return index >= 0 && index < inputWords.length ? inputWords[index] : match;
        });
    }

    public handleLayer(data: GMCPMessageClientKeystrokesLayer): void {
        const layer: KeystrokeLayer = {
            id: data.id,
            label: data.label,
            modal: data.modal ?? false,
            bindings: data.bindings.map(toBinding),
        };
        if (!useKeystrokesStore.getState().putLayer(layer)) return;
        if (layer.modal) {
            say(`${layer.label} keys available. Alt+Shift+K for keys mode.`);
            return;
        }
        const installed = resolveLayer(layer, usePreferences.getState().keystrokes)
            .filter((binding) => binding.unavailable === undefined).length;
        say(`${layer.label} keys: ${installed}`);
    }

    public handleRemoveLayer(data: GMCPMessageClientKeystrokesRemoveLayer): void {
        const removed = this.removeLayer(data.id);
        if (removed) say(removed);
    }

    /** Removes a layer; returns what to say about it, if anything. */
    private removeLayer(id: string): string | undefined {
        const store = useKeystrokesStore.getState();
        const removed = store.removeLayer(id);
        if (!removed) return undefined;
        const modalLeft = useKeystrokesStore.getState().layers.some((layer) => layer.modal);
        const keysModeEnds = removed.modal && !modalLeft && store.keysMode;
        if (keysModeEnds) store.setKeysMode(false);
        if (removed.id === SERVER_KEYS_ID) return keysModeEnds ? "Keys mode off" : undefined;
        return keysModeEnds ? `${removed.label} keys removed. Keys mode off` : `${removed.label} keys removed`;
    }

    private serverKeys(): KeystrokeBinding[] {
        return useKeystrokesStore.getState().layers.find((layer) => layer.id === SERVER_KEYS_ID)?.bindings ?? [];
    }

    private setServerKeys(bindings: KeystrokeBinding[]): void {
        const store = useKeystrokesStore.getState();
        if (bindings.length === 0) {
            store.removeLayer(SERVER_KEYS_ID);
            return;
        }
        const existing = store.layers.find((layer) => layer.id === SERVER_KEYS_ID);
        const layer = { id: SERVER_KEYS_ID, label: SERVER_KEYS_LABEL, modal: false, bindings };
        if (existing) {
            useKeystrokesStore.setState({
                layers: store.layers.map((current) => (current === existing ? layer : current)),
            });
        } else {
            store.putLayer(layer);
        }
    }

    public handleBind(data: GMCPMessageClientKeystrokesBind): void {
        const others = this.serverKeys().filter((binding) => !sameKey(binding, data));
        this.setServerKeys([...others, toBinding(data)]);
    }

    public handleUnbind(data: GMCPMessageClientKeystrokesUnbind): void {
        this.setServerKeys(this.serverKeys().filter((binding) => !sameKey(binding, data)));
    }

    public handleBindAll(data: GMCPMessageClientKeystrokesBindAll): void {
        this.setServerKeys(data.bindings.map(toBinding));
    }

    public handleUnbindAll(): void {
        const messages = useKeystrokesStore.getState().layers
            .map((layer) => this.removeLayer(layer.id))
            .filter((message): message is string => message !== undefined);
        if (messages.length > 0) say(messages.join(". "));
    }

    public listBindings(): ListedBinding[] {
        return useKeystrokesStore.getState().layers.flatMap((layer) =>
            layer.bindings.map((binding) => ({ id: layer.id, ...binding })),
        );
    }
}

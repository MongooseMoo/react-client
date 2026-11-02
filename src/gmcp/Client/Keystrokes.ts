import { announce } from "@react-aria/live-announcer";
import { inbound, outbound } from "../../protocol/messages";
import { GMCPMessage, GMCPPackage } from "../package";
import { useInputStore } from "../../stores/inputStore";
import {
    bindingLabel,
    findBinding,
    resolveLayer,
    type KeystrokeBinding,
    type KeystrokeLayer,
    useKeystrokesStore,
} from "../../stores/keystrokesStore";
import { usePreferences } from "../../stores/preferencesStore";
import { chordFromEvent, chordsEqual, formatChord, parseChord } from "../../keystrokeChords";
import { isInteractModeToggle, isKeysHelpToggle, isKeysModeToggle, reservedReason } from "../../reservedShortcuts";
import { useItemsStore } from "../../stores/itemsStore";
import { useRoomStore } from "../../stores/roomStore";
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

/** A key press that would put a character in the command input. */
function typesCharacter(event: KeyboardEvent): boolean {
    return event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey;
}

function say(message: string): void {
    announce(message, "assertive", 2000);
}

/** Something interact mode can land on, and the command that brings up its menu. */
interface InteractTarget {
    key: string;
    name: string;
    command: string;
    /** The sound to play on landing here, as the server sent it (Char.Items earcon, Room.Info earcons). */
    earcon?: unknown;
}

/**
 * What the player carries, who and what is in the room, then the room's exits: the same things
 * the MOO's bare `interact` offers. An item the server says has no verbs is left out.
 */
function interactTargets(): InteractTarget[] {
    const { itemsByLocation } = useItemsStore.getState();
    const things = [...(itemsByLocation.inv ?? []), ...(itemsByLocation.room ?? [])]
        .filter((item) => item.verbs === undefined || item.verbs.length > 0)
        .map((item) => ({ key: item.id, name: item.name, command: `interact ${item.id}`, earcon: item.earcon }));
    const roomInfo = useRoomStore.getState().roomInfo;
    const exits = Object.keys(roomInfo?.exits ?? {}).map((direction) => ({
        key: `exit ${direction}`,
        name: `${roomInfo?.exit_names?.[direction] ?? direction} exit`,
        command: `interact ${direction}`,
        earcon: roomInfo?.earcons?.[direction],
    }));
    return [...things, ...exits];
}

const NOTHING_TO_INTERACT_WITH = "Nothing here to interact with";

export class GMCPClientKeystrokes extends GMCPClientKeystrokesBase {
    private readonly boundKeyDownHandler = (event: KeyboardEvent) => this.handleKeydown(event);
    private keysHelp = false;
    /** The key of the thing interact mode is on, or null when interact mode is off. */
    private interactKey: string | null = null;
    private keysModeBeforeInteract = false;

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
        this.keysHelp = false;
        this.interactKey = null;
        useKeystrokesStore.getState().clearLayers();
    }

    private handleKeydown(event: KeyboardEvent): void {
        if (event.repeat || event.isComposing || !keysWorkAt(event.target)) return;

        if (isKeysHelpToggle(event)) {
            event.preventDefault();
            event.stopPropagation();
            this.keysHelp = !this.keysHelp;
            say(this.keysHelp ? "Key help on. Press a key to hear what it does. Escape ends key help." : "Key help off");
            return;
        }

        if (this.keysHelp) {
            this.describeKey(event);
            return;
        }

        if (isInteractModeToggle(event)) {
            event.preventDefault();
            event.stopPropagation();
            this.toggleInteractMode();
            return;
        }

        if (isKeysModeToggle(event)) {
            event.preventDefault();
            event.stopPropagation();
            this.toggleKeysMode();
            return;
        }

        const { layers, keysMode, resumeOnSend } = useKeystrokesStore.getState();
        // Interact mode lives inside keys mode and ends with it, however keys mode ended. A pause
        // for typing (resumeOnSend) keeps the current thing for when keys mode comes back.
        if (!keysMode && !resumeOnSend) this.interactKey = null;
        if (keysMode && this.interactKey !== null && this.handleInteractKey(event)) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }
        const found = findBinding(layers, usePreferences.getState().keystrokes, keysMode, event);
        // In keys mode a key never types, bound or not.
        if (!found && !(keysMode && typesCharacter(event))) return;

        event.preventDefault();
        event.stopPropagation();
        if (!found) return;
        const command = this.parseCommand(found.binding.command, useInputStore.getState().text);
        if (found.binding.autosend) {
            this.client.sendCommand(command);
            return;
        }
        useInputStore.getState().setText(command);
        if (keysMode) {
            // The player types the rest; sending it turns keys mode back on.
            useKeystrokesStore.getState().pauseKeysMode();
            say("Keys mode off");
        }
    }

    /** Key help: says what a key does, and does nothing else. */
    private describeKey(event: KeyboardEvent): void {
        const chord = chordFromEvent(event);
        if (!chord) return;
        event.preventDefault();
        event.stopPropagation();
        if (chord.key === "escape" && chord.modifiers.length === 0) {
            this.keysHelp = false;
            say("Key help off");
            return;
        }
        const { layers } = useKeystrokesStore.getState();
        const found = findBinding(layers, usePreferences.getState().keystrokes, true, event);
        const keyName = formatChord(found?.chord ?? chord);
        if (found) {
            say(`${keyName}: ${bindingLabel(found.binding)}`);
            return;
        }
        say(reservedReason(chord) ?? `${keyName}: not bound`);
    }

    /** Tab and Shift+Tab move between things, Ctrl+I interacts, Escape ends. Whether the key was one of these. */
    private handleInteractKey(event: KeyboardEvent): boolean {
        if (event.altKey || event.metaKey) return false;
        if (event.key === "Tab" && !event.ctrlKey) {
            this.moveInteract(event.shiftKey ? -1 : 1);
            return true;
        }
        if (event.key === "Escape" && !event.ctrlKey && !event.shiftKey) {
            this.endInteractMode();
            return true;
        }
        if (event.code === "KeyI" && event.ctrlKey && !event.shiftKey) {
            const target = interactTargets().find((candidate) => candidate.key === this.interactKey);
            if (target) {
                this.client.sendCommand(target.command);
            } else {
                say("That is no longer here. Tab to choose again.");
            }
            return true;
        }
        return false;
    }

    private moveInteract(step: number): void {
        const targets = interactTargets();
        if (targets.length === 0) {
            say(NOTHING_TO_INTERACT_WITH);
            return;
        }
        const index = targets.findIndex((target) => target.key === this.interactKey);
        const next = index < 0 ? (step > 0 ? 0 : targets.length - 1) : (index + step + targets.length) % targets.length;
        this.landOn(targets[next]);
        say(`${targets[next].name}, ${next + 1} of ${targets.length}`);
    }

    /** Makes target the current thing and plays its earcon, if the server sent one. */
    private landOn(target: InteractTarget): void {
        this.interactKey = target.key;
        if (target.earcon !== undefined) this.client.gmcp.handlers["Client.Media"]?.playEarcon(target.earcon);
    }

    private toggleInteractMode(): void {
        if (this.interactKey !== null && useKeystrokesStore.getState().keysMode) {
            this.endInteractMode();
            return;
        }
        const targets = interactTargets();
        if (targets.length === 0) {
            say(NOTHING_TO_INTERACT_WITH);
            return;
        }
        const store = useKeystrokesStore.getState();
        this.keysModeBeforeInteract = store.keysMode;
        store.setKeysMode(true);
        this.landOn(targets[0]);
        say(`Interact mode on. ${targets[0].name}, 1 of ${targets.length}. Tab moves, Ctrl+I interacts, Escape ends.`);
    }

    /** Leaves interact mode, and keys mode too unless it was on before. */
    private endInteractMode(): void {
        this.interactKey = null;
        if (!this.keysModeBeforeInteract) useKeystrokesStore.getState().setKeysMode(false);
        say("Interact mode off");
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
            say(`${layer.label} keys available. Alt+Shift+H for keys mode.`);
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
        if (removed.modal && !modalLeft) store.setKeysMode(false);
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
        } else {
            store.updateLayer({ id: SERVER_KEYS_ID, label: SERVER_KEYS_LABEL, modal: false, bindings });
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

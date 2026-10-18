import { announce } from "@react-aria/live-announcer";
import { useMapStore } from "../stores/mapStore";
import { directionLabel } from "./directions";
import { findPath } from "./mapGraph";

/**
 * Walks to a known room one exit at a time: each step is sent only after
 * Room.Info confirms the step before it arrived where the map said, so a
 * locked door or a changed exit stops the walk instead of sending the rest
 * of the path blind.
 */
export interface CommandSender {
  sendCommand(command: string): void;
}

function roomName(id: number): string {
  return useMapStore.getState().map.rooms[String(id)]?.name ?? `room ${id}`;
}

function stop(message: string): void {
  useMapStore.getState().setWalk(null);
  announce(message, "assertive");
}

function sendStep(sender: CommandSender, from: number, steps: string[], targetId: number): void {
  const [step, ...rest] = steps;
  const expectedRoomId = useMapStore.getState().map.rooms[String(from)].exits[step];
  useMapStore.getState().setWalk({ targetId, steps: rest, expectedRoomId });
  sender.sendCommand(step);
}

/** Starts a walk to targetId and returns what happened, in words. */
export function startWalk(sender: CommandSender, targetId: number): string {
  const { map, currentRoomId } = useMapStore.getState();
  if (currentRoomId === null) return "Your current room is not known yet.";
  if (currentRoomId === targetId) return `You are already in ${roomName(targetId)}.`;
  const path = findPath(map, currentRoomId, targetId);
  if (!path) return `No known way to ${roomName(targetId)}.`;
  sendStep(sender, currentRoomId, path, targetId);
  const count = path.length === 1 ? "1 step" : `${path.length} steps`;
  return `Walking to ${roomName(targetId)}, ${count}.`;
}

/** Called after each Room.Info has been recorded. */
export function walkArrived(sender: CommandSender, roomId: number): void {
  const walk = useMapStore.getState().walk;
  if (!walk) return;
  if (roomId !== walk.expectedRoomId) {
    stop(`Walk stopped: you are in ${roomName(roomId)}, not where the map expected.`);
    return;
  }
  if (walk.steps.length === 0) {
    useMapStore.getState().setWalk(null);
    announce(`Arrived at ${roomName(roomId)}.`, "polite");
    return;
  }
  if (useMapStore.getState().map.rooms[String(roomId)]?.exits[walk.steps[0]] === undefined) {
    stop(`Walk stopped: ${roomName(roomId)} has no exit ${directionLabel(walk.steps[0])} now.`);
    return;
  }
  sendStep(sender, roomId, walk.steps, walk.targetId);
}

/** Called on Room.WrongDir. */
export function walkBlocked(direction: string): void {
  if (!useMapStore.getState().walk) return;
  stop(`Walk stopped: there is no exit ${directionLabel(direction)}.`);
}

export function cancelWalk(): void {
  if (!useMapStore.getState().walk) return;
  stop("Walk stopped.");
}

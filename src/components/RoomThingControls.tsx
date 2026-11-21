import type React from "react";
import type { LayoutThing } from "../gmcp/Room";

/** The key of a part's Inspect button among a thing's controls. */
export const inspectKey = (id: string, lifetime: string, role: string) => JSON.stringify([id, lifetime, role]);
/** The key of a drawer's Open/Close button among a thing's controls. */
export const fittingKey = (lifetime: string) => JSON.stringify([lifetime]);

interface RoomThingControlsProps {
  thing: LayoutThing;
  /** The thing's name as shown, for the lists' accessible names. */
  name: string;
  onCommand: (command: string) => void;
  /** The buttons by key (`inspectKey`, `fittingKey`), so a click on a part in the 3D picture can press its button. */
  buttons: React.MutableRefObject<Map<string, HTMLButtonElement>>;
}

/**
 * The selected thing's authored parts (Inspect) and fitted drawers (Open or Close, and Get for each
 * visible item), from its Room.Layout `form_boxes`. Every command is the server's own or the native
 * `look <role> on <id>`. Renders nothing for a thing with neither.
 */
const RoomThingControls: React.FC<RoomThingControlsProps> = ({ thing, name, onCommand, buttons }) => {
  const { id, lifetime } = thing;
  const parts = lifetime && /^#\d+$/.test(id)
    ? (thing.form_boxes ?? []).flatMap(({ role, label, fitting }) => role && label && !fitting ? [{ role, label }] : [])
    : [];
  const fittings = new Map(thing.form_boxes?.flatMap(({ fitting }) => fitting ? [[fitting.lifetime, fitting] as const] : []));
  if (parts.length === 0 && fittings.size === 0) return null;
  const keep = (key: string) => (node: HTMLButtonElement | null) => {
    if (node) buttons.current.set(key, node);
    else buttons.current.delete(key);
  };

  return (
    <div className="room-thing-controls">
      {parts.length > 0 && lifetime && (
        <ul aria-label={`Parts of ${name}`}>
          {parts.map(({ role, label }) => {
            const key = inspectKey(id, lifetime, role);
            const ambiguous = parts.some((part) => part.label === label && part.role !== role);
            return <li key={key}><button type="button" ref={keep(key)} onClick={() => onCommand(`look ${role} on ${id}`)}>
              Inspect {label}{ambiguous && ` (${role})`}
            </button></li>;
          })}
        </ul>
      )}
      {fittings.size > 0 && (
        <ul aria-label={`Fittings of ${name}`}>
          {Array.from(fittings.values(), (fitting) => (
            <li key={fitting.lifetime}>
              <button type="button" aria-expanded={fitting.opened} disabled={!fitting.command}
                ref={keep(fittingKey(fitting.lifetime))}
                onClick={() => onCommand(fitting.command)}>
                {fitting.opened ? "Close" : "Open"} {fitting.name}
              </button>
              {fitting.opened && (fitting.contents.length ? (
                <ul aria-label={`Contents of ${fitting.name}`}>
                  {fitting.contents.map((item) => (
                    <li key={item.lifetime}>
                      <button type="button" disabled={!item.command} onClick={() => {
                        buttons.current.get(fittingKey(fitting.lifetime))?.focus({ preventScroll: true });
                        onCommand(item.command);
                      }}>Get {item.name}</button>
                    </li>
                  ))}
                </ul>
              ) : " No visible contents.")}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RoomThingControls;

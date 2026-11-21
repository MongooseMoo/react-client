import type React from "react";
import { lazy, Suspense, useMemo, useState } from "react";
import { downloadFile } from "../downloadFile";
import type { RoomLayout } from "../gmcp/Room";
import { describeExit, layoutSummary, metres, placeThings } from "../map/roomLayout";
import { useItemsStore } from "../stores/itemsStore";
import { useSpatialStore } from "../stores/spatialStore";
import { stripMudAnsiTags } from "../stripMudAnsiTags";
import { type LocalStorageSchema, loadStoredValue, saveStoredValue } from "../persistence";
import RoomLayoutPicture, { standaloneSvg } from "./RoomLayoutPicture";
import "./RoomLayoutView.css";

/** three.js and the 3D views load only when one of them is chosen. */
const RoomLayout3D = lazy(() => import("./RoomLayout3D"));

export type RoomLayoutViewName = "plan" | "dollhouse" | "eyes";

const VIEWS: Array<{ value: RoomLayoutViewName; label: string; help: string }> = [
  {
    value: "plan",
    label: "Plan",
    help: "Zoom with the wheel, a pinch, or + and - on the picture; arrows pan; 0 shows the whole room. Click a thing or person to select it.",
  },
  {
    value: "dollhouse",
    label: "Dollhouse",
    help: "Drag to turn the room, the wheel or a pinch to zoom; on the picture arrows turn it, + and - zoom, 0 shows the whole room. Click a thing or person to select it.",
  },
  {
    value: "eyes",
    label: "Your eyes",
    help: "The room from where you stand, facing where you face; it turns as you turn. Click a thing or person to select it.",
  },
];

/** The chosen view, kept across rooms and visits. */
const isViewName = (value: unknown): value is RoomLayoutViewName => VIEWS.some((view) => view.value === value);

export const roomLayoutViewSchema: LocalStorageSchema<RoomLayoutViewName> = {
  key: "roomLayoutView",
  version: 1,
  migrate: (data) => (isViewName(data) ? data : undefined),
};

/**
 * The current spatial room from Room.Layout: the drawing and its controls, the room's size and
 * finishes, and its doorways in words. The Room tab lists the things and people beside it; the
 * drawing shows the one selection (the items store's) and sets it when a thing or person is
 * clicked. Things follow Room.LayoutUpdate body changes; nothing here is announced or takes focus
 * when they do.
 */
interface RoomLayoutViewProps {
  layout: RoomLayout;
  roomName: string;
  onCommand: (command: string) => void;
  /** A part of a thing was clicked in a 3D view. */
  onInspect: (id: string, lifetime: string, role: string) => void;
  /** A fitted drawer's face was clicked in a 3D view. */
  onFitting: (lifetime: string) => void;
}

const RoomLayoutView: React.FC<RoomLayoutViewProps> = ({ layout, roomName, onCommand, onInspect, onFitting }) => {
  const youId = useSpatialStore((state) => state.listenerEntityId);
  const selectedId = useItemsStore((state) => state.selected?.id ?? null);
  const select = useItemsStore((state) => state.select);
  const name = stripMudAnsiTags(roomName);
  const [view, setView] = useState<RoomLayoutViewName>(() => loadStoredValue(roomLayoutViewSchema, "plan"));
  const chooseView = (next: RoomLayoutViewName) => {
    setView(next);
    saveStoredValue(roomLayoutViewSchema, next);
  };

  const placed = useMemo(() => placeThings(layout), [layout]);
  const summary = layoutSummary(name, layout);
  const [w, d, h] = layout.size;

  const save = (svg: SVGSVGElement) => {
    const file = name.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "room";
    downloadFile(standaloneSvg(svg, summary), `${file}-layout.svg`, "image/svg+xml");
  };

  return (
    <section className="room-layout" aria-labelledby="room-layout-heading">
      <h5 id="room-layout-heading">Room layout</h5>
      <fieldset className="room-layout-views">
        <legend>View</legend>
        {VIEWS.map((option) => (
          <label key={option.value}>
            <input
              type="radio"
              name="room-layout-view"
              value={option.value}
              checked={view === option.value}
              onChange={() => chooseView(option.value)}
            />
            {option.label}
          </label>
        ))}
      </fieldset>
      <p className="room-layout-help">{VIEWS.find((option) => option.value === view)?.help}</p>
      {view === "plan" ? (
        <RoomLayoutPicture
          layout={layout}
          placed={placed}
          youId={youId}
          label={summary}
          selectedId={selectedId}
          onSelect={select}
          onExit={onCommand}
          onSave={save}
        />
      ) : (
        <Suspense fallback={<p>Loading the 3D view…</p>}>
          <RoomLayout3D
            layout={layout}
            placed={placed}
            youId={youId}
            label={summary}
            mode={view}
            selectedId={selectedId}
            onSelect={select}
            onExit={onCommand}
            onInspect={onInspect}
            onFitting={onFitting}
          />
        </Suspense>
      )}

      <p>
        {metres(w)} east to west, {metres(d)} north to south, {metres(h)} high.
      </p>
      {layout.finishes && <dl aria-label="Room finishes">
        {(["floor", "wall", "ceiling"] as const).map((slot) => {
          const finish = layout.finishes?.[slot];
          return typeof finish === "string" && finish ? <div key={slot}>
            <dt>{slot === "wall" ? "Walls" : slot === "floor" ? "Floor" : "Ceiling"}</dt><dd>{finish}</dd>
          </div> : null;
        })}
      </dl>}
      <h6>Exits</h6>
      {layout.exits.length === 0 ? (
        <p>No exits.</p>
      ) : (
        <ul aria-label="Exits in the layout">
          {layout.exits.map((exit, index) => (
            <li key={`${exit.name}-${index}`}>{describeExit(exit, layout.size)}</li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default RoomLayoutView;

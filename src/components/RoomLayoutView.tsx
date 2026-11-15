import type React from "react";
import { lazy, Suspense, useMemo, useState } from "react";
import { webAudioToMongooseVector } from "../audio/mongooseCoordinates";
import { downloadFile } from "../downloadFile";
import type { LayoutVector, RoomLayout } from "../gmcp/Room";
import {
  describeArrival,
  describeExit,
  describeThing,
  describeUnshaped,
  displayName,
  isPerson,
  layoutSummary,
  metres,
  placeThings,
} from "../map/roomLayout";
import { useRoomStore } from "../stores/roomStore";
import { useSpatialStore } from "../stores/spatialStore";
import { stripMudAnsiTags } from "../stripMudAnsiTags";
import { type LocalStorageSchema, loadStoredValue, saveStoredValue } from "../persistence";
import RoomLayoutPicture, { standaloneSvg } from "./RoomLayoutPicture";
import AvatarPortrait from "../avatar/portrait";

/** three.js and the 3D views load only when one of them is chosen. */
const RoomLayout3D = lazy(() => import("./RoomLayout3D"));

export type RoomLayoutViewName = "plan" | "dollhouse" | "eyes";

const VIEWS: Array<{ value: RoomLayoutViewName; label: string; help: string }> = [
  {
    value: "plan",
    label: "Plan",
    help: "Zoom with the wheel, a pinch, or + and - on the picture; arrows pan; 0 shows the whole room.",
  },
  {
    value: "dollhouse",
    label: "Dollhouse",
    help: "Drag to turn the room, the wheel or a pinch to zoom; on the picture arrows turn it, + and - zoom, 0 shows the whole room.",
  },
  {
    value: "eyes",
    label: "Your eyes",
    help: "The room from where you stand, facing where you face; it turns as you turn.",
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
 * The current spatial room from Room.Layout: the drawing, its controls, and
 * the same room in words (exits, people, things, each with where it is).
 * Things follow Client.Spatial moves; nothing here is announced or takes
 * focus when they do.
 */
interface RoomLayoutViewProps {
  layout: RoomLayout;
  roomName: string;
  onExit: (name: string) => void;
}

const RoomLayoutView: React.FC<RoomLayoutViewProps> = ({ layout, roomName, onExit }) => {
  const entities = useSpatialStore((state) => state.spatialEntities);
  const youId = useSpatialStore((state) => state.listenerEntityId);
  const arrivalList = useRoomStore((state) => state.layoutArrivals);
  const name = stripMudAnsiTags(roomName);
  const [view, setView] = useState<RoomLayoutViewName>(() => loadStoredValue(roomLayoutViewSchema, "plan"));
  const chooseView = (next: RoomLayoutViewName) => {
    setView(next);
    saveStoredValue(roomLayoutViewSchema, next);
  };

  const placed = useMemo(() => {
    const positions: Record<string, LayoutVector | undefined> = {};
    for (const thing of layout.things) {
      const entity = entities[thing.id];
      if (entity) positions[thing.id] = webAudioToMongooseVector(entity.position);
    }
    return placeThings(layout, positions);
  }, [layout, entities]);

  // Which way each person faces, so their 3D figure turns with them.
  const facings = useMemo(() => {
    const out: Record<string, LayoutVector | undefined> = {};
    for (const [id, entity] of Object.entries(entities)) {
      if (entity.forward) out[id] = webAudioToMongooseVector(entity.forward);
    }
    return out;
  }, [entities]);

  // What entered after the layout, at its Client.Spatial point; it moves with Client.Spatial and goes on leave.
  const arrivals = useMemo(
    () =>
      arrivalList.map((arrival) => {
        const entity = entities[arrival.id];
        return { arrival, at: entity ? webAudioToMongooseVector(entity.position) : undefined };
      }),
    [arrivalList, entities],
  );
  const drawnArrivals = useMemo(
    () => arrivals.filter((a): a is { arrival: (typeof a)["arrival"]; at: LayoutVector } => a.at !== undefined),
    [arrivals],
  );

  const summary = layoutSummary(name, layout, arrivalList);
  // Everything is listed: a thing sent without shapes is listed but not drawn.
  const entries = [
    ...layout.things.map((thing) => {
      const where = placed.find((p) => p.thing.id === thing.id);
      return {
        id: thing.id,
        kind: thing.kind,
        appearance: thing.appearance,
        sortName: displayName(thing, youId),
        text: where ? describeThing(where, layout.size, youId) : describeUnshaped(thing, youId),
      };
    }),
    ...arrivals.map(({ arrival, at }) => ({
      id: arrival.id,
      kind: arrival.kind,
      appearance: undefined,
      sortName: displayName(arrival, youId),
      text: describeArrival(arrival, at, layout.size, youId),
    })),
  ];
  const byName = (a: (typeof entries)[number], b: (typeof entries)[number]) => a.sortName.localeCompare(b.sortName);
  const people = entries.filter((e) => isPerson(e)).sort(byName);
  const things = entries.filter((e) => !isPerson(e)).sort(byName);
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
          arrivals={drawnArrivals}
          youId={youId}
          label={summary}
          onExit={onExit}
          onSave={save}
        />
      ) : (
        <Suspense fallback={<p>Loading the 3D view…</p>}>
          <RoomLayout3D
            layout={layout}
            placed={placed}
            arrivals={drawnArrivals}
            youId={youId}
            facings={facings}
            label={summary}
            mode={view}
            onExit={onExit}
          />
        </Suspense>
      )}

      <p>
        {metres(w)} east to west, {metres(d)} north to south, {metres(h)} high.
      </p>
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
      <h6>People</h6>
      {people.length === 0 ? (
        <p>No one.</p>
      ) : (
        <ul aria-label="People in the layout">
          {people.map((e) => (
            <li key={e.id}>
              <AvatarPortrait appearance={e.appearance} size={32} className="room-layout-portrait" />
              {e.text}
            </li>
          ))}
        </ul>
      )}
      <h6>Things</h6>
      {things.length === 0 ? (
        <p>Nothing.</p>
      ) : (
        <ul aria-label="Things in the layout">
          {things.map((e) => (
            <li key={e.id}>{e.text}</li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default RoomLayoutView;

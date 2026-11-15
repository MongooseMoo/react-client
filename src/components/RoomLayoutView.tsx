import type React from "react";
import { useMemo } from "react";
import { webAudioToMongooseVector } from "../audio/mongooseCoordinates";
import { downloadFile } from "../downloadFile";
import type { LayoutVector, RoomLayout } from "../gmcp/Room";
import {
  describeExit,
  describeThing,
  describeUnshaped,
  isPerson,
  layoutSummary,
  metres,
  placeThings,
} from "../map/roomLayout";
import { useSpatialStore } from "../stores/spatialStore";
import { stripMudAnsiTags } from "../stripMudAnsiTags";
import RoomLayoutPicture, { standaloneSvg } from "./RoomLayoutPicture";

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
  const name = stripMudAnsiTags(roomName);

  const placed = useMemo(() => {
    const positions: Record<string, LayoutVector | undefined> = {};
    for (const thing of layout.things) {
      const entity = entities[thing.id];
      if (entity) positions[thing.id] = webAudioToMongooseVector(entity.position);
    }
    return placeThings(layout, positions);
  }, [layout, entities]);

  const summary = layoutSummary(name, layout);
  // Every thing in the layout is listed; one sent without shapes is listed but not drawn.
  const entries = layout.things.map((thing) => {
    const where = placed.find((p) => p.thing.id === thing.id);
    return { thing, text: where ? describeThing(where, layout.size, youId) : describeUnshaped(thing, youId) };
  });
  const byName = (a: (typeof entries)[number], b: (typeof entries)[number]) => a.thing.name.localeCompare(b.thing.name);
  const people = entries.filter((e) => isPerson(e.thing)).sort(byName);
  const things = entries.filter((e) => !isPerson(e.thing)).sort(byName);
  const [w, d, h] = layout.size;

  const save = (svg: SVGSVGElement) => {
    const file = name.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "room";
    downloadFile(standaloneSvg(svg, summary), `${file}-layout.svg`, "image/svg+xml");
  };

  return (
    <section className="room-layout" aria-labelledby="room-layout-heading">
      <h5 id="room-layout-heading">Room layout</h5>
      <p className="room-layout-help">Zoom with the wheel, a pinch, or + and - on the picture; arrows pan; 0 shows the whole room.</p>
      <RoomLayoutPicture layout={layout} placed={placed} youId={youId} label={summary} onExit={onExit} onSave={save} />

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
            <li key={e.thing.id}>{e.text}</li>
          ))}
        </ul>
      )}
      <h6>Things</h6>
      {things.length === 0 ? (
        <p>Nothing.</p>
      ) : (
        <ul aria-label="Things in the layout">
          {things.map((e) => (
            <li key={e.thing.id}>{e.text}</li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default RoomLayoutView;

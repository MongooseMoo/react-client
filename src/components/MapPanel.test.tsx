import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const announce = vi.hoisted(() => vi.fn());
vi.mock("@react-aria/live-announcer", () => ({ announce }));

import type MudClient from "../client";
import { emptyMap, recordRoom } from "../map/mapGraph";
import { useMapStore } from "../stores/mapStore";
import MapPanel from "./MapPanel";

function knownMap() {
  let map = emptyMap();
  map = recordRoom(map, { num: 1, name: "Square", area: "Town", environment: "outdoors", exits: { n: 2, e: 7 } });
  map = recordRoom(map, { num: 2, name: "Lane", area: "Town", exits: { s: 1, u: 3 } });
  map = recordRoom(map, { num: 3, name: "Loft", area: "Mill", exits: { d: 2 } });
  return map;
}

describe("MapPanel", () => {
  let client: { sendCommand: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    announce.mockClear();
    client = { sendCommand: vi.fn() };
    useMapStore.setState({ owner: "", map: knownMap(), currentRoomId: 1, walk: null });
  });

  const renderPanel = () => render(<MapPanel client={client as unknown as MudClient} />);

  it("says where you are and where each exit leads, in words", () => {
    renderPanel();
    expect(screen.getByText("Square, Town (outdoors)")).toBeTruthy();
    const exits = within(screen.getByRole("list", { name: "Exits" })).getAllByRole("listitem");
    expect(exits.map((item) => item.textContent)).toEqual(["north to Lane", "east not visited"]);
    fireEvent.click(screen.getByRole("button", { name: "north" }));
    expect(client.sendCommand).toHaveBeenCalledWith("n");
  });

  it("walks to a chosen visited room", () => {
    renderPanel();
    const select = screen.getByLabelText("Visited room") as HTMLSelectElement;
    const options = [...select.options].map((option) => option.textContent);
    expect(options).toEqual(["Choose a room (3 visited)", "Lane", "Square", "Loft"]);
    fireEvent.change(select, { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: "Go" }));
    expect(client.sendCommand).toHaveBeenCalledWith("n");
    expect(announce).toHaveBeenCalledWith("Walking to Loft, 2 steps.", "polite");
    expect(screen.getByText("Walking to Loft, 2 steps left.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Go" })).toHaveProperty("disabled", true);
    fireEvent.click(screen.getByRole("button", { name: "Stop" }));
    expect(useMapStore.getState().walk).toBeNull();
  });

  it("draws the area as one labelled image", () => {
    renderPanel();
    const picture = screen.getByRole("img");
    expect(picture.getAttribute("aria-label")).toBe(
      "Map of Town: 2 known rooms on this level. You are in Square.");
    expect(picture.querySelectorAll("rect")).toHaveLength(2);
    expect(picture.querySelector(".map-room-current title")?.textContent).toBe("Square (exits: north, east)");
  });

  it("asks you to walk when no room is known yet", () => {
    useMapStore.setState({ map: emptyMap(), currentRoomId: null });
    renderPanel();
    expect(screen.getByText("No room yet. The map fills in as you walk.")).toBeTruthy();
  });
});

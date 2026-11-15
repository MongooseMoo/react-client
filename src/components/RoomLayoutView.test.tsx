import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mongooseToWebAudioVector } from "../audio/mongooseCoordinates";
import type { SpatialVector } from "../gmcp/Client/Spatial";
import type { RoomLayout } from "../gmcp/Room";
import { sampleLayout } from "../map/roomLayout.fixture";
import laundry from "../map/roomLayout.sample-1770.json";
import { useSpatialStore } from "../stores/spatialStore";
import { standaloneSvg } from "./RoomLayoutPicture";
import RoomLayoutView from "./RoomLayoutView";

const webAudio = (v: [number, number, number]) => mongooseToWebAudioVector(v) as SpatialVector;

describe("RoomLayoutView", () => {
  let onExit: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onExit = vi.fn();
    useSpatialStore.getState().reset();
    useSpatialStore.setState({ listenerEntityId: "#99" });
  });

  const renderView = () => render(<RoomLayoutView layout={sampleLayout()} roomName="Le Salon" onExit={onExit} />);

  it("labels the picture with the room's size and counts, and titles every shape", () => {
    renderView();
    const picture = screen.getByRole("img");
    expect(picture.getAttribute("aria-label")).toBe(
      "Layout of Le Salon: 3.8 m east to west, 5.1 m north to south, 2.4 m high; 1 exit, 1 person, 1 thing.",
    );
    const items = picture.querySelectorAll(".rl-item");
    expect([...items].map((item) => item.querySelector("title")?.textContent)).toEqual(["oak table", "Q (you)"]);
    expect(picture.querySelector(".rl-you")?.getAttribute("data-id")).toBe("#99");
    expect(picture.querySelector(".rl-exit title")?.textContent).toBe("Exit west");
  });

  it("says the room in words: exits, people and things with where they are", () => {
    renderView();
    const words = (name: string) =>
      within(screen.getByRole("list", { name })).getAllByRole("listitem").map((item) => item.textContent);
    expect(words("Exits in the layout")).toEqual(["west: 0.9 m doorway in the west wall, 1.3 m from the south wall"]);
    expect(words("People in the layout")).toEqual(["Q (you), 0.6 m from the south wall, 0.5 m from the east wall"]);
    expect(words("Things in the layout")).toEqual([
      "oak table, 1.6 m from the north wall, midway between the east and west walls",
    ]);
  });

  it("moves a thing when Client.Spatial moves it, without taking focus", () => {
    renderView();
    const before = document.activeElement;
    act(() => {
      useSpatialStore.getState().enterEntity({ id: "#99", position: webAudio([0.2, 1.0, 1.67]) });
    });
    const rect = screen.getByRole("img").querySelector('.rl-you rect');
    // Footprint x 0.0..0.4, y 0.8..1.2: its top-left in SVG units is (0, -1.2).
    expect(Number(rect?.getAttribute("x"))).toBeCloseTo(0);
    expect(Number(rect?.getAttribute("y"))).toBeCloseTo(-1.2);
    expect(document.activeElement).toBe(before);
    expect(document.querySelector("[aria-live]")).toBeNull();
  });

  it("draws the real laundry room and lists a thing sent without shapes", () => {
    render(<RoomLayoutView layout={laundry as unknown as RoomLayout} roomName="Laundry" onExit={onExit} />);
    const picture = screen.getByRole("img");
    expect(picture.querySelectorAll(".rl-item")).toHaveLength(12);
    expect(picture.querySelectorAll(".rl-door")).toHaveLength(2);
    const things = within(screen.getByRole("list", { name: "Things in the layout" }))
      .getAllByRole("listitem")
      .map((item) => item.textContent);
    expect(things).toHaveLength(13);
    expect(things).toContain("a puddle of water and copper, no size or place given");
  });

  it("sends the exit when its doorway is clicked", () => {
    renderView();
    fireEvent.click(screen.getByRole("img").querySelector(".rl-exit") as Element);
    expect(onExit).toHaveBeenCalledWith("west");
  });

  it("zooms by the viewBox with the keyboard and resets with 0", () => {
    renderView();
    const picture = screen.getByRole("img");
    expect(picture.getAttribute("tabindex")).toBe("0");
    const whole = picture.getAttribute("viewBox");
    fireEvent.keyDown(picture, { key: "+" });
    const zoomed = picture.getAttribute("viewBox")?.split(" ").map(Number) ?? [];
    expect(zoomed[2]).toBeCloseTo(Number(whole?.split(" ")[2]) / 1.25);
    fireEvent.keyDown(picture, { key: "0" });
    expect(picture.getAttribute("viewBox")).toBe(whole);
  });

  it("saves a standalone SVG with its own styles, the theme's colours and the whole room", () => {
    document.documentElement.style.setProperty("--color-primary", "#123456");
    renderView();
    const picture = screen.getByRole("img") as unknown as SVGSVGElement;
    const whole = picture.getAttribute("viewBox");
    fireEvent.keyDown(picture, { key: "+" });
    const file = standaloneSvg(picture, "Room layout");
    document.documentElement.style.removeProperty("--color-primary");

    expect(file.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<svg')).toBe(true);
    const parsed = new DOMParser().parseFromString(file, "image/svg+xml").documentElement;
    expect(file.slice(0, 200)).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(parsed.namespaceURI, `${parsed.textContent}\n${file}`).toBe("http://www.w3.org/2000/svg");
    expect(parsed.querySelector("parsererror")).toBeNull();
    expect(parsed.getAttribute("viewBox")).toBe(whole);
    expect(parsed.getAttribute("style")).toContain("--color-primary: #123456");
    expect(parsed.getAttribute("tabindex")).toBeNull();
    expect(parsed.querySelector("style")?.textContent).toContain(".room-layout-svg .rl-wall");
    expect(parsed.firstElementChild?.tagName).toBe("title");
    expect(parsed.firstElementChild?.textContent).toBe("Room layout");
  });
});

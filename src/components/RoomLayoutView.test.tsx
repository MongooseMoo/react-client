import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mongooseToWebAudioVector } from "../audio/mongooseCoordinates";
import { TEST_CHARACTERS } from "../avatar/characters.fixture";
import type { SpatialVector } from "../gmcp/Client/Spatial";
import type { RoomLayout } from "../gmcp/Room";
import { livingRoomLayout, sampleLayout } from "../map/roomLayout.fixture";
import laundry from "../map/roomLayout.sample-1770.json";
import { useRoomStore } from "../stores/roomStore";
import { useSpatialStore } from "../stores/spatialStore";
import { standaloneSvg } from "./RoomLayoutPicture";
import RoomLayoutView from "./RoomLayoutView";

// jsdom has no WebGL: the 3D views stand in as an element carrying their props.
vi.mock("./RoomLayout3D", () => ({
  default: (props: { mode: string; label: string }) => (
    <div data-testid="room-3d" data-mode={props.mode} role="img" aria-label={props.label} />
  ),
}));

const webAudio =(v: [number, number, number]) => mongooseToWebAudioVector(v) as SpatialVector;

describe("RoomLayoutView", () => {
  let onExit: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onExit = vi.fn();
    useSpatialStore.getState().reset();
    useSpatialStore.setState({ listenerEntityId: "#99" });
    useRoomStore.getState().reset();
    useRoomStore.getState().setRoomLayout(sampleLayout());
  });

  const renderView = () => render(<RoomLayoutView layout={sampleLayout()} roomName="Le Salon" onExit={onExit} />);

  it("colours a person's token from their appearance and lists their portrait and label quietly", () => {
    const ch = TEST_CHARACTERS[0];
    const layout = sampleLayout();
    layout.things = layout.things.map((t) => (t.id === "#99" ? { ...t, appearance: ch.appearance } : t));
    const { container } = render(<RoomLayoutView layout={layout} roomName="Le Salon" onExit={onExit} />);
    const token = screen.getByRole("img").querySelector('[data-id="#99"]') as SVGGElement;
    expect(token.getAttribute("class")).toContain("rl-dressed");
    expect(token.style.getPropertyValue("--rl-body")).toBe("#01153e");
    expect(token.style.getPropertyValue("--rl-head")).toBe("#9a3001");
    expect(token.querySelector("circle.rl-thing")).not.toBeNull();
    expect(token.querySelector("circle.rl-head")).not.toBeNull();
    const item = within(screen.getByRole("list", { name: "People in the layout" })).getByRole("listitem");
    expect(item.textContent).toBe("Ondine (you) (the red-haired woman), 0.6 m from the south wall, 0.5 m from the east wall");
    expect(item.querySelector("svg.avatar-portrait")?.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelector("[aria-live]")).toBeNull();
  });

  it("draws something that entered after the layout as a marker, lists it, moves it and drops it on leave", () => {
    renderView();
    act(() => {
      useSpatialStore.getState().enterEntity({ id: "#7", name: "[green]Zed", kind: "player", position: webAudio([1.0, -1.0, 1.6]) });
      useRoomStore.getState().addLayoutArrival({ id: "#7", name: "[green]Zed", kind: "player" });
    });
    const picture = screen.getByRole("img");
    const marker = picture.querySelector('[data-id="#7"]');
    expect(marker?.getAttribute("class")).toBe("rl-item rl-arrival rl-person");
    expect(marker?.querySelector("title")?.textContent).toBe("Zed");
    expect(Number(marker?.querySelector("circle")?.getAttribute("cy"))).toBeCloseTo(1.0);
    const people = () =>
      within(screen.getByRole("list", { name: "People in the layout" })).getAllByRole("listitem").map((i) => i.textContent);
    expect(people()).toContain("Zed, 1.6 m from the south wall, 0.9 m from the east wall");
    expect(picture.getAttribute("aria-label")).toContain("2 people");

    act(() => {
      useSpatialStore.getState().moveEntity({ entityId: "#7", position: webAudio([-1.0, 2.0, 1.6]) });
    });
    expect(Number(picture.querySelector('[data-id="#7"] circle')?.getAttribute("cx"))).toBeCloseTo(-1.0);
    expect(Number(picture.querySelector('[data-id="#7"] circle')?.getAttribute("cy"))).toBeCloseTo(-2.0);

    act(() => {
      useSpatialStore.getState().leaveEntity("#7");
      useRoomStore.getState().removeLayoutThing("#7");
    });
    expect(picture.querySelector('[data-id="#7"]')).toBeNull();
    expect(people()).toEqual(["Ondine (you), 0.6 m from the south wall, 0.5 m from the east wall"]);
  });

  it("labels the picture with the room's size and counts, and titles every shape", () => {
    renderView();
    const picture = screen.getByRole("img");
    expect(picture.getAttribute("aria-label")).toBe(
      "Layout of Le Salon: 3.8 m east to west, 5.1 m north to south, 2.4 m high; 1 exit, 1 person, 1 thing.",
    );
    const items = picture.querySelectorAll(".rl-item");
    expect([...items].map((item) => item.querySelector("title")?.textContent)).toEqual(["oak table", "Ondine (you)"]);
    expect(picture.querySelector(".rl-you")?.getAttribute("data-id")).toBe("#99");
    expect(picture.querySelector(".rl-exit title")?.textContent).toBe("Exit west");
  });

  it("says the room in words: exits, people and things with where they are", () => {
    renderView();
    const words = (name: string) =>
      within(screen.getByRole("list", { name })).getAllByRole("listitem").map((item) => item.textContent);
    expect(words("Exits in the layout")).toEqual(["west: 0.9 m doorway in the west wall, 1.3 m from the south wall"]);
    expect(words("People in the layout")).toEqual(["Ondine (you), 0.6 m from the south wall, 0.5 m from the east wall"]);
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
    const token = screen.getByRole("img").querySelector(".rl-you circle.rl-thing");
    // Footprint x 0.0..0.4, y 0.8..1.2: a person is a round token at its centre, (0.2, -1.0) in SVG units.
    expect(Number(token?.getAttribute("cx"))).toBeCloseTo(0.2);
    expect(Number(token?.getAttribute("cy"))).toBeCloseTo(-1.0);
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

describe("RoomLayoutView views", () => {
  beforeEach(() => {
    // setupTests stubs localStorage with no-ops; give it a memory for these tests.
    const stored = new Map<string, string>();
    vi.mocked(localStorage.getItem).mockImplementation((key) => stored.get(key) ?? null);
    vi.mocked(localStorage.setItem).mockImplementation((key, value) => void stored.set(key, value));
    useSpatialStore.getState().reset();
    useSpatialStore.setState({ listenerEntityId: "#99" });
    useRoomStore.getState().reset();
  });

  const renderLiving = () =>
    render(<RoomLayoutView layout={livingRoomLayout()} roomName="The Living Room" onExit={vi.fn()} />);
  const radio = (name: string) => screen.getByRole("radio", { name }) as HTMLInputElement;

  it("offers Plan, Dollhouse and Your eyes as one labelled radio group, Plan first", () => {
    renderLiving();
    const group = screen.getByRole("group", { name: "View" });
    expect(within(group).getAllByRole("radio").map((r) => r.closest("label")?.textContent)).toEqual([
      "Plan",
      "Dollhouse",
      "Your eyes",
    ]);
    expect(radio("Plan").checked).toBe(true);
    expect(screen.getByRole("img").tagName.toLowerCase()).toBe("svg");
  });

  it("shows the chosen 3D view with the same label, keeps the lists, and remembers the choice in the next room", async () => {
    const view = renderLiving();
    const label = screen.getByRole("img").getAttribute("aria-label");
    fireEvent.click(radio("Dollhouse"));
    const picture = await screen.findByTestId("room-3d");
    expect(picture.getAttribute("data-mode")).toBe("dollhouse");
    expect(picture.getAttribute("aria-label")).toBe(label);
    expect(screen.getByRole("list", { name: "Things in the layout" })).toBeTruthy();
    expect(screen.getByText(/^Drag to turn the room/)).toBeTruthy();

    fireEvent.click(radio("Your eyes"));
    expect((await screen.findByTestId("room-3d")).getAttribute("data-mode")).toBe("eyes");
    view.unmount();

    render(<RoomLayoutView layout={sampleLayout()} roomName="Le Salon" onExit={vi.fn()} />);
    expect(radio("Your eyes").checked).toBe(true);
    expect((await screen.findByTestId("room-3d")).getAttribute("data-mode")).toBe("eyes");
  });

  it("draws what things are in the plan and names them with class and material in the lists", () => {
    renderLiving();
    const picture = screen.getByRole("img");
    const form = (id: string) => picture.querySelector(`[data-id="${id}"]`);
    expect(form("#1")?.getAttribute("data-form")).toBe("table");
    expect(form("#1")?.querySelectorAll("circle.rl-symbol")).toHaveLength(4);
    expect(form("#2")?.querySelector("rect.rl-symbol")).not.toBeNull();
    expect(form("#6")?.querySelector("path.rl-symbol-line")).not.toBeNull();
    const things = within(screen.getByRole("list", { name: "Things in the layout" }))
      .getAllByRole("listitem")
      .map((i) => i.textContent);
    expect(things).toContain(
      "coffee table (table, wood), midway between the north and south walls, midway between the east and west walls",
    );
  });
});

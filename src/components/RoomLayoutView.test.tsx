import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mongooseToWebAudioVector } from "../audio/mongooseCoordinates";
import { TEST_CHARACTERS } from "../avatar/characters.fixture";
import type { SpatialVector } from "../gmcp/Client/Spatial";
import type { RoomLayout } from "../gmcp/Room";
import { livingRoomLayout, sampleLayout, translateLayoutThing } from "../map/roomLayout.fixture";
import laundry from "../map/roomLayout.sample-1770.json";
import { useItemsStore } from "../stores/itemsStore";
import { useRoomStore } from "../stores/roomStore";
import { useSpatialStore } from "../stores/spatialStore";
import { standaloneSvg } from "./RoomLayoutPicture";
import RoomLayoutView from "./RoomLayoutView";

// jsdom has no WebGL: the 3D views stand in as an element carrying their props.
vi.mock("./RoomLayout3D", () => ({
  default: (props: { mode: string; label: string; selectedId: string | null }) => (
    <div data-testid="room-3d" data-mode={props.mode} data-selected={props.selectedId ?? ""} role="img" aria-label={props.label} />
  ),
}));

const webAudio =(v: [number, number, number]) => mongooseToWebAudioVector(v) as SpatialVector;

describe("RoomLayoutView", () => {
  let onExit: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onExit = vi.fn();
    useSpatialStore.getState().reset();
    useSpatialStore.setState({ listenerEntityId: "#99" });
    useItemsStore.getState().reset();
    useRoomStore.getState().reset();
    useRoomStore.getState().setRoomLayout(sampleLayout());
  });

  const view = (layout: RoomLayout, roomName = "Le Salon") =>
    <RoomLayoutView layout={layout} roomName={roomName} onCommand={onExit} onInspect={vi.fn()} onFitting={vi.fn()} />;
  function StoredView() {
    const layout = useRoomStore((state) => state.roomLayout);
    return layout && view(layout);
  }
  const renderView = () => render(<StoredView />);

  it("shows supplied finishes, and support, front and device state in the picture's titles, quietly", () => {
    const layout = sampleLayout();
    layout.finishes = { floor: "oak", wall: "drywall" };
    layout.things.push({ id: "#panel", name: "control panel", kind: "object", fixed: false, mounted: false,
      shapes: [{ box: [[-0.2, 0.2], [0.4, 0.6], [1.05, 1.2]] }],
      relation: { kind: "on", target: "#5678", text: "on oak table" },
      front: { axis: [0, -1, 0], yaw: Math.PI, direction: "north" }, state: { opened: false, mode: "offline" },
    });
    render(view(layout));
    expect(screen.getAllByRole("definition")).toHaveLength(2);
    expect(screen.getByText("oak")).toBeDefined();
    expect(screen.getByText("drywall")).toBeDefined();
    expect(screen.getByRole("img").querySelector('[data-id="#panel"] title')?.textContent).toBe(
      "control panel, on oak table, faces north, closed, offline");
    expect(document.querySelector("[aria-live]")).toBeNull();
  });

  it("colours a person's token from their appearance, quietly", () => {
    const ch = TEST_CHARACTERS[0];
    const layout = sampleLayout();
    layout.things = layout.things.map((t) => (t.id === "#99" ? { ...t, appearance: ch.appearance } : t));
    const { container } = render(view(layout));
    const token = screen.getByRole("img").querySelector('[data-id="#99"]') as SVGGElement;
    expect(token.getAttribute("class")).toContain("rl-dressed");
    expect(token.style.getPropertyValue("--rl-body")).toBe("#01153e");
    expect(token.style.getPropertyValue("--rl-head")).toBe("#9a3001");
    expect(token.querySelector("circle.rl-thing")).not.toBeNull();
    expect(token.querySelector("circle.rl-head")).not.toBeNull();
    expect(container.querySelector("[aria-live]")).toBeNull();
  });

  it("does not draw an acoustic newcomer without a physical room record", () => {
    renderView();
    act(() => useSpatialStore.getState().enterEntity({ id: "#7", name: "Zed", kind: "player", position: webAudio([1, -1, 1.6]) }));
    expect(screen.getByRole("img").querySelector('[data-id="#7"]')).toBeNull();
    expect(screen.getByRole("img").getAttribute("aria-label")).toContain("1 person");
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

  it("leaves the room's exits, things and people to the Room tab's lists: it holds no list or heading for them", () => {
    renderView();
    expect(screen.queryAllByRole("list")).toHaveLength(0);
    expect(screen.getAllByRole("heading").map((heading) => heading.textContent)).toEqual(["Room layout"]);
    expect(screen.queryByRole("button", { name: /inspect|open|get/i })).toBeNull();
  });

  it("moves only from the physical room projection, without taking focus", () => {
    renderView();
    const before = document.activeElement;
    act(() => {
      useRoomStore.getState().setRoomLayout(translateLayoutThing(sampleLayout(), "#99", [-1.0, 2.0, 0]));
    });
    const token = screen.getByRole("img").querySelector(".rl-you circle.rl-thing");
    // Footprint x 0.0..0.4, y 0.0..0.4: the centre is (0.2, -0.2) in SVG units.
    expect(Number(token?.getAttribute("cx"))).toBeCloseTo(0.2);
    expect(Number(token?.getAttribute("cy"))).toBeCloseTo(-0.2);
    expect(document.activeElement).toBe(before);
    expect(document.querySelector("[aria-live]")).toBeNull();
  });

  it("draws the real laundry room, leaving out a thing sent without shapes", () => {
    render(view(laundry as unknown as RoomLayout, "Laundry"));
    const picture = screen.getByRole("img");
    expect(picture.querySelectorAll(".rl-item")).toHaveLength(12);
    expect(picture.querySelectorAll(".rl-door")).toHaveLength(2);
  });

  it("sends the exit when its doorway is clicked", () => {
    renderView();
    fireEvent.click(screen.getByRole("img").querySelector(".rl-exit") as Element);
    expect(onExit).toHaveBeenCalledWith("west");
    expect(useItemsStore.getState().selected).toBeNull();
  });

  it("selects the thing or person clicked in the plan and frames it, by more than colour", () => {
    useItemsStore.getState().setLocationItems("room", [{ id: "#5678", name: "oak table" }]);
    renderView();
    const picture = screen.getByRole("img");
    expect(picture.querySelector(".rl-selection")).toBeNull();

    fireEvent.click(picture.querySelector('[data-id="#5678"] .rl-thing') as Element);
    expect(useItemsStore.getState().selected).toEqual({ id: "#5678" });
    expect(onExit).not.toHaveBeenCalled();
    expect(picture.querySelector('[data-id="#5678"]')?.getAttribute("class")).toContain("rl-selected");
    const frame = picture.querySelector("rect.rl-selection") as SVGRectElement;
    // Round the table's footprint (x -0.5..0.5, y 0.2..1.0), a little outside it.
    expect(Number(frame.getAttribute("x"))).toBeLessThan(-0.5);
    expect(Number(frame.getAttribute("width"))).toBeGreaterThan(1);
    expect(picture.querySelector("style")?.textContent).toMatch(/\.rl-selection \{[^}]*stroke-dasharray/);
    expect(picture.querySelector(".rl-label-selected")?.textContent).toBe("oak table");

    fireEvent.click(picture.querySelector('[data-id="#99"]') as Element);
    expect(useItemsStore.getState().selected?.id).toBe("#99");
    expect(picture.querySelectorAll(".rl-selected")).toHaveLength(1);
    expect(picture.querySelector("circle.rl-selection")).not.toBeNull();
  });

  it("does not select on hover, or when the pointer dragged the view", () => {
    renderView();
    const picture = screen.getByRole("img");
    const table = picture.querySelector('[data-id="#5678"]') as Element;
    // jsdom's pointer events carry no coordinates; a mouse event of the same type does. Where jsdom has no
    // `onpointerdown` property Preact listens under the prop's own spelling ("PointerDown").
    const pointer = (type: "Down" | "Move" | "Up", clientX: number, clientY: number) => {
      const name = `onpointer${type.toLowerCase()}` in picture ? `pointer${type.toLowerCase()}` : `Pointer${type}`;
      const event = new MouseEvent(name, { bubbles: true, cancelable: true, clientX, clientY, button: 0 });
      Object.defineProperty(event, "pointerId", { value: 1 });
      Object.defineProperty(event, "pointerType", { value: "mouse" });
      fireEvent(table, event);
    };
    fireEvent.mouseOver(table);
    pointer("Move", 5, 5);
    expect(useItemsStore.getState().selected).toBeNull();

    pointer("Down", 10, 10);
    pointer("Move", 40, 30);
    pointer("Up", 40, 30);
    fireEvent.click(table);
    expect(useItemsStore.getState().selected).toBeNull();

    pointer("Down", 10, 10);
    pointer("Up", 11, 10);
    fireEvent.click(table);
    expect(useItemsStore.getState().selected?.id).toBe("#5678");
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

  it("saves a standalone SVG with its own styles, the theme's colours and the whole room, without the selection", () => {
    document.documentElement.style.setProperty("--color-primary", "#123456");
    renderView();
    act(() => useItemsStore.getState().select("#5678"));
    const picture = screen.getByRole("img") as unknown as SVGSVGElement;
    expect(picture.querySelector(".rl-selection")).not.toBeNull();
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
    expect(parsed.querySelector(".rl-selection, .rl-selected, .rl-label-selected")).toBeNull();
    expect(picture.querySelector(".rl-selection")).not.toBeNull();
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
    useItemsStore.getState().reset();
    useRoomStore.getState().reset();
  });

  const view = (layout: RoomLayout, roomName: string) =>
    <RoomLayoutView layout={layout} roomName={roomName} onCommand={vi.fn()} onInspect={vi.fn()} onFitting={vi.fn()} />;
  const renderLiving = () => render(view(livingRoomLayout(), "The Living Room"));
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

  it("shows the chosen 3D view with the same label and the same selection, and remembers the choice in the next room", async () => {
    useRoomStore.getState().setRoomLayout(livingRoomLayout());
    const shown = renderLiving();
    const label = screen.getByRole("img").getAttribute("aria-label");
    fireEvent.click(screen.getByRole("img").querySelector('[data-id="#1"]') as Element);
    fireEvent.click(radio("Dollhouse"));
    const picture = await screen.findByTestId("room-3d");
    expect(picture.getAttribute("data-mode")).toBe("dollhouse");
    expect(picture.getAttribute("aria-label")).toBe(label);
    expect(picture.getAttribute("data-selected")).toBe("#1");
    expect(screen.getByText(/^Drag to turn the room/)).toBeTruthy();

    fireEvent.click(radio("Your eyes"));
    const eyes = await screen.findByTestId("room-3d");
    expect(eyes.getAttribute("data-mode")).toBe("eyes");
    expect(eyes.getAttribute("data-selected")).toBe("#1");
    shown.unmount();

    render(view(sampleLayout(), "Le Salon"));
    expect(radio("Your eyes").checked).toBe(true);
    expect((await screen.findByTestId("room-3d")).getAttribute("data-mode")).toBe("eyes");
  });

  it("draws what things are in the plan", () => {
    renderLiving();
    const picture = screen.getByRole("img");
    const form = (id: string) => picture.querySelector(`[data-id="${id}"]`);
    expect(form("#1")?.getAttribute("data-form")).toBe("table");
    expect(form("#1")?.querySelectorAll("circle.rl-symbol")).toHaveLength(4);
    expect(form("#2")?.querySelector("line.rl-mark-line")).not.toBeNull();
    expect(form("#6")?.querySelector("path.rl-symbol-line")).not.toBeNull();
  });
});

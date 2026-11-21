import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type MudClient from "../client";
import { TEST_CHARACTERS } from "../avatar/characters.fixture";
import type { Item } from "../gmcp/Char/Items";
import type { LayoutThing, RoomLayout } from "../gmcp/Room";
import { sampleLayout, translateLayoutThing } from "../map/roomLayout.fixture";
import laundry from "../map/roomLayout.sample-1770.json";
import RoomInfoDisplay from "./RoomInfoDisplay";
import { useItemsStore } from "../stores/itemsStore";
import { useRoomStore } from "../stores/roomStore";
import { useSpatialStore } from "../stores/spatialStore";

// jsdom has no WebGL: the 3D views stand in as an element carrying their props.
const seen3D = vi.hoisted(() => ({ props: null as null | {
  selectedId: string | null;
  onSelect: (id: string) => void;
  onInspect: (id: string, lifetime: string, role: string) => void;
  onFitting: (lifetime: string) => void;
} }));
vi.mock("./RoomLayout3D", () => ({
  default: (props: NonNullable<typeof seen3D.props> & { mode: string; label: string }) => {
    seen3D.props = props;
    return <div data-testid="room-3d" data-mode={props.mode} data-selected={props.selectedId ?? ""} role="img" aria-label={props.label} />;
  },
}));

function createMockClient() {
  return {
    gmcp: { handlers: { "Char.Items": { sendRoom: vi.fn() } } },
    sendCommand: vi.fn(),
  };
}

const info = (num: number) => ({ num, name: "Le Salon", area: "Daystrom Annex", exits: { west: 1235 } });

/** The sample room (oak table #5678, you #99) with a radio on the table, a plate with two biscuits, and Ann. */
function salon(): RoomLayout {
  const layout = sampleLayout();
  const on = (id: string, name: string, target: string, text: string): LayoutThing => ({
    id, name, kind: "object", fixed: false, mounted: false, lifetime: `${id}-life`,
    shapes: [{ box: [[-0.2, 0.2], [0.4, 0.6], [0.75, 0.9]] }], relation: { kind: "on", target, text },
  });
  layout.things[0] = { ...layout.things[0], classes: ["table"], material: [{ species: "oak", fraction: 1 }] };
  layout.things.push(
    on("#11", "portable radio", "#5678", "on the oak table"),
    on("#12", "plate", "#5678", "on the oak table"),
    on("#21", "biscuit", "#12", "on the plate"),
    on("#22", "biscuit", "#12", "on the plate"),
    { id: "#30", name: "Ann", kind: "player", fixed: true, mounted: false, lifetime: "ann-life",
      shapes: [{ box: [[-1.5, -1.1], [-2.0, -1.6], [0.0, 1.7]] }], appearance: TEST_CHARACTERS[0].appearance },
  );
  return layout;
}

const salonItems: Item[] = [
  { id: "#5678", name: "oak table" },
  { id: "#11", name: "portable radio", verbs: [["pause", "#11"], ["stop", "#11"]] },
  { id: "#12", name: "plate" },
  { id: "#40", name: "a draught" },
  { id: "#30", name: "Ann" },
];

describe("RoomInfoDisplay", () => {
  let client: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    seen3D.props = null;
    const stored = new Map<string, string>();
    vi.mocked(localStorage.getItem).mockImplementation((key) => stored.get(key) ?? null);
    vi.mocked(localStorage.setItem).mockImplementation((key, value) => void stored.set(key, value));
    useItemsStore.getState().reset();
    useRoomStore.getState().reset();
    useSpatialStore.getState().reset();
    useSpatialStore.setState({ listenerEntityId: "#99" });
    client = createMockClient();
  });

  const renderTab = () => render(<RoomInfoDisplay client={client as unknown as MudClient} />);
  const enterSalon = (layout = salon()) => {
    useRoomStore.getState().setRoomInfo(info(layout.num));
    useRoomStore.getState().setRoomLayout(layout);
    useRoomStore.getState().setRoomPlayers([{ name: "ann", fullname: "Ann" }]);
    useItemsStore.getState().setLocationItems("room", salonItems);
  };
  const things = () => screen.getByRole("listbox", { name: "Things" });
  const people = () => screen.getByRole("listbox", { name: "People" });
  const rows = (list: HTMLElement) => within(list).getAllByRole("option").map((option) => option.textContent);
  const selectedRows = () => screen.getAllByRole("option").filter((option) => option.getAttribute("aria-selected") === "true").map((option) => option.textContent);

  it("in a room with no layout shows the room, its things and its players, and no picture", () => {
    useRoomStore.setState({
      roomInfo: { num: 101, name: "Codex's Lab", area: "Daystrom Annex", exits: { west: 100, northeast: 102 } },
      roomPlayers: [{ name: "marlow", fullname: "Marlow" }],
    });
    useItemsStore.getState().setLocationItems("room", [
      { id: "lantern", name: "Lantern", location: "room" },
      { id: "#77", name: "Marlow", location: "room" },
    ]);

    renderTab();
    expect(screen.getByText("Codex's Lab")).toBeTruthy();
    expect(screen.getByText("Area: Daystrom Annex")).toBeTruthy();
    expect(rows(things())).toEqual(["Lantern"]);
    expect(rows(people())).toEqual(["Marlow"]);
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.queryByRole("radio")).toBeNull();

    fireEvent.click(within(people()).getByRole("option", { name: "Marlow" }));
    expect(useItemsStore.getState().selected).toEqual({ id: "#77" });
    fireEvent.click(screen.getByRole("button", { name: "Look at Marlow" }));
    expect(client.sendCommand).toHaveBeenCalledWith("look marlow");
  });

  it("draws the room once, at the top, with the three views, above the lists", () => {
    enterSalon();
    renderTab();
    expect(screen.getAllByRole("img")).toHaveLength(1);
    expect(within(screen.getByRole("group", { name: "View" })).getAllByRole("radio")).toHaveLength(3);
    const picture = screen.getByRole("img");
    expect(picture.compareDocumentPosition(things()) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(picture.getAttribute("aria-label")).toContain("Layout of Le Salon");
  });

  it("lists every thing once, joined by id, each with where it is", () => {
    enterSalon();
    renderTab();
    expect(rows(things())).toEqual([
      "oak table, 1.6 m from the north wall, midway between the east and west walls",
      "portable radio, on the oak table",
      "plate, on the oak table",
      "a draught",
      "biscuit, on the plate",
      "biscuit, on the plate",
    ]);
    expect(screen.queryByRole("list", { name: "Things in the layout" })).toBeNull();
    expect(screen.queryByRole("list", { name: "People in the layout" })).toBeNull();
  });

  it("lists every person once, with portrait and the server's label, and not among the things", () => {
    enterSalon();
    renderTab();
    expect(rows(people())).toEqual(["Ann (the red-haired woman)", "Ondine (you)"]);
    const ann = within(people()).getByRole("option", { name: /Ann/ });
    expect(ann.querySelector("svg.avatar-portrait")?.getAttribute("aria-hidden")).toBe("true");
    expect(rows(things()).some((row) => /Ann|Ondine/.test(row ?? ""))).toBe(false);
  });

  it("selects a thing from its row: the card shows where it is and only the server's actions, and nothing is sent", () => {
    enterSalon();
    renderTab();
    fireEvent.click(within(things()).getByRole("option", { name: "portable radio, on the oak table" }));
    expect(useItemsStore.getState().selected).toEqual({ id: "#11", lifetime: "#11-life" });
    const card = document.querySelector('.item-card[data-item-id="#11"]') as HTMLElement;
    expect(within(card).getByText("portable radio")).toBeTruthy();
    expect(within(card).getByText("on the oak table")).toBeTruthy();
    expect(within(card).getAllByRole("button").map((button) => button.textContent)).toEqual(["Pause", "Stop"]);
    expect(client.sendCommand).not.toHaveBeenCalled();
    fireEvent.click(within(card).getByRole("button", { name: "Pause portable radio" }));
    expect(client.sendCommand).toHaveBeenCalledWith("pause #11");

    fireEvent.click(within(things()).getByRole("option", { name: /^oak table/ }));
    const table = document.querySelector('.item-card[data-item-id="#5678"]') as HTMLElement;
    expect(within(table).getByText("table, oak")).toBeTruthy();
    expect(within(table).queryAllByRole("button")).toHaveLength(0);
  });

  it("lets each thing on a surface be chosen by itself, including one only the layout holds", () => {
    enterSalon();
    renderTab();
    const biscuits = within(things()).getAllByRole("option", { name: "biscuit, on the plate" });
    expect(biscuits).toHaveLength(2);
    fireEvent.click(biscuits[1]);
    expect(useItemsStore.getState().selected).toEqual({ id: "#22", lifetime: "#22-life" });
    expect(document.querySelector('.item-card[data-item-id="#22"]')).not.toBeNull();
  });

  it("selects a person from their row: a player's card with where they are, another person's by the server's verbs", () => {
    enterSalon();
    renderTab();
    fireEvent.click(within(people()).getByRole("option", { name: /Ann/ }));
    expect(useItemsStore.getState().selected?.id).toBe("#30");
    const card = document.querySelector(".player-card") as HTMLElement;
    expect(within(card).getByText("the red-haired woman")).toBeTruthy();
    expect(within(card).getByText("0.6 m from the south wall, near the west wall")).toBeTruthy();
    expect(card.querySelector("svg.player-portrait")).not.toBeNull();
    fireEvent.click(within(card).getByRole("button", { name: "Follow Ann" }));
    expect(client.sendCommand).toHaveBeenCalledWith("follow ann");
    expect(selectedRows()).toEqual(["Ann (the red-haired woman)"]);
  });

  it("shows a selection made elsewhere (the picture, interact mode) as the selected row and card, without taking focus", () => {
    enterSalon();
    renderTab();
    const before = document.activeElement;
    act(() => useItemsStore.getState().select("#11"));
    expect(selectedRows()).toEqual(["portable radio, on the oak table"]);
    expect(document.querySelector('.item-card[data-item-id="#11"]')).not.toBeNull();
    expect(document.activeElement).toBe(before);
    act(() => useItemsStore.getState().select("#30"));
    expect(selectedRows()).toEqual(["Ann (the red-haired woman)"]);
    expect(document.querySelector(".item-card")).toBeNull();
    expect(document.querySelector("[aria-live]")).toBeNull();
  });

  it("selects what is clicked in the plan, outlines it there, and keeps it through Dollhouse and back", async () => {
    enterSalon();
    renderTab();
    const plan = screen.getByRole("img");
    fireEvent.click(plan.querySelector('[data-id="#11"]') as Element);
    expect(selectedRows()).toEqual(["portable radio, on the oak table"]);
    expect(plan.querySelector('[data-id="#11"]')?.getAttribute("class")).toContain("rl-selected");
    expect(plan.querySelectorAll(".rl-selected")).toHaveLength(1);
    expect(client.sendCommand).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("radio", { name: "Dollhouse" }));
    expect((await screen.findByTestId("room-3d")).getAttribute("data-selected")).toBe("#11");
    act(() => seen3D.props?.onSelect("#12"));
    expect(selectedRows()).toEqual(["plate, on the oak table"]);
    fireEvent.click(screen.getByRole("radio", { name: "Plan" }));
    expect(screen.getByRole("img").querySelector(".rl-selected")?.getAttribute("data-id")).toBe("#12");
  });

  it("drops the card when the selected thing leaves, and the selection when the room changes", () => {
    enterSalon();
    renderTab();
    act(() => useItemsStore.getState().select("#40"));
    expect(document.querySelector('.item-card[data-item-id="#40"]')).not.toBeNull();
    act(() => useItemsStore.getState().removeItem("room", { id: "#40", name: "a draught" }));
    expect(document.querySelector(".item-card")).toBeNull();
    expect(selectedRows()).toEqual([]);

    act(() => useItemsStore.getState().select("#11"));
    act(() => useRoomStore.getState().setRoomInfo(info(99)));
    expect(useItemsStore.getState().selected).toBeNull();
  });

  it("updates rows quietly when a body moves: no focus change, nothing announced, the selection kept", () => {
    enterSalon();
    renderTab();
    act(() => useItemsStore.getState().select("#5678"));
    const before = document.activeElement;
    act(() => useRoomStore.getState().setRoomLayout(translateLayoutThing(salon(), "#5678", [0, -1, 0])));
    expect(rows(things())[0]).toBe("oak table, 1.8 m from the south wall, midway between the east and west walls");
    expect(selectedRows()).toEqual([rows(things())[0]]);
    expect(document.activeElement).toBe(before);
    expect(document.querySelector("[aria-live]")).toBeNull();
  });

  it("inspects the selected thing's parts, even when labels repeat, and drops replaced parts", () => {
    const layout = salon();
    const host = { ...layout.things[0], id: "#5678", lifetime: "camera-life",
      form_boxes: ["front/screen", "back/screen"].map((role) => ({ role, label: "screen", center: [0, 0, 0], size: [1, 1, 1] })) } as LayoutThing;
    layout.things[0] = host;
    enterSalon(layout);
    renderTab();
    expect(screen.queryByRole("button", { name: /inspect/i })).toBeNull();
    fireEvent.click(within(things()).getByRole("option", { name: /^oak table/ }));
    fireEvent.click(screen.getByRole("button", { name: "Inspect screen (back/screen)" }));
    expect(client.sendCommand).toHaveBeenCalledWith("look back/screen on #5678");
    act(() => useRoomStore.getState().setRoomLayout({ ...layout, things: layout.things.map((item) =>
      item === host ? { ...host, form_boxes: [{ ...host.form_boxes![0], role: "viewfinder", label: "viewfinder" }] } : item) }));
    expect(screen.queryByRole("button", { name: /inspect screen/i })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Inspect viewfinder" }));
    expect(client.sendCommand).toHaveBeenLastCalledWith("look viewfinder on #5678");
  });

  it("keeps the focused drawer and its native commands across a change observed from text", () => {
    const layout = salon();
    const fitting = { id: "#44469", lifetime: "drawer-life", name: "upper-left drawer", opened: false, command: "open #44469", contents: [] };
    const desk = { ...layout.things[0], lifetime: "desk-life", form_boxes: [{ center: [-0.5, 0, 0.175], size: [0.3, 0.6, 0.15], fitting }] } as LayoutThing;
    layout.things[0] = desk;
    enterSalon(layout);
    renderTab();
    fireEvent.click(within(things()).getByRole("option", { name: /^oak table/ }));
    const toggle = screen.getByRole("button", { name: "Open upper-left drawer", expanded: false });
    toggle.focus();
    fireEvent.click(toggle);
    expect(client.sendCommand).toHaveBeenLastCalledWith("open #44469");
    expect(screen.queryByRole("button", { name: /get letter/i })).toBeNull();

    const item = { id: "#50", lifetime: "letter-life", name: "letter", command: "get #50 from #44469" };
    const show = (opened: boolean) => act(() => useRoomStore.getState().setRoomLayout({ ...layout,
      things: layout.things.map((thing) => thing !== desk ? thing : { ...desk,
        form_boxes: [{ ...desk.form_boxes![0], fitting: { ...fitting, opened,
          command: opened ? "close #44469" : "open #44469", contents: opened ? [item] : [] } }] }),
    }));
    show(true);
    expect(screen.getByRole("button", { name: "Close upper-left drawer", expanded: true })).toBe(toggle);
    expect(document.activeElement).toBe(toggle);
    const getLetter = screen.getByRole("button", { name: "Get letter" });
    getLetter.focus();
    fireEvent.click(getLetter);
    expect(client.sendCommand).toHaveBeenLastCalledWith(item.command);
    expect(document.activeElement).toBe(toggle);
    show(false);
    expect(screen.queryByRole("button", { name: "Get letter" })).toBeNull();
  });

  it("a part or drawer clicked in a 3D view selects its thing and presses the same button", async () => {
    const layout = salon();
    const fitting = { id: "#44469", lifetime: "drawer-life", name: "upper-left drawer", opened: false, command: "open #44469", contents: [] };
    layout.things[0] = { ...layout.things[0], lifetime: "desk-life", form_boxes: [
      { role: "writing-slab", label: "slab", center: [0, 0, 0.3], size: [1, 0.6, 0.05] },
      { center: [-0.5, 0, 0.175], size: [0.3, 0.6, 0.15], fitting },
    ] } as LayoutThing;
    enterSalon(layout);
    renderTab();
    fireEvent.click(screen.getByRole("radio", { name: "Dollhouse" }));
    await screen.findByTestId("room-3d");

    act(() => seen3D.props?.onInspect("#5678", "desk-life", "writing-slab"));
    expect(useItemsStore.getState().selected?.id).toBe("#5678");
    expect(client.sendCommand).toHaveBeenLastCalledWith("look writing-slab on #5678");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Inspect slab" }));

    act(() => useItemsStore.getState().select("#11"));
    act(() => seen3D.props?.onFitting("drawer-life"));
    expect(useItemsStore.getState().selected?.id).toBe("#5678");
    expect(client.sendCommand).toHaveBeenLastCalledWith("open #44469");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Open upper-left drawer" }));
  });

  it("lists the real laundry room's things from the layout alone, one sent without shapes included", () => {
    const layout = laundry as unknown as RoomLayout;
    useRoomStore.getState().setRoomInfo({ num: layout.num, name: "Laundry", area: "" });
    useRoomStore.getState().setRoomLayout(layout);
    renderTab();
    expect(rows(things())).toHaveLength(13);
    expect(rows(things())).toContain("a puddle of water and copper, no size or place given");
  });
});

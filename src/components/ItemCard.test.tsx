import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ItemCard from "./ItemCard";

describe("ItemCard", () => {
  it("offers the actions the server listed for the item, and no others", () => {
    const onAction = vi.fn();
    render(
      <ItemCard
        item={{
          id: "#2558",
          name: "hat",
          location: "inv",
          Attrib: "W",
          verbs: [
            ["wear", "#2558"],
            ["d*rop", "#2558"],
          ],
        }}
        onAction={onAction}
      />,
    );

    expect(screen.getAllByRole("button").map((button) => button.textContent)).toEqual(["Wear", "Drop"]);

    fireEvent.click(screen.getByRole("button", { name: "Wear hat" }));
    expect(onAction).toHaveBeenCalledWith({
      verb: "wear",
      label: "Wear",
      description: "Wear hat",
      command: "wear #2558",
      caret: undefined,
    });
  });

  it("puts an icon on a verb it has one for, and leaves the name it is called by alone", () => {
    render(
      <ItemCard
        item={{
          id: "#2558",
          name: "hat",
          location: "inv",
          verbs: [
            ["wear", "#2558"],
            ["d*rop", "#2558"],
          ],
        }}
        onAction={vi.fn()}
      />,
    );

    const wear = screen.getByRole("button", { name: "Wear hat" });
    const drop = screen.getByRole("button", { name: "Drop hat" });
    expect(wear.querySelector("svg")).toBeNull();
    expect(drop.querySelector("svg")).not.toBeNull();
    expect(drop.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("offers nothing for an item with no listed verbs", () => {
    render(<ItemCard item={{ id: "#5", name: "rock", location: "room" }} onAction={vi.fn()} />);
    expect(screen.queryAllByRole("button")).toEqual([]);
  });
});

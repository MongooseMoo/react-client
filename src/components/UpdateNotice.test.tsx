import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import UpdateNotice from "./UpdateNotice";

const { mockAnnounce } = vi.hoisted(() => ({ mockAnnounce: vi.fn() }));

vi.mock("@react-aria/live-announcer", () => ({
  announce: mockAnnounce,
}));

class FakeContainer extends EventTarget {
  controller: object | null = {};

  takeControl() {
    this.controller = {};
    this.dispatchEvent(new Event("controllerchange"));
  }
}

describe("UpdateNotice", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    mockAnnounce.mockReset();
  });

  it("stays silent until a new client version takes control", () => {
    const container = new FakeContainer();
    const { container: dom } = render(
      <UpdateNotice container={container as unknown as ServiceWorkerContainer} build="abc1234def" />,
    );

    expect(dom).toBeEmptyDOMElement();
    expect(mockAnnounce).not.toHaveBeenCalled();
  });

  it("announces the update and offers a keyboard-reachable reload naming the running build", () => {
    const container = new FakeContainer();
    const reload = vi.fn();
    render(
      <UpdateNotice
        container={container as unknown as ServiceWorkerContainer}
        build="abc1234def5678"
        reload={reload}
      />,
    );

    act(() => container.takeControl());

    expect(mockAnnounce).toHaveBeenCalledWith(
      "Client updated. Reload to use the new version.",
      "assertive",
    );
    expect(screen.getByText(/running build abc1234/)).toBeInTheDocument();
    const button = screen.getByRole("button", { name: "Reload now" });
    expect(button.tagName).toBe("BUTTON");

    fireEvent.click(button);
    expect(reload).toHaveBeenCalledTimes(1);
  });
});

import { describe, expect, it, vi } from "vitest";

import { watchClientUpdates } from "./clientUpdate";

/** Just enough of a ServiceWorkerContainer to drive controllerchange. */
class FakeContainer extends EventTarget {
  constructor(public controller: object | null) {
    super();
  }

  takeControl() {
    this.controller = {};
    this.dispatchEvent(new Event("controllerchange"));
  }
}

const watch = (container: FakeContainer, onUpdate: () => void) =>
  watchClientUpdates(container as unknown as ServiceWorkerContainer, onUpdate);

describe("watchClientUpdates", () => {
  it("reports an update when a new worker replaces the one that served the page", () => {
    const container = new FakeContainer({});
    const onUpdate = vi.fn();
    watch(container, onUpdate);

    container.takeControl();

    expect(onUpdate).toHaveBeenCalledTimes(1);
  });

  it("ignores the first install claiming an uncontrolled page; that page is already current", () => {
    const container = new FakeContainer(null);
    const onUpdate = vi.fn();
    watch(container, onUpdate);

    container.takeControl();
    expect(onUpdate).not.toHaveBeenCalled();

    // A later worker is a real update.
    container.takeControl();
    expect(onUpdate).toHaveBeenCalledTimes(1);
  });

  it("stops reporting after unsubscribe", () => {
    const container = new FakeContainer({});
    const onUpdate = vi.fn();
    const unsubscribe = watch(container, onUpdate);

    unsubscribe();
    container.takeControl();

    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("does nothing where service workers are unsupported", () => {
    const onUpdate = vi.fn();
    expect(() => watchClientUpdates(undefined, onUpdate)()).not.toThrow();
  });
});

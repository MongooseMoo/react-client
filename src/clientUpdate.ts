/**
 * Calls onUpdate when a new service worker takes control of this page.
 *
 * sw.ts calls skipWaiting() and clientsClaim(), so a deployed version never
 * waits: it takes over at once while this page keeps running the old code
 * until it reloads. The takeover (controllerchange) is the only signal.
 * A page that started without a controller is already the current build, so
 * its first takeover is the initial install, not an update.
 */
export function watchClientUpdates(
  container: ServiceWorkerContainer | undefined,
  onUpdate: () => void,
): () => void {
  if (!container) {
    return () => {};
  }
  let servedByWorker = container.controller !== null;
  const handleControllerChange = () => {
    if (servedByWorker) {
      onUpdate();
    }
    servedByWorker = true;
  };
  container.addEventListener("controllerchange", handleControllerChange);
  return () => container.removeEventListener("controllerchange", handleControllerChange);
}

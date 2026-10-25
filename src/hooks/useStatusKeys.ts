import { useEffect } from "react";
import { announce } from "@react-aria/live-announcer";
import { statusReadoutFor } from "../reservedShortcuts";
import { useCharacterStatusStore } from "../stores/characterStatusStore";
import { usePreferences } from "../stores/preferencesStore";
import { statusReadout } from "../status/statusText";

/** Alt+H, Alt+M, Alt+V and Alt+T speak health, power, body and target, without adding to the log. */
export function useStatusKeys(): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      const readout = statusReadoutFor(event, usePreferences.getState().keyboard.navigationKeyScheme);
      if (!readout) return;
      event.preventDefault();
      announce(statusReadout(readout, useCharacterStatusStore.getState(), performance.now()), "assertive");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}

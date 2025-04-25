import React, { useState, useEffect, useCallback } from "react";
import MudClient from "../client";
import { TargetInfo as GmcpTargetInfo } from "../gmcp/IRE/Target"; // Rename import
import "./TargetInfo.css"; // We'll create this CSS file next

interface TargetInfoProps {
  client: MudClient;
}

const TargetInfoDisplay: React.FC<TargetInfoProps> = ({ client }) => {
  const [target, setTarget] = useState<GmcpTargetInfo | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);

  const handleInfo = useCallback((info: GmcpTargetInfo) => {
    setTarget(info);
    setTargetId(info.id); // Keep ID consistent if info arrives
  }, []);

  const handleSet = useCallback((id: string) => {
    setTargetId(id);
    // Clear detailed info if only ID is set, or request new info
    setTarget((prev) => (prev?.id === id ? prev : null));
    // Optionally request full info when target is set via ID only
    // client.gmcpHandlers['IRE.Target']?.sendRequestInfo?.();
  }, []);

  useEffect(() => {
    client.on("targetInfo", handleInfo);
    client.on("targetSet", handleSet); // Listen for server-side set (e.g., tab target)

    // Request initial info if supported and target exists?
    // This depends on game logic - maybe only request when explicitly set.
    // if (client.gmcpHandlers['IRE.Target']) {
    //     client.gmcpHandlers['IRE.Target'].sendRequestInfo?.();
    // }

    return () => {
      client.off("targetInfo", handleInfo);
      client.off("targetSet", handleSet);
    };
  }, [client, handleInfo, handleSet]);

  const handleSetTarget = (id: string) => {
    // Allow manual setting via UI if needed (e.g., clicking a name)
    // This would likely come from another component, but demonstrates sending
    if (client.gmcpHandlers["IRE.Target"]) {
      (client.gmcpHandlers["IRE.Target"] as any).sendSet(id);
      setTargetId(id);
      setTarget(null); // Clear old info
    }
  };

  const headingId = "target-heading";

  if (!targetId && !target) {
    return (
      // Add role="region" and aria-labelledby
      <div
        className="target-info"
        role="region"
        aria-labelledby={headingId}
        aria-live="polite"
      >
        <h4 id={headingId}>Target</h4>
        <p>No target selected.</p>
      </div>
    );
  }

  return (
    <div
      className="target-info"
      role="region"
      aria-labelledby={headingId}
      aria-live="polite"
    >
      <h4 id={headingId}>Target</h4>
      {target ? (
        // Use definition list for better semantics
        <dl>
          <dt>Name:</dt>
          <dd>{target.short_desc}</dd>
          <dt>HP:</dt>
          <dd>{target.hpperc}</dd>
          <dt>ID:</dt>
          <dd>{target.id}</dd>
        </dl>
      ) : (
        <p>
          <strong>ID:</strong> {targetId} (Requesting info...)
        </p>
      )}
      {/* Example button to clear target */}
      {/* <button onClick={() => handleSetTarget('')}>Clear Target</button> */}
    </div>
  );
};

export default TargetInfoDisplay;

import { useEffect, useState, useRef, type RefObject } from 'react';
import { useFocusRefuge } from './useFocusRefuge';
import type { FileTransfers } from '../../fileTransfer/types';
import type { OwnerService } from '../../fileSharing/ownerService';
export function isV2Service(service: FileTransfers): service is OwnerService {
  return 'fileSharingV2' in service;
}
export default function V2Status({
  service,
  refuge,
}: {
  service: OwnerService;
  refuge: RefObject<HTMLElement>;
}) {
  const [, refresh] = useState(0);
  const panel = useRef<HTMLDivElement>(null);
  useFocusRefuge(panel, refuge);
  useEffect(() => service.subscribeStatus(() => refresh((n) => n + 1)), [service]);
  return (
    <div ref={panel}>
      <p role="status">{service.status}</p>
      {service.status === 'File transfers are active in another tab' && (
        <button
          type="button"
          onClick={() => {
            void service.activateThisTab();
          }}
        >
          Use this tab for file sharing
        </button>
      )}
      {!service.durable && (
        <p>
          Files use temporary memory in this tab. Reloading loses partial downloads. The total file
          limit is 100 MiB.
        </p>
      )}
      {service.evictionRisk && (
        <p role="status">
          Persistent storage was not granted. The browser may evict partial downloads.
        </p>
      )}
      {service.details().map((d) => {
        const name = service.transfers().find((t) => t.key === d.key)?.name ?? 'file';
        return (
          <div key={d.key}>
            <p role="status">
              {d.outcome === 'verified'
                ? `${name}: downloaded and verified; ready to save`
                : d.outcome === 'browser-download'
                  ? `${name}: handed to the browser for download`
                  : d.outcome === 'export-uncertain'
                    ? `${name}: download handoff uncertain; choose whether to save again`
                    : ''}
            </p>
            {d.saveError && <p role="alert">{d.saveError}</p>}
            {d.canRetry && (
              <button
                type="button"
                aria-label={`Retry ${name}`}
                onClick={() => service.retry(d.key)}
              >
                Retry {name}
              </button>
            )}
            {d.canSave && (
              <button
                type="button"
                onClick={() => {
                  void service.save(d.key);
                }}
                aria-label={`Save ${name}`}
              >
                Save {name}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

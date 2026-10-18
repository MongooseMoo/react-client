You are worker: react-client channel history memory bounds.

Parallel swarm warning: other agents may be editing unrelated leak families. Do not modify files outside the owned paths below. No oneliners.

Task:
Fix memory growth in the channel history hook.

Owned paths:
- src/hooks/useChannelHistory.tsx
- direct tests for useChannelHistory behavior

Evidence to gather:
- Current listener registration dependencies.
- Current buffer caps and duplication between all-channel and per-channel buffers.
- Current localStorage persistence volume.

Required outcome:
- Client listeners are stable and are not torn down/recreated on every message.
- In-memory history has a realistic bounded cap for the all buffer and per-channel buffers.
- localStorage persistence writes a bounded payload.
- Existing behavior needed by the UI remains intact.

Report:
- Files changed.
- Exact tests or type checks run.
- Any UI behavior that remains unverified.

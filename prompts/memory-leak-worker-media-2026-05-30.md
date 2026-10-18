You are worker: react-client media and cacophony API compatibility.

Parallel swarm warning: other agents may be editing unrelated leak families. Do not modify files outside the owned paths below. No oneliners.

Task:
Fix media lifecycle leaks in react-client and incorporate the newer Cacophony API where soundType is stringly typed rather than enum typed.

Owned paths:
- src/gmcp/Client/Media.ts
- tests or colocated tests that directly exercise Client.Media behavior

Evidence to gather:
- Current sound key behavior for load/play when data.url is missing.
- Whether finite sounds without an explicit end timer are retained after natural playback.
- Current Cacophony soundType imports/usages in this owned surface.

Required outcome:
- Loaded and played sound keys use the same resolved URL key.
- Replacing, stopping, explicit end timers, and natural playback completion release the react-client sound reference and call Cacophony cleanup.
- The code compiles against Cacophony's string soundType API.
- Add or update focused tests when practical.

Report:
- Files changed.
- Exact tests or type checks run.
- Any leak case not covered by code or tests.

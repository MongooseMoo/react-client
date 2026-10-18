You are worker: react-client client and haptics lifecycle cleanup.

Parallel swarm warning: other agents may be editing unrelated leak families. Do not modify files outside the owned paths below. No oneliners.

Task:
Fix lifecycle leaks caused by constructor listeners, preferences subscriptions, haptics backend registration, and GMCP haptics shutdown.

Owned paths:
- src/client.ts
- src/App.tsx
- src/HapticsService.ts
- src/gmcp/Client/Haptics.ts
- direct tests for those lifecycle surfaces

Evidence to gather:
- Current window focus/blur listener setup and shutdown path.
- Current preferencesStore subscribe unsubscribe behavior.
- Current haptics backend registration and disconnect behavior.
- Current sensor subscription cleanup behavior.

Required outcome:
- MudClient shutdown removes its window listeners and preferences subscription.
- Client shutdown closes owned network/media resources when possible.
- Haptics backends registered by App are unregistered or disconnected on App cleanup.
- GMCP haptics shutdown releases service listeners and sensor cleanup callbacks.

Report:
- Files changed.
- Exact tests or type checks run.
- Any cleanup behavior not safely changed.

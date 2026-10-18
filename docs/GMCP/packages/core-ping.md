# Connection latency

Uses the existing [IRE Core.Ping specification](https://nexus.ironrealms.com/GMCP).
The client sends `Core.Ping` without a body initially, then sends a JSON number
containing the rounded average RTT in milliseconds from its last five samples.
The server replies with `Core.Ping` without a body. No new GMCP package is needed.

Sampling starts after network GMCP negotiation and runs every five seconds,
including before login. Local WASM sessions do not start sampling. The status bar
shows the latest RTT; the connection store also exposes the rolling average.
RTT uses the browser's monotonic clock and includes the WebSocket proxy, network,
game scheduling and processing. It is neither one-way latency nor ICMP ping.

Only one ping is outstanding at a time, including resume/liveness probes. After
15 seconds without its response the reading becomes unavailable. A late reply
is drained before sending another request, because the protocol has no request
IDs. Disconnect, shutdown and GMCP disable clear measurements and timers.

The game stores each client's reported average on its telnet session and offers
`$gmcp_registry:match_package("Core"):connection_lag(player)` to gameplay code. It returns a map
with `status`, `rtt_ms`, `age_seconds` and `source`; unknown or older than 30 seconds
means `rtt_ms` is zero and must not be interpreted as a zero-lag connection.
Reports are client supplied telemetry, not proof for competitive compensation.

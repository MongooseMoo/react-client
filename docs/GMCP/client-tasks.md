# Client.Tasks

The Tasks tab is a task manager for the MOO's queued tasks: timers, forked
tasks, suspended tasks and tasks reading input. It shows the player's own
tasks; a wizard sees everyone's. It advertises `Client.Tasks 1` through
`Core.Supports`. The MOO (`$gmcp_tasks`) answers with the connection's
player's permissions, so it shows and kills exactly what `@tasks` and `@kill`
would for that player.

| Client sends | Server answers |
| --- | --- |
| `Client.Tasks.List {}` | `Client.Tasks.List {"now", "total", "groups": [{"key", "label", "owner", "kind", "count", "next"}]}` |
| `Client.Tasks.Group {"key"}` | `Client.Tasks.Group {"key", "now", "tasks": [{"id", "start", "owner", "kind", "label", "name", "line", "interval"}]}` |
| `Client.Tasks.Info {"id"}` | `Client.Tasks.Info {"id", "lines"}`: what `@task-info` shows (owner, verb, call stack) |
| `Client.Tasks.Kill {"ids"}` | `Client.Tasks.Result {"ok", "message"}`, then `List` |

- **Groups** are the tasks of one owner running the same thing, biggest
  first, as `@tasks` lists them. `label` is what they run: `object:verb`, or
  `verb on N objects` when one owner's timers call the same verb on several
  objects (the mob ticks, for example).
- **kind** is `once` (a `$task:after` timer), `every` (a `$task:every` timer;
  `interval` is its period in seconds), `task` (any other queued or suspended
  task; `line` is where it waits), `input` (reading input) or `exec` (waiting
  on a program).
- **Times** (`next`, `start`) are Unix seconds by the server's clock; `-1`
  while reading input or running a program. `now` is the server's clock when
  it answered, so the client counts down from the server's time, not its own.
  A task suspended with no time limit has a start far in the future and is
  shown as "suspended until resumed".
- **Kill** kills each id with the player's permissions. `ok` is 0 when some
  belonged to someone else; the message says how many were killed, had
  already finished, or were refused.

The client asks for `List` when the session is ready, and shows the Tasks tab
once the player has had a queued task in the session. While the tab is
showing it asks for `List` (and each opened group) again every ten seconds.
Telnet players have the same view with `@tasks`, `@tasks <n>` and
`@tasks <text>`.

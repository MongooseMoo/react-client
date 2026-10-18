# IRE and Utility Packages

These files exist under `src/gmcp/IRE/` and are included in
`KnownGMCPPackageMap`, but they are not registered by the current
`createConfiguredClient()` runtime setup. They are documented here so the GMCP
directory captures the whole code surface.

## `IRE.Composer`

Source: Achaea/IRE GMCP PDF.

Server to client:

- `IRE.Composer.Edit`: `{ "title": "...", "text": "..." }`

Client to server:

- `IRE.Composer.SetBuffer`: text string

The implementation emits `ire_composer_edit` and provides helpers for setting
the buffer and sending editor commands such as `*save` or `*quit`.

## `IRE.Rift`

Source: Achaea/IRE GMCP PDF.

Server to client:

- `IRE.Rift.List`: array of `{ "name": "...", "amount": "...", "desc": "..." }`
- `IRE.Rift.Change`: one item with the same shape

Client to server:

- `IRE.Rift.Request`

## `IRE.Tasks`

Source: Achaea/IRE GMCP PDF.

Server to client:

- `IRE.Tasks.List`: array of task objects
- `IRE.Tasks.Update`: one task object
- `IRE.Tasks.Completed`: one task object

Client to server:

- `IRE.Tasks.Request`

Task fields in the implementation are `id`, `name`, `desc`, `type`, `cmd`,
`status`, and `group`.

## `IRE.Time`

Source: Achaea/IRE GMCP PDF.

Server to client:

- `IRE.Time.List`
- `IRE.Time.Update`

Client to server:

- `IRE.Time.Request`

Time fields include `day`, `mon`, `month`, `year`, `hour`, `time`,
`moonphase`, and `daynight`.

## `IRE.Sound`

Source: IRE sound behavior, adapted to Mongoose media.

Server to client:

- `IRE.Sound.Play`
- `IRE.Sound.Stop`
- `IRE.Sound.Stopall`
- `IRE.Sound.Preload`

The implementation delegates to `Client.Media` by translating IRE sound payloads
into `Client.Media.Play`, `Stop`, and `Load` payloads.

## `IRE.Target`

Server to client:

- `IRE.Target.Set`: target id string
- `IRE.Target.Info`: `{ "id": "...", "name": "...", "health": 100, "level": 1 }`

Client to server:

- `IRE.Target.Set`
- `IRE.Target.RequestInfo`

`RequestInfo` is marked as hypothetical in the source.

## `IRE.Misc`

Server to client:

- `IRE.Misc.RemindVote`: URL string
- `IRE.Misc.Achievement`: array of achievements
- `IRE.Misc.URL`: array of URL objects
- `IRE.Misc.Tip`: tip string

Client to server:

- `IRE.Misc.Voted`: empty string

## `IRE.Display`

Server to client:

- `IRE.Display.FixedFont`: `start` or `stop`
- `IRE.Display.Ohmap`: `start` or `stop`

The implementation logs the display state.

## `IRE.CombatMessage`

The implementation sketches dynamic skill attack handling:

- `IRE.CombatMessage.<SkillName>` with `{ "source": "...", "target": "...",
  "text": "..." }`

The generic dynamic dispatcher is commented out, so this package is not active
without additional registration and dispatch work.


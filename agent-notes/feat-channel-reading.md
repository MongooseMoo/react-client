# feat/channel-reading: the server's channel list and per-channel reading

## Goal

Q, 2026-10-10: the server tells the client which channels exist, and the player sets per channel whether it is read aloud and in which voice. The MOO side and the whole design are in the hub: `~/projects/mongoose/agent-notes/channels.md` and `channels-todo/in-moo/01-channel-list.md`.

## State (2026-10-11)

Built on `origin/master` `e0155436`, committed on this branch, not pushed, no PR. `tsc --noEmit` clean; `vitest run` 137 files pass. Not looked at in a browser, and not tried against the live server: the server does not send `Comm.Channel.List`, `Start` or `End` until the MOO handoff is verified.

What it does:

- `Comm.Channel.List` is `[{name, caption, command, kind, listening}]` and fills `stores/channelsStore.ts`. A list of any other shape throws in `decodeChannelList`.
- `Comm.Channel.Start`/`End` set and clear `activeChannel` in that store. `client.ts` `emitMessage` leaves an output line alone when it arrives inside the pair and that channel has its own reading rule.
- `Comm.Channel.Text` speaks the message (`talker. text`, the channel's voice) when the channel has its own rule and the rule says so, and notifies when the channel's `notify` is on and the window is not focused.
- `preferences.channels[name]` is `{autoreadMode: "default" | "off" | "unfocused" | "all", voice, notify}`; storage version 2. Version 1's only entry (`sayto`) is dropped; `say_to_you` defaults to `notify: true`, which is what `Channel.ts` hard-coded before.
- Preferences has a Channels tab (`components/ChannelPreferences.tsx`): a table, one row per channel, listened-to channels first, then the rest of the server's list, then channels that sent text this session or have saved settings.
- Alt+Shift+R steps the current buffer's channel through the four reading modes and announces the result.

## Decisions and why

- A channel on "Same as Auto Read" is not spoken by the `Text` handler at all: Auto Read speaks its output line as before. So nothing changes for anyone who has not chosen a rule, with or without server support for `Start`/`End`.
- A channel with its own rule is spoken from `Text`, not from the output line: `Text` has the talker and the bare message, and it arrives whether or not the server marks the line.
- Settings stay in localStorage: voices differ per device.
- The buffer key cycles reading mode only. Voice and notify are in the tab.

## Known gap

Against a server that does not send `Start`/`End` for some sender, a channel with its own rule and global Auto Read on is spoken twice (once per path), and "Never" does not silence its output line. The handoff has the server mark every sender; check its results for any it left unmarked.

## Next step

1. Verify the MOO side (hub notes), then try this branch against the live server: the Channels tab lists real channels; Always/Never/Unfocused each behave on a real channel line with Auto Read on and off.
2. Listen to it with a screen reader: the table's row and column headers, and the Alt+Shift+R announcement.
3. Push and open the PR when Q says.

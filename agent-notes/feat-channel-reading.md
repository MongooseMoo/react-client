# feat/channel-reading: the server's channel list and per-channel reading

## Goal

Q, 2026-10-10: the server tells the client which channels exist, and the player sets per channel whether it is read aloud and in which voice. The MOO side and the whole design are in the hub: `~/projects/mongoose/agent-notes/channels.md` and `channels-todo/in-moo/01-channel-list.md`.

## State (2026-10-11)

Built on `origin/master` `e0155436`, committed on this branch, not pushed, no PR. `tsc --noEmit` clean; `vitest run` 137 files pass (2086 tests).

Tried in Chrome against the live server on 2026-10-11 (`vite` on 127.0.0.1:5199, logged in as a guest, `speechSynthesis.speak` replaced by a recorder so nothing sounded):

- The Channels tab listed the real channels: Mongoose first, then Say, Say to you, Page, Links, then the 18 others marked "not listening".
- Say on "Always", Auto Read off: one utterance, `Tangra_Guest. Always rule check.`, in the chosen voice.
- Say on "Always", Auto Read on: still one utterance for the say, and `look me` read by Auto Read in the default voice.
- Say on "Never", Auto Read on: the say line was printed and not spoken; `look me` was spoken.
- Alt+Shift+R on the `say` buffer stepped Never to "When the window is not focused" and announced it. On the first buffer (not a channel) it announced "Move to a channel to change how it is read."

That run found one bug, fixed here: a mode change and a voice change landing before the next render lost the first one, because the row merged into the settings it had rendered. It now merges into the stored settings (`ChannelPreferences.tsx`; test "keeps both changes when two land before the next render").

Not done: nobody has listened to it with a screen reader, and "When the window is not focused" was not tried with the window actually unfocused. The key's announcement uses the channel's name (`say`), not its caption (`Say`).

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

For a sender the server does not bracket with `Start`/`End`, a channel with its own rule and global Auto Read on is spoken twice (once per path), and "Never" does not silence its output line. Seen live on the wire as bracketed: channel talk, say, page, pasted links. Bracketed in the code and not seen live: directed say, games, fediverse notices. Not bracketed: neural-interface channels (`#1893:gmcp_publish`). `$wizinfo_chan` sends no `Text` at all, so a rule set on it does nothing.

## Next step

1. Listen to it with a screen reader: the table's row and column headers, and the Alt+Shift+R announcement.
2. Push and open the PR when Q says.

# GMCP Documentation

This directory is the canonical GMCP reference for the Mongoose web client.
It captures the public specifications that were pulled down, the packages
implemented in `src/gmcp`, and the Mongoose-specific extensions that the
server may use.

## Contents

- [Upstream specifications](upstream/README.md) lists the downloaded public
  GMCP sources, and [the upstream spec index](upstream/spec-index.md) links to
  the Markdown copy of each pulled spec.
- [Protocol framing](protocol-framing.md) documents telnet option 201,
  dispatch, JSON handling, and startup negotiation as implemented here.
- [Package inventory](package-inventory.md) lists every registered GMCP package
  and whether it is upstream, an upstream extension, or a Mongoose protocol.
- [Mongoose additions](mongoose-additions.md) summarizes what Mongoose adds to
  the public protocols.

## Package References

- [Core and Auth](packages/core-and-auth.md)
- [Character, Room, Comm, Group, Logging, Redirect](packages/char-room-comm.md)
- [Client.Media](packages/client-media.md)
- [Client.Keystrokes](packages/client-keystrokes.md)
- [Client.Spatial](packages/client-spatial.md)
- [Client.Midi](packages/client-midi.md)
- [Client.Haptics](packages/client-haptics.md)
- [Client.FileTransfer](packages/client-file-transfer.md)
- [Client.WebPush](packages/client-webpush.md)
- [Client.Html, Client.File, Client.Speech](packages/client-html-file-speech.md)
- [IRE and utility packages](packages/ire-and-utility.md)

## Source of Truth

The implementation source is `src/gmcp/`. Default runtime registration and
application event wiring live in `src/createConfiguredClient.ts`; telnet GMCP
framing is parsed by `src/telnet.ts` and dispatched by `src/gmcp/session.ts`.

GMCP message names are matched by splitting the incoming package string at the
last dot. For example, `Client.Media.Play` dispatches to the registered
`Client.Media` package and then to that package's class-local message registry.
The registry entry owns the wire suffix, direction, payload codec, default
package-local event name, and generated outbound `sendX` method. Application
events are wired from those package-local events outside the protocol package.

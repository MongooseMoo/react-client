# Upstream GMCP Specifications

This directory contains the public GMCP material pulled down for comparison.
Read [spec-index.md](spec-index.md) first; it links to the Markdown copy of
each downloaded spec.

## Downloaded Sources

- `mudstandards/`: the MUD Standards GMCP base page plus every package page
  linked from the GMCP package index at download time. Each raw `.html` file has
  a generated `.md` file beside it.
- `mudstandards-manifest.json`: URL, local file, and status for the MUD
  Standards crawl.
- `ire/Achaea_GMCP_Spec_20140311.md`: Markdown extraction of the Achaea/IRE
  GMCP specification PDF. The raw PDF is retained beside it.
- `mudlet/MUD_Client_Media_Protocol.md`: Markdown conversion of the Mudlet MUD
  Client Media Protocol page, which is the source behind `Client.Media`. The raw
  HTML is retained beside it.
- `external-manifest.json`: URL and local file metadata for the non-index
  downloads.

## Coverage Notes

The MUD Standards package index included the base protocol and these package
families: `beip`, `char`, `char.affliction`, `char.defences`, `char.items`,
`char.login`, `char.skills`, `client`, `client.media`, `comm`, `config`,
`core`, `Core.Hello`, `external.discord`, `gmcp.overland`, `group`,
`loci.hotkey`, `loci.menu`, `MSDP`, `mudstandards.channel`,
`mudstandards.char`, `mudstandards.frame`, `mudstandards.resources`,
`mudstandards.room`, `mudstandards.tilemap`, `room`, and `webview`.

Mongoose implements some of those upstream packages, implements some IRE
packages from the Achaea PDF, and adds several private `Client.*` and `Comm.*`
packages that are not public GMCP standards.





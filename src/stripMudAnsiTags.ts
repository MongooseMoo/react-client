import stripAnsi from "strip-ansi";

// GMCP payloads never carry real control characters (those only appear in the
// regular telnet output stream). Instead this MUD's "ANSI Player Class"
// writes its own bracketed tag vocabulary - e.g. "[red]", "[bold]",
// "[normal]" - directly into GMCP text fields (room/item/player names, etc).
// Contexts that render GMCP text as plain text (document.title, sidebar
// headings) need both forms stripped; stripAnsi handles real escapes too, as
// defense-in-depth against a server that does send them.
//
// The result is trimmed: markup often brackets the whole value ("[red]Outer
// Rim[normal]") but sometimes sits outside the padding, and callers treat an
// empty result as "no value" so they can fall back.
const MUD_ANSI_TAGS = [
  "red", "green", "yellow", "blue", "purple", "cyan", "gray", "white",
  "magenta", "grey",
  "bold", "unbold", "bright", "unbright",
  "blink", "unblink",
  "underline", "inverse",
  "beep",
  "normal",
];
const MUD_ANSI_TAG_REGEX = new RegExp(`\\[(?:${MUD_ANSI_TAGS.join("|")})\\]`, "gi");

export function stripMudAnsiTags(text: string): string {
  return stripAnsi(text).replace(MUD_ANSI_TAG_REGEX, "").trim();
}

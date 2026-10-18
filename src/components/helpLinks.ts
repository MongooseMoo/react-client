/** A run of help text; with a topic, it is a `help <topic>` phrase that looks that topic up. */
export interface HelpLinePiece {
  text: string;
  topic?: string;
}

const PHRASE_START = /(?<![\w@$-])help /g;
const TRAILING_PUNCTUATION = /[.,;:!?)"']+$/;
const SEARCH = /^search [^,;]+/;

function isTopicEnd(text: string, index: number): boolean {
  return index === text.length || /[\s.,;:!?)"']/.test(text[index]);
}

/** The topic named at the start of `rest`, the text after `help `. */
function topicAt(rest: string, choices: readonly string[]): string | undefined {
  const choice = [...choices]
    .sort((a, b) => b.length - a.length)
    .find((name) => name !== "" && rest.startsWith(name) && isTopicEnd(rest, name.length));
  if (choice) return choice;
  const phrase = SEARCH.exec(rest)?.[0] ?? /^\S+/.exec(rest)?.[0];
  return phrase?.replace(TRAILING_PUNCTUATION, "").trimEnd() || undefined;
}

/** Splits a help line into plain text and `help <topic>` phrases, keeping every character. */
export function splitHelpLine(line: string, choices: readonly string[]): HelpLinePiece[] {
  const pieces: HelpLinePiece[] = [];
  let consumed = 0;
  for (const match of line.matchAll(PHRASE_START)) {
    const start = match.index ?? 0;
    if (start < consumed) continue;
    const topic = topicAt(line.slice(start + match[0].length), choices);
    if (!topic) continue;
    if (start > consumed) pieces.push({ text: line.slice(consumed, start) });
    const text = `${match[0]}${topic}`;
    pieces.push({ text, topic });
    consumed = start + text.length;
  }
  if (consumed < line.length || pieces.length === 0) pieces.push({ text: line.slice(consumed) });
  return pieces;
}

// `//` comments are not MOO syntax. LambdaCore-derived cores (behind the
// `//_comments` programmer option) rewrite a line holding only `// text` into
// the string statement `"text";` before compiling, and show such statements as
// `// text` when opening a verb. The editor does the same rewrite itself so the
// comments work for every player, whatever their option says.

// The core matches `^ *// ?%(.*%)$`; tabs are accepted here too.
const LINE_COMMENT = /^([ \t]*)\/\/ ?(.*)$/;

// A line that is nothing but one string literal statement.
const STRING_STATEMENT = /^([ \t]*)"((?:[^"\\]|\\.)*)";[ \t]*$/;

/** `// text` lines become `"text";`, the form `set_verb_code()` compiles. */
export function lineCommentsToStringStatements(lines: readonly string[]): string[] {
  return lines.map((line) => {
    const match = LINE_COMMENT.exec(line);
    if (!match) {
      return line;
    }
    const [, indent, text] = match;
    return `${indent}"${text.replace(/[\\"]/g, '\\$&')}";`;
  });
}

/** `"text";` lines become `// text`, the inverse of the above. */
export function stringStatementsToLineComments(lines: readonly string[]): string[] {
  return lines.map((line) => {
    const match = STRING_STATEMENT.exec(line);
    if (!match) {
      return line;
    }
    const [, indent, escaped] = match;
    const text = escaped.replace(/\\(.)/g, '$1');
    return text === '' ? `${indent}//` : `${indent}// ${text}`;
  });
}

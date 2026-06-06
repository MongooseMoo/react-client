import { MOO_BLOCKS, MOO_CLOSE_KEYWORDS, MOO_MIDDLE_KEYWORDS } from './contract';
import { firstMooKeyword, maskMooSource } from './scanner';

export type MooFormattingOptions = {
  tabSize: number;
  insertSpaces: boolean;
};

export function formatMooCode(source: string, options: MooFormattingOptions): string {
  const eol = detectEol(source);
  const lines = source.split(/\r\n|\r|\n/);
  const maskedLines = maskMooSource(source).split(/\r\n|\r|\n/);
  const indentUnit = options.insertSpaces ? ' '.repeat(options.tabSize) : '\t';
  let indentLevel = 0;

  const formattedLines = lines.map((line, index) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      return '';
    }

    const keyword = firstMooKeyword(maskedLines[index] ?? '');
    const normalizedKeyword = keyword?.word.toLowerCase() ?? '';
    const isMiddleKeyword = normalizedKeyword in MOO_MIDDLE_KEYWORDS;
    const isCloseKeyword = normalizedKeyword in MOO_CLOSE_KEYWORDS;

    if (isMiddleKeyword || isCloseKeyword) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    const formattedLine = `${indentUnit.repeat(indentLevel)}${trimmedLine}`;

    if (normalizedKeyword in MOO_BLOCKS || isMiddleKeyword) {
      indentLevel += 1;
    }

    return formattedLine;
  });

  return formattedLines.join(eol);
}

function detectEol(source: string): string {
  const match = /\r\n|\r|\n/.exec(source);
  return match?.[0] ?? '\n';
}

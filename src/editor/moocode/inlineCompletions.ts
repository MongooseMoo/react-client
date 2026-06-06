import { MOO_BLOCKS, type MooBlockKind } from './contract';
import { firstMooKeyword, maskMooSource, type MooSourcePosition } from './scanner';
import type { MonacoRange } from './language';

export type MooInlineCompletion = {
  insertText: string;
  range: MonacoRange;
};

export function getMooInlineCompletions(
  source: string,
  position: MooSourcePosition,
): MooInlineCompletion[] {
  const lines = source.split(/\r\n|\r|\n/);
  const maskedLines = maskMooSource(source).split(/\r\n|\r|\n/);
  const line = lines[position.lineNumber - 1];
  const maskedLine = maskedLines[position.lineNumber - 1];
  if (line === undefined || maskedLine === undefined || position.column !== line.length + 1) {
    return [];
  }

  const keyword = firstMooKeyword(maskedLine);
  if (!keyword || !isMooBlockKind(keyword.word.toLowerCase())) {
    return [];
  }

  const blockKind = keyword.word.toLowerCase() as MooBlockKind;
  const closeKeyword = MOO_BLOCKS[blockKind].close;
  if (nextMeaningfulLineStartsWith(maskedLines, position.lineNumber, closeKeyword)) {
    return [];
  }

  const currentIndent = /^\s*/.exec(line)?.[0] ?? '';
  const indentUnit = currentIndent.includes('\t') ? '\t' : '  ';

  return [
    {
      insertText: `\n${currentIndent}${indentUnit}\n${currentIndent}${closeKeyword}`,
      range: {
        startLineNumber: position.lineNumber,
        startColumn: position.column,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      },
    },
  ];
}

function nextMeaningfulLineStartsWith(
  maskedLines: string[],
  currentLineNumber: number,
  closeKeyword: string,
): boolean {
  for (let index = currentLineNumber; index < maskedLines.length; index += 1) {
    const line = maskedLines[index]?.trim();
    if (!line) {
      continue;
    }

    return line.toLowerCase().startsWith(closeKeyword);
  }

  return false;
}

function isMooBlockKind(value: string): value is MooBlockKind {
  return value in MOO_BLOCKS;
}

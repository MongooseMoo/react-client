export type MooSourcePosition = {
  lineNumber: number;
  column: number;
};

export type MooKeywordMatch = {
  word: string;
  startColumn: number;
  endColumn: number;
};

export function maskMooSource(source: string): string {
  let inString = false;
  let inBlockComment = false;
  let escaped = false;
  const characters = source.split('');

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];

    if (inBlockComment) {
      maskCharacter(characters, index);

      if (character === '*' && next === '/') {
        maskCharacter(characters, index + 1);
        inBlockComment = false;
        index += 1;
      }

      continue;
    }

    if (inString) {
      maskCharacter(characters, index);

      if (escaped) {
        escaped = false;
        continue;
      }

      if (character === '\\') {
        escaped = true;
        continue;
      }

      if (character === '"') {
        inString = false;
      }

      continue;
    }

    if (character === '/' && next === '/') {
      for (let commentIndex = index; commentIndex < source.length; commentIndex += 1) {
        const commentCharacter = source[commentIndex];
        if (commentCharacter === '\r' || commentCharacter === '\n') {
          break;
        }
        characters[commentIndex] = ' ';
      }
      continue;
    }

    if (character === '/' && next === '*') {
      characters[index] = ' ';
      characters[index + 1] = ' ';
      inBlockComment = true;
      index += 1;
      continue;
    }

    if (character === '"') {
      characters[index] = ' ';
      inString = true;
    }
  }

  return characters.join('');
}

export function firstMooKeyword(code: string): MooKeywordMatch | null {
  const match = /^\s*([A-Za-z_][\w$]*)/.exec(code);
  if (!match?.[1]) {
    return null;
  }

  const startColumn = match.index + match[0].indexOf(match[1]) + 1;
  return {
    word: match[1],
    startColumn,
    endColumn: startColumn + match[1].length,
  };
}

export function offsetAtMooPosition(source: string, position: MooSourcePosition): number {
  let lineNumber = 1;
  let column = 1;

  for (let index = 0; index < source.length; index += 1) {
    if (lineNumber === position.lineNumber && column === position.column) {
      return index;
    }

    const character = source[index];
    if (character === '\n') {
      lineNumber += 1;
      column = 1;
      continue;
    }

    if (character !== '\r') {
      column += 1;
    }
  }

  return source.length;
}

export function positionAtMooOffset(source: string, offset: number): MooSourcePosition {
  let lineNumber = 1;
  let column = 1;

  for (let index = 0; index < offset; index += 1) {
    if (source[index] === '\n') {
      lineNumber += 1;
      column = 1;
      continue;
    }

    if (source[index] !== '\r') {
      column += 1;
    }
  }

  return { lineNumber, column };
}

function maskCharacter(characters: string[], index: number): void {
  if (characters[index] !== '\r' && characters[index] !== '\n') {
    characters[index] = ' ';
  }
}

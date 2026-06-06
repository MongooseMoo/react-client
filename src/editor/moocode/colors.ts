import type { MonacoRange } from './language';

export type MooColor = {
  red: number;
  green: number;
  blue: number;
  alpha: number;
};

export type MooColorInformation = {
  range: MonacoRange;
  color: MooColor;
};

export type MooColorPresentation = {
  label: string;
  textEdit: {
    range: MonacoRange;
    text: string;
  };
};

type StringSpan = {
  startOffset: number;
  endOffset: number;
};

const HEX_COLOR_PATTERN = /#(?:[0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})\b/g;

export function collectMooDocumentColors(source: string): MooColorInformation[] {
  const colors: MooColorInformation[] = [];

  for (const span of collectStringSpans(source)) {
    const stringContent = source.slice(span.startOffset, span.endOffset);
    for (const match of stringContent.matchAll(HEX_COLOR_PATTERN)) {
      const text = match[0];
      const startOffset = span.startOffset + match.index;
      const color = parseHexColor(text);
      if (!color) {
        continue;
      }

      colors.push({
        range: rangeFromOffsets(source, startOffset, startOffset + text.length),
        color,
      });
    }
  }

  return colors;
}

export function getMooColorPresentations(
  colorInformation: MooColorInformation,
): MooColorPresentation[] {
  const label = formatHexColor(colorInformation.color);

  return [
    {
      label,
      textEdit: {
        range: colorInformation.range,
        text: label,
      },
    },
  ];
}

function collectStringSpans(source: string): StringSpan[] {
  const spans: StringSpan[] = [];
  let inBlockComment = false;
  let inString = false;
  let stringStartOffset = 0;
  let escaped = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];

    if (inBlockComment) {
      if (character === '*' && next === '/') {
        inBlockComment = false;
        index += 1;
      }
      continue;
    }

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (character === '\\') {
        escaped = true;
        continue;
      }

      if (character === '"') {
        spans.push({ startOffset: stringStartOffset, endOffset: index });
        inString = false;
      }
      continue;
    }

    if (character === '/' && next === '/') {
      index = skipLineComment(source, index);
      continue;
    }

    if (character === '/' && next === '*') {
      inBlockComment = true;
      index += 1;
      continue;
    }

    if (character === '"') {
      inString = true;
      stringStartOffset = index + 1;
      escaped = false;
    }
  }

  return spans;
}

function skipLineComment(source: string, startOffset: number): number {
  const newlineOffset = source.indexOf('\n', startOffset + 2);
  return newlineOffset < 0 ? source.length : newlineOffset;
}

function parseHexColor(value: string): MooColor | null {
  if (/^#[0-9A-Fa-f]{3}$/.test(value)) {
    return {
      red: parseInt(value[1] + value[1], 16) / 255,
      green: parseInt(value[2] + value[2], 16) / 255,
      blue: parseInt(value[3] + value[3], 16) / 255,
      alpha: 1,
    };
  }

  if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
    return {
      red: parseInt(value.slice(1, 3), 16) / 255,
      green: parseInt(value.slice(3, 5), 16) / 255,
      blue: parseInt(value.slice(5, 7), 16) / 255,
      alpha: 1,
    };
  }

  return null;
}

function formatHexColor(color: MooColor): string {
  return `#${toHexChannel(color.red)}${toHexChannel(color.green)}${toHexChannel(color.blue)}`;
}

function toHexChannel(value: number): string {
  return Math.round(clamp(value) * 255)
    .toString(16)
    .padStart(2, '0');
}

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function rangeFromOffsets(source: string, startOffset: number, endOffset: number): MonacoRange {
  const start = positionAt(source, startOffset);
  const end = positionAt(source, endOffset);

  return {
    startLineNumber: start.lineNumber,
    startColumn: start.column,
    endLineNumber: end.lineNumber,
    endColumn: end.column,
  };
}

function positionAt(source: string, offset: number): { lineNumber: number; column: number } {
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

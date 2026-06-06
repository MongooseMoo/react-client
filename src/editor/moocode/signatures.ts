import { BUILTIN_FUNCTIONS } from './contract';
import { maskMooSource, offsetAtMooPosition, type MooSourcePosition } from './scanner';

export type MooCallContext = {
  functionName: string;
  activeParameter: number;
};

export type MooParameterInformation = {
  label: string;
  documentation?: string;
};

export type MooSignatureInformation = {
  label: string;
  documentation: string;
  parameters: MooParameterInformation[];
};

export type MooSignatureHelp = {
  signatures: MooSignatureInformation[];
  activeSignature: number;
  activeParameter: number;
};

type SignatureDefinition = {
  parameters: MooParameterInformation[];
  documentation: string;
};

const BUILTIN_SIGNATURES: Partial<Record<(typeof BUILTIN_FUNCTIONS)[number], SignatureDefinition>> =
  {
    listappend: {
      parameters: [{ label: 'list' }, { label: 'value' }],
      documentation: 'Returns a new list with value appended.',
    },
    listdelete: {
      parameters: [{ label: 'list' }, { label: 'index' }],
      documentation: 'Returns a new list with the item at index removed.',
    },
    listinsert: {
      parameters: [{ label: 'list' }, { label: 'value' }, { label: 'index' }],
      documentation: 'Returns a new list with value inserted at index.',
    },
    listset: {
      parameters: [{ label: 'list' }, { label: 'value' }, { label: 'index' }],
      documentation: 'Returns a new list with the item at index replaced.',
    },
    move: {
      parameters: [{ label: 'object' }, { label: 'destination' }],
      documentation: 'Moves object to destination.',
    },
    notify: {
      parameters: [{ label: 'player' }, { label: 'text' }],
      documentation: 'Sends text to a connected player.',
    },
    pass: {
      parameters: [{ label: 'args' }],
      documentation: 'Calls the inherited verb implementation.',
    },
    raise: {
      parameters: [{ label: 'error' }, { label: 'message' }, { label: 'value' }],
      documentation: 'Raises a MOO error with optional message and value.',
    },
    set_verb_code: {
      parameters: [{ label: 'object' }, { label: 'verb' }, { label: 'code' }],
      documentation: 'Replaces the source code for a verb.',
    },
    suspend: {
      parameters: [{ label: 'seconds' }],
      documentation: 'Suspends the current task for seconds.',
    },
    toliteral: {
      parameters: [{ label: 'value' }],
      documentation: 'Converts a MOO value to a literal source representation.',
    },
    tostr: {
      parameters: [{ label: 'value' }],
      documentation: 'Converts a MOO value to a string.',
    },
    valid: {
      parameters: [{ label: 'object' }],
      documentation: 'Returns whether object is a valid object reference.',
    },
    verb_code: {
      parameters: [{ label: 'object' }, { label: 'verb' }],
      documentation: 'Returns the source code for a verb.',
    },
    verb_info: {
      parameters: [{ label: 'object' }, { label: 'verb' }],
      documentation: 'Returns metadata for a verb.',
    },
  };

const BUILTIN_NAMES = new Set<string>(BUILTIN_FUNCTIONS);

export function findMooCallContext(
  source: string,
  position: MooSourcePosition,
): MooCallContext | null {
  const maskedSource = maskMooSource(source);
  const offset = offsetAtMooPosition(maskedSource, position);
  let activeParameter = 0;
  let nestedDepth = 0;

  for (let index = offset - 1; index >= 0; index -= 1) {
    const character = maskedSource[index];

    if (character === ')') {
      nestedDepth += 1;
      continue;
    }

    if (character === '(') {
      if (nestedDepth > 0) {
        nestedDepth -= 1;
        continue;
      }

      const functionName = readIdentifierBefore(maskedSource, index);
      if (!functionName) {
        return null;
      }

      const normalizedName = functionName.toLowerCase();
      if (!BUILTIN_NAMES.has(normalizedName)) {
        return null;
      }

      return {
        functionName: normalizedName,
        activeParameter,
      };
    }

    if (character === ',' && nestedDepth === 0) {
      activeParameter += 1;
    }
  }

  return null;
}

export function getMooSignatureHelp(
  source: string,
  position: MooSourcePosition,
): MooSignatureHelp | null {
  const context = findMooCallContext(source, position);
  if (!context) {
    return null;
  }

  const definition = BUILTIN_SIGNATURES[context.functionName as keyof typeof BUILTIN_SIGNATURES];
  if (!definition) {
    return null;
  }

  return {
    signatures: [
      {
        label: `${context.functionName}(${definition.parameters
          .map((parameter) => parameter.label)
          .join(', ')})`,
        documentation: definition.documentation,
        parameters: definition.parameters,
      },
    ],
    activeSignature: 0,
    activeParameter: Math.min(context.activeParameter, definition.parameters.length - 1),
  };
}

function readIdentifierBefore(source: string, openParenIndex: number): string | null {
  let endIndex = openParenIndex - 1;
  while (endIndex >= 0 && /\s/.test(source[endIndex])) {
    endIndex -= 1;
  }

  let startIndex = endIndex;
  while (startIndex >= 0 && /[A-Za-z0-9_$]/.test(source[startIndex])) {
    startIndex -= 1;
  }

  const identifier = source.slice(startIndex + 1, endIndex + 1);
  return /^[A-Za-z_][\w$]*$/.test(identifier) ? identifier : null;
}

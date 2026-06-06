import { BUILTIN_FUNCTIONS, MOO_IDENTIFIER_PATTERN_SOURCE } from './contract';
import { formatMooBuiltinArity, getMooBuiltinMetadata } from './builtins';
import { maskMooSource, offsetAtMooPosition, type MooSourcePosition } from './scanner';

type MooBuiltinCallContext = {
  functionName: string;
  activeParameter: number;
};

type MooVerbCallContext = {
  callKind: 'verb';
  receiverName: string;
  functionName: string;
  activeParameter: number;
};

export type MooCallContext = MooBuiltinCallContext | MooVerbCallContext;

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
  label?: string;
  parameters: MooParameterInformation[];
  documentation: string;
};

const GENERIC_BUILTIN_DOCUMENTATION = 'ToastStunt builtin function.';

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
const VALID_IDENTIFIER_PATTERN = new RegExp(`^${MOO_IDENTIFIER_PATTERN_SOURCE}$`);
const IDENTIFIER_CHARACTER_PATTERN = /^[A-Za-z0-9_]$/;

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

      const verbCall = readStaticVerbCallBefore(maskedSource, index);
      if (verbCall) {
        return {
          callKind: 'verb',
          receiverName: verbCall.receiverName,
          functionName: verbCall.verbName,
          activeParameter,
        };
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

  if ('callKind' in context && context.callKind === 'verb') {
    const definition = getVerbSignatureDefinition(context);
    return {
      signatures: [definition],
      activeSignature: 0,
      activeParameter: Math.min(context.activeParameter, definition.parameters.length - 1),
    };
  }

  const definition = getSignatureDefinition(context.functionName, context.activeParameter + 1);
  if (!definition) {
    return null;
  }

  return {
    signatures: [
      {
        label:
          definition.label ?? formatSignatureLabel(context.functionName, definition.parameters),
        documentation: definition.documentation,
        parameters: definition.parameters,
      },
    ],
    activeSignature: 0,
    activeParameter:
      definition.parameters.length > 0
        ? Math.min(context.activeParameter, definition.parameters.length - 1)
        : 0,
  };
}

export function getMooBuiltinSignature(
  functionName: string,
  minimumParameterCount = 1,
): MooSignatureInformation | null {
  const normalizedName = functionName.toLowerCase();
  const definition = getSignatureDefinition(normalizedName, minimumParameterCount);
  if (!definition) {
    return null;
  }

  return {
    label: definition.label ?? formatSignatureLabel(normalizedName, definition.parameters),
    documentation: definition.documentation,
    parameters: definition.parameters,
  };
}

function getVerbSignatureDefinition(context: MooVerbCallContext): MooSignatureInformation {
  const parameterCount = Math.max(context.activeParameter + 1, 1);
  const parameters = Array.from({ length: parameterCount }, (_, index) => ({
    label: `arg${index + 1}`,
  }));

  return {
    label: `${context.receiverName}:${context.functionName}(${parameters
      .map((parameter) => parameter.label)
      .join(', ')})`,
    documentation: 'MOO verb call. Arguments are available to the target verb as args.',
    parameters,
  };
}

function getSignatureDefinition(
  normalizedName: string,
  minimumParameterCount: number,
): SignatureDefinition | null {
  const definition = BUILTIN_SIGNATURES[normalizedName as keyof typeof BUILTIN_SIGNATURES];
  if (definition) {
    return definition;
  }

  const metadata = getMooBuiltinMetadata(normalizedName);
  if (!metadata) {
    return null;
  }

  const parameterCount =
    metadata.maxArgs >= 0 ? metadata.maxArgs : Math.max(metadata.minArgs, minimumParameterCount);
  const parameters = Array.from({ length: parameterCount }, (_, index) => {
    const type = metadata.parameterTypes[index] ?? 'any';
    const optional = index >= metadata.minArgs;
    return {
      label: `arg${index + 1}${optional ? '?' : ''}`,
      documentation: `Registered ToastStunt type: ${type}.${optional ? ' Optional.' : ''}`,
    };
  });
  const parameterTypeList = metadata.parameterTypes.length
    ? metadata.parameterTypes.join(', ')
    : 'none registered';

  return {
    label: `${normalizedName}(${parameters
      .map((parameter, index) => `${parameter.label}: ${metadata.parameterTypes[index] ?? 'any'}`)
      .join(', ')})`,
    parameters,
    documentation: [
      GENERIC_BUILTIN_DOCUMENTATION,
      `Registered arity: ${formatMooBuiltinArity(metadata)}.`,
      `Parameter types: ${parameterTypeList}.`,
    ].join('\n'),
  };
}

function formatSignatureLabel(
  functionName: string,
  parameters: readonly MooParameterInformation[],
): string {
  return `${functionName}(${parameters.map((parameter) => parameter.label).join(', ')})`;
}

function readIdentifierBefore(source: string, openParenIndex: number): string | null {
  return readIdentifierSpanBefore(source, openParenIndex)?.name ?? null;
}

function readIdentifierSpanBefore(
  source: string,
  openParenIndex: number,
): { name: string; startIndex: number; endIndex: number } | null {
  let endIndex = openParenIndex - 1;
  while (endIndex >= 0 && /\s/.test(source[endIndex])) {
    endIndex -= 1;
  }

  let startIndex = endIndex;
  while (startIndex >= 0 && IDENTIFIER_CHARACTER_PATTERN.test(source[startIndex])) {
    startIndex -= 1;
  }

  const identifier = source.slice(startIndex + 1, endIndex + 1);
  return VALID_IDENTIFIER_PATTERN.test(identifier)
    ? { name: identifier, startIndex: startIndex + 1, endIndex: endIndex + 1 }
    : null;
}

function readStaticVerbCallBefore(
  source: string,
  openParenIndex: number,
): { receiverName: string; verbName: string } | null {
  const verb = readIdentifierSpanBefore(source, openParenIndex);
  if (!verb) {
    return null;
  }

  let colonIndex = verb.startIndex - 1;
  while (colonIndex >= 0 && /\s/.test(source[colonIndex])) {
    colonIndex -= 1;
  }

  if (source[colonIndex] !== ':') {
    return null;
  }

  const receiverName = readStaticVerbReceiverBefore(source, colonIndex);
  return receiverName ? { receiverName, verbName: verb.name } : null;
}

function readStaticVerbReceiverBefore(source: string, colonIndex: number): string | null {
  let endIndex = colonIndex - 1;
  while (endIndex >= 0 && /\s/.test(source[endIndex])) {
    endIndex -= 1;
  }

  if (endIndex < 0) {
    return null;
  }

  if (/\d/.test(source[endIndex])) {
    let startIndex = endIndex;
    while (startIndex >= 0 && /\d/.test(source[startIndex])) {
      startIndex -= 1;
    }

    if (source[startIndex] === '-') {
      startIndex -= 1;
    }

    if (source[startIndex] !== '#') {
      return null;
    }

    const receiver = source.slice(startIndex, endIndex + 1);
    return /^#-?\d+$/.test(receiver) ? receiver : null;
  }

  if (IDENTIFIER_CHARACTER_PATTERN.test(source[endIndex])) {
    let startIndex = endIndex;
    while (startIndex >= 0 && IDENTIFIER_CHARACTER_PATTERN.test(source[startIndex])) {
      startIndex -= 1;
    }

    if (source[startIndex] === '$') {
      startIndex -= 1;
    }

    const receiver = source.slice(startIndex + 1, endIndex + 1);
    return /^(?:[A-Za-z_][A-Za-z0-9_]*|\$[A-Za-z_][A-Za-z0-9_]*)$/.test(receiver)
      ? receiver
      : null;
  }

  return null;
}

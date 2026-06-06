import { describe, expect, it } from 'vitest';
import { MOO_BUILTIN_NAMES } from './builtins';
import {
  BUILTIN_FUNCTIONS,
  ERROR_CONSTANTS,
  MOO_BLOCKS,
  MOO_CLOSE_KEYWORDS,
  MOO_IDENTIFIER_PATTERN_SOURCE,
  MOO_INDENT_OPEN_KEYWORDS,
  MOO_LANGUAGE_ID,
  MOO_SESSION_TYPES,
  MOO_SYSTEM_REFERENCE_PATTERN_SOURCE,
  STATEMENT_KEYWORDS,
  SYSTEM_REFERENCES,
} from './contract';

describe('MOO language contract', () => {
  it('owns the stable Monaco language identity and session type mapping inputs', () => {
    expect(MOO_LANGUAGE_ID).toBe('moocode');
    expect(MOO_SESSION_TYPES).toContain('moo-code');
    expect(MOO_SESSION_TYPES).toContain('lambdamoo');
  });

  it('owns shared syntax vocabulary used by highlighting and diagnostics', () => {
    expect(STATEMENT_KEYWORDS).toContain('if');
    expect(STATEMENT_KEYWORDS).toContain('endtry');
    expect(ERROR_CONSTANTS).toContain('E_PERM');
    expect(BUILTIN_FUNCTIONS).toContain('notify');
    expect(SYSTEM_REFERENCES).toContain('$string_utils');
  });

  it('owns the shared MOO identifier shape', () => {
    const identifier = new RegExp(`^${MOO_IDENTIFIER_PATTERN_SOURCE}$`);
    const systemReference = new RegExp(`^${MOO_SYSTEM_REFERENCE_PATTERN_SOURCE}$`);

    expect(identifier.test('valid_name9')).toBe(true);
    expect(identifier.test('_scratch')).toBe(true);
    expect(identifier.test('9bad')).toBe(false);
    expect(identifier.test('bad$name')).toBe(false);
    expect(systemReference.test('$string_utils')).toBe(true);
    expect(systemReference.test('$room$extra')).toBe(false);
  });

  it('keeps block ownership in one contract instead of duplicating parser facts', () => {
    expect(MOO_BLOCKS.if.close).toBe('endif');
    expect(MOO_BLOCKS.if.middle).toEqual(['elseif', 'else']);
    expect(MOO_BLOCKS.for.isLoop).toBe(true);
    expect(MOO_BLOCKS.try.middle).toEqual(['except', 'finally']);
    expect(MOO_CLOSE_KEYWORDS.endtry).toBe('try');
    expect(MOO_INDENT_OPEN_KEYWORDS).toContain('finally');
  });

  it('tracks ToastStunt builtin registrations beyond the classic core set', () => {
    expect(BUILTIN_FUNCTIONS).toEqual(
      expect.arrayContaining([
        'argon2',
        'buffered_output_length',
        'call_function',
        'decode_base64',
        'encode_binary',
        'file_open',
        'generate_json',
        'mapkeys',
        'parse_ansi',
        'pcre_match',
        'sqlite_query',
        'task_local',
        'thread_pool',
        'url_encode',
        'waif_stats',
      ]),
    );
    expect(new Set(BUILTIN_FUNCTIONS).size).toBe(BUILTIN_FUNCTIONS.length);
    expect([...BUILTIN_FUNCTIONS]).toEqual([...BUILTIN_FUNCTIONS].sort());
    expect(BUILTIN_FUNCTIONS).toEqual(MOO_BUILTIN_NAMES);
  });
});

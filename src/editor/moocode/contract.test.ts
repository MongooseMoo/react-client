import { describe, expect, it } from 'vitest';
import {
  BUILTIN_FUNCTIONS,
  ERROR_CONSTANTS,
  MOO_BLOCKS,
  MOO_CLOSE_KEYWORDS,
  MOO_INDENT_OPEN_KEYWORDS,
  MOO_LANGUAGE_ID,
  MOO_SESSION_TYPES,
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

  it('keeps block ownership in one contract instead of duplicating parser facts', () => {
    expect(MOO_BLOCKS.if.close).toBe('endif');
    expect(MOO_BLOCKS.if.middle).toEqual(['elseif', 'else']);
    expect(MOO_BLOCKS.for.isLoop).toBe(true);
    expect(MOO_BLOCKS.try.middle).toEqual(['except', 'finally']);
    expect(MOO_CLOSE_KEYWORDS.endtry).toBe('try');
    expect(MOO_INDENT_OPEN_KEYWORDS).toContain('finally');
  });
});

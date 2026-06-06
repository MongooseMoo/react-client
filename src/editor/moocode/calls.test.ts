import { describe, expect, it } from 'vitest';
import { readMooCallTargetBeforeOpen } from './calls';

describe('MOO call target parser', () => {
  it('recognizes plain function call targets before an opening parenthesis', () => {
    expect(readMooCallTargetBeforeOpen('notify(player, "ok")', 6)).toEqual({
      callKind: 'function',
      functionName: 'notify',
    });
    expect(readMooCallTargetBeforeOpen('custom_name()', 11)).toEqual({
      callKind: 'function',
      functionName: 'custom_name',
    });
  });

  it('recognizes static MOO verb call targets before an opening parenthesis', () => {
    expect(readMooCallTargetBeforeOpen('player:tell("ok")', 11)).toEqual({
      callKind: 'verb',
      receiverName: 'player',
      functionName: 'tell',
    });
    expect(readMooCallTargetBeforeOpen('#-1:initialize(player)', 14)).toEqual({
      callKind: 'verb',
      receiverName: '#-1',
      functionName: 'initialize',
    });
    expect(readMooCallTargetBeforeOpen('$room:announce("ok")', 14)).toEqual({
      callKind: 'verb',
      receiverName: '$room',
      functionName: 'announce',
    });
  });

  it('recognizes dynamic MOO verb expression targets before an argument list', () => {
    expect(readMooCallTargetBeforeOpen('player:(verb_name)(args)', 18)).toEqual({
      callKind: 'dynamic-verb',
      receiverName: 'player',
      functionName: '(verb_name)',
    });
    expect(readMooCallTargetBeforeOpen('$room:(verbs[index])("ok")', 20)).toEqual({
      callKind: 'dynamic-verb',
      receiverName: '$room',
      functionName: '(verbs[index])',
    });
  });

  it('recognizes dollar MOO verb call targets before an argument list', () => {
    expect(readMooCallTargetBeforeOpen('$notify("ok")', 7)).toEqual({
      callKind: 'dollar-verb',
      functionName: 'notify',
    });
    expect(readMooCallTargetBeforeOpen('$(verb_name)("ok")', 12)).toEqual({
      callKind: 'dollar-verb',
      functionName: '(verb_name)',
    });
  });
});

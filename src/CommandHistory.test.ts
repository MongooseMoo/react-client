import { it, describe, expect, beforeEach } from 'vitest';
import { CommandHistory } from './CommandHistory';

describe('CommandHistory', () => {
  let commandHistory: CommandHistory;

  beforeEach(() => {
    commandHistory = new CommandHistory();
  });

  it('should add a command and retrieve it when navigating up', () => {
    commandHistory.addCommand('test');
    expect(commandHistory.navigateUp('')).toBe('test');
  });

  it('should not add an empty command to the history', () => {
    commandHistory.addCommand('');
    expect(commandHistory.navigateUp('')).toBe('');
  });

  it('should navigate through multiple commands in history', () => {
    commandHistory.addCommand('first');
    commandHistory.addCommand('second');
    commandHistory.addCommand('third');

    expect(commandHistory.navigateUp('')).toBe('third');
    expect(commandHistory.navigateUp('third')).toBe('second');
    expect(commandHistory.navigateDown('second')).toBe('third');
  });

  it('should return to unsent input after navigating down from the most recent command', () => {
    commandHistory.addCommand('command');
    expect(commandHistory.navigateUp('com')).toBe('command');
    expect(commandHistory.navigateDown('command')).toBe('com');
  });

  it('should remain at the oldest command when navigating up at history boundary', () => {
    commandHistory.addCommand('only');
    expect(commandHistory.navigateUp('')).toBe('only');
    expect(commandHistory.navigateUp('only')).toBe('only');
  });

  it('should remain at the unsent input when navigating down at history boundary', () => {
    commandHistory.addCommand('command');
    expect(commandHistory.navigateDown('unsent')).toBe('unsent');
  });
  
  it('should keep the typed text when navigating in empty history', () => {
    expect(commandHistory.navigateUp('unsent')).toBe('unsent');
    expect(commandHistory.navigateDown('unsent')).toBe('unsent');
  });

  it('should return current input when history is empty', () => {
    expect(commandHistory.getCurrentInput()).toBe('');
  });

  it('should clear unsent input when a new command is added', () => {
    commandHistory.navigateUp('unsent');
    commandHistory.addCommand('test');
    expect(commandHistory.getCurrentInput()).toBe('');
  });

  it('should preserve unsent input when alternating navigation up and down', () => {
    const blank = '';
    commandHistory.addCommand('first');
    commandHistory.addCommand('second');

    // Navigating down from top shows unsent input
    expect(commandHistory.navigateDown('')).toBe(blank);

    // Navigating up through history
    expect(commandHistory.navigateUp('')).toBe('second');
    expect(commandHistory.navigateUp('second')).toBe('first');

    // Navigating back down returns to more recent command and then to unsent input
    expect(commandHistory.navigateDown('first')).toBe('second');
    expect(commandHistory.navigateDown('second')).toBe(blank);
  });

  describe('prefix-filtered navigation', () => {
    beforeEach(() => {
      commandHistory.addCommand('look north');
      commandHistory.addCommand('say hello');
      commandHistory.addCommand('look south');
    });

    it('walks only commands starting with the typed text, most recent first', () => {
      expect(commandHistory.navigateUp('look')).toBe('look south');
      expect(commandHistory.navigateUp('look south')).toBe('look north');
    });

    it('matches the prefix case-insensitively', () => {
      expect(commandHistory.navigateUp('LOOK')).toBe('look south');
    });

    it('skips commands that do not start with the typed text', () => {
      expect(commandHistory.navigateUp('say')).toBe('say hello');
      // Only one match: stays there rather than falling through to others
      expect(commandHistory.navigateUp('say hello')).toBe('say hello');
    });

    it('keeps the typed text when nothing matches', () => {
      expect(commandHistory.navigateUp('zzz')).toBe('zzz');
      expect(commandHistory.getCurrentInput()).toBe('zzz');
    });

    it('returns to the typed text when navigating back down', () => {
      expect(commandHistory.navigateUp('look')).toBe('look south');
      expect(commandHistory.navigateUp('look south')).toBe('look north');
      expect(commandHistory.navigateDown('look north')).toBe('look south');
      expect(commandHistory.navigateDown('look south')).toBe('look');
    });

    it('restarts the walk with the new prefix when the text is edited mid-walk', () => {
      expect(commandHistory.navigateUp('look')).toBe('look south');
      // User edits the recalled command; next Up filters on the edited text
      expect(commandHistory.navigateUp('say')).toBe('say hello');
      expect(commandHistory.navigateDown('say hello')).toBe('say');
    });

    it('deduplicates repeated commands during the walk, keeping the most recent', () => {
      commandHistory.addCommand('look north');

      expect(commandHistory.navigateUp('look')).toBe('look north');
      expect(commandHistory.navigateUp('look north')).toBe('look south');
      expect(commandHistory.navigateUp('look south')).toBe('look south');
    });
  });
});

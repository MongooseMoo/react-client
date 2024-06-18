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
    expect(commandHistory.navigateUp('unsent')).toBe('command');
    expect(commandHistory.navigateDown('command')).toBe('unsent');
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
  
  it('should handle navigation in empty history', () => {
    expect(commandHistory.navigateUp('unsent')).toBe('');
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
});

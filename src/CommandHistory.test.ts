import { CommandHistory } from './CommandHistory';

describe('CommandHistory', () => {
  let commandHistory: CommandHistory;

  beforeEach(() => {
    commandHistory = new CommandHistory();
  });

  test('adds and retrieves a command', () => {
    commandHistory.addCommand('test');
    expect(commandHistory.navigateUp('')).toBe('test');
  });

  test('handles empty command gracefully', () => {
    commandHistory.addCommand('');
    expect(commandHistory.navigateUp('')).toBe('');
  });

  test('navigates up and down through multiple commands', () => {
    commandHistory.addCommand('first');
    commandHistory.addCommand('second');
    commandHistory.addCommand('third');

    expect(commandHistory.navigateUp('')).toBe('third');
    expect(commandHistory.navigateUp('')).toBe('second');
    expect(commandHistory.navigateDown()).toBe('third');
    expect(commandHistory.navigateDown()).toBe('');
  });

  test('preserves unsent input', () => {
    commandHistory.addCommand('existing');
    expect(commandHistory.navigateUp('unsent')).toBe('existing');
    expect(commandHistory.navigateDown()).toBe('unsent');
  });

  test('prevents navigating beyond history bounds', () => {
    commandHistory.addCommand('only');
    expect(commandHistory.navigateUp('')).toBe('only');
    expect(commandHistory.navigateUp('')).toBe('only'); // Should remain at the oldest command
    expect(commandHistory.navigateDown()).toBe(''); // Should go to unsent input
  });

  test('handles navigating with empty history', () => {
    expect(commandHistory.navigateUp('unsent')).toBe('');
    expect(commandHistory.navigateDown()).toBe('unsent');
  });
});


import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, fireEvent, screen, createEvent } from '@testing-library/react';
import CommandInput from './input';
import { CommandHistory } from '../CommandHistory';

// Shared spy so tests can assert which commands were replayed into history
const { addCommandMock, navigateDownMock, navigateUpMock } = vi.hoisted(() => ({
  addCommandMock: vi.fn(),
  navigateDownMock: vi.fn(),
  navigateUpMock: vi.fn(),
}));

// Mock CommandHistory
vi.mock('../CommandHistory', () => ({
  CommandHistory: class MockCommandHistory {
    private history: string[] = [];
    private index: number = -1;

    addCommand = addCommandMock;
    navigateUp = navigateUpMock;
    navigateDown = navigateDownMock;
    getHistory = vi.fn(() => []);
  }
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('CommandInput Component', () => {
  const onSendMock = vi.fn();
  const inputRef = React.createRef<HTMLTextAreaElement>();
  
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });
  
  it('renders a textarea and a button', () => {
    render(<CommandInput onSend={onSendMock} inputRef={inputRef} />);
    
    expect(screen.getByRole('textbox')).toBeTruthy();
    expect(screen.getByRole('button', { name: /send/i })).toBeTruthy();
  });
  
  it('updates input value when user types', () => {
    render(<CommandInput onSend={onSendMock} inputRef={inputRef} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'hello world' } });
    
    expect((textarea as HTMLTextAreaElement).value).toBe('hello world');
  });
  
  it('calls onSend when send button is clicked', () => {
    render(<CommandInput onSend={onSendMock} inputRef={inputRef} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'look' } });
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);
    
    expect(onSendMock).toHaveBeenCalledWith('look');
    expect((textarea as HTMLTextAreaElement).value).toBe(''); // Input should clear after sending
  });
  
  it('calls onSend when Enter key is pressed', () => {
    render(<CommandInput onSend={onSendMock} inputRef={inputRef} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'examine sword' } });
    fireEvent.keyDown(textarea, { key: 'Enter' });
    
    expect(onSendMock).toHaveBeenCalledWith('examine sword');
    expect((textarea as HTMLTextAreaElement).value).toBe(''); // Input should clear after sending
  });
  
  it('sends blank lines to the MOO', () => {
    render(<CommandInput onSend={onSendMock} inputRef={inputRef} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '   ' } }); // Just spaces
    fireEvent.keyDown(textarea, { key: 'Enter' });

    expect(onSendMock).toHaveBeenCalledWith('   ');
  });
  
  it('adds command to history when sent', () => {
    // Since CommandHistory is mocked at the module level, we'll just verify
    // that the command is sent via onSend
    render(<CommandInput onSend={onSendMock} inputRef={inputRef} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'look' } });
    fireEvent.keyDown(textarea, { key: 'Enter' });
    
    expect(onSendMock).toHaveBeenCalledWith('look');
  });
  
  it('handles arrow key navigation', () => {
    // This test just verifies that the component handles arrow key presses
    // without errors - we can't directly test the navigation functionality
    // since CommandHistory is fully mocked
    render(<CommandInput onSend={onSendMock} inputRef={inputRef} />);
    
    const textarea = screen.getByRole('textbox');
    
    // First send a command
    fireEvent.change(textarea, { target: { value: 'command1' } });
    fireEvent.keyDown(textarea, { key: 'Enter' });
    
    // Verify no errors when navigating with arrow keys
    expect(() => {
      fireEvent.keyDown(textarea, { key: 'ArrowUp' });
      fireEvent.keyDown(textarea, { key: 'ArrowDown' });
    }).not.toThrow();
  });

  it('only suppresses plain Alt navigation keys', () => {
    render(<CommandInput onSend={onSendMock} inputRef={inputRef} />);

    const textarea = screen.getByRole('textbox');
    const plainAltArrow = createEvent.keyDown(textarea, {
      altKey: true,
      code: 'ArrowLeft',
      key: 'ArrowLeft',
    });
    const metaAltArrow = createEvent.keyDown(textarea, {
      altKey: true,
      code: 'ArrowLeft',
      key: 'ArrowLeft',
      metaKey: true,
    });

    fireEvent(textarea, plainAltArrow);
    fireEvent(textarea, metaAltArrow);

    expect(plainAltArrow.defaultPrevented).toBe(true);
    expect(metaAltArrow.defaultPrevented).toBe(false);
  });

  it('never routes Alt+Arrow to command history', () => {
    render(<CommandInput onSend={onSendMock} inputRef={inputRef} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.keyDown(textarea, { altKey: true, key: 'ArrowUp' });
    fireEvent.keyDown(textarea, { altKey: true, ctrlKey: true, key: 'ArrowDown' });

    expect(navigateUpMock).not.toHaveBeenCalled();
    expect(navigateDownMock).not.toHaveBeenCalled();
  });
  
  it('loads command history from localStorage on mount', () => {
    // Setup saved history
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(['command1', 'command2']));
    
    render(<CommandInput onSend={onSendMock} inputRef={inputRef} />);
    
    // Check that localStorage was accessed with the correct key
    expect(localStorageMock.getItem).toHaveBeenCalledWith('command_history');
  });

  it('replays a valid JSON array from localStorage into history on mount', () => {
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(['command1', 'command2']));

    render(<CommandInput onSend={onSendMock} inputRef={inputRef} />);

    expect(addCommandMock).toHaveBeenCalledWith('command1');
    expect(addCommandMock).toHaveBeenCalledWith('command2');
    expect(localStorageMock.removeItem).not.toHaveBeenCalled();
  });

  it('recovers from corrupt (non-JSON) command_history without throwing and clears the bad key', () => {
    localStorageMock.getItem.mockReturnValueOnce('this is not json {[');

    expect(() =>
      render(<CommandInput onSend={onSendMock} inputRef={inputRef} />)
    ).not.toThrow();

    // History stays empty and the corrupt key is removed.
    expect(addCommandMock).not.toHaveBeenCalled();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('command_history');
  });

  it('treats a valid non-array JSON value as empty history without throwing', () => {
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({ not: 'an array' }));

    expect(() =>
      render(<CommandInput onSend={onSendMock} inputRef={inputRef} />)
    ).not.toThrow();

    expect(addCommandMock).not.toHaveBeenCalled();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('command_history');
  });
  
  it('saves command history to localStorage', () => {
    render(<CommandInput onSend={onSendMock} inputRef={inputRef} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'save this command' } });
    fireEvent.keyDown(textarea, { key: 'Enter' });
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('command_history', expect.any(String));
  });
  
  it('limits command history size when saving', () => {
    // Mock getHistory to return a large array
    const largeMockHistory = Array(1010).fill(0).map((_, i) => `command${i}`);
    const mockCommandHistory = new CommandHistory();
    vi.spyOn(mockCommandHistory, 'getHistory').mockReturnValue(largeMockHistory);
    vi.spyOn(React, 'useRef').mockReturnValue({ current: mockCommandHistory });
    
    render(<CommandInput onSend={onSendMock} inputRef={inputRef} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'one more command' } });
    fireEvent.keyDown(textarea, { key: 'Enter' });
    
    // Should have saved only the last 1000 commands
    const savedValue = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(savedValue.length).toBeLessThanOrEqual(1000);
  });
});

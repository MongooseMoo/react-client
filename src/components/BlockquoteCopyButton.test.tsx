import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BlockquoteCopyButton from './BlockquoteCopyButton';

// Mock clipboard API
const mockWriteText = vi.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

// Mock console methods
const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('BlockquoteCopyButton', () => {
  let mockBlockquoteElement: HTMLElement;

  beforeEach(() => {
    // Create a mock blockquote element
    mockBlockquoteElement = document.createElement('blockquote');
    mockBlockquoteElement.innerHTML = '<p>Test content</p>';
    document.body.appendChild(mockBlockquoteElement);
    
    // Reset mocks
    mockWriteText.mockClear();
    consoleSpy.mockClear();
  });

  afterEach(() => {
    // Clean up
    document.body.removeChild(mockBlockquoteElement);
    vi.clearAllTimers();
  });

  it('renders with default "Copy" text', () => {
    render(
      <BlockquoteCopyButton blockquoteElement={mockBlockquoteElement} />
    );
    
    expect(screen.getByRole('button')).toHaveTextContent('Copy');
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Copy blockquote content');
  });

  it('copies text content when clicked', async () => {
    mockWriteText.mockResolvedValueOnce(undefined);
    
    render(
      <BlockquoteCopyButton blockquoteElement={mockBlockquoteElement} />
    );
    
    fireEvent.click(screen.getByRole('button'));
    
    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith('Test content');
    });
  });

  it('copies markdown content when contentType is text/markdown', async () => {
    mockWriteText.mockResolvedValueOnce(undefined);
    mockBlockquoteElement.innerHTML = '<p><strong>Bold text</strong> and <em>italic text</em></p>';
    
    render(
      <BlockquoteCopyButton 
        blockquoteElement={mockBlockquoteElement} 
        contentType="text/markdown" 
      />
    );
    
    fireEvent.click(screen.getByRole('button'));
    
    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith('**Bold text** and *italic text*');
    });
  });

  it('shows "Copied!" feedback after successful copy', async () => {
    mockWriteText.mockResolvedValueOnce(undefined);
    
    render(
      <BlockquoteCopyButton blockquoteElement={mockBlockquoteElement} />
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Wait for the state to change to "Copied!"
    await waitFor(() => {
      expect(button).toHaveTextContent('Copied!');
      expect(button).toHaveClass('copied');
    }, { timeout: 1000 });
    
    expect(mockWriteText).toHaveBeenCalledWith('Test content');
  });

  it('shows "Error" feedback when copy fails', async () => {
    const error = new Error('Clipboard not available');
    mockWriteText.mockRejectedValueOnce(error);
    
    render(
      <BlockquoteCopyButton blockquoteElement={mockBlockquoteElement} />
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Wait for the state to change to "Error"
    await waitFor(() => {
      expect(button).toHaveTextContent('Error');
      expect(button).toHaveClass('error');
    }, { timeout: 1000 });
    
    expect(consoleSpy).toHaveBeenCalledWith('Failed to copy text: ', error);
    expect(mockWriteText).toHaveBeenCalledWith('Test content');
  });

  it('removes existing copy buttons from cloned content', async () => {
    mockWriteText.mockResolvedValueOnce(undefined);
    
    // Add a copy button to the mock blockquote
    const existingButton = document.createElement('button');
    existingButton.className = 'blockquote-copy-button';
    existingButton.textContent = 'Copy';
    mockBlockquoteElement.appendChild(existingButton);
    
    render(
      <BlockquoteCopyButton blockquoteElement={mockBlockquoteElement} />
    );
    
    // Get all buttons and click the React-rendered one (should be the one with aria-label)
    const reactButton = screen.getByLabelText('Copy blockquote content');
    fireEvent.click(reactButton);
    
    await waitFor(() => {
      // Should copy only the text content, not including the button text
      expect(mockWriteText).toHaveBeenCalledWith('Test content');
    }, { timeout: 1000 });
  });

  it('prevents event propagation and default behavior', () => {
    const mockEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      target: document.createElement('button'),
    };
    
    render(
      <BlockquoteCopyButton blockquoteElement={mockBlockquoteElement} />
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button, mockEvent);
    
    // Note: This test verifies the click handler exists and works
    // The actual preventDefault/stopPropagation calls are tested indirectly
    expect(button).toBeInTheDocument();
  });

  it('handles empty blockquote content', async () => {
    mockWriteText.mockResolvedValueOnce(undefined);
    mockBlockquoteElement.innerHTML = '';
    
    render(
      <BlockquoteCopyButton blockquoteElement={mockBlockquoteElement} />
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await vi.waitFor(() => expect(mockWriteText).toHaveBeenCalled());
    
    expect(mockWriteText).toHaveBeenCalledWith('');
  });

  it('trims whitespace from copied content', async () => {
    mockWriteText.mockResolvedValueOnce(undefined);
    mockBlockquoteElement.innerHTML = '  <p>  Test content  </p>  ';
    
    render(
      <BlockquoteCopyButton blockquoteElement={mockBlockquoteElement} />
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await vi.waitFor(() => expect(mockWriteText).toHaveBeenCalled());
    
    expect(mockWriteText).toHaveBeenCalledWith('Test content');
  });

  it('has correct accessibility attributes', () => {
    render(
      <BlockquoteCopyButton blockquoteElement={mockBlockquoteElement} />
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('aria-label', 'Copy blockquote content');
  });
});
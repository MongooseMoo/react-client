import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BlockquoteWithCopy from './BlockquoteWithCopy';

// Mock the BlockquoteCopyButton component
vi.mock('./BlockquoteCopyButton', () => ({
  default: ({ blockquoteElement, contentType }: { blockquoteElement: HTMLElement, contentType?: string }) => (
    <button data-testid="mock-copy-button" data-content-type={contentType}>
      Mock Copy Button
    </button>
  ),
}));

describe('BlockquoteWithCopy', () => {
  it('renders blockquote with wrapper div', () => {
    render(
      <BlockquoteWithCopy>
        <p>Test content</p>
      </BlockquoteWithCopy>
    );
    
    const wrapper = screen.getByText('Test content').closest('.blockquote-with-copy');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveStyle({ position: 'relative' });
    
    const blockquote = screen.getByRole('blockquote');
    expect(blockquote).toBeInTheDocument();
    expect(blockquote).toContainElement(screen.getByText('Test content'));
  });

  it('renders copy button after component mounts', async () => {
    render(
      <BlockquoteWithCopy>
        <p>Test content</p>
      </BlockquoteWithCopy>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('mock-copy-button')).toBeInTheDocument();
    });
  });

  it('passes contentType to copy button', async () => {
    render(
      <BlockquoteWithCopy contentType="text/markdown">
        <p>Test markdown content</p>
      </BlockquoteWithCopy>
    );
    
    await waitFor(() => {
      const copyButton = screen.getByTestId('mock-copy-button');
      expect(copyButton).toHaveAttribute('data-content-type', 'text/markdown');
    });
  });

  it('sets data-content-type attribute on blockquote', () => {
    render(
      <BlockquoteWithCopy contentType="text/markdown">
        <p>Test content</p>
      </BlockquoteWithCopy>
    );
    
    const blockquote = screen.getByRole('blockquote');
    expect(blockquote).toHaveAttribute('data-content-type', 'text/markdown');
  });

  it('handles string children with dangerouslySetInnerHTML', () => {
    const htmlContent = '<p><strong>Bold</strong> text</p>';
    
    render(
      <BlockquoteWithCopy>
        {htmlContent}
      </BlockquoteWithCopy>
    );
    
    const blockquote = screen.getByRole('blockquote');
    expect(blockquote).toContainHTML(htmlContent);
  });

  it('handles React element children normally', () => {
    render(
      <BlockquoteWithCopy>
        <p><strong>Bold</strong> text</p>
        <p>Another paragraph</p>
      </BlockquoteWithCopy>
    );
    
    const blockquote = screen.getByRole('blockquote');
    expect(blockquote).toContainElement(screen.getByText('Bold'));
    expect(blockquote).toContainElement(screen.getByText('Another paragraph'));
  });

  it('does not set data-content-type when contentType is undefined', () => {
    render(
      <BlockquoteWithCopy>
        <p>Test content</p>
      </BlockquoteWithCopy>
    );
    
    const blockquote = screen.getByRole('blockquote');
    expect(blockquote).not.toHaveAttribute('data-content-type');
  });

  it('copy button receives blockquote element reference', async () => {
    render(
      <BlockquoteWithCopy>
        <p>Test content</p>
      </BlockquoteWithCopy>
    );
    
    // Wait for component to mount and copy button to appear
    await waitFor(() => {
      expect(screen.getByTestId('mock-copy-button')).toBeInTheDocument();
    });
    
    // The mock component should render, indicating that blockquoteRef.current was not null
    expect(screen.getByTestId('mock-copy-button')).toBeInTheDocument();
  });

  it('handles empty children', async () => {
    render(
      <BlockquoteWithCopy>
        {''}
      </BlockquoteWithCopy>
    );
    
    const blockquote = screen.getByRole('blockquote');
    expect(blockquote).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByTestId('mock-copy-button')).toBeInTheDocument();
    });
  });

  it('wrapper has correct CSS class', () => {
    render(
      <BlockquoteWithCopy>
        <p>Test content</p>
      </BlockquoteWithCopy>
    );
    
    const wrapper = screen.getByText('Test content').closest('div');
    expect(wrapper).toHaveClass('blockquote-with-copy');
  });

  it('renders copy button after component mounts', async () => {
    render(
      <BlockquoteWithCopy>
        <p>Test content</p>
      </BlockquoteWithCopy>
    );
    
    // After mount, it should appear
    await waitFor(() => {
      expect(screen.getByTestId('mock-copy-button')).toBeInTheDocument();
    });
  });
});
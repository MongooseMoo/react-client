import React, { useState } from 'react';
import { announce } from '@react-aria/live-announcer';

export async function copyBlockquoteContent(blockquoteElement: HTMLElement, contentType?: string): Promise<void> {
  // Clone the blockquote to avoid modifying the live DOM
  const clonedBlockquote = blockquoteElement.cloneNode(true) as HTMLElement;

  // Remove any existing copy buttons from the clone
  const buttonsInClone = clonedBlockquote.querySelectorAll('.blockquote-copy-button');
  buttonsInClone.forEach(button => { button.remove(); });

  // Check if the content type is markdown
  if (contentType === 'text/markdown') {
  const htmlContent = clonedBlockquote.innerHTML;
  const markdown = import('turndown').then(({ default: TurndownService }) =>
    new TurndownService({ headingStyle: 'atx', emDelimiter: '*' }).turndown(htmlContent).trim(),
  );
  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard.write) {
    // Start the clipboard write during the click's user activation, even
    // when downloading the converter takes longer than that activation.
    await navigator.clipboard.write([new ClipboardItem({
  'text/plain': markdown.then((text) => new Blob([text], { type: 'text/plain' })),
    })]);
  } else {
    await navigator.clipboard.writeText(await markdown);
  }
  } else {
  await navigator.clipboard.writeText((clonedBlockquote.textContent || '').trim());
  }

}

interface BlockquoteCopyButtonProps {
  blockquoteElement?: HTMLElement;
  getBlockquoteElement?: () => HTMLElement | null;
  contentType?: string;
}

const BlockquoteCopyButton: React.FC<BlockquoteCopyButtonProps> = ({
  blockquoteElement,
  contentType,
  getBlockquoteElement
}) => {
  const [buttonState, setButtonState] = useState<'default' | 'copied' | 'error'>('default');
  
  const handleCopyClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      const element = blockquoteElement ?? getBlockquoteElement?.();
      if (!element) throw new Error('Quotation is unavailable');
      await copyBlockquoteContent(element, contentType);
      // Visual feedback: Change to copied state
      setButtonState('copied');
      announce('Copied', 'polite');
      setTimeout(() => {
        setButtonState('default');
      }, 1500);

    } catch (err) {
      console.error('Failed to copy text: ', err);
      
      // Error feedback
      setButtonState('error');
      announce('Could not copy', 'polite');
    }
  };

  const getButtonText = () => {
    switch (buttonState) {
      case 'copied': return 'Copied!';
      case 'error': return 'Error';
      default: return 'Copy';
    }
  };

  return (
    <>
    <button
      className={`blockquote-copy-button ${buttonState !== 'default' ? buttonState : ''}`}
      onClick={handleCopyClick}
      type="button"
      aria-label="Copy blockquote content"
    >
      {getButtonText()}
    </button>
    <span className="copy-feedback">{buttonState === 'error' ? 'Could not copy. Select the text to copy it.' : ''}</span>
    </>
  );
};

export default BlockquoteCopyButton;

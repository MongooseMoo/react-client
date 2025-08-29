import React, { useState } from 'react';
import TurndownService from 'turndown';

interface BlockquoteCopyButtonProps {
  blockquoteElement: HTMLElement;
  contentType?: string;
}

const BlockquoteCopyButton: React.FC<BlockquoteCopyButtonProps> = ({
  blockquoteElement,
  contentType
}) => {
  const [buttonState, setButtonState] = useState<'default' | 'copied' | 'error'>('default');
  
  // Create TurndownService instance
  const turndownService = new TurndownService({ headingStyle: 'atx', emDelimiter: '*' });

  const handleCopyClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      // Clone the blockquote to avoid modifying the live DOM
      const clonedBlockquote = blockquoteElement.cloneNode(true) as HTMLElement;
      
      // Remove any existing copy buttons from the clone
      const buttonsInClone = clonedBlockquote.querySelectorAll('.blockquote-copy-button');
      buttonsInClone.forEach(button => button.remove());

      let textToCopy: string;

      // Check if the content type is markdown
      if (contentType === 'text/markdown') {
        // Get the inner HTML of the clone (without the button)
        const htmlContent = clonedBlockquote.innerHTML;
        // Convert HTML to Markdown using Turndown
        textToCopy = turndownService.turndown(htmlContent);
      } else {
        // Default behavior: Get text content from the clone
        textToCopy = clonedBlockquote.textContent || '';
      }

      await navigator.clipboard.writeText(textToCopy.trim());
      
      // Visual feedback: Change to copied state
      setButtonState('copied');
      setTimeout(() => {
        setButtonState('default');
      }, 1500);

    } catch (err) {
      console.error('Failed to copy text: ', err);
      
      // Error feedback
      setButtonState('error');
      setTimeout(() => {
        setButtonState('default');
      }, 1500);
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
    <button
      className={`blockquote-copy-button ${buttonState !== 'default' ? buttonState : ''}`}
      onClick={handleCopyClick}
      type="button"
      aria-label="Copy blockquote content"
    >
      {getButtonText()}
    </button>
  );
};

export default BlockquoteCopyButton;
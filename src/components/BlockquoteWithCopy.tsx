import React, { useState, useEffect, useRef } from 'react';
import BlockquoteCopyButton from './BlockquoteCopyButton';

interface BlockquoteWithCopyProps {
  children: React.ReactNode;
  contentType?: string;
}

const BlockquoteWithCopy: React.FC<BlockquoteWithCopyProps> = ({
  children,
  contentType
}) => {
  const blockquoteRef = useRef<HTMLQuoteElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Ensure component is mounted before accessing ref
    setMounted(true);
  }, []);

  return (
    <div className="blockquote-with-copy" style={{ position: 'relative' }}>
      <blockquote
        ref={blockquoteRef}
        data-content-type={contentType}
        dangerouslySetInnerHTML={typeof children === 'string' ? { __html: children } : undefined}
      >
        {typeof children !== 'string' ? children : undefined}
      </blockquote>
      {mounted && blockquoteRef.current && (
        <BlockquoteCopyButton
          blockquoteElement={blockquoteRef.current}
          contentType={contentType}
        />
      )}
    </div>
  );
};

export default BlockquoteWithCopy;
import React, { useRef } from 'react';
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

  return (
    <div className="blockquote-with-copy" style={{ position: 'relative' }}>
      {typeof children === 'string' ? <blockquote
        ref={blockquoteRef}
        data-content-type={contentType}
        dangerouslySetInnerHTML={{ __html: children }}
      /> : <blockquote ref={blockquoteRef} data-content-type={contentType}>
        {children}
      </blockquote>}
      {(
        <BlockquoteCopyButton
          getBlockquoteElement={() => blockquoteRef.current}
          contentType={contentType}
        />
      )}
    </div>
  );
};

export default BlockquoteWithCopy;

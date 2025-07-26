"use client";

import React, { memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { marked } from "marked";

// Custom markdown components with proper typing for react-markdown v10
const CustomH1: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  ...props
}) => {
  return (
    <h1 className="text-3xl font-bold tracking-tight" {...props}>
      {children}
    </h1>
  );
};

const CustomH2: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  ...props
}) => {
  return (
    <h2 className="text-2xl font-bold tracking-tight" {...props}>
      {children}
    </h2>
  );
};

const CustomH3: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  ...props
}) => {
  return (
    <h3 className="text-xl font-bold" {...props}>
      {children}
    </h3>
  );
};

const CustomP: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  ...props
}) => {
  return (
    <p className="text-sm" {...props}>
      {children}
    </p>
  );
};

const CustomLi: React.FC<React.HTMLAttributes<HTMLLIElement>> = ({
  children,
  ...props
}) => {
  return (
    <li className="text-sm my-2" {...props}>
      {children}
    </li>
  );
};

const CustomHr: React.FC<React.HTMLAttributes<HTMLHRElement>> = (props) => {
  return <hr className="border-t-2 border-bg-100" {...props} />;
};

// Memoized markdown components for performance optimization during streaming
function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown);
  return tokens.map((token) => token.raw);
}

const MemoizedMarkdownBlock = memo(
  ({ content }: { content: string }) => {
    return (
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <ReactMarkdown
          components={{
            h1: CustomH1,
            h2: CustomH2,
            h3: CustomH3,
            p: CustomP,
            li: CustomLi,
            hr: CustomHr,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.content !== nextProps.content) return false;
    return true;
  },
);

MemoizedMarkdownBlock.displayName = "MemoizedMarkdownBlock";

const MemoizedMarkdown = memo(
  ({ content, id }: { content: string; id: string }) => {
    const blocks = useMemo(() => parseMarkdownIntoBlocks(content), [content]);

    return (
      <div className="space-y-3">
        {blocks.map((block, index) => (
          <MemoizedMarkdownBlock content={block} key={`${id}-block_${index}`} />
        ))}
      </div>
    );
  },
);

MemoizedMarkdown.displayName = "MemoizedMarkdown";

export default MemoizedMarkdown;

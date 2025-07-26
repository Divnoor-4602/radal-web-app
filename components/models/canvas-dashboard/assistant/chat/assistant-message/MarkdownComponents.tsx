"use client";

import React, { memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { marked } from "marked";

// Custom markdown components
const CustomH1 = ({ children }: { children: React.ReactNode }) => {
  return <h1 className="text-3xl font-bold tracking-tight">{children}</h1>;
};

const CustomH2 = ({ children }: { children: React.ReactNode }) => {
  return <h2 className="text-2xl font-bold tracking-tight">{children}</h2>;
};

const CustomH3 = ({ children }: { children: React.ReactNode }) => {
  return <h3 className="text-xl font-bold">{children}</h3>;
};

const CustomP = ({ children }: { children: React.ReactNode }) => {
  return <p className="text-sm">{children}</p>;
};

const CustomLi = ({ children }: { children: React.ReactNode }) => {
  return <li className="text-sm my-2">{children}</li>;
};

const CustomHr = () => {
  return <hr className="border-t-2 border-bg-100" />;
};

// Memoized markdown components for performance optimization during streaming
function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown);
  return tokens.map((token) => token.raw);
}

const MemoizedMarkdownBlock = memo(
  ({ content }: { content: string }) => {
    return (
      <ReactMarkdown
        className="prose prose-sm max-w-none dark:prose-invert"
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

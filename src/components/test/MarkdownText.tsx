import type { ReactNode } from 'react';

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let remaining = text;
  let index = 0;
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^\)]+\))/;

  while (remaining.length > 0) {
    const match = remaining.match(pattern);
    if (!match || match.index === undefined) {
      if (remaining) {
        nodes.push(remaining);
      }
      break;
    }

    if (match.index > 0) {
      nodes.push(remaining.slice(0, match.index));
    }

    const token = match[0];
    if (token.startsWith('**')) {
      nodes.push(
        <strong key={`${keyPrefix}-strong-${index}`}>
          {renderInline(token.slice(2, -2), `${keyPrefix}-strong-${index}`)}
        </strong>
      );
    } else if (token.startsWith('*')) {
      nodes.push(
        <em key={`${keyPrefix}-em-${index}`}>
          {renderInline(token.slice(1, -1), `${keyPrefix}-em-${index}`)}
        </em>
      );
    } else if (token.startsWith('`')) {
      nodes.push(
        <code key={`${keyPrefix}-code-${index}`} className="rounded bg-slate-200 px-1 py-0.5 text-xs">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('[')) {
      const labelMatch = token.match(/\[([^\]]+)\]\(([^\)]+)\)/);
      const label = labelMatch?.[1] ?? token;
      const href = labelMatch?.[2] ?? '#';
      nodes.push(
        <a
          key={`${keyPrefix}-link-${index}`}
          href={href}
          className="text-sky-600 underline"
          target="_blank"
          rel="noreferrer"
        >
          {renderInline(label, `${keyPrefix}-link-label-${index}`)}
        </a>
      );
    }

    remaining = remaining.slice((match.index ?? 0) + token.length);
    index += 1;
  }

  return nodes;
}

function buildBlocks(content: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  let paragraph: string[] = [];
  let listItems: string[] = [];
  let blockIndex = 0;

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    const text = paragraph.join(' ');
    nodes.push(
      <p key={`p-${blockIndex}`} className="leading-relaxed">
        {renderInline(text, `p-${blockIndex}`)}
      </p>
    );
    paragraph = [];
    blockIndex += 1;
  };

  const flushList = () => {
    if (listItems.length === 0) return;
    nodes.push(
      <ul key={`ul-${blockIndex}`} className="list-disc space-y-1 pl-5">
        {listItems.map((item, idx) => (
          <li key={`li-${blockIndex}-${idx}`} className="leading-relaxed">
            {renderInline(item, `li-${blockIndex}-${idx}`)}
          </li>
        ))}
      </ul>
    );
    listItems = [];
    blockIndex += 1;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    if (trimmed.startsWith('### ')) {
      flushParagraph();
      flushList();
      nodes.push(
        <h4 key={`h4-${blockIndex}`} className="text-lg font-semibold">
          {renderInline(trimmed.slice(4).trim(), `h4-${blockIndex}`)}
        </h4>
      );
      blockIndex += 1;
      continue;
    }

    if (trimmed.startsWith('## ')) {
      flushParagraph();
      flushList();
      nodes.push(
        <h3 key={`h3-${blockIndex}`} className="text-xl font-semibold">
          {renderInline(trimmed.slice(3).trim(), `h3-${blockIndex}`)}
        </h3>
      );
      blockIndex += 1;
      continue;
    }

    if (trimmed.startsWith('# ')) {
      flushParagraph();
      flushList();
      nodes.push(
        <h2 key={`h2-${blockIndex}`} className="text-2xl font-bold">
          {renderInline(trimmed.slice(2).trim(), `h2-${blockIndex}`)}
        </h2>
      );
      blockIndex += 1;
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      flushParagraph();
      listItems.push(trimmed.replace(/^[-*]\s+/, ''));
      continue;
    }

    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();

  return nodes;
}

interface MarkdownTextProps {
  content?: string | null;
  className?: string;
}

export function MarkdownText({ content, className = '' }: MarkdownTextProps) {
  if (!content) return null;
  return <div className={className}>{buildBlocks(content)}</div>;
}

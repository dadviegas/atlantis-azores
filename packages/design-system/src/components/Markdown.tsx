import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Children, isValidElement } from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { CodeBlock } from './CodeBlock';
import { Callout, type CalloutKind } from './Callout';
import { Kbd } from './Kbd';
import { Mermaid } from './Mermaid';

export interface MarkdownProps {
  children: string;
  className?: string;
}

const calloutDirective = /^\s*\[!(NOTE|TIP|WARNING|DANGER|SUCCESS)\]\s*/i;
const kindMap: Record<string, CalloutKind> = {
  NOTE: 'info',
  TIP: 'tip',
  WARNING: 'warning',
  DANGER: 'danger',
  SUCCESS: 'success',
};

function extractCalloutKind(children: ReactNode): { kind: CalloutKind; stripped: ReactNode } | null {
  const arr = Children.toArray(children).filter(
    (c) => !(typeof c === 'string' && c.trim() === ''),
  );
  const first = arr[0];
  if (!isValidElement(first) || first.type !== 'p') return null;
  const pProps = first.props as { children?: ReactNode };
  const pChildren = Children.toArray(pProps.children);
  const head = pChildren[0];
  if (typeof head !== 'string') return null;
  const match = head.match(calloutDirective);
  if (!match) return null;
  const kind = kindMap[match[1].toUpperCase()];
  const rest = head.slice(match[0].length).replace(/^\s+/, '');
  const newP = (
    <p key="p">
      {rest}
      {pChildren.slice(1)}
    </p>
  );
  return { kind, stripped: [newP, ...arr.slice(1)] };
}

const components: Components = {
  code({ className, children }) {
    const langMatch = /language-(\w+)/.exec(className || '');
    if (!langMatch) {
      return <code className={className}>{children}</code>;
    }
    const source = String(children).replace(/\n$/, '');
    if (langMatch[1] === 'mermaid') {
      return <Mermaid>{source}</Mermaid>;
    }
    return <CodeBlock lang={langMatch[1]}>{source}</CodeBlock>;
  },
  blockquote({ children }) {
    const callout = extractCalloutKind(children);
    if (callout) {
      return <Callout kind={callout.kind}>{callout.stripped}</Callout>;
    }
    return <blockquote>{children}</blockquote>;
  },
  kbd({ children }: ComponentPropsWithoutRef<'kbd'>) {
    return <Kbd>{children}</Kbd>;
  },
};

export function Markdown({ children, className }: MarkdownProps) {
  return (
    <div className={['prose', className].filter(Boolean).join(' ')}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}

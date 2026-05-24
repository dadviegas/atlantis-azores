import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Children, isValidElement, createElement } from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { CodeBlock } from './CodeBlock';
import { Callout, type CalloutKind } from './Callout';
import { Kbd } from './Kbd';
import { Mermaid } from './Mermaid';
import { StatGrid, Steps, Compare, Quote, Meters, KeyValueGrid } from './Infographic';

const infographicRenderers: Record<string, (json: unknown) => ReactNode> = {
  stats: (data) => <StatGrid items={data as Parameters<typeof StatGrid>[0]['items']} />,
  steps: (data) => <Steps items={data as Parameters<typeof Steps>[0]['items']} />,
  meters: (data) => <Meters items={data as Parameters<typeof Meters>[0]['items']} />,
  keyvalue: (data) => <KeyValueGrid items={data as Parameters<typeof KeyValueGrid>[0]['items']} />,
  compare: (data) => <Compare columns={data as Parameters<typeof Compare>[0]['columns']} />,
  quote: (data) => {
    const q = data as { text: string; by?: string; role?: string };
    return <Quote by={q.by} role={q.role}>{q.text}</Quote>;
  },
};

function renderInfographic(lang: string, source: string): ReactNode {
  const fn = infographicRenderers[lang];
  if (!fn) return null;
  try {
    return fn(JSON.parse(source));
  } catch (e) {
    return (
      <pre style={{
        background: 'var(--danger-soft)', color: 'var(--danger)',
        padding: 12, borderRadius: 'var(--radius-sm)', whiteSpace: 'pre-wrap',
      }}>{`Invalid ${lang} JSON: ${e instanceof Error ? e.message : String(e)}`}</pre>
    );
  }
}

function slugify(node: ReactNode): string {
  const text = Children.toArray(node)
    .map((c) => {
      if (typeof c === 'string' || typeof c === 'number') return String(c);
      if (isValidElement(c)) return slugify((c.props as { children?: ReactNode }).children);
      return '';
    })
    .join('');
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function makeHeading(level: 1 | 2 | 3 | 4 | 5 | 6) {
  return function Heading({ children }: { children?: ReactNode }) {
    const id = slugify(children);
    return createElement(
      `h${level}`,
      { id, className: 'atlas-anchor' },
      children,
      createElement(
        'a',
        {
          href: `#${id}`,
          className: 'atlas-anchor-link',
          'aria-label': 'Link to this section',
        },
        '#',
      ),
    );
  };
}

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
    const lang = langMatch[1];
    if (lang === 'mermaid') {
      return <Mermaid>{source}</Mermaid>;
    }
    if (lang in infographicRenderers) {
      return renderInfographic(lang, source);
    }
    return <CodeBlock lang={lang}>{source}</CodeBlock>;
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
  h1: makeHeading(1),
  h2: makeHeading(2),
  h3: makeHeading(3),
  h4: makeHeading(4),
  h5: makeHeading(5),
  h6: makeHeading(6),
};

export function Markdown({ children, className }: MarkdownProps) {
  return (
    <div className={['prose', className].filter(Boolean).join(' ')}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={components}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

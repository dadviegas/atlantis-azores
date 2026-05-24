import { useRef, useState, type ReactNode } from 'react';
import { Icon } from '../icons';

export type TokenKind = 'kw' | 'fn' | 'str' | 'num' | 'cmt' | 'typ' | 'op' | 'pn';

export interface TProps {
  k: TokenKind;
  children?: ReactNode;
}

export function T({ k, children }: TProps) {
  const map: Record<TokenKind, string> = {
    kw:  'var(--accent)',
    fn:  'color-mix(in srgb, var(--primary) 90%, var(--ink))',
    str: 'var(--ok)',
    num: 'var(--warn)',
    cmt: 'color-mix(in srgb, var(--code-ink) 50%, transparent)',
    typ: 'color-mix(in srgb, var(--accent) 85%, var(--ink))',
    op:  'color-mix(in srgb, var(--code-ink) 70%, transparent)',
    pn:  'color-mix(in srgb, var(--code-ink) 95%, transparent)',
  };
  const italic = k === 'cmt';
  return <span style={{ color: map[k] || 'inherit', fontStyle: italic ? 'italic' : 'normal' }}>{children}</span>;
}

export interface CodeBlockProps {
  lang?: string;
  title?: ReactNode;
  children?: ReactNode;
  lineNumbers?: boolean;
}

export function CodeBlock({ lang = 'ts', title, children, lineNumbers = true }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLPreElement>(null);
  const copy = () => {
    const text = ref.current?.innerText || '';
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    }).catch(() => {});
  };

  const raw = Array.isArray(children) ? children : [children];
  const lines: ReactNode[][] = [[]];
  raw.forEach((node) => {
    if (typeof node === 'string') {
      const parts = node.split('\n');
      parts.forEach((p, i) => {
        if (i > 0) lines.push([]);
        if (p) lines[lines.length - 1].push(p);
      });
    } else {
      lines[lines.length - 1].push(node);
    }
  });

  return (
    <div className="atlas-code" style={{
      margin: '1.2em 0',
      borderRadius: 'var(--radius)',
      background: 'var(--code-bg)',
      color: 'var(--code-ink)',
      overflow: 'hidden',
      border: '1px solid color-mix(in srgb, var(--code-bg) 80%, var(--border))',
      boxShadow: '0 1px 2px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.08)',
      fontFamily: 'var(--font-mono)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 12px 8px 14px',
        borderBottom: '1px solid color-mix(in srgb, var(--code-ink) 12%, transparent)',
        fontSize: '.82em',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'color-mix(in srgb, var(--code-ink) 70%, transparent)' }}>
          <span style={{
            background: 'color-mix(in srgb, var(--accent) 60%, var(--code-bg))',
            color: '#fff',
            padding: '2px 7px',
            borderRadius: 4,
            fontSize: '.78em',
            fontWeight: 600,
            letterSpacing: '.06em',
            textTransform: 'uppercase',
          }}>{lang}</span>
          {title && <span style={{ fontFamily: 'var(--font-sans)' }}>{title}</span>}
        </div>
        <button onClick={copy} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          color: 'color-mix(in srgb, var(--code-ink) 60%, transparent)',
          fontFamily: 'var(--font-sans)', fontSize: '.8em',
          padding: '4px 8px', borderRadius: 5,
          transition: 'background .15s, color .15s',
        }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in srgb, var(--code-ink) 10%, transparent)'; e.currentTarget.style.color = 'var(--code-ink)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'color-mix(in srgb, var(--code-ink) 60%, transparent)'; }}
        >
          {copied ? Icon.check : Icon.copy}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre ref={ref} style={{
        margin: 0, padding: '12px 0 16px',
        fontSize: '.86em', lineHeight: 1.65,
        overflow: 'auto',
      }}>
        {lines.map((parts, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: lineNumbers ? '36px 1fr' : '1fr', padding: '0 14px 0 0' }}>
            {lineNumbers && (
              <span style={{
                color: 'color-mix(in srgb, var(--code-ink) 30%, transparent)',
                textAlign: 'right', paddingRight: 12, userSelect: 'none',
                fontVariantNumeric: 'tabular-nums', fontSize: '.85em',
              }}>{i + 1}</span>
            )}
            <span style={{ whiteSpace: 'pre' }}>{parts.length ? parts : ' '}</span>
          </div>
        ))}
      </pre>
    </div>
  );
}

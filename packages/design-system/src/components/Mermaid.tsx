import { useEffect, useId, useRef, useState } from 'react';

export interface MermaidProps {
  children: string;
  className?: string;
}

let counter = 0;

function detectTheme(el: HTMLElement | null): 'default' | 'dark' {
  let node: HTMLElement | null = el;
  while (node) {
    const t = node.getAttribute('data-theme');
    if (t === 'dark') return 'dark';
    if (t === 'light') return 'default';
    node = node.parentElement;
  }
  return 'default';
}

export function Mermaid({ children, className }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/[:]/g, '_');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    let cancelled = false;
    const target = ref.current;
    (async () => {
      try {
        const { default: mermaid } = await import('mermaid');
        const theme = detectTheme(target);
        mermaid.initialize({
          startOnLoad: false,
          theme,
          securityLevel: 'loose',
          fontFamily: 'inherit',
        });
        const renderId = `mermaid-${uid}-${++counter}`;
        const { svg } = await mermaid.render(renderId, children);
        if (!cancelled) target.innerHTML = svg;
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => { cancelled = true; };
  }, [children, uid]);

  if (error) {
    return (
      <pre style={{
        background: 'var(--danger-soft)',
        color: 'var(--danger)',
        padding: 12,
        borderRadius: 'var(--radius-sm)',
        whiteSpace: 'pre-wrap',
      }}>{error}</pre>
    );
  }

  return (
    <div
      ref={ref}
      className={['atlas-mermaid', className].filter(Boolean).join(' ')}
      style={{
        display: 'flex',
        justifyContent: 'center',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 16,
        margin: '1.2em 0',
        overflow: 'auto',
      }}
    />
  );
}

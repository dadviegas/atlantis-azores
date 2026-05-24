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

interface MermaidTokens {
  surface: string; ink: string; ink2: string; ink3: string; border: string;
  primary: string; primarySoft: string;
  accent: string; accentSoft: string;
  info: string; infoSoft: string;
  warn: string; ok: string;
}

function readTokens(el: HTMLElement): MermaidTokens {
  const s = getComputedStyle(el);
  const get = (name: string) => s.getPropertyValue(name).trim() || '#888';
  return {
    surface: get('--surface'),
    ink: get('--ink'),
    ink2: get('--ink-2'),
    ink3: get('--ink-3'),
    border: get('--border'),
    primary: get('--primary'),
    primarySoft: get('--primary-soft'),
    accent: get('--accent'),
    accentSoft: get('--accent-soft'),
    info: get('--info'),
    infoSoft: get('--info-soft'),
    warn: get('--warn'),
    ok: get('--ok'),
  };
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
        const tokens = readTokens(target);
        mermaid.initialize({
          startOnLoad: false,
          theme: 'base',
          securityLevel: 'loose',
          themeVariables: {
            darkMode: theme === 'dark',
            background: tokens.surface,
            primaryColor: tokens.primarySoft,
            primaryTextColor: tokens.ink,
            primaryBorderColor: tokens.primary,
            secondaryColor: tokens.infoSoft,
            secondaryBorderColor: tokens.info,
            tertiaryColor: tokens.accentSoft,
            tertiaryBorderColor: tokens.accent,
            lineColor: tokens.ink2,
            textColor: tokens.ink,
            mainBkg: tokens.primarySoft,
            nodeBorder: tokens.primary,
            clusterBkg: tokens.surface,
            clusterBorder: tokens.border,
            edgeLabelBackground: tokens.surface,
            pie1: tokens.primary,
            pie2: tokens.accent,
            pie3: tokens.info,
            pie4: tokens.warn,
            pie5: tokens.ok,
            pie6: tokens.ink3,
            pieTitleTextColor: tokens.ink,
            pieSectionTextColor: tokens.ink,
            pieOuterStrokeColor: tokens.border,
            pieStrokeColor: tokens.surface,
          },
        });
        const renderId = `mermaid-${uid}-${++counter}`;
        const { svg } = await mermaid.render(renderId, children);
        if (cancelled) return;
        target.innerHTML = svg;
        const el = target.querySelector('svg');
        if (el) {
          el.removeAttribute('width');
          el.removeAttribute('height');
          el.style.maxWidth = '640px';
          el.style.width = '100%';
          el.style.height = 'auto';
          el.style.display = 'block';
          el.style.margin = '0 auto';
        }
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
        alignItems: 'center',
        width: '100%',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 16,
        margin: '1.2em 0',
        boxSizing: 'border-box',
        overflow: 'auto',
      }}
    />
  );
}

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
  surface: string; ink: string; ink2: string; ink3: string;
  border: string; borderSoft: string;
  primary: string; primarySoft: string;
  accent: string; accentSoft: string;
  info: string; infoSoft: string;
  warn: string; warnSoft: string;
  ok: string; okSoft: string;
  danger: string; dangerSoft: string;
}

function buildThemeCSS(t: MermaidTokens): string {
  return `
    /* xy-chart, quadrant, pie — force chart canvas to match surface */
    svg .background,
    svg rect.background,
    svg .main-rect,
    svg .chart-background,
    svg #chart-background,
    svg g.main > rect:first-child { fill: ${t.surface} !important; }

    /* Generic title text across diagram types */
    svg .titleText,
    svg .pieTitleText,
    svg text.titleText,
    svg text.timelineTitle,
    svg text.sectionTitle,
    svg .label-container text,
    svg .chartTitleText { fill: ${t.ink} !important; font-weight: 600; opacity: 1; }

    /* Journey: section + task labels */
    svg .section text,
    svg .sectionTitle,
    svg .task-type-0 text,
    svg .task-type-1 text,
    svg .task text { fill: ${t.ink} !important; opacity: 1; }

    /* Timeline: title + section text */
    svg .timeline-title { fill: ${t.ink} !important; opacity: 1; }
    svg .timeline text { fill: ${t.ink} !important; }
  `;
}

function makeXyChartVars(tokens: MermaidTokens) {
  return {
    backgroundColor: tokens.surface,
    titleColor: tokens.ink,
    xAxisLabelColor: tokens.ink2,
    xAxisTitleColor: tokens.ink,
    xAxisTickColor: tokens.ink3,
    xAxisLineColor: tokens.ink3,
    yAxisLabelColor: tokens.ink2,
    yAxisTitleColor: tokens.ink,
    yAxisTickColor: tokens.ink3,
    yAxisLineColor: tokens.ink3,
    plotColorPalette: [
      tokens.primary,
      tokens.accent,
      tokens.info,
      tokens.warn,
      tokens.ok,
    ].join(','),
  };
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
    borderSoft: get('--border-soft'),
    primary: get('--primary'),
    primarySoft: get('--primary-soft'),
    accent: get('--accent'),
    accentSoft: get('--accent-soft'),
    info: get('--info'),
    infoSoft: get('--info-soft'),
    warn: get('--warn'),
    warnSoft: get('--warn-soft'),
    ok: get('--ok'),
    okSoft: get('--ok-soft'),
    danger: get('--danger'),
    dangerSoft: get('--danger-soft'),
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
          themeCSS: buildThemeCSS(tokens),
          themeVariables: {
            darkMode: theme === 'dark',
            background: tokens.surface,
            // Generic
            primaryColor: tokens.primarySoft,
            primaryTextColor: tokens.ink,
            primaryBorderColor: tokens.primary,
            secondaryColor: tokens.infoSoft,
            secondaryTextColor: tokens.ink,
            secondaryBorderColor: tokens.info,
            tertiaryColor: tokens.accentSoft,
            tertiaryTextColor: tokens.ink,
            tertiaryBorderColor: tokens.accent,
            lineColor: tokens.ink2,
            textColor: tokens.ink,
            titleColor: tokens.ink,
            mainBkg: tokens.primarySoft,
            nodeBorder: tokens.primary,
            nodeTextColor: tokens.ink,
            clusterBkg: tokens.surface,
            clusterBorder: tokens.border,
            edgeLabelBackground: tokens.surface,
            // Notes (sequence diagrams)
            noteBkgColor: tokens.warnSoft,
            noteTextColor: tokens.ink,
            noteBorderColor: tokens.warn,
            // Sequence
            actorBkg: tokens.primarySoft,
            actorBorder: tokens.primary,
            actorTextColor: tokens.ink,
            actorLineColor: tokens.ink3,
            signalColor: tokens.ink2,
            signalTextColor: tokens.ink,
            // Journey
            sectionBkgColor: tokens.primarySoft,
            altSectionBkgColor: tokens.infoSoft,
            sectionBkgColor2: tokens.infoSoft,
            taskBkgColor: tokens.primary,
            taskTextColor: tokens.surface,
            taskTextLightColor: tokens.surface,
            taskTextOutsideColor: tokens.ink,
            taskTextDarkColor: tokens.ink,
            // Gantt
            gridColor: tokens.borderSoft,
            doneTaskBkgColor: tokens.ok,
            doneTaskBorderColor: tokens.ok,
            activeTaskBkgColor: tokens.accent,
            activeTaskBorderColor: tokens.accent,
            critBkgColor: tokens.danger,
            critBorderColor: tokens.danger,
            // Pie
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
            // xy-chart (mermaid accepts both camelCase and lowercase keys
            // across versions; provide both for safety).
            xyChart: makeXyChartVars(tokens),
            xychart: makeXyChartVars(tokens),
            // Quadrant
            quadrant1Fill: tokens.primarySoft,
            quadrant2Fill: tokens.accentSoft,
            quadrant3Fill: tokens.infoSoft,
            quadrant4Fill: tokens.warnSoft,
            quadrantTitleFill: tokens.ink,
            quadrantPointFill: tokens.primary,
            quadrantPointTextFill: tokens.ink,
            quadrantInternalBorderStrokeFill: tokens.border,
            quadrantExternalBorderStrokeFill: tokens.border,
            // Class diagram
            classText: tokens.ink,
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
          // Force chart background rects (xy-chart / quadrant / pie) to surface
          el.querySelectorAll('.background, rect.background, .main-rect, .chart-background')
            .forEach((rect) => {
              (rect as SVGElement).setAttribute('fill', tokens.surface);
            });
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

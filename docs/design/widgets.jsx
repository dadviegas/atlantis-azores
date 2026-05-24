// widgets.jsx — Rich markdown element library for Atlas
// All elements are styled to feel hand-crafted, not slop.

// ─────────────────────────────────────────────────────────────
// Icons — small line icons (16px standard)
// ─────────────────────────────────────────────────────────────
const Icon = {
  search: <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><path d="M11 11l3 3"/></svg>,
  chevronR: <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4l4 4-4 4"/></svg>,
  chevronD: <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6l4 4 4-4"/></svg>,
  sun: <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="8" cy="8" r="3"/><path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M2.8 2.8l1 1M12.2 12.2l1 1M2.8 13.2l1-1M12.2 3.8l1-1"/></svg>,
  moon: <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M12.5 9.5A5.5 5.5 0 0 1 6.5 3.5a5 5 0 1 0 6 6z"/></svg>,
  menu: <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 5h12M2 8h12M2 11h12"/></svg>,
  x: <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>,
  copy: <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="5" width="9" height="9" rx="1.5"/><path d="M11 5V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h2"/></svg>,
  check: <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l3.5 3.5L13 5"/></svg>,
  link: <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M7 9a2.5 2.5 0 0 0 3.5 0l2-2a2.5 2.5 0 0 0-3.5-3.5l-1 1M9 7a2.5 2.5 0 0 0-3.5 0l-2 2A2.5 2.5 0 0 0 7 12.5l1-1"/></svg>,
  bell: <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7a4 4 0 0 1 8 0v3l1 2H3l1-2V7zM6.5 13a1.5 1.5 0 0 0 3 0"/></svg>,
  info: <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 11V7M8 5.2v.05"/></svg>,
  warn: <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2L1.5 13.5h13L8 2z"/><path d="M8 6.5V10M8 11.8v.05"/></svg>,
  danger: <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 5v3.5M8 10.8v.05"/></svg>,
  ok: <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6"/><path d="M5 8l2.2 2.2L11 6.4"/></svg>,
  tip: <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 1v1M3 3l.7.7M13 3l-.7.7M2 8h1M13 8h1M5 11h6M6 13h4"/><path d="M5.5 11a4 4 0 1 1 5 0"/></svg>,
  bolt: <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M9 1L3 9h4l-1 6 6-8h-4l1-6z"/></svg>,
  cmd: <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3h6v6H5zM3 5a2 2 0 1 0 2 2H3zM13 5a2 2 0 1 1-2 2h2zM3 11a2 2 0 1 1 2-2v2zM13 11a2 2 0 1 0-2-2v2z"/></svg>,
  compass: <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2"/><path d="M15.5 8.5L13 13l-4.5 2.5L11 11l4.5-2.5z" fill="currentColor" fillOpacity=".3"/></svg>,
  book: <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3.5C2 2.7 2.7 2 3.5 2H14v11H3.5C2.7 13 2 13.7 2 14.5V3.5z"/><path d="M2 14.5a1.5 1.5 0 0 0 1.5 1.5H14"/></svg>,
  hash: <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M3 6h11M2 10h11M6 2l-2 12M12 2l-2 12"/></svg>,
};

// ─────────────────────────────────────────────────────────────
// Callout — alerts with icon stripe and color
// ─────────────────────────────────────────────────────────────
function Callout({ kind = 'info', title, children, compact = false }) {
  const map = {
    info:    { color: 'var(--info)',   bg: 'var(--info-soft)',   icon: Icon.info,  label: 'Note' },
    tip:     { color: 'var(--ok)',     bg: 'var(--ok-soft)',     icon: Icon.tip,   label: 'Tip' },
    warning: { color: 'var(--warn)',   bg: 'var(--warn-soft)',   icon: Icon.warn,  label: 'Warning' },
    danger:  { color: 'var(--danger)', bg: 'var(--danger-soft)', icon: Icon.danger,label: 'Danger' },
    success: { color: 'var(--ok)',     bg: 'var(--ok-soft)',     icon: Icon.ok,    label: 'Success' },
  };
  const c = map[kind] || map.info;
  return (
    <div className="atlas-callout" style={{
      display: 'grid', gridTemplateColumns: '4px 28px 1fr', columnGap: 12,
      background: c.bg, color: 'var(--ink)',
      borderRadius: 'var(--radius)',
      padding: compact ? '10px 14px' : '14px 16px',
      margin: '1.2em 0',
      border: '1px solid color-mix(in srgb, ' + c.color + ' 22%, transparent)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ background: c.color, borderRadius: 2, margin: '2px 0' }} />
      <div style={{ color: c.color, paddingTop: 1 }}>{c.icon}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '.78em', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', color: c.color, marginBottom: title || !compact ? 4 : 0 }}>
          {title || c.label}
        </div>
        <div style={{ lineHeight: 1.55 }}>{children}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CodeBlock — title bar with language pill + copy. Tokens are
// hand-tagged via <T k="kw"> etc, so styling is consistent with
// the palette (vs. shoehorning Prism into theme tokens).
// ─────────────────────────────────────────────────────────────
function T({ k, children }) {
  const map = {
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

function CodeBlock({ lang = 'ts', title, children, lineNumbers = true }) {
  const [copied, setCopied] = React.useState(false);
  const ref = React.useRef(null);
  const copy = () => {
    const text = ref.current?.innerText || '';
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    }).catch(() => {});
  };

  // Wrap children (could be string or array of <T> spans) into numbered lines.
  // Lines are derived by walking string nodes and splitting on \n.
  const raw = Array.isArray(children) ? children : [children];
  const lines = [[]];
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

// ─────────────────────────────────────────────────────────────
// Math — KaTeX-style display equation rendered by hand.
// Just enough composition for showcase purposes.
// ─────────────────────────────────────────────────────────────
function MathEq({ children, inline = false }) {
  const style = {
    fontFamily: '"KaTeX_Main", "Latin Modern Math", "Cambria Math", "Times New Roman", serif',
    fontStyle: 'italic',
    letterSpacing: 0,
  };
  if (inline) {
    return <span style={{ ...style, fontSize: '1.04em', padding: '0 .15em' }}>{children}</span>;
  }
  return (
    <div style={{
      margin: '1.4em 0',
      padding: '1.1em 1.2em',
      background: 'var(--surface)',
      borderLeft: '2px solid var(--accent)',
      borderRadius: '0 var(--radius) var(--radius) 0',
      textAlign: 'center', position: 'relative',
      overflowX: 'auto',
    }}>
      <span style={{
        position: 'absolute', top: 8, right: 12,
        fontFamily: 'var(--font-mono)', fontSize: '.7em',
        color: 'var(--ink-3)', letterSpacing: '.1em',
      }}>TEX</span>
      <span style={{ ...style, fontSize: '1.3em', color: 'var(--ink)' }}>{children}</span>
    </div>
  );
}

// helpers for math composition
const Frac = ({ n, d }) => (
  <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle', margin: '0 .15em', lineHeight: 1.05, fontSize: '.92em' }}>
    <span style={{ borderBottom: '1px solid currentColor', padding: '0 .35em .05em' }}>{n}</span>
    <span style={{ padding: '.05em .35em 0' }}>{d}</span>
  </span>
);
const Sup = ({ children }) => <sup style={{ fontSize: '.7em', lineHeight: 0, verticalAlign: 'super' }}>{children}</sup>;
const Sub = ({ children }) => <sub style={{ fontSize: '.7em', lineHeight: 0, verticalAlign: 'sub' }}>{children}</sub>;
const Sum = ({ from, to, children }) => (
  <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle', margin: '0 .2em', fontSize: '.95em', lineHeight: 1 }}>
    <span style={{ fontSize: '.55em' }}>{to}</span>
    <span style={{ fontSize: '1.6em', lineHeight: .8 }}>∑</span>
    <span style={{ fontSize: '.55em' }}>{from}</span>
  </span>
);
const Int = ({ from, to }) => (
  <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle', margin: '0 .1em', fontSize: '1em', lineHeight: 1 }}>
    <span style={{ fontSize: '.55em', alignSelf: 'flex-end', marginLeft: '.4em' }}>{to}</span>
    <span style={{ fontSize: '1.6em', lineHeight: .8 }}>∫</span>
    <span style={{ fontSize: '.55em', alignSelf: 'flex-start', marginLeft: '-.1em' }}>{from}</span>
  </span>
);

// ─────────────────────────────────────────────────────────────
// Mermaid-style flowchart — hand-drawn SVG with crisp geometry
// ─────────────────────────────────────────────────────────────
function Mermaid({ title }) {
  return (
    <figure style={{ margin: '1.6em 0' }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '18px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* subtle dotted graph paper */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, var(--border-soft) 1px, transparent 1px)',
          backgroundSize: '14px 14px',
          backgroundPosition: '7px 7px',
          opacity: .55, pointerEvents: 'none',
        }} />
        <div style={{ position: 'absolute', top: 10, right: 14, fontFamily: 'var(--font-mono)', fontSize: '.7em', color: 'var(--ink-3)', letterSpacing: '.1em' }}>
          MERMAID · graph LR
        </div>
        <svg viewBox="0 0 720 280" style={{ width: '100%', height: 'auto', position: 'relative', display: 'block' }}>
          <defs>
            <marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0L10 5L0 10z" fill="var(--ink-2)" />
            </marker>
            <filter id="sh" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity=".12" />
            </filter>
          </defs>

          {/* edges (drawn first so nodes sit on top) */}
          <g fill="none" stroke="var(--ink-2)" strokeWidth="1.6" markerEnd="url(#ar)" strokeLinecap="round">
            <path d="M120 60 L 220 60" />
            <path d="M340 60 Q 380 60 380 100 L 380 130" />
            <path d="M340 60 Q 380 60 380 100 L 380 30" strokeDasharray="4 3" />
            <path d="M460 150 L 540 150" />
            <path d="M460 150 L 540 230" />
            <path d="M620 150 Q 680 150 680 100 L 680 30 L 340 30" />
          </g>

          {/* nodes */}
          <g style={{ filter: 'url(#sh)' }}>
            {/* request */}
            <rect x="20" y="38" width="100" height="44" rx="8" fill="var(--primary-soft)" stroke="var(--primary)" strokeWidth="1.4"/>
            <text x="70" y="64" textAnchor="middle" fontSize="13" fontFamily="var(--font-sans)" fill="var(--ink)" fontWeight="500">Request</text>

            {/* auth diamond */}
            <path d="M220 60 L 280 30 L 340 60 L 280 90 Z" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.4"/>
            <text x="280" y="64" textAnchor="middle" fontSize="13" fontFamily="var(--font-sans)" fill="var(--ink)" fontWeight="500">Auth?</text>

            {/* allow rect */}
            <rect x="330" y="130" width="130" height="44" rx="8" fill="var(--surface-2)" stroke="var(--border)" strokeWidth="1.2"/>
            <text x="395" y="156" textAnchor="middle" fontSize="13" fontFamily="var(--font-sans)" fill="var(--ink)" fontWeight="500">Route Handler</text>

            {/* db cylinder */}
            <g transform="translate(540 130)">
              <ellipse cx="40" cy="6" rx="40" ry="6" fill="var(--info-soft)" stroke="var(--info)" strokeWidth="1.2"/>
              <rect x="0" y="6" width="80" height="32" fill="var(--info-soft)" stroke="var(--info)" strokeWidth="1.2" />
              <line x1="0" y1="6" x2="0" y2="38" stroke="var(--info)" strokeWidth="1.2"/>
              <line x1="80" y1="6" x2="80" y2="38" stroke="var(--info)" strokeWidth="1.2"/>
              <ellipse cx="40" cy="38" rx="40" ry="6" fill="var(--info-soft)" stroke="var(--info)" strokeWidth="1.2"/>
              <text x="40" y="28" textAnchor="middle" fontSize="13" fontFamily="var(--font-sans)" fill="var(--ink)" fontWeight="500">DB</text>
            </g>

            {/* cache */}
            <rect x="540" y="210" width="80" height="44" rx="8" fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth="1.4"/>
            <text x="580" y="236" textAnchor="middle" fontSize="13" fontFamily="var(--font-sans)" fill="var(--ink)" fontWeight="500">Cache</text>

            {/* reject rect */}
            <rect x="240" y="8" width="100" height="40" rx="8" fill="var(--danger-soft)" stroke="var(--danger)" strokeWidth="1.4"/>
            <text x="290" y="32" textAnchor="middle" fontSize="13" fontFamily="var(--font-sans)" fill="var(--ink)" fontWeight="500">401</text>
          </g>

          {/* edge labels */}
          <g fontFamily="var(--font-sans)" fontSize="11" fill="var(--ink-2)">
            <text x="170" y="54">JWT</text>
            <text x="304" y="120" textAnchor="middle">yes</text>
            <text x="304" y="24">no</text>
            <text x="500" y="142">read</text>
            <text x="500" y="220">miss</text>
          </g>
        </svg>
      </div>
      {title && <figcaption>{title}</figcaption>}
    </figure>
  );
}

// ─────────────────────────────────────────────────────────────
// LineChart — request latency over a week, hand-drawn SVG
// ─────────────────────────────────────────────────────────────
function LineChart({ data, title, unit = 'ms' }) {
  const W = 720, H = 240;
  const PAD = { l: 42, r: 16, t: 16, b: 32 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const max = Math.max(...data.flatMap((s) => s.values));
  const min = 0;
  const xs = data[0].values.map((_, i) => PAD.l + (i / (data[0].values.length - 1)) * innerW);
  const yOf = (v) => PAD.t + innerH - ((v - min) / (max - min)) * innerH;

  const yTicks = 4;
  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => Math.round((max * i) / yTicks));

  return (
    <figure style={{ margin: '1.6em 0' }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '14px 16px 8px',
        position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ fontWeight: 600, fontSize: '.95em' }}>{title}</div>
          <div style={{ display: 'flex', gap: 14, fontSize: '.8em' }}>
            {data.map((s) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-2)' }}>
                <span style={{ width: 16, height: 2, background: s.color, borderRadius: 2 }} />
                {s.label}
              </div>
            ))}
          </div>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          {/* grid */}
          {ticks.map((t, i) => {
            const y = yOf(t);
            return (
              <g key={i}>
                <line x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke="var(--border-soft)" strokeWidth="1" strokeDasharray={i === 0 ? '' : '2 3'} />
                <text x={PAD.l - 8} y={y + 4} fontSize="10" fontFamily="var(--font-mono)" fill="var(--ink-3)" textAnchor="end">{t}{unit}</text>
              </g>
            );
          })}
          {/* x labels */}
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) => (
            <text key={d} x={xs[i]} y={H - 10} fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--ink-3)" textAnchor="middle">{d}</text>
          ))}
          {/* series */}
          {data.map((s, si) => {
            const pts = s.values.map((v, i) => `${xs[i]},${yOf(v)}`).join(' ');
            const areaD = `M ${xs[0]},${yOf(0)} L ${s.values.map((v,i)=>`${xs[i]},${yOf(v)}`).join(' L ')} L ${xs[xs.length-1]},${yOf(0)} Z`;
            return (
              <g key={s.label}>
                {si === 0 && <path d={areaD} fill={s.color} opacity=".12" />}
                <polyline points={pts} fill="none" stroke={s.color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                {s.values.map((v, i) => (
                  <circle key={i} cx={xs[i]} cy={yOf(v)} r="2.5" fill="var(--surface)" stroke={s.color} strokeWidth="1.6" />
                ))}
              </g>
            );
          })}
        </svg>
      </div>
      {title && <figcaption style={{ marginTop: 4 }}>Weekly p95 latency, two regions</figcaption>}
    </figure>
  );
}

// ─────────────────────────────────────────────────────────────
// BarChart — small, horizontal, sparkline-feel
// ─────────────────────────────────────────────────────────────
function BarChart({ data, title }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <figure style={{ margin: '1.6em 0' }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '14px 16px',
      }}>
        <div style={{ fontWeight: 600, fontSize: '.95em', marginBottom: 10 }}>{title}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.map((d, i) => {
            const pct = (d.value / max) * 100;
            return (
              <div key={d.label} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 60px', alignItems: 'center', gap: 10, fontSize: '.88em' }}>
                <div style={{ color: 'var(--ink-2)' }}>{d.label}</div>
                <div style={{ height: 22, background: 'var(--surface-2)', borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
                  <div style={{
                    position: 'absolute', inset: 0,
                    width: pct + '%',
                    background: `linear-gradient(90deg, ${d.color || 'var(--primary)'} 0%, color-mix(in srgb, ${d.color || 'var(--primary)'} 70%, var(--accent)) 100%)`,
                    borderRadius: 4,
                    transition: 'width .4s ease',
                  }} />
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.85em', color: 'var(--ink)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{d.value.toLocaleString()}</div>
              </div>
            );
          })}
        </div>
      </div>
    </figure>
  );
}

// ─────────────────────────────────────────────────────────────
// TaskList — checkboxes with progress bar
// ─────────────────────────────────────────────────────────────
function TaskList({ title, initialTasks }) {
  const [tasks, setTasks] = React.useState(initialTasks);
  const done = tasks.filter((t) => t.done).length;
  const pct = (done / tasks.length) * 100;
  return (
    <div style={{
      margin: '1.4em 0',
      padding: '14px 16px',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <div style={{ fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: '.82em', color: 'var(--ink-3)', fontVariantNumeric: 'tabular-nums' }}>{done}/{tasks.length}</div>
      </div>
      <div style={{ height: 4, background: 'var(--surface-2)', borderRadius: 2, overflow: 'hidden', marginBottom: 10 }}>
        <div style={{ height: '100%', width: pct + '%', background: 'var(--primary)', transition: 'width .3s ease' }} />
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {tasks.map((t, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setTasks((ts) => ts.map((x, j) => j === i ? { ...x, done: !x.done } : x))}
              style={{
                width: 18, height: 18, borderRadius: 5,
                border: '1.5px solid ' + (t.done ? 'var(--primary)' : 'var(--border)'),
                background: t.done ? 'var(--primary)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--surface)', flexShrink: 0,
                transition: 'all .15s ease',
              }}
            >
              {t.done && Icon.check}
            </button>
            <span style={{
              color: t.done ? 'var(--ink-3)' : 'var(--ink)',
              textDecoration: t.done ? 'line-through' : 'none',
              fontSize: '.95em', transition: 'color .15s',
            }}>{t.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Toast — slides in then auto-dismisses (visual demo here is static)
// ─────────────────────────────────────────────────────────────
function ToastDemo({ kind = 'info', title, body }) {
  const c = ({
    info:    { dot: 'var(--info)',  icon: Icon.bell },
    success: { dot: 'var(--ok)',    icon: Icon.ok },
    danger:  { dot: 'var(--danger)',icon: Icon.danger },
  })[kind] || { dot: 'var(--info)', icon: Icon.bell };
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '12px 14px',
      background: 'color-mix(in srgb, var(--surface) 96%, var(--ink))',
      color: 'var(--ink)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      boxShadow: '0 8px 24px rgba(0,0,0,.08), 0 2px 6px rgba(0,0,0,.04)',
      maxWidth: 360,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: 'color-mix(in srgb, ' + c.dot + ' 15%, transparent)',
        color: c.dot,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>{c.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '.92em', marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: '.86em', color: 'var(--ink-2)', lineHeight: 1.4 }}>{body}</div>
      </div>
      <button style={{ color: 'var(--ink-3)', padding: 2, marginTop: -2 }}>{Icon.x}</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ImageFigure — placeholder image with caption
// ─────────────────────────────────────────────────────────────
function ImageFigure({ caption, ratio = '16 / 9', tone = 'cool' }) {
  // Decorative SVG placeholder so users see "image goes here" intent
  // without me hallucinating a real photo.
  return (
    <figure style={{ margin: '1.6em 0' }}>
      <div style={{
        aspectRatio: ratio,
        background: tone === 'warm'
          ? 'linear-gradient(135deg, var(--accent-soft), var(--surface-2))'
          : 'linear-gradient(135deg, var(--primary-soft), var(--info-soft))',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg viewBox="0 0 400 220" style={{ width: '60%', height: 'auto', opacity: .5 }}>
          <defs>
            <linearGradient id="mtn" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" />
              <stop offset="100%" stopColor="var(--accent)" />
            </linearGradient>
          </defs>
          <circle cx="320" cy="50" r="22" fill="var(--accent)" opacity=".6"/>
          <path d="M0 180 L80 110 L130 140 L200 80 L260 130 L330 90 L400 150 L400 220 L0 220 Z" fill="url(#mtn)"/>
        </svg>
        <div style={{
          position: 'absolute', bottom: 8, right: 10,
          fontFamily: 'var(--font-mono)', fontSize: '.7em',
          color: 'var(--ink-3)', letterSpacing: '.1em',
        }}>FIGURE</div>
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

// ─────────────────────────────────────────────────────────────
// Kbd — keyboard chip
// ─────────────────────────────────────────────────────────────
function Kbd({ children }) {
  return (
    <kbd style={{
      fontFamily: 'var(--font-mono)',
      fontSize: '.78em',
      padding: '1px 6px',
      background: 'var(--surface-2)',
      border: '1px solid var(--border)',
      borderBottomWidth: 2,
      borderRadius: 4,
      color: 'var(--ink-2)',
      verticalAlign: 'middle',
      lineHeight: 1.4,
    }}>{children}</kbd>
  );
}

// MathEq avoids shadowing window.Math.
Object.assign(window, {
  Icon, Callout, CodeBlock, T,
  MathEq, MathBlock: MathEq, Frac, Sup, Sub, Sum, Int,
  Mermaid, LineChart, BarChart, TaskList, ToastDemo, ImageFigure, Kbd,
});

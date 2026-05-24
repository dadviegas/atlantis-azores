// design-system.jsx — Atlas Design System reference page.
// Catalogs colors, type, spacing, radius, shadow, and every component
// that the Atlas project consumes.

// ─────────────────────────────────────────────────────────────
// Top-level helpers
// ─────────────────────────────────────────────────────────────
function DSPageNav({ palette, setPalette, dark, setDark, font, setFont, density, setDensity, radius, setRadius }) {
  const PALETTES = [
    { id: 'cove',    label: 'Cove',    colors: ['#5d7a5b', '#c0563b', '#ede4d0'] },
    { id: 'atelier', label: 'Atelier', colors: ['#1a1814', '#e0432a', '#f2eee3'] },
    { id: 'botanic', label: 'Botanic', colors: ['#1f5d5a', '#d49a26', '#e8e4d6'] },
    { id: 'tide',    label: 'Tide',    colors: ['#406d8e', '#d29031', '#e6e7e0'] },
    { id: 'riso',    label: 'Riso',    colors: ['#2d3494', '#ec6a82', '#f6e9d4'] },
    { id: 'cabin',   label: 'Cabin',   colors: ['#2e4a2c', '#b86b2b', '#e6dcc0'] },
  ];
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 20,
      background: 'color-mix(in srgb, var(--bg) 88%, transparent)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
      padding: '12px 28px',
      display: 'flex', alignItems: 'center', gap: 18,
      flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <AtlasLogo size={22} />
        <span style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: '.78em', letterSpacing: '.1em' }}>
          / DESIGN SYSTEM
        </span>
      </div>

      <div style={{ flex: 1 }} />

      {/* palette swatches */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ fontSize: '.78em', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 600 }}>Palette</span>
        {PALETTES.map((p) => {
          const sel = palette === p.id;
          return (
            <button key={p.id} onClick={() => setPalette(p.id)}
              title={p.label}
              style={{
                width: 28, height: 24, borderRadius: 5,
                border: sel ? '1.5px solid var(--ink)' : '1px solid var(--border)',
                padding: 0, overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
                cursor: 'pointer',
                boxShadow: sel ? '0 0 0 3px color-mix(in srgb, var(--accent) 30%, transparent)' : 'none',
              }}>
              <span style={{ flex: 2, background: p.colors[0] }} />
              <span style={{ flex: 1, display: 'flex' }}>
                <span style={{ flex: 1, background: p.colors[1] }} />
                <span style={{ flex: 1, background: p.colors[2] }} />
              </span>
            </button>
          );
        })}
      </div>

      <button onClick={() => setDark(!dark)} title="Toggle theme"
        style={{
          width: 32, height: 32, borderRadius: 'var(--radius-sm)',
          color: 'var(--ink-2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background .12s, color .12s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--ink)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-2)'; }}
      >{dark ? Icon.sun : Icon.moon}</button>
    </header>
  );
}

// Section title + intro
function DSSection({ id, label, title, subtitle, children }) {
  return (
    <section id={id} style={{ paddingTop: 48, marginBottom: 12, scrollMarginTop: 80 }}>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: '.78em',
        color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '.12em',
        fontWeight: 600, marginBottom: 8,
      }}>{label}</div>
      <h2 style={{
        margin: 0, color: 'var(--ink)',
        fontFamily: '"Fraunces", serif',
        fontSize: '2.2em', fontWeight: 500,
        letterSpacing: '-.02em', lineHeight: 1.1,
        fontVariationSettings: '"opsz" 144',
        marginBottom: subtitle ? 8 : 24,
      }}>{title}</h2>
      {subtitle && (
        <p style={{ color: 'var(--ink-2)', fontSize: '1.05em', lineHeight: 1.5, maxWidth: '60ch', marginTop: 0, marginBottom: 24 }}>
          {subtitle}
        </p>
      )}
      {children}
    </section>
  );
}

// Subsection within a section
function DSGroup({ title, description, children, fullBleed }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{
          margin: 0, fontSize: '1.05em', fontWeight: 600, color: 'var(--ink)',
          fontFamily: 'var(--font-sans)',
        }}>{title}</h3>
        {description && (
          <p style={{ margin: '4px 0 0', fontSize: '.92em', color: 'var(--ink-2)', maxWidth: '60ch', lineHeight: 1.5 }}>{description}</p>
        )}
      </div>
      {fullBleed
        ? children
        : (
          <div style={{
            padding: 24,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
          }}>{children}</div>
        )
      }
    </div>
  );
}

// Color swatch with token name + value
function Swatch({ name, value, large = false }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      borderRadius: 'var(--radius-sm)',
      overflow: 'hidden',
      border: '1px solid var(--border-soft)',
    }}>
      <div style={{ height: large ? 86 : 52, background: value }} />
      <div style={{
        padding: '8px 10px',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border-soft)',
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.78em', color: 'var(--ink)', fontWeight: 500 }}>{name}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.72em', color: 'var(--ink-3)', marginTop: 2 }}>{value}</div>
      </div>
    </div>
  );
}

// All palettes shown as a grid of mini-previews
function PaletteCard({ id, label, light, dark }) {
  const [showDark, setShowDark] = React.useState(false);
  const colors = showDark ? dark : light;
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
    }}>
      <div data-palette={id} data-theme={showDark ? 'dark' : 'light'} style={{
        padding: '16px 18px',
        background: 'var(--bg)',
        color: 'var(--ink)',
        borderBottom: '1px solid var(--border)',
      }}>
        {/* mini app preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
          <span style={{ fontFamily: '"Fraunces", serif', fontSize: '1.4em', fontWeight: 500, fontStyle: 'italic' }}>{label}</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {colors.map((c, i) => (
            <div key={i} style={{ flex: 1, height: 28, borderRadius: 4, background: c }} />
          ))}
        </div>
        <div style={{ fontSize: '.78em', color: 'var(--ink-2)', marginTop: 10, fontStyle: 'italic' }}>
          A taste of the {label.toLowerCase()} mood.
        </div>
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '8px 14px', background: 'var(--surface-2)', fontSize: '.78em',
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-2)' }}>data-palette="{id}"</span>
        <button onClick={() => setShowDark((d) => !d)} style={{
          padding: '3px 8px', borderRadius: 99,
          background: 'var(--surface)',
          color: 'var(--ink-2)', fontSize: '.8em',
          border: '1px solid var(--border)',
        }}>{showDark ? 'dark ●' : '○ dark'}</button>
      </div>
    </div>
  );
}

// Spacing / radius / shadow scale visual
function ScaleRow({ label, value, demo }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '90px 100px 1fr',
      alignItems: 'center', gap: 16,
      padding: '8px 0',
      borderBottom: '1px solid var(--border-soft)',
    }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.85em', color: 'var(--ink)', fontWeight: 500 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.78em', color: 'var(--ink-3)' }}>{value}</div>
      <div>{demo}</div>
    </div>
  );
}

// Buttons component for the catalog
function ButtonShowcase() {
  const Btn = ({ kind, children, size = 'md' }) => {
    const styles = {
      primary: { background: 'var(--primary)', color: 'var(--bg)', border: '1px solid var(--primary)' },
      accent:  { background: 'var(--accent)',  color: '#fff',       border: '1px solid var(--accent)' },
      ghost:   { background: 'transparent',    color: 'var(--ink)', border: '1px solid var(--border)' },
      link:    { background: 'transparent',    color: 'var(--accent)', border: '1px solid transparent', textDecoration: 'underline', textUnderlineOffset: 3 },
    };
    const sizes = {
      sm: { padding: '4px 10px', fontSize: '.82em' },
      md: { padding: '8px 14px', fontSize: '.92em' },
      lg: { padding: '11px 20px', fontSize: '1.02em' },
    };
    return (
      <button style={{
        ...styles[kind], ...sizes[size],
        borderRadius: 'var(--radius-sm)',
        fontWeight: 500,
        transition: 'transform .12s, opacity .12s',
        cursor: 'pointer',
      }}>{children}</button>
    );
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <Btn kind="primary">Primary</Btn>
        <Btn kind="accent">Accent</Btn>
        <Btn kind="ghost">Ghost</Btn>
        <Btn kind="link">Link only</Btn>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <Btn kind="primary" size="sm">Small</Btn>
        <Btn kind="primary">Medium</Btn>
        <Btn kind="primary" size="lg">Large</Btn>
      </div>
    </div>
  );
}

// Inputs
function InputShowcase() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
      <div>
        <label style={{ fontSize: '.78em', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600 }}>Input</label>
        <input type="text" defaultValue="Atlas" style={{
          marginTop: 6, width: '100%', padding: '8px 10px',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', color: 'var(--ink)',
        }} />
      </div>
      <div>
        <label style={{ fontSize: '.78em', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600 }}>Search</label>
        <div style={{
          marginTop: 6, display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 10px', background: 'var(--surface)',
          border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
          color: 'var(--ink-3)',
        }}>
          {Icon.search}
          <span style={{ flex: 1 }}>Search atlas…</span>
          <span style={{ display: 'flex', gap: 2 }}><Kbd>⌘</Kbd><Kbd>K</Kbd></span>
        </div>
      </div>
      <div>
        <label style={{ fontSize: '.78em', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600 }}>Disabled</label>
        <input type="text" defaultValue="—" disabled style={{
          marginTop: 6, width: '100%', padding: '8px 10px',
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', color: 'var(--ink-3)',
        }} />
      </div>
    </div>
  );
}

// Badges
function BadgeShowcase() {
  const B = ({ tone, children }) => (
    <span style={{
      fontSize: '.74em', fontWeight: 600,
      padding: '3px 10px', borderRadius: 99,
      background: `var(--${tone}-soft)`,
      color: `var(--${tone})`,
      textTransform: 'uppercase', letterSpacing: '.08em',
    }}>{children}</span>
  );
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <B tone="ok">Verified</B>
      <B tone="info">Updated</B>
      <B tone="warn">Draft</B>
      <B tone="danger">Deprecated</B>
      <B tone="accent">New</B>
      <B tone="primary">Beta</B>
    </div>
  );
}

// Toggle
function ToggleShowcase() {
  const [a, setA] = React.useState(false);
  const [b, setB] = React.useState(true);
  const T = ({ value, onChange, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <button onClick={() => onChange(!value)} style={{
        position: 'relative', width: 36, height: 20, borderRadius: 999,
        background: value ? 'var(--primary)' : 'var(--surface-3)',
        transition: 'background .15s',
      }}>
        <span style={{
          position: 'absolute', top: 2, left: 2,
          width: 16, height: 16, borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 2px rgba(0,0,0,.25)',
          transform: value ? 'translateX(16px)' : 'none',
          transition: 'transform .15s',
        }} />
      </button>
      <span style={{ fontSize: '.92em', color: 'var(--ink)' }}>{label}</span>
    </div>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <T value={a} onChange={setA} label="Notify on edits" />
      <T value={b} onChange={setB} label="Sync wirelessly" />
    </div>
  );
}

// Tabs
function TabsShowcase() {
  const [tab, setTab] = React.useState('all');
  const TABS = [
    { id: 'all', label: 'All', n: 248 },
    { id: 'js', label: 'JavaScript', n: 42 },
    { id: 'net', label: 'Networking', n: 31 },
    { id: 'sys', label: 'Systems', n: 27 },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* segmented */}
      <div style={{
        display: 'inline-flex', padding: 3, gap: 2,
        background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)',
        width: 'fit-content',
      }}>
        {TABS.slice(0, 3).map((t) => {
          const sel = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '5px 14px', borderRadius: 'calc(var(--radius-sm) - 2px)',
              background: sel ? 'var(--surface)' : 'transparent',
              color: sel ? 'var(--ink)' : 'var(--ink-2)',
              fontSize: '.88em', fontWeight: 500,
              boxShadow: sel ? '0 1px 2px rgba(0,0,0,.06)' : 'none',
              transition: 'all .12s',
            }}>{t.label}</button>
          );
        })}
      </div>
      {/* underline */}
      <div style={{ display: 'flex', gap: 18, borderBottom: '1px solid var(--border)' }}>
        {TABS.map((t) => {
          const sel = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '8px 0', position: 'relative',
              fontSize: '.92em', fontWeight: 500,
              color: sel ? 'var(--ink)' : 'var(--ink-2)',
            }}>
              {t.label} <span style={{ color: 'var(--ink-3)', fontSize: '.85em' }}>{t.n}</span>
              {sel && <span style={{
                position: 'absolute', left: 0, right: 0, bottom: -1, height: 2,
                background: 'var(--accent)', borderRadius: 1,
              }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Book card preview using the home page art
function CardShowcase() {
  const fakeBook = {
    id: 'js', label: 'JavaScript', color: 'amber',
    children: [
      { id: 'a', label: 'TypeScript', children: [{ id: 'a1', label: 'p' }, { id: 'a2', label: 'p' }, { id: 'a3', label: 'p' }] },
      { id: 'b', label: 'React',      children: [{ id: 'b1', label: 'p' }, { id: 'b2', label: 'p' }] },
      { id: 'c', label: 'Node',       children: [{ id: 'c1', label: 'p' }] },
    ],
  };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
      <BookCard book={fakeBook} index={0} onSelectPage={() => {}} />
      <BookCard book={{ ...fakeBook, id: 'net', label: 'Networking', color: 'blue' }} index={1} onSelectPage={() => {}} />
      <BookCard book={{ ...fakeBook, id: 'db', label: 'Databases', color: 'rust' }} index={2} onSelectPage={() => {}} />
    </div>
  );
}

// Sample sidebar tree for showcase
function SidebarShowcase() {
  const [expanded, setExpanded] = React.useState(['js', 'js-ts']);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(220px, 1fr))', gap: 14 }}>
      <div style={{ height: 380, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
        <Sidebar variant="shelf" currentPageId="js-ts-generics"
          onSelectPage={() => {}} expanded={expanded} setExpanded={setExpanded}
          viewport="desktop" onGoHome={() => {}} />
      </div>
      <div style={{ height: 380, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
        <Sidebar variant="tree" currentPageId="js-ts-generics"
          onSelectPage={() => {}} expanded={expanded} setExpanded={setExpanded}
          viewport="desktop" onGoHome={() => {}} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main DesignSystem page
// ─────────────────────────────────────────────────────────────
const DS_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette":  "cove",
  "dark":     false,
  "density":  "comfy",
  "radius":   10,
  "fontSans": "'DM Sans', ui-sans-serif, system-ui, sans-serif"
}/*EDITMODE-END*/;

function DesignSystem() {
  const [t, setTweak] = useTweaks(DS_DEFAULTS);

  // System dark preference seeding (mirrors App)
  React.useEffect(() => {
    if (window.__ds_seeded) return;
    window.__ds_seeded = true;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    if (mq.matches && !t.dark) setTweak('dark', true);
  }, []);

  const TOC = [
    { id: 'colors',    label: 'Colors' },
    { id: 'type',      label: 'Typography' },
    { id: 'space',     label: 'Spacing' },
    { id: 'radius',    label: 'Radius & shape' },
    { id: 'elevation', label: 'Elevation' },
    { id: 'buttons',   label: 'Buttons' },
    { id: 'inputs',    label: 'Inputs' },
    { id: 'badges',    label: 'Badges' },
    { id: 'toggles',   label: 'Toggles' },
    { id: 'tabs',      label: 'Tabs' },
    { id: 'callouts',  label: 'Callouts' },
    { id: 'code',      label: 'Code block' },
    { id: 'math',      label: 'Math' },
    { id: 'mermaid',   label: 'Mermaid' },
    { id: 'charts',    label: 'Charts' },
    { id: 'tasks',     label: 'Task list' },
    { id: 'toasts',    label: 'Toasts' },
    { id: 'tables',    label: 'Tables' },
    { id: 'cards',     label: 'Cards' },
    { id: 'kbd',       label: 'Keyboard chips' },
    { id: 'figure',    label: 'Figures' },
    { id: 'sidebar',   label: 'Sidebar' },
    { id: 'cmdk',      label: 'Command palette' },
  ];

  const ALL_PALETTES = [
    { id: 'cove',    label: 'Cove',
      light: ['#ede4d0', '#f5ede0', '#5d7a5b', '#c0563b', '#222a23'],
      dark:  ['#131815', '#1c221d', '#a4ba99', '#e08470', '#ece4d2'] },
    { id: 'atelier', label: 'Atelier',
      light: ['#f2eee3', '#faf6ea', '#1a1814', '#e0432a', '#1a1814'],
      dark:  ['#0c0b08', '#161410', '#f2eee3', '#ff6442', '#f2eee3'] },
    { id: 'botanic', label: 'Botanic',
      light: ['#e8e4d6', '#f1ede0', '#1f5d5a', '#d49a26', '#122524'],
      dark:  ['#0a1716', '#122120', '#4d9b97', '#f0b950', '#e8e4d6'] },
    { id: 'tide',    label: 'Tide',
      light: ['#e6e7e0', '#f1f0e8', '#406d8e', '#d29031', '#15212d'],
      dark:  ['#0d141c', '#161e28', '#7eaad0', '#e3b35a', '#e3e6e4'] },
    { id: 'riso',    label: 'Riso',
      light: ['#f6e9d4', '#fdf2dc', '#2d3494', '#ec6a82', '#1c1d4f'],
      dark:  ['#0f1130', '#181a3d', '#8e93dc', '#ff8aa1', '#f6e9d4'] },
    { id: 'cabin',   label: 'Cabin',
      light: ['#e6dcc0', '#f0e6c9', '#2e4a2c', '#b86b2b', '#1a2719'],
      dark:  ['#0f140d', '#181f15', '#88af74', '#d99046', '#ebe2c9'] },
  ];

  const SAMPLE_LATENCY = [
    { label: 'before', color: 'var(--ink-3)', values: [42, 44, 41, 48, 51, 49, 47] },
    { label: 'after',  color: 'var(--accent)', values: [42, 22, 23, 21, 19, 18, 17] },
  ];
  const SAMPLE_BAR = [
    { label: 'TS strict',  value: 218, color: 'var(--primary)' },
    { label: 'TS lenient', value: 84,  color: 'var(--info)' },
    { label: 'Plain JS',   value: 12,  color: 'var(--warn)' },
    { label: 'JSDoc only', value: 41,  color: 'var(--accent)' },
  ];

  return (
    <div className="atlas-root atlas-scroll"
      data-palette={t.palette}
      data-theme={t.dark ? 'dark' : 'light'}
      data-density={t.density}
      style={{
        '--radius': t.radius + 'px',
        '--radius-sm': Math.max(2, t.radius - 4) + 'px',
        '--radius-lg': (t.radius + 8) + 'px',
        '--font-sans': t.fontSans,
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--ink)',
      }}>

      <DSPageNav
        palette={t.palette} setPalette={(v) => setTweak('palette', v)}
        dark={t.dark} setDark={(v) => setTweak('dark', v)}
        font={t.fontSans} setFont={(v) => setTweak('fontSans', v)}
        density={t.density} setDensity={(v) => setTweak('density', v)}
        radius={t.radius} setRadius={(v) => setTweak('radius', v)}
      />

      {/* Two-col body */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)',
        maxWidth: 1240, margin: '0 auto',
        padding: '0 28px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '200px minmax(0, 1fr)',
          gap: 56,
        }}>
          {/* TOC */}
          <aside style={{
            position: 'sticky', top: 80, alignSelf: 'start',
            paddingTop: 48, paddingBottom: 32,
            maxHeight: 'calc(100vh - 80px)', overflowY: 'auto',
          }} className="atlas-scroll">
            <div style={{
              fontSize: '.74em', textTransform: 'uppercase', letterSpacing: '.12em',
              color: 'var(--ink-3)', fontWeight: 600, marginBottom: 12,
            }}>Contents</div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {TOC.map((it) => (
                <a key={it.id} href={'#' + it.id} style={{
                  padding: '4px 8px', borderRadius: 4,
                  fontSize: '.88em', color: 'var(--ink-2)',
                  borderBottom: 'none', textDecoration: 'none',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--ink)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-2)'; }}
                >{it.label}</a>
              ))}
            </nav>
          </aside>

          {/* main */}
          <main style={{ paddingTop: 32, paddingBottom: 96, minWidth: 0 }}>

            {/* HERO */}
            <section style={{ marginBottom: 24, marginTop: 16 }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '.78em',
                color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '.12em',
                fontWeight: 600, marginBottom: 10,
              }}>Atlas · System v2.4 · May 2026</div>
              <h1 style={{
                margin: 0, color: 'var(--ink)',
                fontFamily: '"Fraunces", serif',
                fontSize: '4em', fontWeight: 500,
                letterSpacing: '-.03em', lineHeight: 1,
                fontVariationSettings: '"opsz" 144',
              }}>
                The <em style={{ color: 'var(--accent)' }}>Atlas</em> Design System
              </h1>
              <p style={{ color: 'var(--ink-2)', fontSize: '1.15em', lineHeight: 1.5, maxWidth: '60ch', marginTop: 16, marginBottom: 8 }}>
                Every token, surface and component used by the Atlas docs app. A
                single source of truth — swap the palette above and watch the whole
                page reflect what your product would look like.
              </p>
              <p style={{ color: 'var(--ink-3)', fontSize: '.92em', maxWidth: '60ch', marginTop: 0 }}>
                Built on six palettes &middot; light + dark &middot; three densities &middot; five sans families.
              </p>
            </section>

            {/* ───────── COLORS ───────── */}
            <DSSection id="colors" label="Foundations · 01" title="Colors" subtitle="Six curated palettes, each with a light and a dark theme. Tokens are CSS variables exposed under [data-palette] selectors — pick once and the entire surface reflows.">
              <DSGroup title="All palettes" description="Click any palette in the top nav to apply globally; toggle the dark switch on each card to preview both themes side-by-side." fullBleed>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: 14,
                }}>
                  {ALL_PALETTES.map((p) => (
                    <PaletteCard key={p.id} id={p.id} label={p.label} light={p.light} dark={p.dark} />
                  ))}
                </div>
              </DSGroup>

              <DSGroup title="Semantic tokens" description="Current palette resolved.">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
                  {['bg','surface','surface-2','ink','ink-2','ink-3','border','primary','accent','warn','danger','info','ok'].map((tok) => (
                    <Swatch key={tok} name={'--' + tok} value={`var(--${tok})`} />
                  ))}
                </div>
              </DSGroup>

              <DSGroup title="Soft variants" description="Semantically-tinted backgrounds for callouts, badges, and chips.">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
                  {['primary-soft','accent-soft','warn-soft','danger-soft','info-soft','ok-soft'].map((tok) => (
                    <Swatch key={tok} name={'--' + tok} value={`var(--${tok})`} />
                  ))}
                </div>
              </DSGroup>
            </DSSection>

            {/* ───────── TYPE ───────── */}
            <DSSection id="type" label="Foundations · 02" title="Typography" subtitle="DM Sans for UI, Fraunces for editorial display headings and italic accents, Geist Mono for code and tabular data.">
              <DSGroup title="Display & body scale">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <TypeRow label="h1 · serif" sample="Generics in Depth" style={{ fontFamily: '"Fraunces", serif', fontSize: '2.6em', fontWeight: 500, letterSpacing: '-.03em', lineHeight: 1.1, fontVariationSettings: '"opsz" 144' }} />
                  <TypeRow label="h2 · serif" sample="Inference & the call site" style={{ fontFamily: '"Fraunces", serif', fontSize: '1.7em', fontWeight: 500, letterSpacing: '-.02em', lineHeight: 1.15 }} />
                  <TypeRow label="h3 · serif italic" sample="Patterns you’ll reach for" style={{ fontFamily: '"Fraunces", serif', fontSize: '1.25em', fontWeight: 500, fontStyle: 'italic' }} />
                  <TypeRow label="lead · sans" sample="Generics let a function or type adapt to whatever shape you hand it." style={{ fontFamily: 'var(--font-sans)', fontSize: '1.15em', color: 'var(--ink-2)' }} />
                  <TypeRow label="body · sans" sample="Imagine a function that returns the first element of any array." style={{ fontFamily: 'var(--font-sans)', fontSize: '1em', lineHeight: 1.55 }} />
                  <TypeRow label="small · sans" sample="Last edited 3 days ago · 14 min read" style={{ fontFamily: 'var(--font-sans)', fontSize: '.85em', color: 'var(--ink-3)' }} />
                  <TypeRow label="mono · code" sample="const first = <T,>(a: T[]) => a[0];" style={{ fontFamily: 'var(--font-mono)', fontSize: '.92em', color: 'var(--accent)' }} />
                  <TypeRow label="overline · mono" sample="JS · TYPESCRIPT · 002" style={{ fontFamily: 'var(--font-mono)', fontSize: '.78em', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600 }} />
                </div>
              </DSGroup>
              <DSGroup title="Font families">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                  {[
                    { name: 'Fraunces',       sample: 'Editorial headlines',     stack: '"Fraunces", serif' },
                    { name: 'DM Sans',        sample: 'Body & UI · default',     stack: '"DM Sans", sans-serif' },
                    { name: 'Manrope',        sample: 'Body & UI · alt',         stack: '"Manrope", sans-serif' },
                    { name: 'Space Grotesk',  sample: 'Body & UI · geometric',   stack: '"Space Grotesk", sans-serif' },
                    { name: 'Outfit',         sample: 'Body & UI · friendly',    stack: '"Outfit", sans-serif' },
                    { name: 'Geist Mono',     sample: 'const code = "monospace";', stack: '"Geist Mono", monospace' },
                  ].map((f) => (
                    <div key={f.name} style={{
                      padding: 14, borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg)',
                      border: '1px solid var(--border-soft)',
                    }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.78em', color: 'var(--ink-3)', marginBottom: 6 }}>{f.name}</div>
                      <div style={{ fontFamily: f.stack, fontSize: '1.3em', color: 'var(--ink)', lineHeight: 1.2 }}>{f.sample}</div>
                    </div>
                  ))}
                </div>
              </DSGroup>
            </DSSection>

            {/* ───────── SPACE ───────── */}
            <DSSection id="space" label="Foundations · 03" title="Spacing" subtitle="A simple 4-step rhythm. Pair these with density for compact, comfy, or airy surfaces.">
              <DSGroup title="Spacing scale">
                {[
                  { label: 'space/1',  value: '4px',  px: 4 },
                  { label: 'space/2',  value: '8px',  px: 8 },
                  { label: 'space/3',  value: '12px', px: 12 },
                  { label: 'space/4',  value: '16px', px: 16 },
                  { label: 'space/6',  value: '24px', px: 24 },
                  { label: 'space/8',  value: '32px', px: 32 },
                  { label: 'space/12', value: '48px', px: 48 },
                ].map((r) => (
                  <ScaleRow key={r.label} label={r.label} value={r.value}
                    demo={<div style={{ width: r.px, height: 14, background: 'var(--accent)', borderRadius: 2 }} />} />
                ))}
              </DSGroup>
            </DSSection>

            {/* ───────── RADIUS ───────── */}
            <DSSection id="radius" label="Foundations · 04" title="Radius & shape" subtitle="Three steps, plus the live --radius variable controlled by Tweaks.">
              <DSGroup title="Radius scale">
                {[
                  { label: '--radius-sm', value: '6px',  px: 6 },
                  { label: '--radius',    value: 'live', px: null },
                  { label: '--radius-lg', value: '18px', px: 18 },
                  { label: 'pill',        value: '999px', px: 999 },
                ].map((r) => (
                  <ScaleRow key={r.label} label={r.label} value={r.value}
                    demo={<div style={{
                      width: 64, height: 36,
                      background: 'var(--primary-soft)',
                      border: '1px solid var(--primary)',
                      borderRadius: r.px == null ? 'var(--radius)' : r.px,
                    }} />} />
                ))}
              </DSGroup>
            </DSSection>

            {/* ───────── ELEVATION ───────── */}
            <DSSection id="elevation" label="Foundations · 05" title="Elevation" subtitle="Three shadow rungs. Elevation is intentionally restrained — Atlas avoids floating drama.">
              <DSGroup title="Shadow steps" fullBleed>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                  {[
                    { label: 'flat',  shadow: 'none' },
                    { label: 'subtle',shadow: '0 1px 2px rgba(0,0,0,.06)' },
                    { label: 'rest',  shadow: '0 4px 16px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)' },
                    { label: 'lift',  shadow: '0 14px 30px rgba(0,0,0,.08), 0 2px 6px rgba(0,0,0,.06)' },
                    { label: 'overlay',shadow:'0 30px 80px rgba(0,0,0,.18), 0 8px 24px rgba(0,0,0,.10)' },
                  ].map((s) => (
                    <div key={s.label} style={{
                      padding: 18,
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      boxShadow: s.shadow,
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: '.92em', fontWeight: 600 }}>{s.label}</div>
                      <div style={{ fontSize: '.74em', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>{s.shadow === 'none' ? '—' : 'box-shadow'}</div>
                    </div>
                  ))}
                </div>
              </DSGroup>
            </DSSection>

            {/* ───────── COMPONENTS HEADER ───────── */}
            <div style={{
              marginTop: 64, paddingTop: 24,
              borderTop: '1px solid var(--border)',
              textAlign: 'center', color: 'var(--ink-3)',
              fontFamily: 'var(--font-mono)', fontSize: '.8em',
              letterSpacing: '.12em', textTransform: 'uppercase',
            }}>· · ·  Components  · · ·</div>

            <DSSection id="buttons" label="Components · 01" title="Buttons"
              subtitle="Primary uses the palette primary; accent uses the secondary accent; ghost defers to neutrals.">
              <DSGroup title="Variants & sizes"><ButtonShowcase /></DSGroup>
            </DSSection>

            <DSSection id="inputs" label="Components · 02" title="Inputs"
              subtitle="Plain text input, search trigger, disabled.">
              <DSGroup title="Field types"><InputShowcase /></DSGroup>
            </DSSection>

            <DSSection id="badges" label="Components · 03" title="Badges"
              subtitle="Tonal chips for tags, status, and lightweight metadata.">
              <DSGroup title="Tonal pills"><BadgeShowcase /></DSGroup>
            </DSSection>

            <DSSection id="toggles" label="Components · 04" title="Toggles"
              subtitle="Binary state, follows accent on, neutral off.">
              <DSGroup title="On / off"><ToggleShowcase /></DSGroup>
            </DSSection>

            <DSSection id="tabs" label="Components · 05" title="Tabs"
              subtitle="Two variants: segmented (filter context) and underline (page sections).">
              <DSGroup title="Segmented & underline"><TabsShowcase /></DSGroup>
            </DSSection>

            <DSSection id="callouts" label="Components · 06" title="Callouts"
              subtitle="Five tonal callouts. Each carries an icon, a label, and a body slot.">
              <div className="prose" style={{ maxWidth: 'none' }}>
                <Callout kind="info" title="Note">Inline note callouts adopt the palette's <code>info</code> token.</Callout>
                <Callout kind="tip" title="Tip">Constraints narrow what a caller can pass; start permissive.</Callout>
                <Callout kind="warning" title="Watch out">Don&rsquo;t over-constrain — each <code>extends</code> tightens the call site.</Callout>
                <Callout kind="danger" title="Risky path">The <code>any</code> escape hatch voids the warranty.</Callout>
                <Callout kind="success" title="Shipped">Type-check time fell 60% after the generic refactor.</Callout>
              </div>
            </DSSection>

            <DSSection id="code" label="Components · 07" title="Code block"
              subtitle="Title bar with language pill + copy button. Tokens are hand-tagged for palette consistency.">
              <div className="prose" style={{ maxWidth: 'none' }}>
                <CodeBlock lang="ts" title="first.ts">
                  <T k="cmt">// preserves whatever T the caller had</T>{'\n'}
                  <T k="kw">function</T> <T k="fn">first</T>&lt;<T k="typ">T</T>&gt;(arr: <T k="typ">T</T>[]): <T k="typ">T</T> | <T k="typ">undefined</T> {'{'}{'\n'}
                  {'  '}<T k="kw">return</T> arr[<T k="num">0</T>];{'\n'}
                  {'}'}
                </CodeBlock>
              </div>
            </DSSection>

            <DSSection id="math" label="Components · 08" title="Math"
              subtitle="KaTeX-style display blocks rendered with simple JSX helpers (Frac, Sum, Sub, Sup, Int).">
              <div className="prose" style={{ maxWidth: 'none' }}>
                <MathEq>
                  T = <MathEq inline><Sum from="i=1" to="n">τᵢ</Sum> ⊓ Γ</MathEq> where Γ = <Frac n="constraint(T)" d="default(T)" />
                </MathEq>
                <p>Inline math like <MathEq inline>f(x) = x<Sup>2</Sup> + 1</MathEq> blends with running prose.</p>
              </div>
            </DSSection>

            <DSSection id="mermaid" label="Components · 09" title="Mermaid"
              subtitle="Hand-styled flowchart on a soft dot grid. Edges flow left to right.">
              <div className="prose" style={{ maxWidth: 'none' }}>
                <Mermaid title="Auth flow" />
              </div>
            </DSSection>

            <DSSection id="charts" label="Components · 10" title="Charts"
              subtitle="Two primitives: a line chart with grid + area fill, and a horizontal bar chart.">
              <div className="prose" style={{ maxWidth: 'none' }}>
                <LineChart title="Weekly p95 latency" unit="s" data={SAMPLE_LATENCY} />
                <BarChart title="Type errors caught per week" data={SAMPLE_BAR} />
              </div>
            </DSSection>

            <DSSection id="tasks" label="Components · 11" title="Task list"
              subtitle="Checkable list with live progress bar.">
              <TaskList title="Ship checklist" initialTasks={[
                { label: 'Constraints documented in JSDoc', done: true },
                { label: 'No type assertions inside generic body', done: false },
                { label: 'Tested with wide and narrow T', done: false },
              ]} />
            </DSSection>

            <DSSection id="toasts" label="Components · 12" title="Toasts"
              subtitle="Inline notification tile — three tonal variants.">
              <DSGroup title="Tones" fullBleed>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <ToastDemo kind="success" title="Saved" body="Your changes synced to Atlas in 24ms." />
                  <ToastDemo kind="info" title="New version available" body="Atlas 2.4 introduces command palette filters." />
                  <ToastDemo kind="danger" title="Sync failed" body="Network unreachable. Retrying in 5 seconds." />
                </div>
              </DSGroup>
            </DSSection>

            <DSSection id="tables" label="Components · 13" title="Tables"
              subtitle="Quiet borders, uppercase heading row, hover-tinted body rows.">
              <div className="prose" style={{ maxWidth: 'none' }}>
                <table>
                  <thead><tr><th>Utility</th><th>Shape</th><th>Returns</th></tr></thead>
                  <tbody>
                    <tr><td><code>Partial&lt;T&gt;</code></td><td>object</td><td>All fields optional</td></tr>
                    <tr><td><code>Pick&lt;T, K&gt;</code></td><td>object &amp; keys</td><td>Subset by K</td></tr>
                    <tr><td><code>Record&lt;K, V&gt;</code></td><td>keys, value</td><td>Dictionary</td></tr>
                  </tbody>
                </table>
              </div>
            </DSSection>

            <DSSection id="cards" label="Components · 14" title="Cards"
              subtitle="The shelf book card — spine, art watermark, chapter list, footer rule.">
              <DSGroup title="Section cards" fullBleed>
                <CardShowcase />
              </DSGroup>
            </DSSection>

            <DSSection id="kbd" label="Components · 15" title="Keyboard chips"
              subtitle="Tiny mono pills for shortcuts.">
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', fontSize: '.95em', color: 'var(--ink-2)' }}>
                <span><Kbd>⌘</Kbd> <Kbd>K</Kbd> open palette</span>
                <span><Kbd>⌘</Kbd> <Kbd>B</Kbd> toggle sidebar</span>
                <span><Kbd>esc</Kbd> close</span>
              </div>
            </DSSection>

            <DSSection id="figure" label="Components · 16" title="Figures"
              subtitle="Image placeholders with caption and a tiny FIGURE tag.">
              <div className="prose" style={{ maxWidth: 'none' }}>
                <ImageFigure caption="Fig 1. The dependency graph of a generic type-resolution pass." />
              </div>
            </DSSection>

            <DSSection id="sidebar" label="Components · 17" title="Sidebar"
              subtitle="Two variants: 'shelf' (default — colored book spines) and 'tree' (classic indented).">
              <DSGroup title="Shelf vs. tree" fullBleed>
                <SidebarShowcase />
              </DSGroup>
            </DSSection>

            <DSSection id="cmdk" label="Components · 18" title="Command palette"
              subtitle="⌘K modal — Pages · Actions · Recent · fuzzy search · keyboard nav.">
              <DSGroup title="Static preview" fullBleed>
                <div style={{
                  width: 'min(560px, 100%)', maxWidth: '100%',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 30px 80px rgba(0,0,0,.2)',
                  overflow: 'hidden',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: '1px solid var(--border-soft)' }}>
                    <span style={{ color: 'var(--ink-3)', display: 'flex' }}>{Icon.search}</span>
                    <span style={{ flex: 1, color: 'var(--ink-3)' }}>Search pages…</span>
                    <Kbd>esc</Kbd>
                  </div>
                  <div style={{ display: 'flex', gap: 4, padding: '8px 14px', borderBottom: '1px solid var(--border-soft)' }}>
                    <span style={{ padding: '5px 10px', borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)', border: '1px solid var(--border)', fontSize: '.85em', fontWeight: 500 }}>Pages 248</span>
                    <span style={{ padding: '5px 10px', borderRadius: 'var(--radius-sm)', color: 'var(--ink-3)', fontSize: '.85em', fontWeight: 500 }}>Actions</span>
                    <span style={{ padding: '5px 10px', borderRadius: 'var(--radius-sm)', color: 'var(--ink-3)', fontSize: '.85em', fontWeight: 500 }}>Recent</span>
                  </div>
                  <div style={{ padding: 6 }}>
                    {[
                      { label: 'Generics in Depth', path: 'JavaScript › TypeScript', sel: true },
                      { label: 'Type Narrowing', path: 'JavaScript › TypeScript' },
                      { label: 'Suspense & Concurrency', path: 'JavaScript › React', tag: 'new' },
                    ].map((r, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                        background: r.sel ? 'var(--primary-soft)' : 'transparent',
                      }}>
                        <span style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)', color: 'var(--ink-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icon.book}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '.92em', fontWeight: 500 }}>{r.label}</div>
                          <div style={{ fontSize: '.75em', color: 'var(--ink-3)' }}>{r.path}</div>
                        </div>
                        {r.tag && <span style={{
                          fontSize: '.66em', fontWeight: 600,
                          padding: '2px 6px', borderRadius: 99,
                          background: 'var(--ok-soft)', color: 'var(--ok)',
                          textTransform: 'uppercase', letterSpacing: '.08em',
                        }}>{r.tag}</span>}
                        {r.sel && <span style={{ color: 'var(--ink-3)', fontSize: '.8em' }}>↵</span>}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 16, padding: '8px 14px', borderTop: '1px solid var(--border-soft)', background: 'var(--surface-2)', fontSize: '.75em', color: 'var(--ink-3)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Kbd>↑</Kbd><Kbd>↓</Kbd> nav</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Kbd>↵</Kbd> open</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Kbd>tab</Kbd> mode</span>
                  </div>
                </div>
              </DSGroup>
            </DSSection>

            {/* Footer */}
            <footer style={{
              marginTop: 80, paddingTop: 32, paddingBottom: 32,
              borderTop: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontSize: '.82em', color: 'var(--ink-3)',
              flexWrap: 'wrap', gap: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AtlasLogo size={16} />
                <span>Atlas Design System — single source of truth.</span>
              </div>
              <a href="Atlas.html" style={{ color: 'var(--accent)', fontWeight: 500, borderBottom: '1px dotted var(--accent)' }}>← Back to Atlas docs</a>
            </footer>
          </main>
        </div>
      </div>

      {/* Tweaks panel reused from the main app */}
      <AtlasTweaksPanel t={t} setTweak={setTweak} />
    </div>
  );
}

// Type-sample row helper
function TypeRow({ label, sample, style }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'baseline', gap: 16, paddingBottom: 12, borderBottom: '1px solid var(--border-soft)' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.78em', color: 'var(--ink-3)' }}>{label}</div>
      <div style={style}>{sample}</div>
    </div>
  );
}

window.DesignSystem = DesignSystem;

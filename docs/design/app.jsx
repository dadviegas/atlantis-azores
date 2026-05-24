// app.jsx — Root + App; sets up tweaks, mounts three responsive Apps
// inside a design canvas (desktop, iPad, mobile).

// ─────────────────────────────────────────────────────────────
// App — one instance of the Atlas UI, viewport-aware
// ─────────────────────────────────────────────────────────────
function App({ viewport = 'desktop', tweaks, setTweak, onOpenPalette }) {
  const [currentPageId, setCurrentPageId] = React.useState('home');
  const [lastArticleId, setLastArticleId] = React.useState('js-ts-generics');
  const [expanded, setExpanded] = React.useState(['js', 'js-ts', 'net', 'net-ip']);
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  // Sidebar collapse — default open on desktop, collapsed on iPad to give
  // the article more room.
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(viewport === 'ipad');
  const rootRef = React.useRef(null);

  const isHome = currentPageId === 'home';

  // Keyboard shortcut — only when a pointer is inside this App
  const [hot, setHot] = React.useState(false);
  React.useEffect(() => {
    const onKey = (e) => {
      if (!hot) return;
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hot]);

  // Find current page in tree
  const findPage = (id) => {
    for (const b of window.ATLAS_TREE) for (const c of b.children) for (const p of c.children) {
      if (p.id === id) return { book: b, chap: c, page: p };
    }
    return null;
  };
  const ctx = isHome ? null : (findPage(currentPageId) || findPage('js-ts-generics'));
  const breadcrumbs = isHome ? ['Home'] : (ctx ? [ctx.book.label, ctx.chap.label, ctx.page.label] : []);

  const onSelectPage = (id) => {
    setCurrentPageId(id);
    if (id !== 'home') {
      setLastArticleId(id);
      const ctx = findPage(id);
      if (ctx) setExpanded((e) => Array.from(new Set([...e, ctx.book.id, ctx.chap.id])));
    }
    setDrawerOpen(false);
  };

  const goHome = () => { setCurrentPageId('home'); setDrawerOpen(false); };

  // Layout dimensions per viewport
  const sidebarW = viewport === 'desktop' ? 256 : viewport === 'ipad' ? 220 : 280;
  const railW    = viewport === 'desktop' ? 260 : 0;
  const showRail = viewport === 'desktop';
  const showSidebar = viewport !== 'mobile';

  return (
    <div
      ref={rootRef}
      className="atlas-root atlas-scroll"
      data-palette={tweaks.palette}
      data-theme={tweaks.dark ? 'dark' : 'light'}
      data-density={tweaks.density}
      style={{
        '--radius': tweaks.radius + 'px',
        '--radius-sm': Math.max(2, tweaks.radius - 4) + 'px',
        '--radius-lg': (tweaks.radius + 8) + 'px',
        '--font-sans': tweaks.fontSans,
        width: '100%', height: '100%',
        background: 'var(--bg)',
        color: 'var(--ink)',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => setHot(false)}
    >
      {/* Top bar */}
      <TopBar
        viewport={viewport}
        onOpenCommand={() => setPaletteOpen(true)}
        onOpenSidebar={() => setDrawerOpen(true)}
        dark={tweaks.dark}
        onToggleDark={() => setTweak('dark', !tweaks.dark)}
        breadcrumbs={breadcrumbs}
        onGoHome={goHome}
        isHome={isHome}
        sidebarCollapsed={sidebarCollapsed}
        onExpandSidebar={() => setSidebarCollapsed(false)}
      />

      {/* main row */}
      <div className="atlas-grid" style={{
        flex: 1, minHeight: 0,
        display: 'grid',
        gridTemplateColumns: showSidebar
          ? (sidebarCollapsed
              ? (showRail && !isHome ? `0px 1fr ${railW}px` : `0px 1fr`)
              : (showRail && !isHome ? `${sidebarW}px 1fr ${railW}px` : `${sidebarW}px 1fr`))
          : '1fr',
      }}>
        {/* sidebar (desktop + ipad) */}
        {showSidebar && (
          <div style={{ overflow: 'hidden', minWidth: 0 }}>
            <Sidebar
              variant={tweaks.sidebar}
              currentPageId={currentPageId}
              onSelectPage={onSelectPage}
              expanded={expanded}
              setExpanded={setExpanded}
              viewport={viewport}
              onGoHome={goHome}
              onCollapse={() => setSidebarCollapsed(true)}
            />
          </div>
        )}

        {/* article column */}
        <main className="atlas-scroll" style={{
          overflowY: 'auto',
          padding: isHome
            ? (viewport === 'desktop' ? '24px 56px 0' :
               viewport === 'ipad'    ? '20px 36px 0' :
                                        '16px 22px 0')
            : (viewport === 'desktop' ? '32px 56px 0' :
               viewport === 'ipad'    ? '24px 36px 0' :
                                        '20px 22px 0'),
        }}>
          {isHome
            ? <HomePage viewport={viewport} lastPageId={lastArticleId} onSelectPage={onSelectPage} onOpenCommand={() => setPaletteOpen(true)} />
            : <Article pageTitle={ctx?.page.label} pagePath={breadcrumbs} />
          }
        </main>

        {/* right rail (desktop only, articles only) */}
        {showRail && !isHome && <RightRail activeId="why" />}
      </div>

      {/* mobile drawer */}
      {viewport === 'mobile' && drawerOpen && (
        <>
          <div onClick={() => setDrawerOpen(false)} style={{
            position: 'absolute', inset: 0, zIndex: 40,
            background: 'color-mix(in srgb, var(--ink) 35%, transparent)',
            backdropFilter: 'blur(4px)',
          }} />
          <div style={{
            position: 'absolute', top: 0, bottom: 0, left: 0,
            width: 280, zIndex: 41,
            animation: 'atlasSlideUp .2s ease-out',
            display: 'flex', flexDirection: 'column',
            background: 'var(--surface)',
            boxShadow: '4px 0 24px rgba(0,0,0,.15)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 8px 0' }}>
              <button onClick={() => setDrawerOpen(false)} style={{
                width: 32, height: 32, borderRadius: 'var(--radius-sm)',
                color: 'var(--ink-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{Icon.x}</button>
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <Sidebar
                variant={tweaks.sidebar}
                currentPageId={currentPageId}
                onSelectPage={onSelectPage}
                expanded={expanded}
                setExpanded={setExpanded}
                viewport={viewport}
                onGoHome={goHome}
              />
            </div>
          </div>
        </>
      )}

      {/* command palette */}
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onSelectPage={onSelectPage}
        onToggleDark={() => setTweak('dark', !tweaks.dark)}
        dark={tweaks.dark}
      />

      {/* mobile FAB to open palette */}
      {viewport === 'mobile' && !paletteOpen && (
        <button
          onClick={() => setPaletteOpen(true)}
          style={{
            position: 'absolute', right: 18, bottom: 18, zIndex: 20,
            width: 48, height: 48, borderRadius: 24,
            background: 'var(--primary)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 20px color-mix(in srgb, var(--primary) 35%, transparent), 0 2px 6px rgba(0,0,0,.15)',
          }}
        >{Icon.search}</button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Root — wires Tweaks + shared state across the three Apps in a
// design canvas. Each App is mounted independently inside a
// DCArtboard so the design system can be viewed side-by-side.
// ─────────────────────────────────────────────────────────────
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette":  "cove",
  "dark":     false,
  "density":  "comfy",
  "radius":   10,
  "fontSans": "'DM Sans', ui-sans-serif, system-ui, sans-serif",
  "sidebar":  "shelf"
}/*EDITMODE-END*/;

function Root() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Reflect system preference on first load (only if not user-overridden).
  // We don't persist this back — it's just a sensible default for a new
  // visitor. The Tweaks panel can override at any time.
  React.useEffect(() => {
    if (window.__atlas_seeded_dark) return;
    window.__atlas_seeded_dark = true;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    if (mq.matches && !t.dark) setTweak('dark', true);
  }, []);

  return (
    <>
      <DesignCanvas>
        <DCSection
          id="responsive"
          title="Atlas"
          subtitle="A personal atlas of code — desktop, iPad, mobile"
        >
          <DCArtboard id="desktop" label="Desktop · 1440×920" width={1440} height={920}>
            <App viewport="desktop" tweaks={t} setTweak={setTweak} />
          </DCArtboard>
          <DCArtboard id="ipad" label="iPad · 834×1120" width={834} height={1120}>
            <App viewport="ipad" tweaks={t} setTweak={setTweak} />
          </DCArtboard>
          <DCArtboard id="mobile" label="Mobile · 390×844" width={390} height={844}>
            <App viewport="mobile" tweaks={t} setTweak={setTweak} />
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      <AtlasTweaksPanel t={t} setTweak={setTweak} />
    </>
  );
}

function AtlasTweaksPanel({ t, setTweak }) {
  const PALETTES = [
    { id: 'cove',    label: 'Cove · sage + terracotta',   colors: ['#5d7a5b', '#c0563b', '#ede4d0'] },
    { id: 'atelier', label: 'Atelier · ink + paper + red',colors: ['#1a1814', '#e0432a', '#f2eee3'] },
    { id: 'botanic', label: 'Botanic · teal + saffron',   colors: ['#1f5d5a', '#d49a26', '#e8e4d6'] },
    { id: 'tide',    label: 'Tide · blue + mustard',      colors: ['#406d8e', '#d29031', '#e6e7e0'] },
    { id: 'riso',    label: 'Riso · indigo + peach',      colors: ['#2d3494', '#ec6a82', '#f6e9d4'] },
    { id: 'cabin',   label: 'Cabin · forest + rust',      colors: ['#2e4a2c', '#b86b2b', '#e6dcc0'] },
  ];
  return (
    <TweaksPanel>
      <TweakSection label="Palette" />
      <div className="twk-row">
        <div className="twk-lbl">
          <span>Mood</span>
          <span style={{ color: 'rgba(41,38,27,.5)' }}>
            {PALETTES.find((p) => p.id === t.palette)?.label.split(' · ')[0]}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 4 }}>
          {PALETTES.map((p) => {
            const sel = t.palette === p.id;
            return (
              <button key={p.id} onClick={() => setTweak('palette', p.id)}
                title={p.label}
                style={{
                  height: 38, borderRadius: 8,
                  border: sel ? '1.5px solid rgba(0,0,0,.65)' : '1px solid rgba(0,0,0,.12)',
                  padding: 0, overflow: 'hidden',
                  display: 'flex', flexDirection: 'column',
                  cursor: 'pointer',
                  boxShadow: sel ? '0 0 0 3px rgba(0,0,0,.06)' : 'none',
                  position: 'relative',
                }}>
                <span style={{ flex: 2, background: p.colors[0] }} />
                <span style={{ flex: 1, display: 'flex' }}>
                  <span style={{ flex: 1, background: p.colors[1] }} />
                  <span style={{ flex: 1, background: p.colors[2] }} />
                </span>
                {sel && (
                  <span style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 14,
                    textShadow: '0 1px 2px rgba(0,0,0,.6)',
                  }}>●</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <TweakToggle label="Dark mode" value={t.dark} onChange={(v) => setTweak('dark', v)} />

      <TweakSection label="Layout" />
      <TweakRadio label="Density"
        value={t.density}
        options={['compact','comfy','airy']}
        onChange={(v) => setTweak('density', v)} />
      <TweakSlider label="Corner radius" value={t.radius} min={0} max={20} unit="px"
        onChange={(v) => setTweak('radius', v)} />
      <TweakRadio label="Sidebar"
        value={t.sidebar}
        options={['shelf','tree']}
        onChange={(v) => setTweak('sidebar', v)} />

      <TweakSection label="Typography" />
      <TweakSelect label="Sans family"
        value={t.fontSans}
        options={[
          { value: "'DM Sans', ui-sans-serif, system-ui, sans-serif",        label: 'DM Sans' },
          { value: "'Manrope', ui-sans-serif, system-ui, sans-serif",        label: 'Manrope' },
          { value: "'Space Grotesk', ui-sans-serif, system-ui, sans-serif",  label: 'Space Grotesk' },
          { value: "'Outfit', ui-sans-serif, system-ui, sans-serif",         label: 'Outfit' },
          { value: "'Sora', ui-sans-serif, system-ui, sans-serif",           label: 'Sora' },
        ]}
        onChange={(v) => setTweak('fontSans', v)} />
    </TweaksPanel>
  );
}

window.Root = Root;
window.App = App;
window.AtlasTweaksPanel = AtlasTweaksPanel;
window.TWEAK_DEFAULTS = TWEAK_DEFAULTS;

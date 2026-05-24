// chrome.jsx — Sidebar / TopBar / RightRail / CommandPalette
// Each accepts `viewport` so it can adapt to desktop / ipad / mobile.

// ─────────────────────────────────────────────────────────────
// Logo — "Atlas" lockup with compass mark
// ─────────────────────────────────────────────────────────────
function AtlasLogo({ size = 22, showWordmark = true }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ink)', userSelect: 'none' }}>
      <div style={{
        width: size + 6, height: size + 6, borderRadius: 'calc(var(--radius-sm) + 2px)',
        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff',
        boxShadow: '0 1px 2px rgba(0,0,0,.08), 0 4px 12px color-mix(in srgb, var(--primary) 25%, transparent)',
      }}>
        <svg viewBox="0 0 24 24" width={size - 2} height={size - 2} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="8.5" />
          <path d="M15 9L13 13L9 15L11 11Z" fill="currentColor" />
          <path d="M12 3v1.5M12 19.5V21M3 12h1.5M19.5 12H21" />
        </svg>
      </div>
      {showWordmark && (
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05em', letterSpacing: '-0.02em' }}>
          Atlas
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Sidebar — Two variants: "shelf" (default novelty) and "tree" (classic)
// ─────────────────────────────────────────────────────────────
const BOOK_TINT = {
  amber: { spine: '#c98b29', soft: 'var(--warn-soft)' },
  blue:  { spine: '#4f7a8f', soft: 'var(--info-soft)' },
  green: { spine: '#6c8369', soft: 'var(--primary-soft)' },
  plum:  { spine: '#8b5a7a', soft: 'color-mix(in srgb, #8b5a7a 18%, var(--surface))' },
  rust:  { spine: '#b85a3e', soft: 'var(--accent-soft)' },
};

function Sidebar({ variant = 'shelf', currentPageId, onSelectPage, expanded, setExpanded, viewport = 'desktop', onGoHome, onCollapse }) {
  const tree = window.ATLAS_TREE || [];
  const compact = viewport === 'mobile';
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      overflow: 'hidden',
    }}>
      {/* header */}
      <div style={{
        padding: '8px 8px 8px 16px',
        borderBottom: '1px solid var(--border-soft)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
      }}>
        <button onClick={onGoHome} style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '4px 6px',
          borderRadius: 'var(--radius-sm)',
          textAlign: 'left',
          transition: 'background .12s',
        }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'color-mix(in srgb, var(--primary) 5%, transparent)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          title="Back to home"
        >
          <AtlasLogo size={20} />
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '.7em',
            color: 'var(--ink-3)', letterSpacing: '.06em',
            marginLeft: 8,
          }}>v2.4</span>
        </button>
        {onCollapse && !compact && (
          <button onClick={onCollapse} title="Collapse sidebar"
            style={{
              width: 26, height: 26, borderRadius: 'var(--radius-sm)',
              color: 'var(--ink-3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background .12s, color .12s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--ink)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-3)'; }}
          >
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="12" height="10" rx="1.5" />
              <line x1="6" y1="3" x2="6" y2="13" />
              <path d="M10 6l-2 2 2 2" />
            </svg>
          </button>
        )}
      </div>

      {/* home link */}
      <button onClick={onGoHome} style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 16px',
        margin: '8px 10px 0',
        borderRadius: 'var(--radius-sm)',
        background: currentPageId === 'home' ? 'var(--primary-soft)' : 'transparent',
        color: currentPageId === 'home' ? 'var(--ink)' : 'var(--ink-2)',
        fontSize: '.92em', fontWeight: currentPageId === 'home' ? 600 : 500,
        textAlign: 'left',
        transition: 'background .12s, color .12s',
      }}
        onMouseEnter={(e) => { if (currentPageId !== 'home') { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--ink)'; } }}
        onMouseLeave={(e) => { if (currentPageId !== 'home') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-2)'; } }}
      >
        <span style={{ width: 22, height: 22, borderRadius: 5, background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
          <svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 7l6-5 6 5v7h-4v-4H6v4H2z"/>
          </svg>
        </span>
        Home
      </button>

      {/* shelf legend */}
      {variant === 'shelf' && (
        <div style={{
          padding: '12px 16px 6px',
          fontSize: '.72em', textTransform: 'uppercase', letterSpacing: '.12em',
          color: 'var(--ink-3)', fontWeight: 600,
        }}>The Shelf</div>
      )}

      {/* tree */}
      <div className="atlas-scroll" style={{ flex: 1, overflowY: 'auto', padding: variant === 'shelf' ? '4px 10px 16px' : '8px 6px 16px' }}>
        {tree.map((book) => (
          <BookNode
            key={book.id}
            book={book}
            variant={variant}
            expanded={expanded}
            setExpanded={setExpanded}
            currentPageId={currentPageId}
            onSelectPage={onSelectPage}
            compact={compact}
          />
        ))}
      </div>

      {/* footer */}
      <div style={{
        padding: '10px 14px',
        borderTop: '1px solid var(--border-soft)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: '.78em', color: 'var(--ink-3)',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ok)', boxShadow: '0 0 0 2px var(--ok-soft)' }} />
          synced 14s ago
        </span>
        <span style={{ fontFamily: 'var(--font-mono)' }}>248 pages</span>
      </div>
    </div>
  );
}

function BookNode({ book, variant, expanded, setExpanded, currentPageId, onSelectPage, compact }) {
  const open = expanded.includes(book.id);
  const tint = BOOK_TINT[book.color] || BOOK_TINT.amber;
  const toggle = () => setExpanded((e) => open ? e.filter((x) => x !== book.id) : [...e, book.id]);

  if (variant === 'shelf') {
    return (
      <div style={{ marginBottom: 4 }}>
        <button onClick={toggle} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 10px',
          background: open ? tint.soft : 'transparent',
          borderRadius: 'var(--radius-sm)',
          textAlign: 'left',
          transition: 'background .15s',
        }}>
          {/* spine */}
          <div style={{
            width: 4, height: 22, borderRadius: 2,
            background: tint.spine,
            boxShadow: open ? `0 0 0 2px color-mix(in srgb, ${tint.spine} 30%, transparent)` : 'none',
            flexShrink: 0,
          }} />
          <span style={{
            flex: 1, fontWeight: 600, color: 'var(--ink)',
            fontSize: '.95em', letterSpacing: '-.005em',
          }}>{book.label}</span>
          <span style={{ color: 'var(--ink-3)', display: 'flex' }}>
            {open ? Icon.chevronD : Icon.chevronR}
          </span>
        </button>
        {open && (
          <div style={{
            paddingLeft: 16, marginTop: 2,
            borderLeft: `2px dashed color-mix(in srgb, ${tint.spine} 35%, var(--border))`,
            marginLeft: 14,
          }}>
            {book.children.map((chap) => (
              <ChapterNode
                key={chap.id}
                chapter={chap}
                expanded={expanded}
                setExpanded={setExpanded}
                currentPageId={currentPageId}
                onSelectPage={onSelectPage}
                tint={tint}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // classic tree variant
  return (
    <div>
      <button onClick={toggle} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 8px',
        borderRadius: 'var(--radius-sm)',
        textAlign: 'left',
        color: 'var(--ink)',
      }}>
        <span style={{ display: 'flex', color: 'var(--ink-3)', transition: 'transform .2s', transform: open ? 'rotate(90deg)' : 'none' }}>
          {Icon.chevronR}
        </span>
        <span style={{ fontWeight: 600, fontSize: '.93em' }}>{book.label}</span>
      </button>
      {open && (
        <div style={{ paddingLeft: 18 }}>
          {book.children.map((chap) => (
            <ChapterNode
              key={chap.id}
              chapter={chap}
              expanded={expanded}
              setExpanded={setExpanded}
              currentPageId={currentPageId}
              onSelectPage={onSelectPage}
              tint={tint}
              flat
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ChapterNode({ chapter, expanded, setExpanded, currentPageId, onSelectPage, tint, flat }) {
  const open = expanded.includes(chapter.id);
  const toggle = () => setExpanded((e) => open ? e.filter((x) => x !== chapter.id) : [...e, chapter.id]);
  return (
    <div style={{ marginTop: 2 }}>
      <button onClick={toggle} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 6,
        padding: '5px 8px',
        borderRadius: 'var(--radius-sm)',
        textAlign: 'left',
        color: 'var(--ink-2)',
        transition: 'color .12s, background .12s',
      }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in srgb, ' + tint.spine + ' 6%, transparent)'; e.currentTarget.style.color = 'var(--ink)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-2)'; }}
      >
        <span style={{ display: 'flex', color: 'var(--ink-3)', transition: 'transform .2s', transform: open ? 'rotate(90deg)' : 'none' }}>
          {Icon.chevronR}
        </span>
        <span style={{ fontSize: '.88em', fontWeight: 500 }}>{chapter.label}</span>
      </button>
      {open && (
        <div style={{ paddingLeft: flat ? 18 : 16, marginTop: 1 }}>
          {chapter.children.map((page) => {
            const active = page.id === currentPageId;
            return (
              <button
                key={page.id}
                onClick={() => onSelectPage(page.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 6,
                  padding: '4px 8px 4px 14px',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'left',
                  color: active ? 'var(--ink)' : 'var(--ink-2)',
                  background: active ? tint.soft : 'transparent',
                  position: 'relative',
                  fontSize: '.85em',
                  transition: 'background .12s',
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'color-mix(in srgb, ' + tint.spine + ' 5%, transparent)'; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                {active && (
                  <span style={{
                    position: 'absolute', left: 0, top: '50%',
                    transform: 'translateY(-50%)',
                    width: 3, height: '60%',
                    background: tint.spine, borderRadius: 2,
                  }} />
                )}
                <span style={{ fontWeight: active ? 600 : 400, flex: 1 }}>{page.label}</span>
                {page.tag && (
                  <span style={{
                    fontSize: '.7em', fontWeight: 600,
                    padding: '1px 6px', borderRadius: 99,
                    background: page.tag === 'new' ? 'var(--ok-soft)' : page.tag === 'updated' ? 'var(--info-soft)' : 'transparent',
                    color: page.tag === 'new' ? 'var(--ok)' : page.tag === 'updated' ? 'var(--info)' : 'var(--ink-3)',
                    textTransform: 'uppercase', letterSpacing: '.08em',
                  }}>{page.tag}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TopBar
// ─────────────────────────────────────────────────────────────
function TopBar({ onOpenCommand, dark, onToggleDark, onOpenSidebar, viewport, breadcrumbs, onGoHome, isHome, sidebarCollapsed, onExpandSidebar }) {
  const isMobile = viewport === 'mobile';
  return (
    <div style={{
      height: 52,
      padding: '0 16px',
      display: 'flex', alignItems: 'center', gap: 12,
      borderBottom: '1px solid var(--border)',
      background: 'color-mix(in srgb, var(--bg) 80%, transparent)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      position: 'sticky', top: 0, zIndex: 10,
    }}>
      {isMobile && (
        <button onClick={onOpenSidebar} style={{
          width: 32, height: 32, borderRadius: 'var(--radius-sm)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--ink)',
        }}>{Icon.menu}</button>
      )}

      {/* expand sidebar button — shown when sidebar collapsed (non-mobile) */}
      {!isMobile && sidebarCollapsed && (
        <button onClick={onExpandSidebar} title="Open sidebar"
          style={{
            width: 32, height: 32, borderRadius: 'var(--radius-sm)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--ink-2)',
            transition: 'background .12s, color .12s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--ink)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-2)'; }}
        >
          <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="12" height="10" rx="1.5" />
            <line x1="6" y1="3" x2="6" y2="13" />
            <path d="M8 6l2 2-2 2" />
          </svg>
        </button>
      )}

      {/* breadcrumbs */}
      {!isMobile && breadcrumbs && breadcrumbs.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.85em', color: 'var(--ink-2)', minWidth: 0, overflow: 'hidden' }}>
          <button onClick={onGoHome} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '3px 8px', borderRadius: 'var(--radius-sm)',
            color: isHome ? 'var(--ink)' : 'var(--ink-2)',
            fontWeight: isHome ? 600 : 500,
            transition: 'background .12s, color .12s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--ink)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = isHome ? 'var(--ink)' : 'var(--ink-2)'; }}
          >
            <span style={{ color: 'var(--accent)', display: 'flex' }}>
              <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor"><circle cx="8" cy="8" r="3"/></svg>
            </span>
            Atlas
          </button>
          {!isHome && breadcrumbs.map((b, i) => (
            <React.Fragment key={i}>
              <span style={{ opacity: .4 }}>›</span>
              <span style={{
                whiteSpace: 'nowrap',
                color: i === breadcrumbs.length - 1 ? 'var(--ink)' : 'var(--ink-2)',
                fontWeight: i === breadcrumbs.length - 1 ? 500 : 400,
              }}>{b}</span>
            </React.Fragment>
          ))}
        </div>
      )}

      {isMobile && <button onClick={onGoHome} style={{ display: 'flex' }}><AtlasLogo size={18} /></button>}

      <div style={{ flex: 1 }} />

      {/* command bar trigger */}
      <button
        onClick={onOpenCommand}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '6px 10px 6px 12px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          color: 'var(--ink-3)',
          fontSize: '.85em',
          minWidth: isMobile ? 0 : 220,
          transition: 'all .15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--ink-3)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
      >
        <span style={{ display: 'flex', color: 'var(--ink-3)' }}>{Icon.search}</span>
        {!isMobile && <span style={{ flex: 1, textAlign: 'left' }}>Search atlas…</span>}
        {!isMobile && (
          <span style={{ display: 'flex', gap: 2 }}>
            <Kbd>⌘</Kbd><Kbd>K</Kbd>
          </span>
        )}
      </button>

      {/* dark toggle */}
      <button onClick={onToggleDark} style={{
        width: 32, height: 32, borderRadius: 'var(--radius-sm)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--ink-2)',
        transition: 'background .12s, color .12s',
      }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--ink)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-2)'; }}
        title={dark ? 'Light mode' : 'Dark mode'}
      >{dark ? Icon.sun : Icon.moon}</button>

      {/* avatar */}
      {!isMobile && (
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
          color: '#fff', fontSize: '.72em', fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>JC</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// RightRail — TOC, tags, related
// ─────────────────────────────────────────────────────────────
function RightRail({ activeId = 'why' }) {
  const toc = [
    { id: 'why',        label: 'Why generics?', level: 2 },
    { id: 'constraints',label: 'Constraints & defaults', level: 2 },
    { id: 'inference',  label: 'Inference & the call site', level: 2 },
    { id: 'formula',    label: 'Inference, formally', level: 3 },
    { id: 'patterns',   label: 'Patterns you\u2019ll reach for', level: 2 },
    { id: 'builder',    label: '1. The builder', level: 3 },
    { id: 'discriminated', label: '2. Discriminated mappers', level: 3 },
    { id: 'latency',    label: 'Real-world impact', level: 2 },
    { id: 'checklist',  label: 'Checklist before shipping', level: 2 },
    { id: 'utility',    label: 'Quick utility reference', level: 2 },
  ];
  return (
    <aside className="atlas-scroll" style={{
      width: '100%', height: '100%',
      padding: '20px 20px 32px',
      overflowY: 'auto',
      borderLeft: '1px solid var(--border-soft)',
      background: 'transparent',
    }}>
      {/* reading progress dots */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        marginBottom: 18, paddingBottom: 16,
        borderBottom: '1px solid var(--border-soft)',
      }}>
        <div style={{ fontSize: '.72em', textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--ink-3)', fontWeight: 600 }}>Progress</div>
        <div style={{ flex: 1, display: 'flex', gap: 3 }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: i < 3 ? 'var(--primary)' : 'var(--surface-2)',
            }} />
          ))}
        </div>
        <div style={{ fontSize: '.78em', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>30%</div>
      </div>

      <div style={{ fontSize: '.72em', textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--ink-3)', fontWeight: 600, marginBottom: 10 }}>
        On this page
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 1, marginBottom: 24 }}>
        {toc.map((it) => {
          const active = it.id === activeId;
          return (
            <a key={it.id} href={'#' + it.id} style={{
              padding: '5px 8px 5px ' + (it.level === 3 ? 22 : 8) + 'px',
              borderRadius: 5,
              fontSize: it.level === 3 ? '.83em' : '.88em',
              color: active ? 'var(--accent)' : 'var(--ink-2)',
              borderLeft: '2px solid ' + (active ? 'var(--accent)' : 'transparent'),
              marginLeft: it.level === 3 ? 8 : 0,
              fontWeight: active ? 600 : 400,
              textDecoration: 'none',
              borderBottom: 'none',
              transition: 'color .12s',
            }}>{it.label}</a>
          );
        })}
      </nav>

      {/* tags */}
      <div style={{ fontSize: '.72em', textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--ink-3)', fontWeight: 600, marginBottom: 10 }}>
        Tags
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
        {['typescript','generics','types','inference','advanced'].map((t) => (
          <span key={t} style={{
            fontSize: '.78em',
            padding: '3px 9px',
            background: 'var(--surface-2)',
            color: 'var(--ink-2)',
            borderRadius: 99,
            fontWeight: 500,
          }}>#{t}</span>
        ))}
      </div>

      {/* related */}
      <div style={{ fontSize: '.72em', textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--ink-3)', fontWeight: 600, marginBottom: 10 }}>
        Linked
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { label: 'Type Narrowing', from: 'TypeScript' },
          { label: 'Utility Types', from: 'TypeScript' },
          { label: 'Hooks Cookbook', from: 'React' },
        ].map((r, i) => (
          <a key={i} href="#" style={{
            display: 'flex', flexDirection: 'column', gap: 1,
            padding: '8px 10px',
            background: 'var(--surface)',
            border: '1px solid var(--border-soft)',
            borderRadius: 'var(--radius-sm)',
            textDecoration: 'none', borderBottom: '1px solid var(--border-soft)',
            transition: 'transform .12s, border-color .12s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateX(2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-soft)'; e.currentTarget.style.transform = 'none'; }}
          >
            <span style={{ fontSize: '.88em', color: 'var(--ink)', fontWeight: 500 }}>{r.label}</span>
            <span style={{ fontSize: '.74em', color: 'var(--ink-3)' }}>{r.from}</span>
          </a>
        ))}
      </div>

      {/* metadata */}
      <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-soft)', fontSize: '.78em', color: 'var(--ink-3)', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div>Created · 2024-03-12</div>
        <div>Updated · 2026-05-21</div>
        <div>Edits · 47</div>
        <div>Backlinks · 12</div>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────
// CommandPalette — ⌘K
// ─────────────────────────────────────────────────────────────
function CommandPalette({ open, onClose, onSelectPage, onTogglePalette, onToggleDark, dark }) {
  const [q, setQ] = React.useState('');
  const [mode, setMode] = React.useState('pages'); // 'pages' | 'actions' | 'recent'
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (open) {
      setQ(''); setMode('pages'); setActive(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const pages = window.ATLAS_PAGES || [];

  const actions = [
    { id: 'go-home',     label: 'Go to Atlas Home',                icon: Icon.compass, run: () => onSelectPage('home') },
    { id: 'toggle-dark', label: dark ? 'Switch to light mode' : 'Switch to dark mode', icon: dark ? Icon.sun : Icon.moon, run: onToggleDark },
    { id: 'new-note',    label: 'New note',                        icon: Icon.book,  run: () => {} },
    { id: 'graph',       label: 'Open knowledge graph',            icon: Icon.compass, run: () => {} },
    { id: 'export',      label: 'Export current page as PDF',      icon: Icon.bolt,   run: () => {} },
    { id: 'random',      label: 'Open a random page',              icon: Icon.bolt,   run: () => {} },
    { id: 'settings',    label: 'Settings',                         icon: Icon.compass, run: () => {} },
  ];

  const recent = pages.slice(0, 5);

  let results;
  if (mode === 'actions') results = actions.filter((a) => a.label.toLowerCase().includes(q.toLowerCase()));
  else if (mode === 'recent') results = recent;
  else {
    if (!q) results = pages.slice(0, 12);
    else {
      const ql = q.toLowerCase();
      results = pages.filter((p) =>
        p.label.toLowerCase().includes(ql) || p.path.join(' ').toLowerCase().includes(ql)
      ).slice(0, 12);
    }
  }

  React.useEffect(() => { setActive(0); }, [q, mode]);

  const onKey = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(results.length - 1, a + 1)); }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    else if (e.key === 'Enter')     {
      e.preventDefault();
      const r = results[active];
      if (!r) return;
      if (mode === 'actions') { r.run?.(); onClose(); }
      else { onSelectPage(r.id); onClose(); }
    }
    else if (e.key === 'Tab') {
      e.preventDefault();
      const order = ['pages','actions','recent'];
      const i = order.indexOf(mode);
      setMode(order[(i + 1) % order.length]);
    }
  };

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute', inset: 0, zIndex: 50,
        background: 'color-mix(in srgb, var(--ink) 30%, transparent)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', justifyContent: 'center',
        paddingTop: '12vh',
        animation: 'atlasFadeIn .15s ease-out',
      }}
    >
      <div onClick={(e) => e.stopPropagation()} onKeyDown={onKey}
        style={{
          width: 'min(560px, 92%)',
          maxHeight: '70vh',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 30px 80px rgba(0,0,0,.25), 0 8px 24px rgba(0,0,0,.12)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          animation: 'atlasFadeInScale .18s cubic-bezier(.2,.7,.3,1)',
        }}>
        {/* search row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 18px',
          borderBottom: '1px solid var(--border-soft)',
        }}>
          <span style={{ color: 'var(--ink-3)', display: 'flex' }}>{Icon.search}</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={
              mode === 'pages' ? 'Search pages…' :
              mode === 'actions' ? 'Search actions…' :
              'Recent…'
            }
            style={{
              flex: 1, background: 'transparent', border: 0, outline: 0,
              color: 'var(--ink)', fontSize: '1em',
              fontFamily: 'var(--font-sans)',
            }}
          />
          <button onClick={onClose} style={{ color: 'var(--ink-3)' }}>
            <Kbd>esc</Kbd>
          </button>
        </div>

        {/* mode tabs */}
        <div style={{
          display: 'flex', gap: 4, padding: '8px 14px',
          borderBottom: '1px solid var(--border-soft)',
          background: 'color-mix(in srgb, var(--surface-2) 50%, transparent)',
        }}>
          {[
            { id: 'pages',  label: 'Pages',  icon: Icon.hash },
            { id: 'actions',label: 'Actions',icon: Icon.bolt },
            { id: 'recent', label: 'Recent', icon: Icon.book },
          ].map((tab) => {
            const sel = mode === tab.id;
            return (
              <button key={tab.id} onClick={() => setMode(tab.id)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 10px', borderRadius: 'var(--radius-sm)',
                background: sel ? 'var(--surface)' : 'transparent',
                color: sel ? 'var(--ink)' : 'var(--ink-3)',
                fontSize: '.85em', fontWeight: 500,
                border: '1px solid ' + (sel ? 'var(--border)' : 'transparent'),
                transition: 'all .12s',
              }}>
                {tab.icon}{tab.label}
                {tab.id === 'pages' && <span style={{ marginLeft: 4, fontSize: '.78em', color: 'var(--ink-3)' }}>{pages.length}</span>}
              </button>
            );
          })}
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--ink-3)', fontSize: '.75em' }}>
            <Kbd>tab</Kbd> to switch
          </div>
        </div>

        {/* results */}
        <div className="atlas-scroll" style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
          {results.length === 0 && (
            <div style={{ padding: '32px 18px', textAlign: 'center', color: 'var(--ink-3)', fontSize: '.9em' }}>
              No matches for &ldquo;{q}&rdquo;
            </div>
          )}
          {results.map((r, i) => {
            const sel = i === active;
            if (mode === 'actions') {
              return (
                <button key={r.id} onClick={() => { r.run?.(); onClose(); }}
                  onMouseMove={() => setActive(i)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                    background: sel ? 'var(--primary-soft)' : 'transparent',
                    color: 'var(--ink)', textAlign: 'left',
                  }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                    background: 'var(--surface-2)',
                    color: 'var(--ink-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{r.icon}</span>
                  <span style={{ flex: 1, fontSize: '.92em' }}>{r.label}</span>
                  {sel && <span style={{ color: 'var(--ink-3)', fontSize: '.8em' }}>↵</span>}
                </button>
              );
            }
            return (
              <button key={r.id} onClick={() => { onSelectPage(r.id); onClose(); }}
                onMouseMove={() => setActive(i)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                  background: sel ? 'var(--primary-soft)' : 'transparent',
                  color: 'var(--ink)', textAlign: 'left',
                }}>
                <span style={{
                  width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface-2)',
                  color: 'var(--ink-3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '.7em',
                }}>{Icon.book}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '.92em', color: 'var(--ink)', fontWeight: 500, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {r.label}
                  </div>
                  <div style={{ fontSize: '.75em', color: 'var(--ink-3)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {r.path.slice(0, -1).join(' › ')}
                  </div>
                </div>
                {r.tag && (
                  <span style={{
                    fontSize: '.66em', fontWeight: 600,
                    padding: '2px 6px', borderRadius: 99,
                    background: r.tag === 'new' ? 'var(--ok-soft)' : r.tag === 'updated' ? 'var(--info-soft)' : 'transparent',
                    color: r.tag === 'new' ? 'var(--ok)' : r.tag === 'updated' ? 'var(--info)' : 'var(--ink-3)',
                    textTransform: 'uppercase', letterSpacing: '.08em',
                  }}>{r.tag}</span>
                )}
                {sel && <span style={{ color: 'var(--ink-3)', fontSize: '.8em' }}>↵</span>}
              </button>
            );
          })}
        </div>

        {/* footer hint row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          padding: '8px 14px',
          borderTop: '1px solid var(--border-soft)',
          background: 'color-mix(in srgb, var(--surface-2) 50%, transparent)',
          fontSize: '.75em', color: 'var(--ink-3)',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Kbd>↑</Kbd><Kbd>↓</Kbd> navigate</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Kbd>↵</Kbd> open</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Kbd>tab</Kbd> switch mode</span>
          <div style={{ flex: 1 }} />
          <span>Atlas</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AtlasLogo, Sidebar, TopBar, RightRail, CommandPalette });

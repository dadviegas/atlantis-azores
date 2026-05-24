// home.jsx — Atlas entry page
// Editorial magazine-style hub: hero · resume · shelf · recent · graph

function HomePage({ viewport = 'desktop', lastPageId, onSelectPage, onOpenCommand }) {
  const tree = window.ATLAS_TREE || [];
  const last = (window.ATLAS_PAGES || []).find((p) => p.id === lastPageId);

  const isMobile = viewport === 'mobile';
  const isIpad = viewport === 'ipad';

  // Date strip
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="atlas-fade-in" style={{ paddingBottom: '6em' }}>

      {/* ───── HERO ─────────────────────────────────────────── */}
      <div style={{
        position: 'relative',
        padding: isMobile ? '8px 0 32px' : '8px 0 48px',
        borderBottom: '1px solid var(--border)',
        marginBottom: isMobile ? 28 : 40,
      }}>
        {/* date strip */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontFamily: 'var(--font-mono)', fontSize: '.78em',
          color: 'var(--ink-3)', letterSpacing: '.06em',
          textTransform: 'uppercase', marginBottom: 18,
        }}>
          <span>{dateStr}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ok)', animation: 'atlasPulse 2.4s ease-in-out infinite' }} />
            Live
          </span>
        </div>

        {/* big editorial logotype */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, flexWrap: 'wrap' }}>
          <h1 style={{
            margin: 0,
            fontFamily: '"Fraunces", "Tiempos Text", Georgia, serif',
            fontWeight: 400,
            fontSize: isMobile ? '3.6em' : isIpad ? '5em' : '7em',
            lineHeight: .92,
            letterSpacing: '-0.04em',
            color: 'var(--ink)',
            fontVariationSettings: '"opsz" 144',
          }}>
            <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>A</span>tla
            <span style={{ fontStyle: 'italic', color: 'var(--primary)' }}>s</span>
          </h1>
          <div style={{
            flex: 1, minWidth: 200,
            paddingTop: isMobile ? 0 : 18,
            color: 'var(--ink-2)',
            fontSize: isMobile ? '1em' : '1.05em',
            lineHeight: 1.5,
            maxWidth: '34ch',
          }}>
            A personal atlas of code — everything I&rsquo;ve learned, in one place,
            shaped to be remembered. <em style={{ color: 'var(--ink-3)' }}>v2.4 · 248 pages</em>
          </div>
        </div>

        {/* big command bar */}
        <button
          onClick={onOpenCommand}
          style={{
            marginTop: isMobile ? 20 : 32,
            width: '100%', maxWidth: 700,
            display: 'flex', alignItems: 'center', gap: 14,
            padding: isMobile ? '12px 14px' : '16px 18px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--ink-3)',
            fontSize: isMobile ? '.95em' : '1.05em',
            textAlign: 'left',
            transition: 'all .15s',
            boxShadow: '0 1px 0 var(--surface-2), 0 4px 16px rgba(0,0,0,.04)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.boxShadow = '0 1px 0 var(--surface-2), 0 6px 20px color-mix(in srgb, var(--primary) 12%, transparent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.boxShadow = '0 1px 0 var(--surface-2), 0 4px 16px rgba(0,0,0,.04)';
          }}
        >
          <span style={{ color: 'var(--accent)', display: 'flex' }}>{Icon.search}</span>
          <span style={{ flex: 1 }}>Search anything in the atlas…</span>
          <span style={{ display: 'flex', gap: 3 }}><Kbd>⌘</Kbd><Kbd>K</Kbd></span>
        </button>

        {/* decorative compass mark, only desktop */}
        {viewport === 'desktop' && (
          <div style={{
            position: 'absolute', top: 30, right: 0,
            color: 'var(--accent)', opacity: .15,
            transform: 'rotate(-12deg)',
          }}>
            <svg viewBox="0 0 200 200" width="160" height="160" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="100" cy="100" r="90"/>
              <circle cx="100" cy="100" r="70"/>
              <circle cx="100" cy="100" r="50"/>
              <path d="M100 10 L100 190 M10 100 L190 100"/>
              <path d="M100 30 L120 100 L100 170 L80 100 Z" fill="currentColor"/>
              {Array.from({ length: 16 }).map((_, i) => {
                const a = (i / 16) * Math.PI * 2;
                const x1 = 100 + Math.cos(a) * 85, y1 = 100 + Math.sin(a) * 85;
                const x2 = 100 + Math.cos(a) * 95, y2 = 100 + Math.sin(a) * 95;
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
              })}
            </svg>
          </div>
        )}
      </div>

      {/* ───── RESUME ─────────────────────────────────────────── */}
      {last && (
        <section style={{ marginBottom: isMobile ? 32 : 48 }}>
          <SectionLabel>Continue reading</SectionLabel>
          <button onClick={() => onSelectPage(last.id)} style={{
            display: 'block', width: '100%', textAlign: 'left',
            padding: isMobile ? '18px' : '22px 26px',
            background: 'linear-gradient(135deg, var(--primary-soft), color-mix(in srgb, var(--accent-soft) 60%, var(--surface)))',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            position: 'relative', overflow: 'hidden',
            transition: 'transform .18s ease, box-shadow .18s ease',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 30px rgba(0,0,0,.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, flexWrap: 'wrap' }}>
              <div style={{
                fontFamily: '"Fraunces", serif',
                fontSize: isMobile ? '2.4em' : '3em',
                fontWeight: 400, fontStyle: 'italic',
                color: 'var(--accent)', lineHeight: 1,
                fontVariationSettings: '"opsz" 144',
              }}>02</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '.78em', textTransform: 'uppercase', letterSpacing: '.12em',
                  color: 'var(--ink-3)', fontWeight: 600, marginBottom: 4,
                }}>{last.path.slice(0, -1).join(' › ')}</div>
                <div style={{
                  fontSize: isMobile ? '1.4em' : '1.7em',
                  fontWeight: 600, color: 'var(--ink)',
                  letterSpacing: '-.02em', marginBottom: 8, lineHeight: 1.2,
                }}>{last.label}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '.85em', color: 'var(--ink-2)', flexWrap: 'wrap' }}>
                  <div style={{ flex: '0 0 60px', height: 4, background: 'color-mix(in srgb, var(--ink-3) 20%, transparent)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '30%', background: 'var(--accent)' }} />
                  </div>
                  <span>30% in</span>
                  <span style={{ opacity: .5 }}>·</span>
                  <span>~9 min remaining</span>
                </div>
              </div>
              <div style={{
                fontSize: '.9em', fontWeight: 600, color: 'var(--accent)',
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '8px 14px', borderRadius: 99,
                background: 'var(--surface)',
                border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
              }}>Resume <span>→</span></div>
            </div>
          </button>
        </section>
      )}

      {/* ───── THE SHELF ─────────────────────────────────────── */}
      <section style={{ marginBottom: isMobile ? 32 : 56 }}>
        <SectionLabel>The Shelf</SectionLabel>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : isIpad ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          gap: isMobile ? 14 : 18,
        }}>
          {tree.map((book, i) => (
            <BookCard key={book.id} book={book} index={i} onSelectPage={onSelectPage} />
          ))}
        </div>
      </section>

      {/* ───── 2 column row: recent + graph ───────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile || isIpad ? '1fr' : '1.2fr 1fr',
        gap: isMobile ? 32 : 40,
        marginBottom: isMobile ? 32 : 48,
      }}>
        {/* recent */}
        <section>
          <SectionLabel>Recently updated</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {RECENT.map((r, i) => (
              <button key={i} onClick={() => onSelectPage(r.id)} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 0',
                borderBottom: i < RECENT.length - 1 ? '1px solid var(--border-soft)' : 'none',
                textAlign: 'left', width: '100%',
                transition: 'transform .15s',
              }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
              >
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '.78em',
                  color: 'var(--ink-3)',
                  width: 54, flexShrink: 0,
                  fontVariantNumeric: 'tabular-nums',
                }}>{r.when}</div>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: r.color, flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, color: 'var(--ink)', fontSize: '.95em', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {r.label}
                  </div>
                  <div style={{ fontSize: '.78em', color: 'var(--ink-3)' }}>{r.path}</div>
                </div>
                {r.kind && (
                  <span style={{
                    fontSize: '.7em', fontWeight: 600, color: r.kind === 'new' ? 'var(--ok)' : 'var(--info)',
                    background: r.kind === 'new' ? 'var(--ok-soft)' : 'var(--info-soft)',
                    padding: '2px 8px', borderRadius: 99,
                    textTransform: 'uppercase', letterSpacing: '.08em',
                  }}>{r.kind}</span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* knowledge graph */}
        <section>
          <SectionLabel>Knowledge graph</SectionLabel>
          <KnowledgeGraph />
        </section>
      </div>

      {/* ───── BY THE NUMBERS ─────────────────────────────────── */}
      <section style={{ marginBottom: 32 }}>
        <SectionLabel>By the numbers</SectionLabel>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: isMobile ? 12 : 18,
        }}>
          {STATS.map((s, i) => (
            <Stat key={i} {...s} />
          ))}
        </div>
      </section>

      {/* ───── FOOTER ─────────────────────────────────────────── */}
      <footer style={{
        marginTop: isMobile ? 32 : 56,
        paddingTop: 24,
        borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: '.82em', color: 'var(--ink-3)',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AtlasLogo size={16} />
          <span>Atlas — built for the long haul.</span>
        </div>
        <div style={{ display: 'flex', gap: 16, fontFamily: 'var(--font-mono)', fontSize: '.92em' }}>
          <a href="#" style={{ color: 'var(--ink-3)', borderBottom: 'none' }}>Export</a>
          <a href="#" style={{ color: 'var(--ink-3)', borderBottom: 'none' }}>Backup</a>
          <a href="#" style={{ color: 'var(--ink-3)', borderBottom: 'none' }}>Settings</a>
        </div>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SectionLabel — capsule heading with thin rule
// ─────────────────────────────────────────────────────────────
function SectionLabel({ children, count }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      marginBottom: 18,
    }}>
      <span style={{
        fontFamily: '"Fraunces", serif',
        fontSize: '1.4em', fontWeight: 500,
        color: 'var(--ink)',
        fontStyle: 'italic',
        letterSpacing: '-.01em',
        fontVariationSettings: '"opsz" 30',
      }}>{children}</span>
      <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      {count != null && (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.78em', color: 'var(--ink-3)' }}>
          {String(count).padStart(2, '0')}
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// BookArt — section-specific illustration. Tinted to spine color.
// ─────────────────────────────────────────────────────────────
function BookArt({ kind, color }) {
  // Each kind is a hand-drawn SVG glyph at 100×100 viewBox.
  const stroke = { stroke: color, strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };
  const fill   = { fill: color };
  let art;
  switch (kind) {
    case 'js':
      art = (
        <g>
          {/* curly braces */}
          <path d="M40 18 C26 18 26 35 26 42 C26 47 22 50 18 50 C22 50 26 53 26 58 C26 65 26 82 40 82" {...stroke} strokeWidth="3.2" />
          <path d="M60 18 C74 18 74 35 74 42 C74 47 78 50 82 50 C78 50 74 53 74 58 C74 65 74 82 60 82" {...stroke} strokeWidth="3.2" />
          {/* dot */}
          <circle cx="50" cy="50" r="3" {...fill} />
          {/* slash detail */}
          <line x1="44" y1="63" x2="56" y2="37" {...stroke} strokeWidth="1.5" opacity=".55" />
        </g>
      );
      break;
    case 'net':
      art = (
        <g>
          {/* edges */}
          <g {...stroke} strokeWidth="1.2" opacity=".55">
            <line x1="22" y1="28" x2="50" y2="22" />
            <line x1="50" y1="22" x2="78" y2="40" />
            <line x1="78" y1="40" x2="68" y2="72" />
            <line x1="22" y1="28" x2="38" y2="64" />
            <line x1="38" y1="64" x2="68" y2="72" />
            <line x1="50" y1="22" x2="38" y2="64" />
          </g>
          {/* nodes */}
          <circle cx="22" cy="28" r="5" {...fill} />
          <circle cx="50" cy="22" r="6.5" {...fill} />
          <circle cx="78" cy="40" r="5" {...fill} />
          <circle cx="38" cy="64" r="4.5" {...fill} />
          <circle cx="68" cy="72" r="5" {...fill} />
          {/* pulse ring around hub */}
          <circle cx="50" cy="22" r="11" {...stroke} strokeWidth="1" opacity=".5" />
        </g>
      );
      break;
    case 'sys':
      art = (
        <g>
          {/* stacked server units */}
          {[26, 46, 66].map((y, i) => (
            <g key={i}>
              <rect x="20" y={y} width="60" height="14" rx="2.5" {...stroke} strokeWidth="1.6" />
              <circle cx="28" cy={y + 7} r="1.6" {...fill} />
              <circle cx="34" cy={y + 7} r="1.6" {...fill} opacity=".55" />
              <rect x="58" y={y + 4} width="18" height="2" rx="1" {...fill} opacity=".6" />
              <rect x="58" y={y + 8} width="12" height="2" rx="1" {...fill} opacity=".4" />
            </g>
          ))}
          {/* power lead */}
          <path d="M50 80 L50 88 M44 88 L56 88" {...stroke} strokeWidth="1.6" opacity=".6" />
        </g>
      );
      break;
    case 'algo':
      art = (
        <g>
          {/* binary tree edges */}
          <g {...stroke} strokeWidth="1.4" opacity=".5">
            <line x1="50" y1="22" x2="30" y2="50" />
            <line x1="50" y1="22" x2="70" y2="50" />
            <line x1="30" y1="50" x2="20" y2="78" />
            <line x1="30" y1="50" x2="40" y2="78" />
            <line x1="70" y1="50" x2="60" y2="78" />
            <line x1="70" y1="50" x2="80" y2="78" />
          </g>
          {/* nodes */}
          <circle cx="50" cy="22" r="6" {...fill} />
          <circle cx="30" cy="50" r="5" {...fill} opacity=".85" />
          <circle cx="70" cy="50" r="5" {...fill} opacity=".85" />
          <circle cx="20" cy="78" r="3.5" {...fill} opacity=".7" />
          <circle cx="40" cy="78" r="3.5" {...fill} opacity=".7" />
          <circle cx="60" cy="78" r="3.5" {...fill} opacity=".7" />
          <circle cx="80" cy="78" r="3.5" {...fill} opacity=".7" />
        </g>
      );
      break;
    case 'db':
      art = (
        <g>
          {/* three cylinders stacked */}
          {[20, 45, 70].map((y, i) => (
            <g key={i} opacity={1 - i * 0.15}>
              <ellipse cx="50" cy={y} rx="26" ry="5" {...stroke} strokeWidth="1.6" fill="none" />
              <path d={`M24 ${y} L24 ${y + 14}`} {...stroke} strokeWidth="1.6" />
              <path d={`M76 ${y} L76 ${y + 14}`} {...stroke} strokeWidth="1.6" />
              <ellipse cx="50" cy={y + 14} rx="26" ry="5" {...stroke} strokeWidth="1.6" fill="none" />
              <ellipse cx="50" cy={y} rx="26" ry="5" fill={color} opacity=".15" />
            </g>
          ))}
        </g>
      );
      break;
    default:
      // generic — concentric arcs + dot grid
      art = (
        <g>
          <circle cx="50" cy="50" r="32" {...stroke} strokeWidth="1.4" opacity=".4" />
          <circle cx="50" cy="50" r="22" {...stroke} strokeWidth="1.4" opacity=".6" />
          <circle cx="50" cy="50" r="12" {...fill} />
          {[20, 50, 80].flatMap((x) => [20, 50, 80].map((y) => (
            <circle key={x + '-' + y} cx={x} cy={y} r="1.2" {...fill} opacity=".5" />
          )))}
        </g>
      );
  }
  return (
    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', display: 'block' }}>
      {art}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// BookCard — section card styled as a book with spine + art
// ─────────────────────────────────────────────────────────────
function BookCard({ book, index, onSelectPage }) {
  const tint = BOOK_TINT[book.color] || BOOK_TINT.amber;
  const pageCount = book.children.reduce((s, c) => s + c.children.length, 0);
  const chapTitles = book.children.slice(0, 3).map((c) => c.label);

  // Map book id to art kind
  const artKind = {
    js: 'js', net: 'net', sys: 'sys', algo: 'algo', db: 'db',
  }[book.id] || 'generic';

  // Get the page on Active spotlight
  const featured = book.children[0]?.children[0];

  return (
    <div
      onClick={() => featured && onSelectPage(featured.id)}
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: '8px 1fr',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        cursor: 'pointer',
        minHeight: 240,
        transition: 'transform .18s ease, box-shadow .18s ease, border-color .18s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 14px 30px rgba(0,0,0,.08)';
        e.currentTarget.style.borderColor = tint.spine;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      {/* spine */}
      <div style={{
        background: `linear-gradient(180deg, ${tint.spine} 0%, color-mix(in srgb, ${tint.spine} 75%, var(--ink)) 100%)`,
        boxShadow: 'inset -1px 0 0 rgba(0,0,0,.18), inset 1px 0 0 rgba(255,255,255,.2)',
      }} />

      {/* body */}
      <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0, position: 'relative' }}>

        {/* art — big watermark on right side */}
        <div style={{
          position: 'absolute', top: 14, right: 14,
          width: 88, height: 88,
          color: tint.spine, opacity: .22,
          pointerEvents: 'none',
        }}>
          <BookArt kind={artKind} color={tint.spine} />
        </div>
        {/* art — sharp mini-mark next to header (front of book) */}
        {/* (kept subtle so the watermark stays the focal element) */}

        {/* top row: index */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '.74em', letterSpacing: '.12em',
            color: tint.spine, fontWeight: 600,
            textTransform: 'uppercase',
          }}>BOOK {String(index + 1).padStart(2, '0')}</span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '.76em',
            color: 'var(--ink-3)', fontVariantNumeric: 'tabular-nums',
            background: 'var(--surface)', padding: '0 4px',
            position: 'relative', zIndex: 1,
          }}>{pageCount} pages</span>
        </div>

        {/* title */}
        <h3 style={{
          margin: 0, color: 'var(--ink)',
          fontFamily: '"Fraunces", serif',
          fontSize: '1.7em', fontWeight: 500,
          letterSpacing: '-.02em', lineHeight: 1.05,
          fontVariationSettings: '"opsz" 50',
          position: 'relative', zIndex: 1,
        }}>{book.label}</h3>

        {/* chapter list */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, fontSize: '.88em', color: 'var(--ink-2)', position: 'relative', zIndex: 1 }}>
          {chapTitles.map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 3, height: 3, borderRadius: '50%', background: tint.spine, opacity: .6 }} />
              {c}
            </div>
          ))}
          {book.children.length > 3 && (
            <div style={{ color: 'var(--ink-3)', fontSize: '.88em' }}>+ {book.children.length - 3} more</div>
          )}
        </div>

        {/* footer: tags */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: 8, borderTop: '1px dashed var(--border-soft)',
          fontSize: '.82em',
          position: 'relative', zIndex: 1,
        }}>
          <span style={{ color: 'var(--ink-3)' }}>Updated 3d ago</span>
          <span style={{ color: tint.spine, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>Browse <span>→</span></span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Knowledge graph — static SVG of section nodes
// ─────────────────────────────────────────────────────────────
function KnowledgeGraph() {
  // Nodes positioned by hand for a balanced layout
  const nodes = [
    { id: 'js',   label: 'JavaScript',  x: 95,  y: 80,  r: 24, color: '#c98b29' },
    { id: 'net',  label: 'Networking',  x: 240, y: 50,  r: 22, color: '#4f7a8f' },
    { id: 'sys',  label: 'Systems',     x: 280, y: 160, r: 20, color: '#6c8369' },
    { id: 'algo', label: 'Algorithms',  x: 130, y: 180, r: 18, color: '#8b5a7a' },
    { id: 'db',   label: 'Databases',   x: 60,  y: 200, r: 16, color: '#b85a3e' },
    // small sub-nodes
    { id: 'ts',   label: 'TS',          x: 50,  y: 30,  r: 8,  color: '#c98b29', sub: true },
    { id: 'react',label: 'React',       x: 160, y: 30,  r: 7,  color: '#c98b29', sub: true },
    { id: 'http', label: 'HTTP',        x: 290, y: 100, r: 7,  color: '#4f7a8f', sub: true },
    { id: 'pg',   label: 'PG',          x: 25,  y: 150, r: 6,  color: '#b85a3e', sub: true },
    { id: 'docker',label: 'Docker',     x: 240, y: 215, r: 7,  color: '#6c8369', sub: true },
  ];
  const edges = [
    ['js','ts'], ['js','react'],
    ['js','net'], ['net','sys'], ['sys','algo'], ['algo','js'], ['db','algo'],
    ['net','http'], ['db','pg'], ['sys','docker'],
    ['js','algo'], ['db','js'],
  ];
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '16px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <svg viewBox="0 0 340 260" style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          {nodes.map((n) => (
            <radialGradient key={n.id} id={'g_' + n.id} cx=".35" cy=".3">
              <stop offset="0%" stopColor={n.color} stopOpacity=".9"/>
              <stop offset="100%" stopColor={n.color} stopOpacity="1"/>
            </radialGradient>
          ))}
        </defs>
        {/* grid */}
        <g stroke="var(--border-soft)" strokeWidth="1" opacity=".6">
          {[40, 90, 140, 190, 240, 290].map((x) => <line key={x} x1={x} y1="0" x2={x} y2="260"/>)}
          {[40, 90, 140, 190, 240].map((y) => <line key={y} x1="0" y1={y} x2="340" y2={y}/>)}
        </g>
        {/* edges */}
        {edges.map(([a, b], i) => {
          const A = byId[a], B = byId[b];
          if (!A || !B) return null;
          return (
            <line key={i}
              x1={A.x} y1={A.y} x2={B.x} y2={B.y}
              stroke="color-mix(in srgb, var(--ink-2) 50%, transparent)"
              strokeWidth="1" opacity=".55"
            />
          );
        })}
        {/* nodes */}
        {nodes.map((n) => (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r={n.r + 4} fill={n.color} opacity=".18"/>
            <circle cx={n.x} cy={n.y} r={n.r} fill={`url(#g_${n.id})`}
              stroke="var(--surface)" strokeWidth="2"
              style={n.sub ? {} : { filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.18))' }}
            />
            {!n.sub && (
              <text x={n.x} y={n.y + n.r + 12}
                textAnchor="middle"
                fontSize="10.5" fontFamily="var(--font-sans)"
                fontWeight="600" fill="var(--ink)"
              >{n.label}</text>
            )}
            {n.sub && (
              <text x={n.x} y={n.y + 3}
                textAnchor="middle"
                fontSize="6.5" fontFamily="var(--font-sans)"
                fontWeight="600" fill="#fff"
              >{n.label}</text>
            )}
          </g>
        ))}
      </svg>
      <div style={{
        marginTop: 6,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: '.78em', color: 'var(--ink-3)',
      }}>
        <span>5 books · 16 chapters · 248 pages</span>
        <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Explore →</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Stat — large number with label
// ─────────────────────────────────────────────────────────────
function Stat({ value, label, trend, color }) {
  return (
    <div style={{
      padding: '16px 18px',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: color || 'var(--primary)',
      }} />
      <div style={{
        fontFamily: '"Fraunces", serif',
        fontSize: '2.4em', fontWeight: 500,
        color: 'var(--ink)', letterSpacing: '-.02em', lineHeight: 1,
        marginTop: 4, marginBottom: 4,
        fontVariationSettings: '"opsz" 144',
      }}>{value}</div>
      <div style={{ fontSize: '.78em', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 600, marginBottom: trend ? 6 : 0 }}>{label}</div>
      {trend && (
        <div style={{ fontSize: '.78em', color: trend.up ? 'var(--ok)' : 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)' }}>
          <span>{trend.up ? '↗' : '↘'}</span> {trend.value}
        </div>
      )}
    </div>
  );
}

// Sample data
const RECENT = [
  { id: 'net-http-3',      when: '14:02', color: '#4f7a8f', label: 'HTTP/3 & QUIC',          path: 'Networking › HTTP',       kind: 'new' },
  { id: 'js-react-suspense', when: 'yest', color: '#c98b29', label: 'Suspense & Concurrency', path: 'JavaScript › React',     kind: 'new' },
  { id: 'sys-linux-perf',  when: '2d',    color: '#6c8369', label: 'perf & flamegraphs',     path: 'Systems › Linux' },
  { id: 'algo-graph-dijkstra', when: '3d',color: '#8b5a7a', label: 'Dijkstra',               path: 'Algorithms › Graphs' },
  { id: 'db-pg-jsonb',     when: '4d',    color: '#b85a3e', label: 'JSONB Queries',          path: 'Databases › Postgres',   kind: 'updated' },
  { id: 'js-ts-narrow',    when: '6d',    color: '#c98b29', label: 'Type Narrowing',         path: 'JavaScript › TypeScript' },
];

const STATS = [
  { value: '248',  label: 'Total pages',    trend: { up: true,  value: '+12 this month' }, color: 'var(--primary)' },
  { value: '16',   label: 'Chapters',       trend: { up: true,  value: '+1' },              color: 'var(--accent)' },
  { value: '14.2h',label: 'Reading time',   trend: { up: true,  value: '+1.4h' },           color: 'var(--info)' },
  { value: '3d',   label: 'Last updated',   trend: { up: false, value: 'idle' },            color: 'var(--warn)' },
];

window.HomePage = HomePage;
window.BookCard = BookCard;
window.BookArt = BookArt;
window.BOOK_TINT_HOME = (typeof BOOK_TINT !== 'undefined' ? BOOK_TINT : null);

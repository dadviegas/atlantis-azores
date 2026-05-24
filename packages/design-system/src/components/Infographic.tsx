import type { ReactNode } from 'react';
import { Icon } from '../icons';

type Trend = 'up' | 'down' | 'neutral' | 'warn';
export type Tone = 'primary' | 'accent' | 'ok' | 'warn' | 'danger' | 'info';

const toneRing: Record<Tone, string> = {
  primary: 'var(--primary)',
  accent: 'var(--accent)',
  ok: 'var(--ok)',
  warn: 'var(--warn)',
  danger: 'var(--danger)',
  info: 'var(--info)',
};
const toneSoft: Record<Tone, string> = {
  primary: 'var(--primary-soft)',
  accent: 'var(--accent-soft)',
  ok: 'var(--ok-soft)',
  warn: 'var(--warn-soft)',
  danger: 'var(--danger-soft)',
  info: 'var(--info-soft)',
};
const toneCycle: Tone[] = ['primary', 'accent', 'info', 'ok', 'warn', 'danger'];

function gradient(tone: Tone): string {
  return `linear-gradient(135deg, ${toneRing[tone]}, color-mix(in srgb, ${toneRing[tone]} 60%, var(--ink)))`;
}
function softGradient(tone: Tone): string {
  return `linear-gradient(135deg, ${toneSoft[tone]}, color-mix(in srgb, ${toneSoft[tone]} 50%, var(--surface)))`;
}

export interface StatItem {
  value: string;
  label: string;
  delta?: string;
  trend?: Trend;
  hint?: string;
  tone?: Tone;
}

export function StatGrid({ items }: { items: StatItem[] }) {
  return (
    <div
      className="atlas-stats"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))`,
        gap: 14,
        margin: '1.4em 0',
      }}
    >
      {items.map((s, i) => (
        <Stat key={i} index={i} {...s} />
      ))}
    </div>
  );
}

function trendColor(t?: Trend): string {
  switch (t) {
    case 'up': return 'var(--ok)';
    case 'down': return 'var(--danger)';
    case 'warn': return 'var(--warn)';
    default: return 'var(--ink-3)';
  }
}

function Stat({ value, label, delta, trend, hint, tone, index = 0 }: StatItem & { index?: number }) {
  const t: Tone = tone ?? toneCycle[index % toneCycle.length];
  return (
    <div
      style={{
        position: 'relative',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '16px 16px 16px 18px',
        overflow: 'hidden',
        boxShadow: `0 1px 2px rgba(0,0,0,.04), 0 8px 24px -12px ${toneRing[t]}`,
      }}
    >
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
        background: gradient(t),
      }} />
      <div style={{ fontSize: '.78em', color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
        <div style={{
          fontSize: '1.9em', fontWeight: 700, letterSpacing: '-0.03em',
          background: gradient(t),
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>{value}</div>
        {delta && (
          <span style={{
            fontSize: '.78em', fontWeight: 700, color: trendColor(trend),
            padding: '2px 7px', borderRadius: 99,
            background: `color-mix(in srgb, ${trendColor(trend)} 14%, transparent)`,
          }}>
            {trend === 'up' ? '▲ ' : trend === 'down' ? '▼ ' : ''}{delta}
          </span>
        )}
      </div>
      {hint && (
        <div style={{ fontSize: '.78em', color: 'var(--ink-3)', marginTop: 6 }}>{hint}</div>
      )}
    </div>
  );
}

export interface Step {
  title: string;
  body?: string;
  icon?: ReactNode;
}

export function Steps({ items }: { items: Step[] }) {
  return (
    <ol
      className="atlas-steps"
      style={{
        listStyle: 'none',
        padding: 0,
        margin: '1.4em 0',
        display: 'grid',
        gap: 14,
      }}
    >
      {items.map((step, i) => {
        const t = toneCycle[i % toneCycle.length];
        return (
          <li
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '44px 1fr',
              gap: 16,
              alignItems: 'start',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '14px 16px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: `0 1px 2px rgba(0,0,0,.03), 0 6px 18px -10px ${toneRing[t]}`,
            }}
          >
            <div
              style={{
                width: 40, height: 40,
                borderRadius: '50%',
                background: gradient(t),
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '1.05em',
                boxShadow: `0 4px 12px -4px ${toneRing[t]}`,
              }}
            >
              {step.icon ?? i + 1}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '1em' }}>{step.title}</div>
              {step.body && (
                <div style={{ color: 'var(--ink-2)', fontSize: '.92em', marginTop: 4, lineHeight: 1.55 }}>{step.body}</div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export interface CompareCol {
  title: string;
  badge?: string;
  highlight?: boolean;
  rows: { label: string; value: ReactNode }[];
}

export function Compare({ columns }: { columns: CompareCol[] }) {
  return (
    <div
      className="atlas-compare"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
        gap: 14,
        margin: '1.4em 0',
      }}
    >
      {columns.map((col, i) => {
        const t: Tone = col.highlight ? 'primary' : 'info';
        return (
          <div
            key={i}
            style={{
              background: col.highlight ? softGradient(t) : 'var(--surface)',
              border: `1px solid ${col.highlight ? toneRing[t] : 'var(--border)'}`,
              borderRadius: 'var(--radius)',
              padding: 18,
              position: 'relative',
              boxShadow: col.highlight
                ? `0 2px 6px rgba(0,0,0,.04), 0 16px 40px -20px ${toneRing[t]}`
                : `0 1px 2px rgba(0,0,0,.03)`,
              transform: col.highlight ? 'translateY(-4px)' : 'none',
            }}
          >
            {col.highlight && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 4,
                background: gradient(t),
                borderTopLeftRadius: 'var(--radius)',
                borderTopRightRadius: 'var(--radius)',
              }} />
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '1.1em', flex: 1, letterSpacing: '-0.01em' }}>{col.title}</div>
              {col.badge && (
                <span style={{
                  fontSize: '.68em', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em',
                  padding: '3px 9px', borderRadius: 99,
                  background: col.highlight ? gradient(t) : 'var(--surface-2)',
                  color: col.highlight ? '#fff' : 'var(--ink-2)',
                }}>{col.badge}</span>
              )}
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {col.rows.map((r, j) => (
                <div key={j} style={{ display: 'flex', justifyContent: 'space-between', gap: 12,
                  fontSize: '.92em',
                  paddingBottom: 8,
                  borderBottom: j < col.rows.length - 1 ? '1px dashed var(--border-soft)' : 'none',
                }}>
                  <span style={{ color: 'var(--ink-2)' }}>{r.label}</span>
                  <span style={{ color: 'var(--ink)', fontWeight: 500, textAlign: 'right' }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Quote({ children, by, role }: { children: ReactNode; by?: string; role?: string }) {
  return (
    <figure
      className="atlas-quote"
      style={{
        position: 'relative',
        margin: '1.6em 0',
        padding: '22px 26px 22px 30px',
        background: softGradient('accent'),
        border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
        borderRadius: 'var(--radius)',
        display: 'flex', gap: 18,
        overflow: 'hidden',
        boxShadow: `0 1px 2px rgba(0,0,0,.04), 0 18px 40px -22px var(--accent)`,
      }}
    >
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
        background: gradient('accent'),
      }} />
      <div style={{ fontSize: '2.8em', lineHeight: .8, color: 'var(--accent)', fontFamily: 'Georgia, serif', alignSelf: 'flex-start' }}>&ldquo;</div>
      <div style={{ flex: 1 }}>
        <blockquote style={{ margin: 0, fontStyle: 'italic', color: 'var(--ink)', fontSize: '1.1em', lineHeight: 1.55 }}>
          {children}
        </blockquote>
        {(by || role) && (
          <figcaption style={{ marginTop: 12, color: 'var(--ink-2)', fontSize: '.88em' }}>
            <strong style={{ color: 'var(--ink)' }}>{by}</strong>
            {by && role && <span> · </span>}
            {role && <span>{role}</span>}
          </figcaption>
        )}
      </div>
    </figure>
  );
}

export interface MeterItem {
  label: string;
  value: number;
  max?: number;
  tone?: 'primary' | 'accent' | 'ok' | 'warn' | 'danger' | 'info';
  caption?: string;
}

export function Meters({ items }: { items: MeterItem[] }) {
  return (
    <div
      className="atlas-meters"
      style={{
        display: 'grid', gap: 16,
        margin: '1.4em 0',
        padding: 18,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        boxShadow: '0 1px 2px rgba(0,0,0,.03)',
      }}
    >
      {items.map((m, i) => {
        const max = m.max ?? 100;
        const pct = Math.min(100, Math.max(0, (m.value / max) * 100));
        const t = m.tone ?? 'primary';
        return (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '.88em', marginBottom: 6 }}>
              <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{m.label}</span>
              <span style={{
                color: toneRing[t], fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
              }}>
                {m.value}{m.max != null ? ` / ${m.max}` : '%'}
              </span>
            </div>
            <div style={{
              height: 10, background: 'var(--surface-2)',
              borderRadius: 99, overflow: 'hidden',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,.06)',
            }}>
              <div style={{
                width: `${pct}%`, height: '100%',
                background: gradient(t),
                borderRadius: 99,
                transition: 'width .4s cubic-bezier(.2,.7,.3,1)',
                boxShadow: `0 0 12px -2px ${toneRing[t]}`,
              }} />
            </div>
            {m.caption && (
              <div style={{ fontSize: '.78em', color: 'var(--ink-3)', marginTop: 5 }}>{m.caption}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export interface KeyValueItem {
  k: string;
  v: ReactNode;
  icon?: ReactNode;
}

export function KeyValueGrid({ items }: { items: KeyValueItem[] }) {
  return (
    <div
      className="atlas-kv"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 12,
        margin: '1.4em 0',
      }}
    >
      {items.map((it, i) => {
        const t = toneCycle[i % toneCycle.length];
        return (
          <div key={i} style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '14px 16px',
            display: 'flex', gap: 12, alignItems: 'flex-start',
            boxShadow: `0 1px 2px rgba(0,0,0,.03), 0 8px 18px -14px ${toneRing[t]}`,
          }}>
            <div style={{
              color: '#fff',
              background: gradient(t),
              borderRadius: 'var(--radius-sm)',
              padding: 7,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 10px -4px ${toneRing[t]}`,
            }}>{it.icon ?? <span style={{ fontWeight: 700, fontSize: '.9em', padding: '0 4px' }}>{(i + 1).toString().padStart(2, '0')}</span>}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '.74em', color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600 }}>{it.k}</div>
              <div style={{ color: 'var(--ink)', marginTop: 3, fontWeight: 500 }}>{it.v}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export const InfographicIcons = Icon;

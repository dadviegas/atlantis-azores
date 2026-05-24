import type { ReactNode } from 'react';
import { Icon } from '../icons';

export type CalloutKind = 'info' | 'tip' | 'warning' | 'danger' | 'success';

export interface CalloutProps {
  kind?: CalloutKind;
  title?: ReactNode;
  children?: ReactNode;
  compact?: boolean;
}

export function Callout({ kind = 'info', title, children, compact = false }: CalloutProps) {
  const map = {
    info:    { color: 'var(--info)',   bg: 'var(--info-soft)',   icon: Icon.info,  label: 'Note' },
    tip:     { color: 'var(--ok)',     bg: 'var(--ok-soft)',     icon: Icon.tip,   label: 'Tip' },
    warning: { color: 'var(--warn)',   bg: 'var(--warn-soft)',   icon: Icon.warn,  label: 'Warning' },
    danger:  { color: 'var(--danger)', bg: 'var(--danger-soft)', icon: Icon.danger,label: 'Danger' },
    success: { color: 'var(--ok)',     bg: 'var(--ok-soft)',     icon: Icon.ok,    label: 'Success' },
  } as const;
  const c = map[kind];
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

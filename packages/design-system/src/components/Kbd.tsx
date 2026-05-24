import type { ReactNode } from 'react';

export interface KbdProps {
  children?: ReactNode;
}

export function Kbd({ children }: KbdProps) {
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

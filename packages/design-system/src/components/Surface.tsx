import type { HTMLAttributes, ReactNode } from 'react';

export type SurfaceTone = 'base' | 'raised' | 'sunken';

export interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  tone?: SurfaceTone;
  bordered?: boolean;
  padding?: number | string;
  children?: ReactNode;
}

const bgFor: Record<SurfaceTone, string> = {
  base:    'var(--surface)',
  raised:  'var(--bg)',
  sunken:  'var(--surface-2)',
};

export function Surface({
  tone = 'base',
  bordered = true,
  padding = 16,
  style,
  children,
  ...rest
}: SurfaceProps) {
  return (
    <div
      {...rest}
      style={{
        background: bgFor[tone],
        border: bordered ? '1px solid var(--border)' : '1px solid transparent',
        borderRadius: 'var(--radius)',
        padding,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

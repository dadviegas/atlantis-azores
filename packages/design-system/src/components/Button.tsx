import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'ghost' | 'quiet';
export type ButtonSize = 'sm' | 'md';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

const sizing: Record<ButtonSize, { padding: string; fontSize: string; height: number }> = {
  sm: { padding: '0 10px', fontSize: '.82em', height: 28 },
  md: { padding: '0 14px', fontSize: '.9em',  height: 34 },
};

export function Button({
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  children,
  style,
  ...rest
}: ButtonProps) {
  const s = sizing[size];
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: s.padding,
    height: s.height,
    fontSize: s.fontSize,
    fontWeight: 500,
    borderRadius: 'var(--radius-sm)',
    border: '1px solid transparent',
    transition: 'background .12s, color .12s, border-color .12s',
  } as const;

  const byVariant: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      background: 'var(--primary)',
      color: 'var(--surface)',
    },
    ghost: {
      background: 'var(--surface)',
      color: 'var(--ink)',
      borderColor: 'var(--border)',
    },
    quiet: {
      background: 'transparent',
      color: 'var(--ink-2)',
    },
  };

  return (
    <button {...rest} style={{ ...base, ...byVariant[variant], ...style }}>
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}

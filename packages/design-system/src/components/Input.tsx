import type { InputHTMLAttributes, ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

export function Input({ iconLeft, iconRight, style, ...rest }: InputProps) {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '0 10px',
      height: 34,
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)',
      color: 'var(--ink)',
      transition: 'border-color .15s',
    }}
      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
    >
      {iconLeft && <span style={{ color: 'var(--ink-3)', display: 'flex' }}>{iconLeft}</span>}
      <input
        {...rest}
        style={{
          flex: 1,
          minWidth: 0,
          background: 'transparent',
          border: 0,
          outline: 0,
          color: 'inherit',
          fontFamily: 'var(--font-sans)',
          fontSize: '.92em',
          ...style,
        }}
      />
      {iconRight && <span style={{ color: 'var(--ink-3)', display: 'flex' }}>{iconRight}</span>}
    </div>
  );
}

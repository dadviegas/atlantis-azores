import type { ReactNode } from 'react';

export interface Tab<T extends string> {
  id: T;
  label: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
}

export interface TabGroupProps<T extends string> {
  tabs: Tab<T>[];
  value: T;
  onChange: (id: T) => void;
}

export function TabGroup<T extends string>({ tabs, value, onChange }: TabGroupProps<T>) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {tabs.map((tab) => {
        const selected = tab.id === value;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 10px',
              borderRadius: 'var(--radius-sm)',
              background: selected ? 'var(--surface)' : 'transparent',
              color: selected ? 'var(--ink)' : 'var(--ink-3)',
              fontSize: '.85em',
              fontWeight: 500,
              border: '1px solid ' + (selected ? 'var(--border)' : 'transparent'),
              transition: 'all .12s',
            }}
          >
            {tab.icon}
            {tab.label}
            {tab.badge != null && (
              <span style={{ marginLeft: 4, fontSize: '.78em', color: 'var(--ink-3)' }}>{tab.badge}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

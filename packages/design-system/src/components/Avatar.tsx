export interface AvatarProps {
  initials: string;
  size?: number;
  src?: string;
}

export function Avatar({ initials, size = 28, src }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={initials}
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div
      aria-label={initials}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
        color: '#fff',
        fontSize: size * 0.36,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        userSelect: 'none',
      }}
    >{initials}</div>
  );
}

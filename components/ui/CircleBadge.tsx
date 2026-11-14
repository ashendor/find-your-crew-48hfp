interface CircleBadgeProps {
  children: React.ReactNode;
  color?: 'rust' | 'mustard' | 'dubai-blue';
  size?: 'small' | 'medium' | 'large';
}

export default function CircleBadge({
  children,
  color = 'rust',
  size = 'medium',
}: CircleBadgeProps) {
  const colorStyles = {
    rust: 'bg-rust',
    mustard: 'bg-mustard',
    'dubai-blue': 'bg-dubai-blue',
  };
  
  const sizeStyles = {
    small: 'w-8 h-8 text-xs',
    medium: 'w-12 h-12 text-sm',
    large: 'w-16 h-16 text-base',
  };
  
  return (
    <div
      className={`${colorStyles[color]} ${sizeStyles[size]} rounded-full flex items-center justify-center text-paper font-label font-semibold border-2 border-ink`}
    >
      {children}
    </div>
  );
}

import Link from 'next/link';

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: 'primary' | 'secondary';
  size?: 'default' | 'large';
  className?: string;
}

export default function Button({
  children,
  href,
  variant = 'primary',
  size = 'default',
  className = '',
}: ButtonProps) {
  const baseStyles = 'inline-block font-label font-semibold uppercase tracking-wider transition-all duration-200 border-2 text-center';
  
  const variantStyles = {
    primary: 'bg-rust text-paper border-rust hover:bg-ink hover:border-ink',
    secondary: 'bg-transparent text-ink border-ink hover:bg-ink hover:text-paper',
  };
  
  const sizeStyles = {
    default: 'px-6 py-3 text-sm',
    large: 'px-8 py-4 text-base',
  };
  
  const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;
  
  if (href) {
    return (
      <Link href={href} className={combinedStyles}>
        {children}
      </Link>
    );
  }
  
  return (
    <button className={combinedStyles}>
      {children}
    </button>
  );
}

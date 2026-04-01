import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Button({ 
  className, 
  variant = 'primary', 
  children, 
  style: parentStyle,
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'glass' | 'ghost' }) {
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    glass: 'glass btn-glass',
    ghost: 'btn-ghost',
  };
  
  return (
    <button 
      className={cn('btn-base', variantClasses[variant], className)}
      style={parentStyle}
      {...props}
    >
      {children}
    </button>
  );
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input 
        ref={ref}
        className={className} 
        style={{
          width: '100%',
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius)',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          color: 'white',
          fontSize: '1rem',
          outline: 'none',
          transition: 'all 0.3s ease',
          fontFamily: 'inherit'
        }}
        {...props} 
      />
    );
  }
);

Input.displayName = 'Input';

export function Card({ children, className, style }: { children: React.ReactNode, className?: string, style?: React.CSSProperties }) {
  return (
    <div 
      className={cn('glass', className)} 
      style={{ 
        padding: '2.5rem', 
        borderColor: 'rgba(255, 255, 255, 0.05)',
        ...style 
      }}
    >
      {children}
    </div>
  );
}

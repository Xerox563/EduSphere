import { motion } from 'framer-motion';
import { ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  icon,
  iconPosition = 'left',
  onClick,
  disabled = false,
  type = 'button'
}: ButtonProps) => {
  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'py-1.5 px-3 text-sm',
    md: 'py-2 px-4',
    lg: 'py-2.5 px-5 text-lg',
  };
  
  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-primary-500/25',
    secondary: 'bg-secondary-600 hover:bg-secondary-700 text-white shadow-lg hover:shadow-secondary-500/25',
    accent: 'bg-accent-600 hover:bg-accent-700 text-white shadow-lg hover:shadow-accent-500/25',
    outline: 'border border-gray-300 hover:bg-gray-800 text-gray-100 shadow-md hover:shadow-gray-500/20',
    ghost: 'hover:bg-gray-800 text-gray-300 hover:text-white shadow-sm hover:shadow-gray-500/10',
  };
  
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`
        rounded-lg font-medium transition-all duration-300 ease-in-out
        flex items-center justify-center gap-2 transform
        ${sizeClasses[size]} 
        ${variantClasses[variant]}
        ${className}
      `}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {icon && iconPosition === 'left' && icon}
      {children}
      {icon && iconPosition === 'right' && icon}
    </motion.button>
  );
};

export default Button; 
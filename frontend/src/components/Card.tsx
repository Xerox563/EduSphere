import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
}

const Card = ({ children, className = '', animate = true }: CardProps) => {
  return (
    <motion.div
      className={`bg-background-card rounded-xl shadow-xl border border-gray-700/50 p-6 backdrop-blur-sm ${className}`}
      whileHover={animate ? { 
        y: -8, 
        scale: 1.02,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        transition: { duration: 0.3, ease: "easeOut" } 
      } : undefined}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
};

export default Card; 
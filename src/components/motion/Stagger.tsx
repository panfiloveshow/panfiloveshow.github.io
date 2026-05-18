import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface StaggerProps {
  children: ReactNode;
  className?: string;
  delayChildren?: number;
  stagger?: number;
}

export function Stagger({ children, className, delayChildren = 0, stagger = 0.08 }: StaggerProps) {
  const reduced = useReducedMotion();
  const container: Variants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: reduced ? 0 : delayChildren,
        staggerChildren: reduced ? 0 : stagger,
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={container}
      initial={false}
      animate="visible"
    >
      {children}
    </motion.div>
  );
}

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
}

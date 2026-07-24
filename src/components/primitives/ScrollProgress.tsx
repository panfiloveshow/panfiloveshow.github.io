import { motion, useScroll } from 'framer-motion';

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      style={{ scaleX: scrollYProgress }}
      aria-hidden
      className="scroll-progress fixed inset-x-0 top-0 z-[60] h-[2px] origin-left transform-gpu bg-gradient-to-r from-brand-500 via-accent to-brand-400 shadow-glow-soft transition-transform duration-75"
    />
  );
}

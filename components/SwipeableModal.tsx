import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { ReactNode } from 'react';

interface SwipeableModalProps {
  children: ReactNode;
  onClose: () => void;
  isOpen: boolean;
}

export function SwipeableModal({ children, onClose, isOpen }: SwipeableModalProps) {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [0, 300], [1, 0]);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // If dragged more than 150px to the right, close
    if (info.offset.x > 150) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
      className="fixed inset-0 bg-background z-50 overflow-y-auto"
      style={{ x, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 300 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
    >
      {/* Swipe Indicator */}
      <div className="absolute top-2 left-2 w-1 h-12 bg-muted-foreground/20 rounded-full pointer-events-none" />

      {children}
    </motion.div>
  );
}

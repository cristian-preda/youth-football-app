import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { ArrowLeft, X } from 'lucide-react';

interface NavigationHeaderProps {
  title: string;
  onBack: () => void;
  rightAction?: React.ReactNode;
  variant?: 'back' | 'close';
  subtitle?: string;
}

export function NavigationHeader({
  title,
  onBack,
  rightAction,
  variant = 'back',
  subtitle,
}: NavigationHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border"
      style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top))' }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Back/Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="flex-shrink-0"
        >
          {variant === 'back' ? (
            <ArrowLeft className="w-5 h-5" />
          ) : (
            <X className="w-5 h-5" />
          )}
        </Button>

        {/* Title */}
        <div className="flex-1 text-center px-4 min-w-0">
          <h2 className="font-semibold truncate">{title}</h2>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>

        {/* Right Action or Spacer */}
        <div className="flex-shrink-0">
          {rightAction || <div className="w-10" />}
        </div>
      </div>
    </motion.div>
  );
}

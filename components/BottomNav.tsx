import { Home, Calendar, Users, MessageSquare, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'dashboard', label: 'Acasă', icon: Home },
    { id: 'schedule', label: 'Program', icon: Calendar },
    { id: 'attendance', label: 'Prezență', icon: Users },
    { id: 'messages', label: 'Mesaje', icon: MessageSquare },
    { id: 'profile', label: 'Profil', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-50">
      <div className="flex items-center justify-around py-2 px-2 relative">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center p-2 rounded-lg relative z-10 flex-1"
              whileTap={{ scale: 0.9 }}
              animate={{
                color: isActive ? 'var(--primary)' : 'var(--muted-foreground)',
              }}
              transition={{ duration: 0.2 }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-primary/10 rounded-lg"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                  }}
                />
              )}

              <motion.div
                className="relative z-10"
                animate={{
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -2 : 0,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-2' : 'stroke-1.5'}`} />
              </motion.div>

              <motion.span
                className="text-xs mt-1 relative z-10"
                animate={{
                  fontWeight: isActive ? 600 : 400,
                  scale: isActive ? 1.05 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                {tab.label}
              </motion.span>

              {isActive && (
                <motion.div
                  className="absolute -bottom-2 left-1/2 w-1 h-1 bg-primary rounded-full"
                  layoutId="activeTabDot"
                  initial={false}
                  style={{ x: '-50%' }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
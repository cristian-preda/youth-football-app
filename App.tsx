import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { Schedule } from './components/Schedule';
import { Attendance } from './components/Attendance';
import { Messages } from './components/Messages';
import { Profile } from './components/Profile';
import { PlayerRoster } from './components/PlayerRoster';
import { Onboarding } from './components/Onboarding';
import { users } from './data/mockData';
import type { UserRole } from './types';

function AppContent() {
  const { currentUser, isOnboarded, login, completeOnboarding } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Handle onboarding completion
  const handleOnboardingComplete = (selectedRole: UserRole) => {
    // Find a mock user with the selected role
    const mockUser = users.find(u => u.role === selectedRole);
    if (mockUser) {
      login(mockUser.id);
      completeOnboarding();
    }
  };

  // Show onboarding if user hasn't completed it or isn't logged in
  if (!isOnboarded || !currentUser) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} />;
      case 'schedule':
        return <Schedule />;
      case 'attendance':
        return <Attendance />;
      case 'messages':
        return <Messages />;
      case 'profile':
        return <Profile />;
      case 'players':
        return <PlayerRoster />;
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  const pageVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  };

  const pageTransition = {
    type: "tween" as const,
    ease: [0.22, 1, 0.36, 1] as const,
    duration: 0.3
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="p-4 pb-20 max-w-md mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={pageTransition}
          >
            {renderActiveTab()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

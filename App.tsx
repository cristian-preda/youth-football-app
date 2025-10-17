import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { NewsFeed } from './components/NewsFeed';
import { ClubStandings } from './components/ClubStandings';
import { Schedule } from './components/Schedule';
import { Attendance } from './components/Attendance';
import { MessagesSimplified as Messages } from './components/MessagesSimplified';
import { Profile } from './components/Profile';
import { PlayerRoster } from './components/PlayerRoster';
import { Onboarding } from './components/Onboarding';
import { users } from './data/mockData';
import type { UserRole } from './types';

function AppContent() {
  const { currentUser, login, completeOnboarding } = useAuth();
  const [activeTab, setActiveTab] = useState('news');
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Handle onboarding completion
  const handleOnboardingComplete = (selectedRole: UserRole) => {
    // Find a mock user with the selected role
    const mockUser = users.find(u => u.role === selectedRole);
    if (mockUser) {
      login(mockUser.id);
      completeOnboarding();
      setShowOnboarding(false);
      // Navigate to team page after login
      setActiveTab('team');
    }
  };

  // Show onboarding modal if explicitly requested
  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'news':
        // News feed is public - pass login handler
        return <NewsFeed onNavigate={setActiveTab} onRequestLogin={() => setShowOnboarding(true)} />;
      case 'schedule':
        return currentUser ? <Schedule /> : <NewsFeed onNavigate={setActiveTab} onRequestLogin={() => setShowOnboarding(true)} />;
      case 'team':
        return currentUser ? <Dashboard onNavigate={setActiveTab} /> : <NewsFeed onNavigate={setActiveTab} onRequestLogin={() => setShowOnboarding(true)} />;
      case 'messages':
        return currentUser ? <Messages /> : <NewsFeed onNavigate={setActiveTab} onRequestLogin={() => setShowOnboarding(true)} />;
      case 'club':
        return currentUser ? <ClubStandings onNavigate={setActiveTab} /> : <NewsFeed onNavigate={setActiveTab} onRequestLogin={() => setShowOnboarding(true)} />;
      case 'profile':
        return currentUser ? <Profile /> : <NewsFeed onNavigate={setActiveTab} onRequestLogin={() => setShowOnboarding(true)} />;
      case 'attendance':
        return currentUser ? <Attendance /> : <NewsFeed onNavigate={setActiveTab} onRequestLogin={() => setShowOnboarding(true)} />;
      case 'players':
        return currentUser ? <PlayerRoster /> : <NewsFeed onNavigate={setActiveTab} onRequestLogin={() => setShowOnboarding(true)} />;
      default:
        return <NewsFeed onNavigate={setActiveTab} onRequestLogin={() => setShowOnboarding(true)} />;
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
      <main className="p-4 pb-20 max-w-md mx-auto" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
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

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
import { MyKid } from './components/MyKid';
import { TeamsOverview } from './components/TeamsOverview';
import { CoachesManagement } from './components/CoachesManagement';
import { Analytics } from './components/Analytics';
import { ClubAnnouncements } from './components/ClubAnnouncements';
import { Facilities } from './components/Facilities';
import { users } from './data/mockData';
import type { UserRole } from './types';

function AppContent() {
  const { currentUser, login, completeOnboarding } = useAuth();
  const [activeTab, setActiveTab] = useState('news');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  // Handle onboarding completion
  const handleOnboardingComplete = (selectedRole: UserRole) => {
    // Find a mock user with the selected role
    const mockUser = users.find(u => u.role === selectedRole);
    if (mockUser) {
      login(mockUser.id);
      completeOnboarding();
      setShowOnboarding(false);
      // Navigate to appropriate page based on role
      if (selectedRole === 'parent') {
        setActiveTab('my-kid');
      } else {
        setActiveTab('team');
      }
    }
  };

  // Show onboarding modal if explicitly requested
  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const handleNavigate = (tab: string, playerId?: string) => {
    setActiveTab(tab);
    if (playerId) {
      setSelectedPlayerId(playerId);
    } else {
      setSelectedPlayerId(null);
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'news':
        // News feed is public - pass login handler
        return <NewsFeed onNavigate={handleNavigate} onRequestLogin={() => setShowOnboarding(true)} />;
      case 'schedule':
        return currentUser ? <Schedule /> : <NewsFeed onNavigate={handleNavigate} onRequestLogin={() => setShowOnboarding(true)} />;
      case 'add-event':
        return currentUser ? <Schedule openCreateForm={true} /> : <NewsFeed onNavigate={handleNavigate} onRequestLogin={() => setShowOnboarding(true)} />;
      case 'team':
        return currentUser ? <Dashboard onNavigate={handleNavigate} /> : <NewsFeed onNavigate={handleNavigate} onRequestLogin={() => setShowOnboarding(true)} />;
      case 'my-kid':
        return currentUser ? <MyKid /> : <NewsFeed onNavigate={handleNavigate} onRequestLogin={() => setShowOnboarding(true)} />;
      case 'messages':
        return currentUser ? <Messages /> : <NewsFeed onNavigate={handleNavigate} onRequestLogin={() => setShowOnboarding(true)} />;
      case 'club':
        return currentUser ? <ClubStandings onNavigate={handleNavigate} /> : <NewsFeed onNavigate={handleNavigate} onRequestLogin={() => setShowOnboarding(true)} />;
      case 'profile':
        return currentUser ? <Profile /> : <NewsFeed onNavigate={handleNavigate} onRequestLogin={() => setShowOnboarding(true)} />;
      case 'attendance':
        return currentUser ? <Attendance /> : <NewsFeed onNavigate={handleNavigate} onRequestLogin={() => setShowOnboarding(true)} />;
      case 'players':
        return currentUser ? <PlayerRoster initialPlayerId={selectedPlayerId || undefined} /> : <NewsFeed onNavigate={handleNavigate} onRequestLogin={() => setShowOnboarding(true)} />;
      // Director-specific routes
      case 'teams':
        return currentUser ? <TeamsOverview /> : <NewsFeed onNavigate={handleNavigate} onRequestLogin={() => setShowOnboarding(true)} />;
      case 'coaches':
        return currentUser ? <CoachesManagement /> : <NewsFeed onNavigate={handleNavigate} onRequestLogin={() => setShowOnboarding(true)} />;
      case 'analytics':
        return currentUser ? <Analytics /> : <NewsFeed onNavigate={handleNavigate} onRequestLogin={() => setShowOnboarding(true)} />;
      case 'announcements':
        return currentUser ? <ClubAnnouncements /> : <NewsFeed onNavigate={handleNavigate} onRequestLogin={() => setShowOnboarding(true)} />;
      case 'facilities':
        return currentUser ? <Facilities /> : <NewsFeed onNavigate={handleNavigate} onRequestLogin={() => setShowOnboarding(true)} />;
      default:
        return <NewsFeed onNavigate={handleNavigate} onRequestLogin={() => setShowOnboarding(true)} />;
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

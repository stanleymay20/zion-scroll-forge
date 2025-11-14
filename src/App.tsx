import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./contexts/AuthContext";
import { InstitutionProvider } from "./contexts/InstitutionContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { useRealtimeSubscriptions } from "@/hooks/useRealtime";
import { MainLayout } from "./components/layout/MainLayout";
import { Loader2 } from "lucide-react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import CourseLearn from "./pages/CourseLearn";
import ModuleDetail from "./pages/ModuleDetail";
import QuizPage from "./pages/QuizPage";
import AITutors from "./pages/AITutors";
import AITutorChat from "./pages/AITutorChat";
import AITutorOfficeHours from "./pages/AITutorOfficeHours";
import AITutorAnalytics from "./pages/AITutorAnalytics";
import TutorProfile from "./pages/TutorProfile";
import AvatarCustomization from "./pages/AvatarCustomization";
import ContentGeneration from "./pages/ContentGeneration";
import Community from "./pages/Community";
import Assessments from "./pages/Assessments";
import ScrollCoin from "./pages/ScrollCoin";
import Wallet from "./pages/Wallet";
import SpiritualFormation from "./pages/SpiritualFormation";
import PrayerRequests from "./pages/PrayerRequests";
import Analytics from "./pages/Analytics";
import Transcript from "./pages/Transcript";
import StudyGroups from "./pages/StudyGroups";
import StudyGroupChat from "./pages/StudyGroupChat";
import Achievements from "./pages/Achievements";
import AdminDashboard from "./pages/AdminDashboard";
import Apply from "./pages/Apply";
import FacultyDashboard from "./pages/FacultyDashboard";
import Gradebook from "./pages/Gradebook";
import AlumniPortal from "./pages/AlumniPortal";
import ProfilePage from "./pages/Profile";
import DegreesPage from "./pages/Degrees";
import SettingsPage from "./pages/Settings";
import { ComingSoonPage } from "./components/layout/PageTemplate";
import FacultyGallery from "./pages/FacultyGallery";
import FacultyDetail from "./pages/FacultyDetail";
import FacultyComparison from "./pages/FacultyComparison";
import GenerationHistory from "./pages/admin/GenerationHistory";
import LearningProfileOnboarding from "./pages/LearningProfileOnboarding";
import PersonalizedDashboard from "./pages/PersonalizedDashboard";
import LearningGoals from "./pages/LearningGoals";
import SkillsAssessment from "./pages/SkillsAssessment";
import NotFound from "./pages/NotFound";
import PrayerJournal from "./pages/PrayerJournal";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import DegreePrograms from "./pages/DegreePrograms";
import DegreeProgramDetail from "./pages/DegreeProgramDetail";
import BillingDashboard from "./pages/BillingDashboard";
import ScrollCoinWallet from "./pages/ScrollCoinWallet";
import ScrollCoinLeaderboard from "./pages/ScrollCoinLeaderboard";
import AITutorsCatalog from "./pages/AITutorsCatalog";
import TutorSession from "./pages/TutorSession";
import VirtualLabsPage from "./pages/VirtualLabsPage";
import XRClassroomsPage from "./pages/XRClassroomsPage";
import AdmissionsReview from "./pages/AdmissionsReview";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import CourseAnalyticsPage from "./pages/CourseAnalyticsPage";
import NotificationsPage from "./pages/NotificationsPage";
import NotificationSettings from "./pages/NotificationSettings";
import GenerationMonitor from "./pages/GenerationMonitor";
import InstitutionsAdmin from "./pages/InstitutionsAdmin";

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-scroll-primary mx-auto"></div>
          <p className="mt-4 text-scroll-primary">Loading ScrollUniversity...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
      <p className="text-muted-foreground">Loading ScrollUniversity...</p>
      <p className="text-xs text-muted-foreground mt-2">✝️ Jesus Christ is Lord</p>
    </div>
  </div>
);

// Realtime subscriptions wrapper
const RealtimeProvider = ({ children }: { children: React.ReactNode }) => {
  useRealtimeSubscriptions();
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <InstitutionProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <RealtimeProvider>
              <Suspense fallback={<LoadingFallback />}>
              <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected Routes with Main Layout */}
            <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="courses" element={<Courses />} />
              <Route path="courses/:courseId" element={<CourseDetail />} />
              <Route path="courses/:courseId/learn" element={<CourseLearn />} />
              <Route path="courses/:courseId/modules/:moduleId" element={<ModuleDetail />} />
              <Route path="quiz/:quizId" element={<QuizPage />} />
              <Route path="ai-tutors" element={<AITutors />} />
              <Route path="ai-tutors/:tutorId" element={<AITutorChat />} />
              <Route path="ai-tutors/:tutorId/profile" element={<TutorProfile />} />
              <Route path="ai-tutors/office-hours" element={<AITutorOfficeHours />} />
              <Route path="ai-tutors/analytics" element={<AITutorAnalytics />} />
              <Route path="avatar-customization" element={<AvatarCustomization />} />
              <Route path="content-generation" element={<ContentGeneration />} />
              <Route path="community" element={<Community />} />
              <Route path="scrollcoin" element={<ScrollCoin />} />
              <Route path="wallet" element={<Wallet />} />
              <Route path="spiritual-formation" element={<SpiritualFormation />} />
              <Route path="prayer-requests" element={<PrayerRequests />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="transcript" element={<Transcript />} />
              <Route path="study-groups" element={<StudyGroups />} />
              <Route path="study-groups/:groupId" element={<StudyGroupChat />} />
              <Route path="achievements" element={<Achievements />} />
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="admin/generation-history" element={<GenerationHistory />} />
              <Route path="admin/institutions" element={<InstitutionsAdmin />} />
              <Route path="apply" element={<Apply />} />
              <Route path="faculty" element={<FacultyDashboard />} />
              <Route path="faculty/gradebook/:courseId" element={<Gradebook />} />
              <Route path="admin/admissions" element={<AdmissionsReview />} />
              <Route path="alumni" element={<AlumniPortal />} />
            
            {/* Dynamic pages */}
            <Route path="profile" element={<ProfilePage />} />
            <Route path="degrees" element={<DegreePrograms />} />
            <Route path="degrees/:id" element={<DegreeProgramDetail />} />
            <Route path="xr-classrooms" element={<XRClassroomsPage />} />
            <Route path="virtual-labs" element={<VirtualLabsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="prayer-journal" element={<PrayerJournal />} />
            <Route path="events" element={<Events />} />
            <Route path="events/:id" element={<EventDetail />} />
            <Route path="billing" element={<BillingDashboard />} />
            <Route path="scrollcoin-wallet" element={<ScrollCoinWallet />} />
            <Route path="scrollcoin-leaderboard" element={<ScrollCoinLeaderboard />} />
            <Route path="ai-tutors-catalog" element={<AITutorsCatalog />} />
            <Route path="ai-tutors/:id" element={<TutorSession />} />
            <Route path="tutor-session/:id" element={<TutorSession />} />
            <Route path="admissions-review" element={<AdmissionsReview />} />
            <Route path="analytics/dashboard" element={<AnalyticsDashboard />} />
            <Route path="analytics/courses/:courseId" element={<CourseAnalyticsPage />} />
            <Route path="generation-monitor" element={<GenerationMonitor />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="notifications/settings" element={<NotificationSettings />} />
            
            {/* All other routes use coming soon pages */}
            <Route path="assessments" element={<Assessments />} />
            <Route path="divine-scorecard" element={<ComingSoonPage title="Divine Scorecard" />} />
            <Route path="prophetic-checkins" element={<ComingSoonPage title="Prophetic Check-ins" />} />
            <Route path="calling-discernment" element={<ComingSoonPage title="Calling Discernment" />} />
            <Route path="forums" element={<ComingSoonPage title="Discussion Forums" />} />
            <Route path="mentorship" element={<ComingSoonPage title="Mentorship" />} />
            <Route path="projects" element={<ComingSoonPage title="Collaborative Projects" />} />
            <Route path="marketplace" element={<ComingSoonPage title="Marketplace" />} />
            <Route path="badges" element={<ComingSoonPage title="ScrollBadges" />} />
              <Route path="faculties" element={<FacultyGallery />} />
              <Route path="faculties/compare" element={<FacultyComparison />} />
              <Route path="faculties/:facultyId" element={<FacultyDetail />} />
              <Route path="learning-profile" element={<LearningProfileOnboarding />} />
              <Route path="personalized-dashboard" element={<PersonalizedDashboard />} />
              <Route path="learning-goals" element={<LearningGoals />} />
              <Route path="skills-assessment" element={<SkillsAssessment />} />
              <Route path="career-pathways" element={<ComingSoonPage title="Career Pathways" />} />
            <Route path="job-board" element={<ComingSoonPage title="Job Board" />} />
            <Route path="research" element={<ComingSoonPage title="Research Hub" />} />
            <Route path="help" element={<ComingSoonPage title="Help Center" />} />
          </Route>
          
          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </RealtimeProvider>
        </BrowserRouter>
      </TooltipProvider>
      </InstitutionProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

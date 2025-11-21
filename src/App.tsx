import React, { Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./contexts/AuthContext";
import { InstitutionProvider } from "./contexts/InstitutionContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorHandlingProvider } from "./contexts/ErrorHandlingContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { useRealtimeSubscriptions } from "@/hooks/useRealtime";
import { MainLayout } from "./components/layout/MainLayout";
import { MobileAppInstallPrompt } from "@/components/mobile";
import { PWAInstallPrompt, OfflineIndicator, PWAUpdatePrompt } from "@/components/pwa";
import { Loader2 } from "lucide-react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import OAuthCallback from "./pages/auth/OAuthCallback";
import Dashboard from "@/pages/Dashboard";
import EnhancedDashboard from "@/pages/EnhancedDashboard";
import ForgeDashboard from "@/pages/ForgeDashboard";
import FunctionalDashboard from "@/pages/FunctionalDashboard";
import ScrollSpecs from "@/pages/ScrollSpecs";
import Agents from "@/pages/Agents";
import ForgeSessions from "@/pages/ForgeSessions";
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
import { UserProfilePage } from "./components/community";
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
import ContentGenerationAdmin from "./pages/ContentGenerationAdmin";
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
import PaymentBilling from "./pages/PaymentBilling";
import ScrollCoinWallet from "./pages/ScrollCoinWallet";
import ScrollCoinLeaderboard from "./pages/ScrollCoinLeaderboard";
import AITutorsCatalog from "./pages/AITutorsCatalog";
import TutorSession from "./pages/TutorSession";
import AITutorInterface from "./pages/AITutorInterface";
import VirtualLabsPage from "./pages/VirtualLabsPage";
import XRClassroomsPage from "./pages/XRClassroomsPage";
import AdmissionsReview from "./pages/AdmissionsReview";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import CourseAnalyticsPage from "./pages/CourseAnalyticsPage";
import NotificationsPage from "./pages/NotificationsPage";
import NotificationSettings from "./pages/NotificationSettings";
import GenerationMonitor from "./pages/GenerationMonitor";
import InstitutionsAdmin from "./pages/InstitutionsAdmin";
import SystemStatus from "./pages/SystemStatus";
import InstitutionOnboarding from "./pages/InstitutionOnboarding";
import FacultyAnalytics from "./pages/FacultyAnalytics";
import Faculties from "./pages/Faculties";
import SuperAdmin from "./pages/SuperAdmin";
import FacultyAdmin from "./pages/FacultyAdmin";
import CommunityFeed from "./pages/CommunityFeed";
import DailyDevotion from "./pages/DailyDevotion";
import ScriptureMemory from "./pages/ScriptureMemory";
import Testimonies from "./pages/Testimonies";
import FellowshipRooms from "./pages/FellowshipRooms";
import SpiritualMentor from "./pages/SpiritualMentor";
import Messaging from "./pages/Messaging";
import RedemptionStore from "./pages/RedemptionStore";
import AssignmentUpload from "./pages/AssignmentUpload";
import DegreeAudit from "./pages/DegreeAudit";
import ScholarshipsPage from "./pages/ScholarshipsPage";
import RealTimeMessaging from "./pages/RealTimeMessaging";
import { ScrollBadgeGallery } from "./pages/ScrollBadgeGallery";
import { PublicBadgeProfile } from "./pages/PublicBadgeProfile";
import AdmissionsApplication from "./pages/AdmissionsApplication";
import ApplicationStatus from "./pages/ApplicationStatus";
import StudentProfile from "./pages/StudentProfile";
import MobileFeaturesDemo from "./pages/MobileFeaturesDemo";
import RealtimeDemo from "./pages/RealtimeDemo";
import CourseCatalog from "./pages/CourseCatalog";
import CourseDetailPage from "./pages/CourseDetailPage";
import MyCourses from "./pages/MyCourses";
import QuizTaking from "./pages/QuizTaking";

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

// Mobile viewport configuration
const MobileViewportConfig = () => {
  useEffect(() => {
    // Set viewport meta tag for mobile devices
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute(
        'content',
        'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover'
      );
    }

    // Prevent zoom on input focus (iOS)
    const style = document.createElement('style');
    style.textContent = `
      @media screen and (max-width: 768px) {
        input, textarea, select {
          font-size: 16px !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ErrorHandlingProvider>
        <AuthProvider>
          <InstitutionProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <MobileViewportConfig />
              <BrowserRouter>
                <RealtimeProvider>
                  <PWAInstallPrompt />
                  <PWAUpdatePrompt />
                  <MobileAppInstallPrompt />
                <Suspense fallback={<LoadingFallback />}>
                <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<Index />} />
            
            {/* Public Badge Profile */}
            <Route path="/badges/public/:userId" element={<PublicBadgeProfile />} />
            
            {/* Authentication Routes */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/auth/verify-email" element={<VerifyEmail />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            
            {/* Protected Routes with Main Layout */}
            <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<EnhancedDashboard />} />
              <Route path="specs" element={<ScrollSpecs />} />
              <Route path="specs/new" element={<ScrollSpecs />} />
              <Route path="specs/templates" element={<ScrollSpecs />} />
              <Route path="specs/versions" element={<ScrollSpecs />} />
              <Route path="specs/dependencies" element={<ScrollSpecs />} />
              <Route path="agents" element={<Agents />} />
              <Route path="agents/new" element={<Agents />} />
              <Route path="agents/training" element={<Agents />} />
              <Route path="agents/performance" element={<Agents />} />
              <Route path="agents/deployment" element={<Agents />} />
              <Route path="sessions" element={<ForgeSessions />} />
              <Route path="sessions/new" element={<ForgeSessions />} />
              <Route path="sessions/collab" element={<ForgeSessions />} />
              <Route path="sessions/history" element={<ForgeSessions />} />
              <Route path="workspace" element={<ForgeSessions />} />
              <Route path="activity" element={<ForgeDashboard />} />
              <Route path="status" element={<ForgeDashboard />} />
              <Route path="university/courses" element={<Dashboard />} />
              <Route path="university/faculty" element={<Dashboard />} />
              <Route path="university/students" element={<Dashboard />} />
              <Route path="university/curriculum" element={<Dashboard />} />
              <Route path="settings/api" element={<SettingsPage />} />
              <Route path="settings/integrations" element={<SettingsPage />} />
              <Route path="settings/users" element={<SettingsPage />} />
              <Route path="courses" element={<Courses />} />
              <Route path="courses/:courseId" element={<CourseDetail />} />
              <Route path="courses/:courseId/learn" element={<CourseLearn />} />
              
              {/* Admissions Routes */}
              <Route path="admissions/apply/:applicationId?" element={<AdmissionsApplication />} />
              <Route path="admissions/status/:applicationId" element={<ApplicationStatus />} />
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
              <Route path="community/users/:userId" element={<UserProfilePage />} />
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
              <Route path="admin/content-generation" element={<ContentGenerationAdmin />} />
              <Route path="admin/institutions" element={<InstitutionsAdmin />} />
              <Route path="admin/super" element={<SuperAdmin />} />
              <Route path="apply" element={<Apply />} />
              <Route path="courses-catalog" element={<CourseCatalog />} />
              <Route path="courses-detail/:courseId" element={<CourseDetailPage />} />
              <Route path="my-courses" element={<MyCourses />} />
              <Route path="quiz-taking/:quizId" element={<QuizTaking />} />
              <Route path="faculty" element={<FacultyDashboard />} />
              <Route path="faculty/admin" element={<FacultyAdmin />} />
              <Route path="faculty/gradebook/:courseId" element={<Gradebook />} />
              <Route path="admin/admissions" element={<AdmissionsReview />} />
              <Route path="alumni" element={<AlumniPortal />} />
              
              {/* Community & Social */}
              <Route path="community-feed" element={<CommunityFeed />} />
              <Route path="messaging" element={<RealTimeMessaging />} />
              <Route path="fellowship-rooms" element={<FellowshipRooms />} />
              <Route path="spiritual-mentor" element={<SpiritualMentor />} />
              
              {/* Spiritual Formation */}
              <Route path="daily-devotion" element={<DailyDevotion />} />
              <Route path="scripture-memory" element={<ScriptureMemory />} />
              <Route path="testimonies" element={<Testimonies />} />
              
              {/* Learning */}
              <Route path="assignment-upload" element={<AssignmentUpload />} />
              <Route path="degree-audit" element={<DegreeAudit />} />
              <Route path="scholarships" element={<ScholarshipsPage />} />
              
              {/* ScrollCoin Economy */}
              <Route path="redemption-store" element={<RedemptionStore />} />
            
            {/* Dynamic pages */}
            <Route path="profile" element={<ProfilePage />} />
            <Route path="profile/:userId" element={<StudentProfile />} />
            <Route path="degrees" element={<DegreePrograms />} />
            <Route path="degrees/:id" element={<DegreeProgramDetail />} />
            <Route path="xr-classrooms" element={<XRClassroomsPage />} />
            <Route path="virtual-labs" element={<VirtualLabsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="prayer-journal" element={<PrayerJournal />} />
            <Route path="events" element={<Events />} />
            <Route path="events/:id" element={<EventDetail />} />
            <Route path="billing" element={<BillingDashboard />} />
            <Route path="payment-billing" element={<PaymentBilling />} />
            <Route path="scrollcoin-wallet" element={<ScrollCoinWallet />} />
            <Route path="scrollcoin-leaderboard" element={<ScrollCoinLeaderboard />} />
            <Route path="ai-tutors-catalog" element={<AITutorsCatalog />} />
            <Route path="ai-tutor-interface" element={<AITutorInterface />} />
            <Route path="ai-tutors/:id" element={<TutorSession />} />
            <Route path="tutor-session/:id" element={<TutorSession />} />
            <Route path="admissions-review" element={<AdmissionsReview />} />
            <Route path="analytics/dashboard" element={<AnalyticsDashboard />} />
            <Route path="analytics/courses/:courseId" element={<CourseAnalyticsPage />} />
            <Route path="generation-monitor" element={<GenerationMonitor />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="notifications/settings" element={<NotificationSettings />} />
            <Route path="system-status" element={<SystemStatus />} />
            <Route path="institution-onboarding" element={<InstitutionOnboarding />} />
            <Route path="faculty-analytics" element={<FacultyAnalytics />} />
            
            {/* All other routes use coming soon pages */}
            <Route path="assessments" element={<Assessments />} />
            <Route path="divine-scorecard" element={<ComingSoonPage title="Divine Scorecard" />} />
            <Route path="prophetic-checkins" element={<ComingSoonPage title="Prophetic Check-ins" />} />
            <Route path="calling-discernment" element={<ComingSoonPage title="Calling Discernment" />} />
            <Route path="forums" element={<ComingSoonPage title="Discussion Forums" />} />
            <Route path="mentorship" element={<ComingSoonPage title="Mentorship" />} />
            <Route path="projects" element={<ComingSoonPage title="Collaborative Projects" />} />
            <Route path="marketplace" element={<ComingSoonPage title="Marketplace" />} />
            <Route path="badges" element={<ScrollBadgeGallery />} />
            <Route path="my-badges" element={<ScrollBadgeGallery />} />
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
            <Route path="mobile-demo" element={<MobileFeaturesDemo />} />
            <Route path="realtime-demo" element={<RealtimeDemo />} />
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
    </ErrorHandlingProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

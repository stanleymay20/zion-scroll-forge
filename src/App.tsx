import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./contexts/AuthContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { MainLayout } from "./components/layout/MainLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import AITutors from "./pages/AITutors";
import Community from "./pages/Community";
import ScrollCoin from "./pages/ScrollCoin";
import SpiritualFormation from "./pages/SpiritualFormation";
import Analytics from "./pages/Analytics";
import { ComingSoonPage } from "./components/layout/PageTemplate";
import NotFound from "./pages/NotFound";

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected Routes with Main Layout */}
            <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="courses" element={<Courses />} />
              <Route path="courses/:id" element={<ComingSoonPage title="Course Details" />} />
              <Route path="ai-tutors" element={<AITutors />} />
              <Route path="ai-tutors/:id" element={<ComingSoonPage title="AI Tutor Chat" />} />
              <Route path="community" element={<Community />} />
              <Route path="scrollcoin" element={<ScrollCoin />} />
              <Route path="spiritual-formation" element={<SpiritualFormation />} />
              <Route path="analytics" element={<Analytics />} />
            
            {/* All other routes use coming soon pages */}
            <Route path="degrees" element={<ComingSoonPage title="Degree Programs" />} />
            <Route path="xr-classrooms" element={<ComingSoonPage title="XR Classrooms" />} />
            <Route path="virtual-labs" element={<ComingSoonPage title="Virtual Labs" />} />
            <Route path="assessments" element={<ComingSoonPage title="Assessments" />} />
            <Route path="divine-scorecard" element={<ComingSoonPage title="Divine Scorecard" />} />
            <Route path="prophetic-checkins" element={<ComingSoonPage title="Prophetic Check-ins" />} />
            <Route path="prayer-requests" element={<ComingSoonPage title="Prayer Center" />} />
            <Route path="calling-discernment" element={<ComingSoonPage title="Calling Discernment" />} />
            <Route path="forums" element={<ComingSoonPage title="Discussion Forums" />} />
            <Route path="study-groups" element={<ComingSoonPage title="Study Groups" />} />
            <Route path="mentorship" element={<ComingSoonPage title="Mentorship" />} />
            <Route path="projects" element={<ComingSoonPage title="Collaborative Projects" />} />
            <Route path="marketplace" element={<ComingSoonPage title="Marketplace" />} />
            <Route path="badges" element={<ComingSoonPage title="ScrollBadges" />} />
            <Route path="achievements" element={<ComingSoonPage title="Achievements" />} />
            <Route path="faculties" element={<ComingSoonPage title="All Faculties" />} />
            <Route path="faculties/*" element={<ComingSoonPage title="Faculty Details" />} />
            <Route path="career-pathways" element={<ComingSoonPage title="Career Pathways" />} />
            <Route path="job-board" element={<ComingSoonPage title="Job Board" />} />
            <Route path="research" element={<ComingSoonPage title="Research Hub" />} />
            <Route path="help" element={<ComingSoonPage title="Help Center" />} />
            <Route path="profile" element={<ComingSoonPage title="My Profile" />} />
            <Route path="settings" element={<ComingSoonPage title="Settings" />} />
          </Route>
          
          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

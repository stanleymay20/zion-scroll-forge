import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import AITutors from "./pages/AITutors";
import Community from "./pages/Community";
import ScrollCoin from "./pages/ScrollCoin";
import SpiritualFormation from "./pages/SpiritualFormation";
import { ComingSoonPage } from "./components/layout/PageTemplate";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<Index />} />
          
          {/* Protected Routes with Main Layout */}
          <Route path="/" element={<MainLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="courses" element={<Courses />} />
            <Route path="courses/:id" element={<ComingSoonPage title="Course Details" />} />
            <Route path="ai-tutors" element={<AITutors />} />
            <Route path="ai-tutors/:id" element={<ComingSoonPage title="AI Tutor Chat" />} />
            <Route path="community" element={<Community />} />
            <Route path="scrollcoin" element={<ScrollCoin />} />
            <Route path="spiritual-formation" element={<SpiritualFormation />} />
            
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
  </QueryClientProvider>
);

export default App;

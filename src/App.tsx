import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import AnnouncementBar from "./components/AnnouncementBar";
import TopInfoBar from "./components/TopInfoBar";
import Header from "./components/Header";
import Footer from "./components/Footer";
import StickyMobileCTA from "./components/StickyMobileCTA";
import ScrollToTop from "./components/ScrollToTop";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ProgramsPage from "./pages/ProgramsPage";
import LocationsPage from "./pages/LocationsPage";
import AdmissionsPage from "./pages/AdmissionsPage";
import PreQualificationPage from "./pages/PreQualificationPage";
import CohortsPage from "./pages/CohortsPage";
import GalleryPage from "./pages/GalleryPage";
import ContactPage from "./pages/ContactPage";
import BlogPage from "./pages/BlogPage";
import HealthcareCareerPath from "./pages/blog/HealthcareCareerPath";
import CNATrainingExcellence from "./pages/blog/CNATrainingExcellence";
import NursingCareerFoundations from "./pages/blog/NursingCareerFoundations";
import ExamPrepPage from "./pages/ExamPrepPage";
import CareersPage from "./pages/CareersPage";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import RefundPolicyPage from "./pages/RefundPolicyPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col">
          <TopInfoBar />
          <Header />
          <AnnouncementBar />
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/programs" element={<ProgramsPage />} />
              <Route path="/programs/cohorts" element={<CohortsPage />} />
              <Route path="/programs/admissions" element={<AdmissionsPage />} />
              <Route path="/pre-qualification" element={<PreQualificationPage />} />
              <Route path="/programs/exam-prep" element={<ExamPrepPage />} />
              <Route path="/locations" element={<LocationsPage />} />
              <Route path="/careers" element={<CareersPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/healthcare-career-path" element={<HealthcareCareerPath />} />
              <Route path="/blog/cna-training-excellence" element={<CNATrainingExcellence />} />
              <Route path="/blog/nursing-career-foundations" element={<NursingCareerFoundations />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms-of-service" element={<TermsOfServicePage />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
          <StickyMobileCTA />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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
import HowToBecomeCnaCalifornia from "./pages/blog/HowToBecomeCnaCalifornia";
import FastCnaCertificationBayArea from "./pages/blog/FastCnaCertificationBayArea";
import CdphApprovedCnaSacramento from "./pages/blog/CdphApprovedCnaSacramento";
import HybridCnaClassesStockton from "./pages/blog/HybridCnaClassesStockton";
import ExamPrepPage from "./pages/ExamPrepPage";
import CareersPage from "./pages/CareersPage";
import CommunityResourcesPage from "./pages/CommunityResourcesPage";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PortalLogin from "./pages/portal/PortalLogin";
import AcceptInvite from "./pages/portal/AcceptInvite";
import StudentDashboard from "./pages/portal/StudentDashboard";
import CourseView from "./pages/portal/CourseView";
import InstructorDashboard from "./pages/portal/teach/InstructorDashboard";
import CourseEditor from "./pages/portal/teach/CourseEditor";
import QuizEditor from "./pages/portal/teach/QuizEditor";
import SubmissionsInbox from "./pages/portal/teach/SubmissionsInbox";
import AssignmentView from "./pages/portal/AssignmentView";
import QuizView from "./pages/portal/QuizView";
import Account from "./pages/portal/Account";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import RefundPolicyPage from "./pages/RefundPolicyPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppShell = () => {
  const { pathname } = useLocation();
  const isApp = pathname.startsWith("/portal") || pathname.startsWith("/admin");
  return (
    <div className="min-h-screen flex flex-col">
      {!isApp && <TopInfoBar />}
      {!isApp && <Header />}
      {!isApp && <AnnouncementBar />}
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
          <Route path="/community-resources" element={<CommunityResourcesPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/healthcare-career-path" element={<HealthcareCareerPath />} />
          <Route path="/blog/cna-training-excellence" element={<CNATrainingExcellence />} />
          <Route path="/blog/nursing-career-foundations" element={<NursingCareerFoundations />} />
          <Route path="/blog/how-to-become-cna-in-california" element={<HowToBecomeCnaCalifornia />} />
          <Route path="/blog/fast-cna-certification-bay-area" element={<FastCnaCertificationBayArea />} />
          <Route path="/blog/cdph-approved-cna-training-sacramento" element={<CdphApprovedCnaSacramento />} />
          <Route path="/blog/hybrid-cna-classes-near-stockton" element={<HybridCnaClassesStockton />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/refund-policy" element={<RefundPolicyPage />} />
          <Route path="/terms-of-service" element={<TermsOfServicePage />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/portal/login" element={<PortalLogin />} />
          <Route path="/portal/accept-invite" element={<AcceptInvite />} />
          <Route path="/portal" element={<StudentDashboard />} />
          <Route path="/portal/courses" element={<StudentDashboard />} />
          <Route path="/portal/courses/:courseId/*" element={<CourseView />} />
          <Route path="/portal/teach" element={<InstructorDashboard />} />
          <Route path="/portal/courses/:courseId/assignments/:assignmentId" element={<AssignmentView />} />
          <Route path="/portal/courses/:courseId/quizzes/:quizId" element={<QuizView />} />
          <Route path="/portal/teach/courses/:courseId" element={<CourseEditor />} />
          <Route path="/portal/teach/courses/:courseId/quizzes/:quizId" element={<QuizEditor />} />
          <Route path="/portal/teach/courses/:courseId/assignments/:assignmentId" element={<SubmissionsInbox />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      {!isApp && <Footer />}
      {!isApp && <StickyMobileCTA />}
    </div>
  );
};

const App = () => (
  <HelmetProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <AppShell />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;

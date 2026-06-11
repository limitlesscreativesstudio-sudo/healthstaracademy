import PortalLogin  from './pages/portal/teach/PortalLogin';
import AcceptInvite from './pages/portal/teach/AcceptInvite';
import CourseView   from './pages/portal/teach/CourseView';
import { AuthProvider } from './pages/portal/teach/AuthContext';
import ProtectedRoute   from './pages/portal/teach/ProtectedRoute';
import CreateAccount    from './pages/portal/teach/CreateAccount';
import ForgotPassword   from './pages/portal/teach/ForgotPassword';
import UpdatePassword   from './pages/portal/teach/UpdatePassword';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import AnnouncementBar from "./components/AnnouncementBar";
import TopInfoBar from "./components/TopInfoBar";
import Header from "./components/Header";
import Footer from "./components/Footer";
import StickyMobileCTA from "./components/StickyMobileCTA";
import ScrollToTop from "./components/ScrollToTop";
import HomePage from "./pages/portal/HomePage";
import AboutPage from "./pages/portal/AboutPage";
import ProgramsPage from "./pages/portal/ProgramsPage";
import LocationsPage from "./pages/portal/LocationsPage";
import AdmissionsPage from "./pages/portal/AdmissionsPage";
import PreQualificationPage from "./pages/portal/PreQualificationPage";
import CohortsPage from "./pages/portal/CohortsPage";
import GalleryPage from "./pages/portal/GalleryPage";
import ContactPage from "./pages/portal/ContactPage";
import BlogPage from "./pages/portal/BlogPage";
import HealthcareCareerPath from "./pages/blog/HealthcareCareerPath";
import CNATrainingExcellence from "./pages/blog/CNATrainingExcellence";
import NursingCareerFoundations from "./pages/blog/NursingCareerFoundations";
import HowToBecomeCnaCalifornia from "./pages/blog/HowToBecomeCnaCalifornia";
import FastCnaCertificationBayArea from "./pages/blog/FastCnaCertificationBayArea";
import CdphApprovedCnaSacramento from "./pages/blog/CdphApprovedCnaSacramento";
import HybridCnaClassesStockton from "./pages/blog/HybridCnaClassesStockton";
import CnaStateExamPrep22Skills from "./pages/blog/CnaStateExamPrep22Skills";
import CnaSalaryCalifornia2026 from "./pages/blog/CnaSalaryCalifornia2026";
import DayInTheLifeOfCna from "./pages/blog/DayInTheLifeOfCna";
import FinancingCnaTraining from "./pages/blog/FinancingCnaTraining";
import CnaVsHhaVsMedTech from "./pages/blog/CnaVsHhaVsMedTech";
import CnaProgramsFremontEastBay from "./pages/blog/CnaProgramsFremontEastBay";
import CnaToRnCalifornia from "./pages/blog/CnaToRnCalifornia";
import ExamPrepPage from "./pages/portal/ExamPrepPage";
import CareersPage from "./pages/portal/CareersPage";
import CommunityResourcesPage from "./pages/portal/CommunityResourcesPage";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentDashboard from "./pages/portal/teach/StudentDashboard";
// Instructor screens were moved/removed in an earlier refactor; using StudentDashboard as placeholder
const InstructorDashboard = StudentDashboard;
const CourseEditor = StudentDashboard;
const QuizEditor = StudentDashboard;
const SubmissionsInbox = StudentDashboard;
import AssignmentView from "./pages/portal/teach/AssignmentView";
import QuizView from "./pages/portal/teach/QuizView";
import Account from "./pages/portal/teach/Account";
import CareerPortal from "./pages/portal/teach/CareerPortal";
import RequiredWork from "./pages/portal/teach/RequiredWork";
import PrivacyPolicyPage from "./pages/portal/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/portal/TermsOfServicePage";
import RefundPolicyPage from "./pages/portal/RefundPolicyPage";
import NotFound from "./pages/portal/NotFound";

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
          <Route path="/blog/cna-state-exam-prep-22-skills" element={<CnaStateExamPrep22Skills />} />
          <Route path="/blog/cna-salary-california-2026" element={<CnaSalaryCalifornia2026 />} />
          <Route path="/blog/day-in-the-life-of-a-cna" element={<DayInTheLifeOfCna />} />
          <Route path="/blog/financing-cna-training-california" element={<FinancingCnaTraining />} />
          <Route path="/blog/cna-vs-hha-vs-medical-assistant" element={<CnaVsHhaVsMedTech />} />
          <Route path="/blog/cna-programs-fremont-east-bay" element={<CnaProgramsFremontEastBay />} />
          <Route path="/blog/cna-to-rn-california" element={<CnaToRnCalifornia />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/refund-policy" element={<RefundPolicyPage />} />
          <Route path="/terms-of-service" element={<TermsOfServicePage />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/portal/login" element={<Navigate to="/portal/teach/login" replace />} />                  
          <Route path="/portal/accept-invite" element={<AcceptInvite />} />
          <Route path="/portal" element={<StudentDashboard />} />
          <Route path="/portal/account" element={<Account />} />
          <Route path="/portal/career" element={<CareerPortal />} />
          <Route path="/portal/required" element={<RequiredWork />} />
          <Route path="/portal/courses" element={<StudentDashboard />} />
          <Route path="/portal/courses/:courseId/*" element={<CourseView />} />
          <Route path="/portal/courses/:courseId/assignments/:assignmentId" element={<AssignmentView />} />
          <Route path="/portal/courses/:courseId/quizzes/:quizId" element={<QuizView />} />
          <Route path="/portal/teach/login"          element={<AuthProvider><PortalLogin /></AuthProvider>} />
          <Route path="/portal/teach/reset"          element={<AuthProvider><ForgotPassword /></AuthProvider>} />
          <Route path="/portal/teach/update-password" element={<AuthProvider><UpdatePassword /></AuthProvider>} />
          <Route path="/portal/teach/invite"         element={<AuthProvider><AcceptInvite /></AuthProvider>} />
          <Route path="/portal/teach/create-account" element={<AuthProvider><CreateAccount /></AuthProvider>} />
          <Route path="/portal/teach"                element={<AuthProvider><ProtectedRoute><CourseView /></ProtectedRoute></AuthProvider>} />
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

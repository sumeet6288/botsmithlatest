import { useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Toaster as HotToaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import ChatbotBuilder from './pages/ChatbotBuilder';
import Analytics from './pages/Analytics';
import AccountSettings from './pages/AccountSettings';
import Subscription from './pages/Subscription';
import Leads from './pages/Leads';
import LeadsManagement from './pages/LeadsManagement';
import NotificationPreferences from './pages/NotificationPreferences';
import Notifications from './pages/Notifications';
import NotificationDebug from './pages/NotificationDebug';
import EmbedChat from './pages/EmbedChat';
import ChatPage from './pages/ChatPage';
import PublicChat from './pages/PublicChat';
import Pricing from './pages/Pricing';
import Enterprise from './pages/Enterprise';
import Resources from './pages/Resources';
import Documentation from './pages/resources/Documentation';
import GettingStarted from './pages/resources/GettingStarted';
import UserGuides from './pages/resources/UserGuides';
import BestPractices from './pages/resources/BestPractices';
import APIReference from './pages/resources/APIReference';
import HelpCenter from './pages/resources/HelpCenter';
import Community from './pages/resources/Community';
import QuickStartGuide from './pages/resources/articles/QuickStartGuide';
import Installation from './pages/resources/articles/Installation';
import YourFirstChatbot from './pages/resources/articles/YourFirstChatbot';
import AddingKnowledgeBase from './pages/resources/articles/AddingKnowledgeBase';
import CustomizationOptions from './pages/resources/articles/CustomizationOptions';
import AnalyticsInsights from './pages/resources/articles/AnalyticsInsights';
import SharingDeployment from './pages/resources/articles/SharingDeployment';
import ChatbotManagement from './pages/resources/articles/ChatbotManagement';
import AccountSettingsGuide from './pages/resources/articles/AccountSettingsGuide';
import SecurityOverview from './pages/resources/articles/SecurityOverview';
import SecurityDocs from './pages/resources/articles/SecurityDocs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CookiePolicy from './pages/CookiePolicy';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/admin/AdminDashboard';
import DirectLogin from './pages/DirectLogin';
import SupabaseCallback from './pages/SupabaseCallback';
import { Toaster } from './components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';
import SubscriptionExpiredModal from './components/SubscriptionExpiredModal';
import useSubscriptionCheck from './hooks/useSubscriptionCheck';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Redirect to signin if not authenticated
  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }
  
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Redirect to signin if not authenticated
  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }
  
  // Redirect to dashboard if not admin
  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Smooth scroll to top on route change
function ScrollToTop() {
  const location = useLocation();
  
  useEffect(() => {
    // Smooth scroll to top with animation
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [location.pathname]);
  
  return null;
}

// Detect auth routes and apply scoped class to fix white space
function AuthRouteDetector() {
  const location = useLocation();
  
  useEffect(() => {
    const authRoutes = ['/signin', '/signup'];
    const isAuthRoute = authRoutes.includes(location.pathname);
    
    // Get the root element
    const rootElement = document.getElementById('root');
    
    if (rootElement) {
      if (isAuthRoute) {
        // Add auth-route class for scoped CSS fixes
        rootElement.classList.add('auth-route');
      } else {
        // Remove auth-route class for all other pages
        rootElement.classList.remove('auth-route');
      }
    }
  }, [location.pathname]);
  
  return null;
}

function AppContent() {
  const { user } = useAuth();
  
  // Use subscription check hook - only when user is authenticated
  const {
    subscriptionStatus,
    currentPlan,
    showExpirationModal,
    handleModalClose,
    handleRenewed
  } = useSubscriptionCheck();
  
  return (
    <div className="App">
      <BrowserRouter>
        <AuthRouteDetector />
        <ScrollToTop />
        <NotificationProvider user={user}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/enterprise" element={<Enterprise />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/resources/documentation" element={<Documentation />} />
            <Route path="/resources/getting-started" element={<GettingStarted />} />
            <Route path="/resources/user-guides" element={<UserGuides />} />
            <Route path="/resources/best-practices" element={<BestPractices />} />
            <Route path="/resources/articles/quick-start-guide" element={<QuickStartGuide />} />
            <Route path="/resources/articles/installation" element={<Installation />} />
            <Route path="/resources/articles/your-first-chatbot" element={<YourFirstChatbot />} />
            <Route path="/resources/articles/adding-knowledge-base" element={<AddingKnowledgeBase />} />
            <Route path="/resources/articles/customization-options" element={<CustomizationOptions />} />
            <Route path="/resources/articles/analytics-insights" element={<AnalyticsInsights />} />
            <Route path="/resources/articles/sharing-deployment" element={<SharingDeployment />} />
            <Route path="/resources/articles/chatbot-management" element={<ChatbotManagement />} />
            <Route path="/resources/articles/account-settings-guide" element={<AccountSettingsGuide />} />
            <Route path="/resources/articles/security-overview" element={<SecurityOverview />} />
            <Route path="/resources/articles/security-docs" element={<SecurityDocs />} />
            <Route path="/resources/api-reference" element={<APIReference />} />
            <Route path="/resources/help-center" element={<HelpCenter />} />
            <Route path="/resources/community" element={<Community />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth/callback" element={<SupabaseCallback />} />
            <Route path="/direct-login" element={<DirectLogin />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/leads" element={<LeadsManagement />} />
            <Route path="/account-settings" element={<AccountSettings />} />
            <Route path="/notification-preferences" element={<NotificationPreferences />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/notification-debug" element={<NotificationDebug />} />
            <Route path="/chatbot/:id" element={<ChatbotBuilder />} />
            <Route path="/embed/:id" element={<EmbedChat />} />
            <Route path="/chat/:id" element={<ChatPage />} />
            <Route path="/public-chat/:chatbotId" element={<PublicChat />} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </NotificationProvider>
      </BrowserRouter>
      <Toaster />
      <SonnerToaster position="top-right" richColors />
      <HotToaster position="top-right" />
      
      {/* Subscription Expiration Modal */}
      {user && (
        <SubscriptionExpiredModal
          isOpen={showExpirationModal}
          onClose={handleModalClose}
          subscriptionStatus={subscriptionStatus}
          currentPlan={currentPlan}
          onRenewed={handleRenewed}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

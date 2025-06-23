import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { SettingsProvider } from './contexts/SettingsContext';
import PrivateRoute from './components/auth/PrivateRoute';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CookieConsent from './components/ui/CookieConsent';
import GoogleAnalytics from './components/analytics/GoogleAnalytics';
import FunctionalityCookies from './components/analytics/FunctionalityCookies';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import AppointmentsPage from './pages/AppointmentsPage';
import CalendarsPage from './pages/CalendarsPage';
import SpecialtiesPage from './pages/SpecialtiesPage';
import ProfessionalsPage from './pages/ProfessionalsPage';
import ClientsPage from './pages/ClientsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import ApiDocsPage from './pages/ApiDocsPage';
import BookingPage from './pages/BookingPage';
import SharedBookingPage from './pages/SharedBookingPage';
import PricingPage from './pages/PricingPage';
import NotFoundPage from './pages/NotFoundPage';
import ChatPage from './pages/ChatPage';
import AITrainingPage from './pages/AITrainingPage';
import AssistantSettingsPage from './pages/AssistantSettingsPage';
import WhatsAppConnect from './pages/WhatsAppConnect';
import SharedBookingEmbedPage from './pages/SharedBookingEmbedPage';
import Integracoes from './pages/IntegrationsPage';
import SubscriptionPage from './pages/SubscriptionPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import CookiePolicyPage from './pages/CookiePolicyPage';
import DashboardLayout from './components/layout/DashboardLayout';
import TasksPage from './pages/TasksPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentCancelledPage from './pages/PaymentCancelledPage';

function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <SettingsProvider>
            <Routes>
              {/* Public Routes */}
              <Route
                path="/"
                element={
                  <>
                    <Navbar />
                    <LandingPage />
                    <Footer />
                  </>
                }
              />
              <Route
                path="/login"
                element={
                  <>
                    <Navbar />
                    <LoginPage />
                    <Footer />
                  </>
                }
              />
              <Route
                path="/register"
                element={
                  <>
                    <Navbar />
                    <RegisterPage />
                    <Footer />
                  </>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <>
                    <Navbar />
                    <ForgotPasswordPage />
                    <Footer />
                  </>
                }
              />
              <Route
                path="/reset-password"
                element={
                  <>
                    <Navbar />
                    <ResetPasswordPage />
                    <Footer />
                  </>
                }
              />
              <Route
                path="/pricing"
                element={
                  <>
                    <Navbar />
                    <PricingPage />
                    <Footer />
                  </>
                }
              />
              <Route
                path="/terms"
                element={
                  <>
                    <Navbar />
                    <TermsOfServicePage />
                    <Footer />
                  </>
                }
              />
              <Route
                path="/privacy"
                element={
                  <>
                    <Navbar />
                    <PrivacyPolicyPage />
                    <Footer />
                  </>
                }
              />
              <Route
                path="/cookies"
                element={
                  <>
                    <Navbar />
                    <CookiePolicyPage />
                    <Footer />
                  </>
                }
              />
              <Route
                path="/booking/:calendarId"
                element={<SharedBookingPage />}
              />

              <Route
                path="/c/:calendarId"
                element={<SharedBookingPage />}
              />

              <Route
                path="/booking/embed/:id"
                element={<SharedBookingEmbedPage />}
              />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <DashboardPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/appointments"
                element={
                  <PrivateRoute>
                    <AppointmentsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/calendars"
                element={
                  <PrivateRoute>
                    <CalendarsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/specialties"
                element={
                  <PrivateRoute>
                    <SpecialtiesPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/professionals"
                element={
                  <PrivateRoute>
                    <ProfessionalsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/clients"
                element={
                  <PrivateRoute>
                    <ClientsPage />
                  </PrivateRoute>
                }
              />
              {/*
              <Route
                path="/assistant"
                element={
                  <PrivateRoute>
                    <AssistantSettingsPage />
                  </PrivateRoute>
                }
              />
              */}
              <Route
                path="/chat"
                element={
                  <PrivateRoute>
                    <ChatPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/ai-training"
                element={
                  <PrivateRoute>
                    <AITrainingPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <PrivateRoute>
                    <AnalyticsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/integrations"
                element={
                  <PrivateRoute>
                    <Integracoes />
                  </PrivateRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <PrivateRoute>
                    <SettingsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/conectar-whatsapp"
                element={
                  <PrivateRoute>
                    <WhatsAppConnect />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/api-docs"
                element={
                  <PrivateRoute>
                    <ApiDocsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/subscription"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <SubscriptionPage />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/payment/success"
                element={
                  <PrivateRoute>
                    <PaymentSuccessPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/payment/cancelled"
                element={
                  <PrivateRoute>
                    <PaymentCancelledPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/tasks"
                element={
                  <PrivateRoute>
                    <TasksPage />
                  </PrivateRoute>
                }
              />

              {/* 404 Page */}
              <Route
                path="*"
                element={
                  <>
                    <Navbar />
                    <NotFoundPage />
                    <Footer />
                  </>
                }
              />
            </Routes>
            
            {/* Cookie Consent Banner - aparece em todas as páginas */}
            <CookieConsent />
            
            {/* Google Analytics - respeita as preferências de cookies */}
            <GoogleAnalytics />
            
            {/* Cookies de Funcionalidade - respeita as preferências de cookies */}
            <FunctionalityCookies />
          </SettingsProvider>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;
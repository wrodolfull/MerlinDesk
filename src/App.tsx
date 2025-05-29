import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { SettingsProvider } from './contexts/SettingsContext';
import PrivateRoute from './components/auth/PrivateRoute';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
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
                path="/booking/:calendarId"
                element={<SharedBookingPage />}
              />

              <Route
                path="/c/:calendarId"
                element={<SharedBookingPage />}
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
              <Route
                path="/assistant"
                element={
                  <PrivateRoute>
                    <AssistantSettingsPage />
                  </PrivateRoute>
                }
              />
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
                path="/settings"
                element={
                  <PrivateRoute>
                    <SettingsPage />
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
          </SettingsProvider>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;
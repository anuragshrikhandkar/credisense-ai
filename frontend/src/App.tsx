import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import { I18nProvider } from './i18n';
import { ThemeProvider } from './hooks/useTheme';
import { Navbar } from './components/layout/Navbar';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Pages
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { Chat } from './pages/Chat';
import { KfsPage } from './pages/KfsPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { StatusPage } from './pages/StatusPage';
import { FinishWizardPage } from './pages/FinishWizardPage';
import { Dashboard } from './pages/Dashboard';
import { CalculatorPage } from './pages/CalculatorPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-surface-warm dark:bg-surface-dark text-ink-950 dark:text-ink-50 transition-colors flex flex-col relative selection:bg-crimson-100 selection:text-crimson-800">
              {/* Ambient Glowing Blobs */}
              <div className="ambient-glow">
                <div className="ambient-blob-1" />
                <div className="ambient-blob-2" />
              </div>

              {/* Top Navigation */}
              <Navbar />

              {/* Content Routes */}
              <main className="flex-1 relative z-10">
                <Routes>
                  {/* Public Auth Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />

                  {/* Protected Core App Routes */}
                  <Route
                    path="/chat"
                    element={
                      <ProtectedRoute>
                        <Chat />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/application/:id/kfs"
                    element={
                      <ProtectedRoute>
                        <KfsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/application/:id/documents"
                    element={
                      <ProtectedRoute>
                        <DocumentsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/application/:id/status"
                    element={
                      <ProtectedRoute>
                        <StatusPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/application/:id/finish"
                    element={
                      <ProtectedRoute>
                        <FinishWizardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/calculator"
                    element={
                      <ProtectedRoute>
                        <CalculatorPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <SettingsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Root Redirection */}
                  <Route path="/" element={<Navigate to="/chat" replace />} />
                  <Route path="*" element={<Navigate to="/chat" replace />} />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

export default App;

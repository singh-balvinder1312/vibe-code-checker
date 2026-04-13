import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/common/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ScanPage from './pages/ScanPage';
import HistoryPage from './pages/HistoryPage';
import { useAuth } from './context/AuthContext';

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
      <>
        {isAuthenticated && <Navbar />}
        <Routes>
          <Route
              path="/login"
              element={isAuthenticated
                  ? <Navigate to="/dashboard" />
                  : <LoginPage />}
          />
          <Route
              path="/register"
              element={isAuthenticated
                  ? <Navigate to="/dashboard" />
                  : <RegisterPage />}
          />
          <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
          />
          <Route
              path="/scan"
              element={
                <ProtectedRoute>
                  <ScanPage />
                </ProtectedRoute>
              }
          />
          <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <HistoryPage />
                </ProtectedRoute>
              }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </>
  );
};

const App: React.FC = () => {
  return (
      <BrowserRouter>
        <AuthProvider>
            <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                background: '#0a0a0f',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}>
            <AppRoutes />
            <ToastContainer
                position="top-right"
                autoClose={3000}
                theme="dark"
                toastStyle={{
                  background: '#1a1a2e',
                  border: '1px solid rgba(108,99,255,0.3)',
                  color: 'white',
                }}
            />
          </div>
        </AuthProvider>
      </BrowserRouter>
  );
};

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AdminProvider } from './contexts/AdminContext';
import AppContent from './components/AppContent';
import AuthScreen from './components/AuthScreen';
import EventsPage from './components/events/EventsPage';
import AdminDashboard from './components/admin/AdminDashboard';
import { useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';

function AppWrapper() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/admin/*" element={user ? <AdminDashboard /> : <AuthScreen />} />
      <Route
        path="*"
        element={
          <div className="min-h-screen">
            <Header />
            <main>
              <Routes>
                <Route path="/events" element={<EventsPage />} />
                <Route path="/" element={<AppContent />} />
                <Route path="/auth" element={<AuthScreen />} />
              </Routes>
            </main>
            <Footer />
          </div>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AdminProvider>
          <AppWrapper />
        </AdminProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
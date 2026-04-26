import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import CompanyDashboard from './pages/company/Dashboard';
import TokenManagement from './pages/company/TokenManagement';
import SearchCompanies from './pages/user/Search';
import CompanyDetails from './pages/user/CompanyDetails';
import TokenStatus from './pages/user/TokenStatus';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, loading } = useAuth();

  const ProtectedRoute = ({ children }) => {
    if (loading) return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-primary"></div>
      </div>
    );
    if (!user) return <Navigate to="/login" />;
    return children;
  };

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          
          {/* Company Routes */}
          <Route path="/company" element={<ProtectedRoute><CompanyDashboard /></ProtectedRoute>} />
          <Route path="/company/:id" element={<ProtectedRoute><TokenManagement /></ProtectedRoute>} />
          
          {/* User Routes */}
          <Route path="/search" element={<ProtectedRoute><SearchCompanies /></ProtectedRoute>} />
          <Route path="/search/:id" element={<ProtectedRoute><CompanyDetails /></ProtectedRoute>} />
          <Route path="/my-token" element={<ProtectedRoute><TokenStatus /></ProtectedRoute>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

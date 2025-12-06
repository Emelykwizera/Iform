import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppStore } from './store/AppContext';
import { Layout } from './components/Layout';
import { UserRole } from './types';
import Dashboard from './pages/Dashboard';
import CreateForm from './pages/CreateForm';
import SubmitForm from './pages/SubmitForm';
import Analytics from './pages/Analytics';
import DataView from './pages/DataView';
import Login from './pages/Login';
import SuperAdmin from './pages/SuperAdmin';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactElement, allowedRoles?: UserRole[] }) => {
  const { currentUser } = useAppStore();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Wrapper component to access useAppStore hook inside Router context
const AppRoutes = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/submit/:formId" element={<SubmitForm />} />
        
        {/* Super Admin Routes */}
        <Route path="/" element={
           <ProtectedRoute>
             <RoleBasedHome />
           </ProtectedRoute>
        } />

        {/* Inst/Dept Admin Routes */}
        <Route path="/create" element={<ProtectedRoute allowedRoles={[UserRole.INSTITUTION_ADMIN, UserRole.DEPT_ADMIN]}><CreateForm /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/analytics/:formId" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/data" element={<ProtectedRoute><DataView /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute allowedRoles={[UserRole.INSTITUTION_ADMIN]}><Settings /></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

const RoleBasedHome = () => {
  const { currentUser } = useAppStore();
  if (currentUser?.role === UserRole.SUPER_ADMIN) {
    return <SuperAdmin />;
  }
  return <Dashboard />;
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
};

export default App;
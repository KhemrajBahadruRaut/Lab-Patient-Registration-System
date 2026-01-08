import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PatientRegister from "./pages/PatientRegister";
import EditPatient from "./pages/EditPatient";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import OPDRegistration from "./pages/OPDRegistration";
import FollowUp from "./pages/FollowUp";
import Layout from "./components/Layout/Layout";
import ErrorBoundary from "./components/ErrorBoundary";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return <Layout>{children}</Layout>;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user || user.role !== 'Super Admin') return <Navigate to="/" />;
  
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/super-admin" 
              element={
                <AdminRoute>
                  <SuperAdminDashboard />
                </AdminRoute>
              } 
            />
            <Route 
              path="/patient/register" 
              element={
                <ProtectedRoute>
                  <PatientRegister />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/patient/edit" 
              element={
                <ProtectedRoute>
                  <EditPatient />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/opd" 
              element={
                <ProtectedRoute>
                  <OPDRegistration />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/followup" 
              element={
                <ProtectedRoute>
                  <FollowUp />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;

import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ApiProvider } from './contexts/ApiContext'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import LabSettings from './pages/admin/LabSettings'
import TestGroups from './pages/admin/TestGroups'
import DoctorManagement from './pages/admin/DoctorManagement'
import CreateBill from './pages/billing/CreateBill'
import BillsList from './pages/billing/BillsList'
import BillDetails from './pages/billing/BillDetails'
import EditBill from './pages/billing/EditBill';
import AboutUs from './pages/AboutUs'
import ReportDetails from './pages/ReportDetails';
import AdminPanel from './pages/AdminPanel';
import useFavicon from './hooks/useFavicon'

// Component to handle favicon inside ApiProvider context
function FaviconHandler() {
  useFavicon();
  return null;
}

function App() {
  return (
    <AuthProvider>
      <ApiProvider>
        <FaviconHandler />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminPanel />} />
          
          {/* Protected Routes */}
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin/lab-settings" element={<LabSettings />} />
                  <Route path="/admin/test-groups" element={<TestGroups />} />
                  <Route path="/admin/doctors" element={<DoctorManagement />} />
                  
                  {/* Billing Routes */}
                  <Route path="/billing/create" element={<CreateBill />} />
                  <Route path="/billing/list" element={<BillsList />} />
                  <Route path="/billing/:id" element={<BillDetails />} />
                  <Route path="/billing/edit/:id" element={<EditBill />} />
                  
                  {/* Other Pages */}
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/reports/bill/:billId" element={<ReportDetails />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </ApiProvider>
    </AuthProvider>
  )
}

export default App 
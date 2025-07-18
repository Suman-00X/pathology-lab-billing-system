import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ApiProvider } from './contexts/ApiContext'
import Layout from './components/Layout'
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
import useFavicon from './hooks/useFavicon'

// Component to handle favicon inside ApiProvider context
function FaviconHandler() {
  useFavicon();
  return null;
}

function App() {
  return (
    <ApiProvider>
      <FaviconHandler />
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
    </ApiProvider>
  )
}

export default App 
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Login from './pages/Login'
import Signup from './pages/Signup'

// Layout
import DashboardLayout from './layouts/DashboardLayout'

// Dashboards
import DonorDashboard from './pages/dashboard/Donor/DonorDashboard'
import HospitalDashboard from './pages/dashboard/Hospital/HospitalDashboard'
import AdminDashboard from './pages/dashboard/Admin/AdminDashboard'
import BloodBankDashboard from './pages/dashboard/BloodBank/BloodBankDashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Dashboard (shared layout) */}
        <Route path="/dashboard" element={<DashboardLayout />}>

          <Route path="donor" element={<DonorDashboard />} />
          <Route path="hospital" element={<HospitalDashboard />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="bloodbank" element={<BloodBankDashboard />} />

        </Route>

      </Routes>
    </BrowserRouter>
  )
}

export default App
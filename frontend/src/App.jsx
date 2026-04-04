import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ProtectedRoute from "./routes/ProtectedRoutes";
import DonorSetup from "./pages/setup/DonorSetup";
import HospitalSetup from "./pages/setup/HospitalSetup";
import BloodBankSetup from "./pages/setup/BloodBankSetup";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardRouter from "./pages/dashboard/DashboardRouter";
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>

            <Route path="/dashboard" element={<DashboardRouter />} />

            {/* future routes */}
            <Route path="/dashboard/profile" element={<h1>Profile</h1>} />
            <Route path="/dashboard/history" element={<h1>History</h1>} />

          </Route>
          <Route path="/setup/donor" element={<DonorSetup />} />
          <Route path="/setup/hospital" element={<HospitalSetup />} />
          <Route path="/setup/bloodbank" element={<BloodBankSetup />} />
          <Route path="/dashboard" element={<DashboardRouter />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
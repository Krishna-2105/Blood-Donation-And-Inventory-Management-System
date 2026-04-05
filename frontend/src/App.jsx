import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ProtectedRoute from "./routes/ProtectedRoutes";
import DonorSetup from "./pages/setup/DonorSetup";
import HospitalSetup from "./pages/setup/HospitalSetup";
import BloodBankSetup from "./pages/setup/BloodBankSetup";
<<<<<<< HEAD
=======
import DashboardLayout from "./pages/Layouts/DashboardLayout";
import DashboardRouter from "./pages/dashboard/DashboardRouter";
>>>>>>> main
function App() {
  return (
    <BrowserRouter>
      <Routes>
<<<<<<< HEAD
        
=======

>>>>>>> main
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected */}
<<<<<<< HEAD
       <Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<h1>Dashboard</h1>} />
  <Route path="/setup/donor" element={<DonorSetup />} />
  <Route path="/setup/hospital" element={<HospitalSetup />} />
  <Route path="/setup/bloodbank" element={<BloodBankSetup />} />
</Route>
=======
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
>>>>>>> main

      </Routes>
    </BrowserRouter>
  );
}

export default App;
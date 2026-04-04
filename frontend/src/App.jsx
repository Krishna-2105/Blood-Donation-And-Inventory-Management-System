import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ProtectedRoute from "./routes/ProtectedRoutes";
import DonorSetup from "./pages/setup/DonorSetup";
import HospitalSetup from "./pages/setup/HospitalSetup";
import BloodBankSetup from "./pages/setup/BloodBankSetup";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected */}
       <Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<h1>Dashboard</h1>} />
  <Route path="/setup/donor" element={<DonorSetup />} />
  <Route path="/setup/hospital" element={<HospitalSetup />} />
  <Route path="/setup/bloodbank" element={<BloodBankSetup />} />
</Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
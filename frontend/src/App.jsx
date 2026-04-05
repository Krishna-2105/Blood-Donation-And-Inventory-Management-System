import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

import ProtectedRoute from "./routes/ProtectedRoutes";
import DashboardLayout from "./pages/Layouts/DashboardLayout";
import DashboardRouter from "./pages/dashboard/DashboardRouter";
import RoleProtectedRoute from "./routes/RoleProtectedRoute";

// setup
import DonorSetup from "./pages/setup/DonorSetup";
import HospitalSetup from "./pages/setup/HospitalSetup";
import BloodBankSetup from "./pages/setup/BloodBankSetup";

// donor pages
import DonorHome from "./pages/dashboard/donor/DonorHome";
import DonorProfile from "./pages/dashboard/donor/DonorProfile";
import DonorHistory from "./pages/dashboard/donor/DonorHistory";

//Blood Bank
import BloodBankHome from "./pages/dashboard/bloodbank/BloodBankHome";
import BloodInventory from "./pages/dashboard/bloodbank/BloodInventory";
import Requests from "./pages/dashboard/bloodbank/Requests";
import Donations from "./pages/dashboard/bloodbank/Donations";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<ProtectedRoute />}>

          <Route element={<ProtectedRoute />}>

            {/* SETUP ROUTES */}
            <Route path="/setup/donor" element={<DonorSetup />} />
            <Route path="/setup/hospital" element={<HospitalSetup />} />
            <Route path="/setup/bloodbank" element={<BloodBankSetup />} />

            {/* DASHBOARD LAYOUT */}
            <Route element={<DashboardLayout />}>

              {/* MAIN ENTRY */}
              <Route path="/dashboard" element={<DashboardRouter />} />

              {/* 🧑 DONOR ROUTES */}
              <Route element={<RoleProtectedRoute allowedRoles={["donor"]} />}>
                <Route path="/dashboard/profile" element={<DonorProfile />} />
                <Route path="/dashboard/history" element={<DonorHistory />} />
              </Route>

              {/* 🏥 HOSPITAL (NO BANK) */}
              <Route
                element={
                  <RoleProtectedRoute
                    allowedRoles={["hospital"]}
                    requireBank={false}
                  />
                }
              >
                {/* <Route path="/dashboard/request" element={<RequestBlood />} /> */}
                {/* <Route path="/dashboard/my-requests" element={<HospitalRequests />} /> */}
              </Route>

              {/* 🩸 BLOOD BANK (or hospital WITH bank) */}
              <Route
                element={
                  <RoleProtectedRoute
                    allowedRoles={["blood_bank", "hospital"]}
                    requireBank={true}
                  />
                }
              >
                <Route path="/dashboard/inventory" element={<BloodInventory />} />
                <Route path="/dashboard/requests" element={<Requests />} />
                <Route path="/dashboard/donations" element={<Donations />} />
              </Route>

            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
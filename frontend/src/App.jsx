import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
// ForgotPassword component removed; import kept commented for reuse
// import ForgotPassword from "./pages/auth/ForgotPassword";
// ResetPassword component removed; import kept commented for reuse
// import ResetPassword from "./pages/auth/ResetPassword";

import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./pages/Layouts/DashboardLayout";
import DashboardRouter from "./pages/dashboard/DashboardRouter";
import RoleProtectedRoute from "./routes/RoleProtectedRoute";
import { useAuth } from "./context/AuthContext";

// setup
import DonorSetup from "./pages/setup/DonorSetup";
import HospitalSetup from "./pages/setup/HospitalSetup";
import BloodBankSetup from "./pages/setup/BloodBankSetup";

// donor
import DonorProfile from "./pages/dashboard/donor/DonorProfile";
import DonorHistory from "./pages/dashboard/donor/DonorHistory";
import BookAppointment from "./pages/dashboard/donor/BookAppointment";
import DonorAppointments from "./pages/dashboard/donor/DonorAppointments";

// hospital
import HospitalRequest from "./pages/dashboard/hospital/HospitalRequest";
import HospitalRequests from "./pages/dashboard/hospital/HospitalRequests";
import FindBloodBanks from "./pages/dashboard/hospital/FindBloodBanks";
import HospitalOwnBank from "./pages/dashboard/hospital/HospitalOwnBank";

// blood bank
import BloodInventory from "./pages/dashboard/bloodbank/BloodInventory";
import Requests from "./pages/dashboard/bloodbank/Requests";
import Donations from "./pages/dashboard/bloodbank/Donations";
import AddDonation from "./pages/dashboard/bloodbank/AddDonation";
import OwnedBankInventory from "./pages/dashboard/bloodbank/OwnedBankInventory";
import BankAppointments from "./pages/dashboard/bloodbank/BankAppointments";
import UserProfile from "./pages/dashboard/UserProfile";
import AdminDashboard from "./pages/dashboard/admin/AdminDashboard";
import AdminUsers from "./pages/dashboard/admin/AdminUsers";
import AdminDonations from "./pages/dashboard/admin/AdminDonations";
import AdminRequests from "./pages/dashboard/admin/AdminRequests";
import AdminStock from "./pages/dashboard/admin/AdminStock";
import AdminIssued from "./pages/dashboard/admin/AdminIssued";
import AdminAuditLogs from "./pages/dashboard/admin/AdminAuditLogs";
import AdminProfile from "./pages/dashboard/admin/AdminProfile";
import AdminAppointments from "./pages/dashboard/admin/AdminAppointments";
import Notifications from "./pages/dashboard/Notifications";
import Landing from "./pages/Landing";
import NearbyBanks from "./pages/public/NearbyBanks";

function App() {
  const RootRedirect = () => {
    const { token } = useAuth();
    if (token) return <Navigate to="/dashboard" replace />;
    return <Navigate to="/login" replace />;
  };

  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Landing />} />

        <Route path="/home" element={<RootRedirect />} />

        {/* 🔓 PUBLIC */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* Forgot/reset-password pages removed (commented out) */}
        {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
        {/* <Route path="/reset-password" element={<ResetPassword />} /> */}

        {/* 🔐 PROTECTED */}
        <Route element={<ProtectedRoute />}>

          {/* ⚙️ SETUP */}
          <Route path="/setup/donor" element={<DonorSetup />} />
          <Route path="/setup/hospital" element={<HospitalSetup />} />
          <Route path="/setup/bloodbank" element={<BloodBankSetup />} />

            {/* 🧭 DASHBOARD LAYOUT */}
            <Route element={<DashboardLayout />}>

              {/* 🏠 MAIN ENTRY (ALL USERS) */}
              <Route path="/dashboard" element={<DashboardRouter />} />

              {/* ✅ PROFILE (ALL USERS) */}
              <Route path="/dashboard/profile" element={<UserProfile />} />

              {/* 🔔 NOTIFICATIONS (ALL USERS) */}
              <Route path="/dashboard/notifications" element={<Notifications />} />

            {/* 🛡️ ADMIN */}
              <Route element={<RoleProtectedRoute allowedRoles={["admin"]} />}>
                <Route path="/dashboard/admin" element={<AdminDashboard />} />
                <Route path="/dashboard/admin/profile" element={<AdminProfile />} />
                <Route path="/dashboard/admin/users" element={<AdminUsers />} />
                <Route path="/dashboard/admin/donations" element={<AdminDonations />} />
                <Route path="/dashboard/admin/requests" element={<AdminRequests />} />
                <Route path="/dashboard/admin/stock" element={<AdminStock />} />
                <Route path="/dashboard/admin/issued" element={<AdminIssued />} />
                <Route path="/dashboard/admin/audit-logs" element={<AdminAuditLogs />} />
                <Route path="/dashboard/admin/appointments" element={<AdminAppointments />} />
              </Route>

            {/* 🧑 DONOR */}
              <Route element={<RoleProtectedRoute allowedRoles={["donor"]} />}>
              <Route path="/dashboard/history" element={<DonorHistory />} />
              <Route path="/dashboard/book-appointment" element={<BookAppointment />} />
              <Route path="/dashboard/my-appointments" element={<DonorAppointments />} />
              </Route>

            {/* 🏥 HOSPITAL */}
            <Route element={<RoleProtectedRoute allowedRoles={["hospital"]} />}>
              <Route path="/dashboard/request" element={<HospitalRequest />} />
              <Route path="/dashboard/my-requests" element={<HospitalRequests />} />
              <Route path="/dashboard/find-banks" element={<FindBloodBanks />} />
            </Route>

            {/* 🩸 BLOOD BANK */}
              <Route
                element={
                  <RoleProtectedRoute
                    allowedRoles={["blood_bank"]}
                    requireBank={true}
                  />
                }
              >
                <Route path="/dashboard/inventory" element={<BloodInventory />} />
                <Route path="/dashboard/requests" element={<Requests />} />
                <Route path="/dashboard/donations" element={<Donations />} />
                <Route path="/dashboard/add-donation" element={<AddDonation />} />
                <Route path="/dashboard/appointments" element={<BankAppointments />} />
              </Route>

            {/* 🏥 HOSPITAL WITH OWNED BANK */}
            <Route element={<RoleProtectedRoute allowedRoles={["hospital"]} requireBank={true} />}>
              <Route path="/dashboard/bank/inventory" element={<OwnedBankInventory />} />
              <Route path="/dashboard/bank/use" element={<HospitalOwnBank />} />
            </Route>

          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<RootRedirect />} />
        {/* Public Nearby Banks */}
        <Route path="/nearby-banks" element={<NearbyBanks />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

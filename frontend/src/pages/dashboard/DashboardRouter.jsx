import { useAuth } from "../../context/AuthContext";

import DonorHome from "./donor/DonorHome";
import BloodBankHome from "./bloodbank/BloodBankHome";
import HospitalHome from "./hospital/HospitalHome";

function DashboardRouter() {
  const { role, hasBloodBank } = useAuth();

  // 🧑 DONOR
  if (role === "donor") {
    return <DonorHome />;
  }

  // 🏥 HOSPITAL WITHOUT BANK
  if (role === "hospital" && !hasBloodBank) {
    return <HospitalHome />;
  }

  // 🏥 HOSPITAL WITH BANK (acts like blood bank)
  if (role === "hospital" && hasBloodBank) {
    return <BloodBankHome />;
  }

  // 🩸 BLOOD BANK
  if (role === "blood_bank") {
    return <BloodBankHome />;
  }

  return <p>Unauthorized</p>;
}

export default DashboardRouter;
import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [hasBloodBank, setHasBloodBank] = useState(
    localStorage.getItem("hasBloodBank") === "true"
  );
  const login = (token, role, hasBloodBank) => {
    setToken(token);
    setRole(role);
    setHasBloodBank(hasBloodBank);

    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("hasBloodBank", hasBloodBank);
  };

  const logout = () => {
    setToken(null);
    setRole(null);

    localStorage.removeItem("token");
    localStorage.removeItem("role");
  };

  return (
    <AuthContext.Provider value={{ token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ✅ THIS LINE IS THE FIX
export const useAuth = () => useContext(AuthContext);
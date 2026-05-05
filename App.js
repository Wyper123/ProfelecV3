import { useState } from "react";
import Login from "./pages/Login";
import AdminLayout from "./pages/admin/AdminLayout";
import StaffLayout from "./pages/staff/StaffLayout";
import PatientLayout from "./pages/patient/PatientLayout";
import { ModalProvider } from "./components/ModalContext";
import "./styles/global.css";

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = ({ role, email, name }) => {
    setUser({
      name: name || (email ? email.split("@")[0] : role + " User"),
      role,
      initials: role.slice(0, 2).toUpperCase(),
      email,
    });
  };

  const handleLogout = () => setUser(null);

  return (
    <ModalProvider>
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : user.role === "Patient" ? (
        <PatientLayout user={user} onLogout={handleLogout} />
      ) : user.role === "Doctor" ? (
        <StaffLayout user={user} onLogout={handleLogout} />
      ) : (
        <AdminLayout user={user} onLogout={handleLogout} />
      )}
    </ModalProvider>
  );
}

export default App;
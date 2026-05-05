import { useState, useEffect } from "react";
import AppShell from "../../components/AppShell";
import AdminDashboard from "./AdminDashboard";
import { AdminAppointments, AdminDoctors, AdminSchedule, AdminPatients, AdminReports, AdminSettings } from "./AdminPages";
import { getPendingAppointments } from "../../data/storage";

function AdminLayout({ user, onLogout }) {
  const [page, setPage] = useState("dashboard");
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const pending = getPendingAppointments();
    setPendingCount(pending.length);
  }, [page]); // refresh count on page change

  const NAV = [
    { label: "Main", items: [
      { id: "dashboard",    icon: "⊞",   label: "Dashboard" },
      { id: "appointments", icon: "📅",  label: "Appointments", badge: pendingCount || undefined },
      { id: "doctors",      icon: "👨‍⚕️", label: "Doctors" },
      { id: "schedule",     icon: "🗓",   label: "Schedules" },
      { id: "patients",     icon: "🧑‍🤝‍🧑", label: "Patients" },
    ]},
    { label: "Management", items: [
      { id: "reports",  icon: "📊", label: "Reports & Analytics" },
      { id: "settings", icon: "⚙️", label: "System Settings" },
    ]},
  ];

  const renderPage = () => {
    switch (page) {
      case "appointments": return <AdminAppointments />;
      case "doctors":      return <AdminDoctors />;
      case "schedule":     return <AdminSchedule />;
      case "patients":     return <AdminPatients />;
      case "reports":      return <AdminReports />;
      case "settings":     return <AdminSettings />;
      default:             return <AdminDashboard />;
    }
  };

  return (
    <AppShell
      user={user}
      navItems={NAV}
      page={page}
      setPage={setPage}
      onLogout={onLogout}
    >
      {renderPage()}
    </AppShell>
  );
}

export default AdminLayout;
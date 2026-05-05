import { useState } from "react";
import AppShell from "../../components/AppShell";
import {
  PatientDashboard,
  PatientAppointments,
  BookAppointment,
  PatientRecords,
  PatientInformation,
} from "./PatientPages";

const PATIENT_NAV = [
  {
    label: "Overview",
    items: [
      { id: "dashboard", icon: "⊞", label: "Dashboard" },
      { id: "appointments", icon: "📅", label: "My Appointments" },
      { id: "book", icon: "📝", label: "Book Appointment" },
    ],
  },
  {
    label: "Health",
    items: [
      { id: "records", icon: "📋", label: "Medical Records" },
    ],
  },
  {
    label: "Account",
    items: [
      { id: "information", icon: "👤", label: "My Information" },
    ],
  },
];

function PatientLayout({ user, onLogout }) {
  const [page, setPage] = useState("dashboard");

  const renderPage = () => {
    switch (page) {
      case "appointments":
        return <PatientAppointments user={user} />;
      case "book":
        return (
          <BookAppointment
            user={user}
            onSuccess={() => setPage("appointments")}
            onEditInfo={() => setPage("information")}
          />
        );
      case "information":
        return <PatientInformation user={user} />;
      case "records":
        return <PatientRecords />;
      default:
        return <PatientDashboard user={user} onBookNow={() => setPage("book")} />;
    }
  };

  return (
    <AppShell
      user={user}
      navItems={PATIENT_NAV}
      page={page}
      setPage={setPage}
      onLogout={onLogout}
    >
      {renderPage()}
    </AppShell>
  );
}

export default PatientLayout;
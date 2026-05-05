import { useState, useEffect } from "react";
import AppShell from "../../components/AppShell";
import { getAppointments, updateAppointmentStatus, getPatients, saveAppointments } from "../../data/storage";
import { useModal } from "../../components/ModalContext";
import "../admin/Admin.css";
import "./Staff.css";

function getDoctorName(user) {
  return user.name;
}

function seedDemoAppointments(user) {
  const existing = getAppointments().filter(a => a.doctorName === getDoctorName(user) && a.status !== "cancelled");
  if (existing.length > 0) return;

  const demoPatients = [
    { name: "Juan Dela Cruz", email: "juan@example.com" },
    { name: "Maria Clara", email: "maria@example.com" },
  ];

  const today = new Date();
  const formatDate = (d) => d.toISOString().split("T")[0];
  const nextMon = new Date(today);
  nextMon.setDate(today.getDate() + ((1 + 7 - today.getDay()) % 7 || 7));

  const demoAppts = [
    {
      id: "demo-1",
      patientId: demoPatients[0].email,
      patientName: demoPatients[0].name,
      patientEmail: demoPatients[0].email,
      doctorId: 1,
      doctorName: getDoctorName(user),
      doctorSpec: "Cardiology",
      appointmentType: "Check-up",
      date: formatDate(nextMon),
      time: "10:00 AM",
      concern: "Annual physical",
      status: "pending",
      createdAt: new Date().toISOString(),
    },
    {
      id: "demo-2",
      patientId: demoPatients[1].email,
      patientName: demoPatients[1].name,
      patientEmail: demoPatients[1].email,
      doctorId: 1,
      doctorName: getDoctorName(user),
      doctorSpec: "Cardiology",
      appointmentType: "Follow-up",
      date: formatDate(new Date(today.getTime() + 2 * 86400000)),
      time: "2:30 PM",
      concern: "Blood pressure check",
      status: "confirmed",
      createdAt: new Date().toISOString(),
    },
  ];

  const allAppts = getAppointments();
  saveAppointments([...allAppts, ...demoAppts]);
}

// ========== DASHBOARD ==========
function StaffDashboard({ user }) {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    seedDemoAppointments(user);
    const all = getAppointments();
    const filtered = all.filter(a => a.doctorName === getDoctorName(user));
    setAppointments(filtered);
  }, [user]);

  const pending = appointments.filter(a => a.status === "pending").length;
  const confirmed = appointments.filter(a => a.status === "confirmed").length;

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <div className="page-title">Welcome, {user.name} 👋</div>
          <div className="page-sub">Doctor Portal</div>
        </div>
      </div>

      <div className="staff-stat-row">
        <div className="staff-stat-card" style={{ "--accent": "#0ea5e9" }}>
          <div className="ssc-icon">📅</div>
          <div className="ssc-value">{appointments.length}</div>
          <div className="ssc-label">My Appointments</div>
        </div>
        <div className="staff-stat-card" style={{ "--accent": "#10b981" }}>
          <div className="ssc-icon">✅</div>
          <div className="ssc-value">{confirmed}</div>
          <div className="ssc-label">Confirmed</div>
        </div>
        <div className="staff-stat-card" style={{ "--accent": "#f59e0b" }}>
          <div className="ssc-icon">⏳</div>
          <div className="ssc-value">{pending}</div>
          <div className="ssc-label">Pending</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">My Upcoming Appointments</div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Date</th>
              <th>Time</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.slice(0, 5).map(a => (
              <tr key={a.id}>
                <td>
                  <strong>{a.patientName}</strong>
                  <br />
                  {a.patientEmail}
                </td>
                <td>{a.date}</td>
                <td>{a.time}</td>
                <td>{a.appointmentType}</td>
                <td>
                  <span className={`badge ${a.status}`}>{a.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ========== APPOINTMENTS ==========
function StaffAppointments({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("all");
  const { showAlert, showConfirm } = useModal();

  const loadAppointments = () => {
    const all = getAppointments();
    setAppointments(all.filter(a => a.doctorName === getDoctorName(user)));
  };

  useEffect(() => {
    loadAppointments();
  }, [user]);

  const handleConfirm = async (id) => {
    updateAppointmentStatus(id, "confirmed");
    loadAppointments();
    await showAlert("Appointment confirmed.", "Success");
  };

  const handleCancel = async (id) => {
    const yes = await showConfirm("Cancel this appointment?", "Confirm Cancel");
    if (yes) {
      updateAppointmentStatus(id, "cancelled");
      loadAppointments();
      await showAlert("Appointment cancelled.", "Cancelled");
    }
  };

  const displayed =
    filter === "all"
      ? appointments
      : appointments.filter(a => a.status === filter);

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <div className="page-title">My Appointments</div>
          <div className="page-sub">Manage patient appointments</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ display: "flex", gap: 8 }}>
            {["all", "pending", "confirmed", "cancelled"].map(f => (
              <button
                key={f}
                className={`btn ${filter === f ? "btn-primary" : "btn-outline"}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Date</th>
              <th>Time</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map(a => (
              <tr key={a.id}>
                <td>
                  <strong>{a.patientName}</strong>
                  <br />
                  <span style={{ fontSize: 11 }}>{a.patientEmail}</span>
                </td>
                <td>{a.date}</td>
                <td>{a.time}</td>
                <td>{a.appointmentType}</td>
                <td>
                  <span className={`badge ${a.status}`}>{a.status}</span>
                </td>
                <td>
                  {a.status === "pending" && (
                    <>
                      <button
                        className="btn btn-primary"
                        style={{ marginRight: 8 }}
                        onClick={() => handleConfirm(a.id)}
                      >
                        Confirm
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleCancel(a.id)}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {a.status === "confirmed" && "✓ Confirmed"}
                  {a.status === "cancelled" && "✗ Cancelled"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ========== PATIENTS ==========
function StaffPatients({ user }) {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    const all = getPatients();
    const appts = getAppointments().filter(
      a => a.doctorName === getDoctorName(user)
    );
    const emails = new Set(appts.map(a => a.patientEmail));
    setPatients(all.filter(p => emails.has(p.email)));
  }, [user]);

  const handleView = (patient) => {
    setSelectedPatient(patient);
  };

  const closeModal = () => {
    setSelectedPatient(null);
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <div className="page-title">My Patients</div>
          <div className="page-sub">View patient records</div>
        </div>
      </div>
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>DOB</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p, idx) => (
              <tr key={idx}>
                <td>{p.name}</td>
                <td>{p.email}</td>
                <td>{p.phone || "—"}</td>
                <td>{p.dob || "—"}</td>
                <td>
                  <button className="btn btn-outline" onClick={() => handleView(p)}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedPatient && (
        <div className="modal-overlay open" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 560 }}>
            <button className="modal-close-x" onClick={closeModal}>✕</button>
            <div className="modal-title">{selectedPatient.name}</div>
            <div className="modal-sub">{selectedPatient.email}</div>

            <div className="card-header" style={{ marginTop: 16 }}>
              <div className="card-title">Personal Information</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px", fontSize: 13 }}>
              <div><strong>First Name:</strong> {selectedPatient.first_name || (selectedPatient.name ? selectedPatient.name.split(" ")[0] : "—")}</div>
              <div><strong>Middle Name:</strong> {selectedPatient.middle_name || "—"}</div>
              <div><strong>Last Name:</strong> {selectedPatient.last_name || (selectedPatient.name ? selectedPatient.name.split(" ").slice(1).join(" ") : "—")}</div>
              <div><strong>DOB:</strong> {selectedPatient.dob || "—"}</div>
              <div><strong>Phone:</strong> {selectedPatient.phone || "—"}</div>
              <div><strong>Address:</strong> {selectedPatient.address || "—"}</div>
              <div><strong>Religion:</strong> {selectedPatient.religion || "—"}</div>
            </div>

            <div className="card-header" style={{ marginTop: 16 }}>
              <div className="card-title">Medical Information</div>
            </div>
            <div style={{ fontSize: 13 }}>
              <p><strong>Past Medical Conditions:</strong><br />{selectedPatient.medical_conditions || "—"}</p>
              <p><strong>Current Medications:</strong><br />{selectedPatient.medications || "—"}</p>
              <p><strong>Family Medical History:</strong><br />{selectedPatient.family_history || "—"}</p>
            </div>

            <div className="card-header" style={{ marginTop: 16 }}>
              <div className="card-title">Emergency Contact</div>
            </div>
            <div style={{ fontSize: 13 }}>
              <p><strong>Name:</strong> {selectedPatient.emergency_name || "—"}</p>
              <p><strong>Relationship:</strong> {selectedPatient.emergency_relationship || "—"}</p>
              <p><strong>Phone:</strong> {selectedPatient.emergency_phone || "—"}</p>
            </div>

            <div className="modal-actions">
              <button className="btn btn-outline" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ========== SCHEDULE ==========
function StaffSchedule({ user }) {
  const dayLabels = {
    mon: "Monday",
    tue: "Tuesday",
    wed: "Wednesday",
    thu: "Thursday",
    fri: "Friday",
  };

  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const all = getAppointments().filter(
      a => a.doctorName === getDoctorName(user) && a.status !== "cancelled"
    );
    setAppointments(all);
  }, [user]);

  const grouped = {
    mon: [],
    tue: [],
    wed: [],
    thu: [],
    fri: [],
  };

  appointments.forEach(a => {
    const d = new Date(a.date);
    if (isNaN(d.getTime())) return;
    const dayIndex = d.getDay();
    const dayMap = { 1: "mon", 2: "tue", 3: "wed", 4: "thu", 5: "fri" };
    const key = dayMap[dayIndex];
    if (key) {
      grouped[key].push(a);
    }
  });

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <div className="page-title">My Schedule</div>
          <div className="page-sub">Your weekly availability</div>
        </div>
      </div>
      <div className="staff-schedule-grid">
        {Object.entries(grouped).map(([day, appts]) => (
          <div className="schedule-day" key={day}>
            <div className="day-label">{dayLabels[day]}</div>
            {appts.length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--muted)", padding: "8px 0" }}>
                No appointments
              </div>
            ) : (
              appts.map((a, i) => (
                <div className="schedule-slot" key={i}>
                  <div className="slot-bar" style={{ background: "#0ea5e9" }} />
                  <div className="slot-time">{a.time}</div>
                  <div>
                    <div className="slot-doctor">{a.patientName}</div>
                    <div className="slot-spec">{a.appointmentType} · {a.status}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ========== PROFILE (ENHANCED – centered, more fields, persistent) ==========
function StaffProfile({ user }) {
  const storageKey = `staff_profile_${user.email}`;
  const defaultProfile = {
    phone: "",
    specialty: "",
    licenseNumber: "",
    yearsOfExperience: "",
    consultationFee: "",
  };

  const [profile, setProfile] = useState(() => {
    const stored = localStorage.getItem(storageKey);
    return stored ? { ...defaultProfile, ...JSON.parse(stored) } : defaultProfile;
  });
  const { showAlert } = useModal();

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    localStorage.setItem(storageKey, JSON.stringify(profile));
    showAlert("Profile updated successfully.", "Success");
  };

  return (
    <div className="page-enter" style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 620 }}>
        <div className="page-header">
          <div>
            <div className="page-title">My Profile</div>
            <div className="page-sub">Your professional details</div>
          </div>
          <button className="btn btn-primary" onClick={handleSave}>
            Save Changes
          </button>
        </div>

        <div className="card">
          {/* Avatar and Identity */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div className="profile-avatar" style={{ background: "#0ea5e9", margin: "0 auto 12px auto", width: 64, height: 64, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center", color: "white", borderRadius: 18 }}>
              {user.initials}
            </div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{user.name}</div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>Doctor · MediCare Hospital</div>
          </div>

          <div className="settings-divider" />

          {/* Editable Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                value={user.email}
                disabled
                style={{ background: "var(--surface)", color: "var(--muted)" }}
              />
              <p style={{ fontSize: 11, color: "var(--light)", marginTop: 4 }}>
                Cannot be changed (linked to your login)
              </p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  className="form-input"
                  value={profile.phone}
                  onChange={e => handleChange("phone", e.target.value)}
                  placeholder="+63 9XX XXX XXXX"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Specialty</label>
                <input
                  className="form-input"
                  value={profile.specialty}
                  onChange={e => handleChange("specialty", e.target.value)}
                  placeholder="e.g., Cardiology"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">License Number</label>
                <input
                  className="form-input"
                  value={profile.licenseNumber}
                  onChange={e => handleChange("licenseNumber", e.target.value)}
                  placeholder="PRC-12345"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Years of Experience</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  value={profile.yearsOfExperience}
                  onChange={e => handleChange("yearsOfExperience", e.target.value)}
                  placeholder="e.g., 12"
                />
              </div>
            </div>

            
          </div>

          <div className="settings-divider" />

          <p style={{ fontSize: 12, color: "var(--muted)", textAlign: "center" }}>
            Your profile details are stored locally on this device. They will be retained even after logging out.
          </p>
        </div>
      </div>
    </div>
  );
}

// ========== NAVIGATION ==========
function buildNav(pendingCount) {
  return [
    {
      label: "My Work",
      items: [
        { id: "dashboard", icon: "⊞", label: "Dashboard" },
        { id: "myAppointments", icon: "📅", label: "My Appointments", badge: pendingCount || undefined },
        { id: "myPatients", icon: "🧑‍🤝‍🧑", label: "My Patients" },
        { id: "mySchedule", icon: "🗓", label: "My Schedule" },
      ],
    },
    {
      label: "Account",
      items: [{ id: "profile", icon: "👤", label: "My Profile" }],
    },
  ];
}

// ========== MAIN LAYOUT ==========
export default function StaffLayout({ user, onLogout }) {
  const [page, setPage] = useState("dashboard");
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const all = getAppointments().filter(
      a => a.doctorName === getDoctorName(user) && a.status === "pending"
    );
    setPendingCount(all.length);
  }, [user]);

  const navItems = buildNav(pendingCount);

  const renderPage = () => {
    switch (page) {
      case "myAppointments":
        return <StaffAppointments user={user} />;
      case "myPatients":
        return <StaffPatients user={user} />;
      case "mySchedule":
        return <StaffSchedule user={user} />;
      case "profile":
        return <StaffProfile user={user} />;
      default:
        return <StaffDashboard user={user} />;
    }
  };

  return (
    <AppShell
      user={user}
      navItems={navItems}
      page={page}
      setPage={setPage}
      onLogout={onLogout}
    >
      {renderPage()}
    </AppShell>
  );
}

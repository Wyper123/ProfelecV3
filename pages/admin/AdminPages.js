import { useState, useEffect } from "react";
import {
  getDoctors, addDoctor, updateDoctor, removeDoctor,
  getSchedules, addScheduleSlot,
  getAppointments, updateAppointmentStatus, getPatients,
  saveAppointments, saveNotifications
} from "../../data/storage";
import { useModal } from "../../components/ModalContext";
import "./Admin.css";

// ========== APPOINTMENTS ==========
const filters = ["all", "pending", "confirmed", "cancelled"];

export function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("all");
  const { showAlert, showConfirm } = useModal();

  const loadAppointments = () => {
    setAppointments(getAppointments());
  };

  useEffect(() => {
    loadAppointments();
  }, []);

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

  const filtered = filter === "all" ? appointments : appointments.filter(a => a.status === filter);

  return (
    <div className="page-enter">
      <div className="page-header">
        <div><div className="page-title">All Appointments</div><div className="page-sub">Patient‑submitted appointments</div></div>
      </div>
      <div className="card">
        <div className="card-header">
          <div style={{ display: "flex", gap: 8 }}>
            {filters.map(f => (
              <button key={f} className={`btn ${filter === f ? "btn-primary" : "btn-outline"}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <table className="data-table">
          <thead><tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id}>
                <td><strong>{a.patientName}</strong><br/><span style={{fontSize:11}}>{a.patientEmail}</span></td>
                <td>{a.doctorName}<br/><span style={{fontSize:11}}>{a.doctorSpec}</span></td>
                <td>{a.date}</td><td>{a.time}</td><td>{a.appointmentType}</td>
                <td><span className={`badge ${a.status}`}>{a.status}</span></td>
                <td>
                  {a.status === "pending" && (
                    <>
                      <button className="btn btn-primary" style={{marginRight:8}} onClick={() => handleConfirm(a.id)}>Confirm</button>
                      <button className="btn btn-danger" onClick={() => handleCancel(a.id)}>Cancel</button>
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

// ========== DOCTORS (with Edit & Remove) ==========
export function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);   // null = adding, otherwise editing
  const [form, setForm] = useState({
    name: "", spec: "", color: "#6366f1", days: "Mon–Fri", time: "8AM–5PM", cases: 0, phone: "", email: ""
  });
  const { showAlert, showConfirm } = useModal();

  useEffect(() => {
    setDoctors(getDoctors());
  }, []);

  const openAddModal = () => {
    setEditingDoctor(null);
    setForm({ name: "", spec: "", color: "#6366f1", days: "Mon–Fri", time: "8AM–5PM", cases: 0, phone: "", email: "" });
    setShowModal(true);
  };

  const openEditModal = (doctor) => {
    setEditingDoctor(doctor);
    setForm({
      name: doctor.name,
      spec: doctor.spec,
      color: doctor.color,
      days: doctor.days,
      time: doctor.time,
      cases: doctor.cases,
      phone: doctor.phone || "",
      email: doctor.email || ""
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSave = () => {
    if (!form.name || !form.spec) {
      showAlert("Name and specialty are required.", "Missing Fields");
      return;
    }

    if (editingDoctor) {
      // Update
      updateDoctor(editingDoctor.id, {
        ...form,
        cases: Number(form.cases) || 0,
        init: form.name.split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2)
      });
      showAlert("Doctor updated successfully.", "Success");
    } else {
      // Add new
      const nameParts = form.name.split(" ");
      const init = nameParts.map(p => p[0]).join("").toUpperCase().slice(0, 2);
      addDoctor({
        ...form,
        init,
        cases: Number(form.cases) || 0,
      });
      showAlert("Doctor added successfully.", "Success");
    }

    setDoctors(getDoctors());
    closeModal();
  };

  const handleRemove = async (doctor) => {
    const yes = await showConfirm(
      `Remove Dr. ${doctor.name} permanently? This cannot be undone.`,
      "Confirm Removal"
    );
    if (!yes) return;

    removeDoctor(doctor.id);
    setDoctors(getDoctors());
    await showAlert("Doctor removed.", "Removed");
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <div className="page-title">Manage Doctors</div>
          <div className="page-sub">Add, edit, or remove doctors.</div>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>+ Add Doctor</button>
      </div>

      <div className="doctor-grid">
        {doctors.map(d => (
          <div className="doctor-card" key={d.id}>
            <div className="doctor-avatar" style={{ background: d.color }}>{d.init}</div>
            <div className="doctor-name">{d.name}</div>
            <div className="doctor-spec">{d.spec}</div>
            <div className="doctor-meta">
              <span className="doctor-tag">📅 {d.days}</span>
              <span className="doctor-tag">🕐 {d.time}</span>
              <span className="doctor-tag">📋 {d.cases} cases</span>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button className="btn btn-outline" onClick={() => openEditModal(d)}>Edit</button>
              <button className="btn btn-danger" onClick={() => handleRemove(d)}>Remove</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay open" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <button className="modal-close-x" onClick={closeModal}>✕</button>
            <div className="modal-title">{editingDoctor ? "Edit Doctor" : "Add New Doctor"}</div>
            <div className="modal-sub">Enter doctor details below.</div>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Dr. ..." />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Specialty *</label>
                <input className="form-input" value={form.spec} onChange={e => setForm({...form, spec: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Color</label>
                <input className="form-input" type="color" value={form.color} onChange={e => setForm({...form, color: e.target.value})} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Days Available</label>
                <input className="form-input" value={form.days} onChange={e => setForm({...form, days: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Time</label>
                <input className="form-input" value={form.time} onChange={e => setForm({...form, time: e.target.value})} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Initial Cases</label>
              <input className="form-input" type="number" value={form.cases} onChange={e => setForm({...form, cases: e.target.value})} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>
                {editingDoctor ? "Update Doctor" : "Add Doctor"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ========== SCHEDULE ==========
const DAYS = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" }
];

export function AdminSchedule() {
  const [schedules, setSchedules] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState("mon");
  const [slotForm, setSlotForm] = useState({
    time: "", doctor: "", spec: "", color: "#6366f1", doctorId: ""
  });
  const [doctorsList, setDoctorsList] = useState([]);
  const { showAlert } = useModal();

  useEffect(() => {
    const sched = getSchedules();
    setSchedules(sched);
    setDoctorsList(getDoctors());
  }, []);

  const handleAddSlot = () => {
    if (!slotForm.time || !slotForm.doctor || !slotForm.doctorId) {
      showAlert("Please fill in time and select a doctor.", "Missing Fields");
      return;
    }
    addScheduleSlot(selectedDay, {
      time: slotForm.time,
      doctor: slotForm.doctor,
      spec: slotForm.spec,
      color: slotForm.color,
      doctorId: Number(slotForm.doctorId),
    });
    setSchedules(getSchedules());
    setShowAddModal(false);
    setSlotForm({ time: "", doctor: "", spec: "", color: "#6366f1", doctorId: "" });
    showAlert("Schedule slot added.", "Success");
  };

  const handleDoctorSelect = (e) => {
    const doctorId = e.target.value;
    const doctor = doctorsList.find(d => d.id.toString() === doctorId);
    if (doctor) {
      setSlotForm({
        ...slotForm,
        doctorId: doctor.id.toString(),
        doctor: doctor.name,
        spec: doctor.spec,
        color: doctor.color,
      });
    }
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <div><div className="page-title">Manage Schedules</div><div className="page-sub">View and edit doctor schedules.</div></div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>+ Add Schedule</button>
      </div>
      <div className="two-col">
        {DAYS.slice(0, 3).map(({key, label}) => (
          <div className="schedule-day" key={key}>
            <div className="day-label">{label}</div>
            {(schedules[key] || []).map((s, i) => (
              <div className="schedule-slot" key={i}>
                <div className="slot-bar" style={{ background: s.color }} />
                <div className="slot-time">{s.time}</div>
                <div>
                  <div className="slot-doctor">{s.doctor}</div>
                  <div className="slot-spec">{s.spec}</div>
                </div>
              </div>
            ))}
          </div>
        ))}
        {DAYS.slice(3).map(({key, label}) => (
          <div className="schedule-day" key={key}>
            <div className="day-label">{label}</div>
            {(schedules[key] || []).map((s, i) => (
              <div className="schedule-slot" key={i}>
                <div className="slot-bar" style={{ background: s.color }} />
                <div className="slot-time">{s.time}</div>
                <div>
                  <div className="slot-doctor">{s.doctor}</div>
                  <div className="slot-spec">{s.spec}</div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="modal-overlay open" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close-x" onClick={() => setShowAddModal(false)}>✕</button>
            <div className="modal-title">Add Schedule Slot</div>
            <div className="modal-sub">Assign a doctor to a day/time.</div>
            <div className="form-group">
              <label className="form-label">Day</label>
              <select className="form-select" value={selectedDay} onChange={e => setSelectedDay(e.target.value)}>
                {DAYS.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Time</label>
              <input className="form-input" placeholder="e.g., 8:00–5:00" value={slotForm.time} onChange={e => setSlotForm({...slotForm, time: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Doctor</label>
              <select className="form-select" value={slotForm.doctorId} onChange={handleDoctorSelect}>
                <option value="">Select a doctor</option>
                {doctorsList.map(d => <option key={d.id} value={d.id}>{d.name} ({d.spec})</option>)}
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddSlot}>Add Slot</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ========== PATIENTS (REAL) ==========
export function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    setPatients(getPatients());
  }, []);

  const handleView = (patient) => {
    setSelectedPatient(patient);
  };

  const closeModal = () => {
    setSelectedPatient(null);
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <div><div className="page-title">Patient Records</div><div className="page-sub">Registered patients.</div></div>
      </div>
      <div className="card">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>DOB</th><th>Action</th></tr></thead>
          <tbody>
            {patients.map((p, idx) => (
              <tr key={idx}>
                <td>{p.name}</td>
                <td>{p.email}</td>
                <td>{p.phone||"—"}</td>
                <td>{p.dob||"—"}</td>
                <td><button className="btn btn-outline" onClick={() => handleView(p)}>View</button></td>
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
              <div><strong>First Name:</strong> {selectedPatient.first_name || "—"}</div>
              <div><strong>Middle Name:</strong> {selectedPatient.middle_name || "—"}</div>
              <div><strong>Last Name:</strong> {selectedPatient.last_name || "—"}</div>
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

// ========== REPORTS (REDESIGNED) ==========
export function AdminReports() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    setAppointments(getAppointments());
    setDoctors(getDoctors());
  }, []);

  const totalAppts = appointments.length;
  const confirmed = appointments.filter(a => a.status === "confirmed").length;
  const cancelled = appointments.filter(a => a.status === "cancelled").length;
  const cancellationRate = totalAppts ? Math.round((cancelled / totalAppts) * 100) : 0;

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const today = new Date();
  const monthlyBars = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthLabel = monthNames[d.getMonth()] + " " + d.getFullYear();
    const count = appointments.filter(a => {
      const ad = new Date(a.date);
      return ad.getMonth() === d.getMonth() && ad.getFullYear() === d.getFullYear();
    }).length;
    monthlyBars.push({ label: monthLabel, count });
  }
  const maxMonthly = Math.max(...monthlyBars.map(b => b.count), 1);

  const doctorCaseMap = {};
  appointments.forEach(a => {
    if (a.doctorName) {
      doctorCaseMap[a.doctorName] = (doctorCaseMap[a.doctorName] || 0) + 1;
    }
  });
  const topDoctorsList = doctors
    .map(d => ({
      ...d,
      cases: doctorCaseMap[d.name] || 0
    }))
    .sort((a, b) => b.cases - a.cases)
    .slice(0, 5);
  const maxTopCases = Math.max(...topDoctorsList.map(d => d.cases), 1);

  return (
    <div className="page-enter">
      <div className="page-header">
        <div><div className="page-title">Reports & Analytics</div><div className="page-sub">Real-time hospital metrics</div></div>
        <button className="btn btn-primary">⬇ Export PDF</button>
      </div>

      <div className="report-stat-row">
        <div className="report-stat-card">
          <div className="rsc-icon">📅</div>
          <div className="rsc-value">{totalAppts}</div>
          <div className="rsc-label">Total Appointments</div>
          <div className="rsc-change up">↑ 12% vs last month</div>
        </div>
        <div className="report-stat-card">
          <div className="rsc-icon">✅</div>
          <div className="rsc-value">{confirmed}</div>
          <div className="rsc-label">Confirmed</div>
          <div className="rsc-change up">↑ 8%</div>
        </div>
        <div className="report-stat-card">
          <div className="rsc-icon">❌</div>
          <div className="rsc-value">{cancellationRate}%</div>
          <div className="rsc-label">Cancellation Rate</div>
          <div className="rsc-change down">↓ 3% vs last month</div>
        </div>
        <div className="report-stat-card">
          <div className="rsc-icon">⏱️</div>
          <div className="rsc-value">14 min</div>
          <div className="rsc-label">Avg. Wait Time</div>
          <div className="rsc-change down">↓ 2 min</div>
        </div>
      </div>

      <div className="report-grid">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Monthly Appointment Volume</div>
          </div>
          <div className="bar-chart" style={{ gap: 12, height: 180 }}>
            {monthlyBars.map(item => (
              <div className="bar-col" key={item.label}>
                <span className="bar-value">{item.count}</span>
                <div className="bar-wrap">
                  <div
                    className="bar-fill"
                    style={{
                      height: `${(item.count / maxMonthly) * 100}%`,
                      background: "linear-gradient(180deg, var(--accent) 0%, #93c5fd 100%)"
                    }}
                  />
                </div>
                <span className="bar-label">{item.label.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Top Doctors by Cases</div>
          </div>
          <div className="top-doctors-list">
            {topDoctorsList.map((doc, idx) => (
              <div className="top-doc-row" key={doc.id}>
                <span className="top-doc-rank">#{idx + 1}</span>
                <div className="top-doc-avatar" style={{ background: doc.color }}>
                  {doc.init}
                </div>
                <div className="top-doc-info">
                  <div className="top-doc-name">{doc.name}</div>
                  <div className="top-doc-spec">{doc.spec}</div>
                </div>
                <div className="top-doc-bar-wrap">
                  <div className="top-doc-bar-track">
                    <div
                      className="top-doc-bar-fill"
                      style={{
                        width: `${(doc.cases / maxTopCases) * 100}%`,
                        background: doc.color
                      }}
                    />
                  </div>
                </div>
                <span className="top-doc-count">{doc.cases} cases</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== SETTINGS ==========
function Toggle({ on, onChange }) {
  return <div className={`toggle ${on ? "on" : ""}`} onClick={() => onChange(!on)}><div className="toggle-knob" /></div>;
}

export function AdminSettings() {
  const [tab, setTab] = useState("general");
  const [notifs, setNotifs] = useState({ appt: true, reminder: true, sms: false, email: true });
  const [autoConfirm, setAutoConfirm] = useState(false);
  const { showAlert, showConfirm } = useModal();
  const tabs = [
    { id: "general", icon: "🏥", label: "General" },
    { id: "notifications", icon: "🔔", label: "Notifications" },
    { id: "appointments", icon: "📅", label: "Appointments" },
    { id: "security", icon: "🔒", label: "Security" },
    { id: "demo", icon: "🧪", label: "Demo Data" }
  ];

  const handleResetDemo = async () => {
    const yes = await showConfirm(
      "This will remove all demo appointments and notifications. Real data will not be affected. Continue?",
      "Reset Demo Data"
    );
    if (!yes) return;

    const appts = getAppointments().filter(a => !a.id.startsWith("demo-"));
    saveAppointments(appts);
    saveNotifications([]);
    await showAlert("Demo data has been cleared.", "Success");
  };

  return (
    <div className="page-enter">
      <div className="page-header"><div><div className="page-title">System Settings</div><div className="page-sub">Configure system-wide preferences.</div></div><button className="btn btn-primary">Save Changes</button></div>
      <div className="settings-layout">
        <div className="settings-nav card">{tabs.map(t => <div key={t.id} className={`settings-nav-item ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}><span>{t.icon}</span> {t.label}</div>)}</div>
        <div className="card">
          {tab === "general" && (<><div className="card-header"><div className="card-title">Hospital Information</div></div><div className="form-row"><div className="form-group"><label className="form-label">Hospital Name</label><input className="form-input" defaultValue="MediCare General Hospital" /></div><div className="form-group"><label className="form-label">Phone</label><input className="form-input" defaultValue="+63 2 8888 0000" /></div></div><div className="form-group"><label className="form-label">Email</label><input className="form-input" defaultValue="info@medicare.ph" /></div></>)}
          {tab === "notifications" && (<><div className="card-header"><div className="card-title">Notification Preferences</div></div><div className="toggle-list">{Object.entries(notifs).map(([k,v]) => <div className="toggle-row" key={k}><div><div className="toggle-label">{k}</div></div><Toggle on={v} onChange={val => setNotifs({...notifs, [k]:val})} /></div>)}</div></>)}
          {tab === "appointments" && (<><div className="card-header"><div className="card-title">Appointment Configuration</div></div><div className="toggle-row"><div><div className="toggle-label">Auto-confirm</div></div><Toggle on={autoConfirm} onChange={setAutoConfirm} /></div></>)}
          {tab === "security" && (<><div className="card-header"><div className="card-title">Security & Access</div></div><div className="form-group"><label className="form-label">New Password</label><input className="form-input" type="password" /></div><button className="btn btn-primary">Update Password</button></>)}
          {tab === "demo" && (<><div className="card-header"><div className="card-title">Demo Data</div></div><p style={{ marginBottom: 16, fontSize: 13, color: "var(--muted)" }}>Use this to reset all demo appointments and notifications. Real patient data remains untouched.</p><button className="btn btn-danger" onClick={handleResetDemo}>Reset Demo Data</button></>)}
        </div>
      </div>
    </div>
  );
}
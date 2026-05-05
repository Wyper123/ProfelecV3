import { useState, useEffect } from "react";
import {
  getAppointmentsByPatient,
  addAppointment,
  getPatients,
  getPatientByEmail,
  updatePatient,
  getDoctors,
} from "../../data/storage";
import { useModal } from "../../components/ModalContext";
import "./PatientPages.css";

const TIME_SLOTS = [
  "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM",
  "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
];

const APPT_TYPES = [
  "Consultation", "Follow-up", "Check-up",
  "Lab / Diagnostics", "Vaccination", "Emergency",
];

// ========== DASHBOARD ==========
export function PatientDashboard({ user, onBookNow }) {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    setAppointments(getAppointmentsByPatient(user.email));
  }, [user.email]);

  const pending = appointments.filter(a => a.status === "pending").length;
  const confirmed = appointments.filter(a => a.status === "confirmed").length;
  const next = appointments.find(a => a.status === "confirmed" || a.status === "pending");

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <div className="page-title">Patient Dashboard</div>
          <div className="page-sub">Welcome, {user.name} 👋</div>
        </div>
        <button className="btn btn-primary" onClick={onBookNow}>
          + Book Appointment
        </button>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total Appointments</div>
          <div className="stat-value">{appointments.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Confirmed</div>
          <div className="stat-value">{confirmed}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending</div>
          <div className="stat-value">{pending}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Next Appointment</div>
        </div>
        {next ? (
          <div style={{ padding: "8px 0" }}>
            <strong>{next.doctorName}</strong> – {next.appointmentType}<br />
            <span style={{ fontSize: 13 }}>{next.date} at {next.time}</span>
            <span className={`badge ${next.status}`} style={{ marginLeft: 12 }}>
              {next.status}
            </span>
          </div>
        ) : (
          <p style={{ fontSize: 13, color: "var(--muted)" }}>
            No upcoming appointments. Use <strong>Book Appointment</strong> to get started.
          </p>
        )}
      </div>
    </div>
  );
}

// ========== MY APPOINTMENTS ==========
export function PatientAppointments({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    setAppointments(getAppointmentsByPatient(user.email));
  }, [user.email]);

  const filtered =
    filter === "all"
      ? appointments
      : appointments.filter(a => a.status === filter);

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <div className="page-title">My Appointments</div>
          <div className="page-sub">All your scheduled visits</div>
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
              <th>Doctor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id}>
                <td>
                  <strong>{a.doctorName}</strong>
                  <br />
                  <span style={{ fontSize: 11 }}>{a.doctorSpec}</span>
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

// ========== BOOK APPOINTMENT (DYNAMIC DOCTOR LIST) ==========
export function BookAppointment({ user, onSuccess, onEditInfo }) {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const p = getPatientByEmail(user.email);
    setPatient(p);
    setDoctors(getDoctors());
    setLoading(false);
  }, [user.email]);

  // Booking state
  const [step, setStep] = useState(0);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [apptType, setApptType] = useState("");
  const [apptDate, setApptDate] = useState("");
  const [apptTime, setApptTime] = useState("");
  const [concern, setConcern] = useState("");

  if (loading) return null;

  const isComplete =
    patient &&
    patient.first_name &&
    patient.last_name &&
    patient.dob &&
    patient.phone &&
    patient.address;

  if (!isComplete) {
    return (
      <div className="page-enter">
        <div className="page-header">
          <div>
            <div className="page-title">Book Appointment</div>
            <div className="page-sub">Complete your information first</div>
          </div>
        </div>
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
          <p>You need to fill out your personal, medical, and emergency details before booking.</p>
          <button
            className="btn btn-primary"
            style={{ marginTop: 20 }}
            onClick={() => onEditInfo()}
          >
            Complete My Information
          </button>
        </div>
      </div>
    );
  }

  const canNext = () => {
    if (step === 0) return selectedDoctor && apptType;
    if (step === 1) return apptDate && apptTime;
    return true;
  };

  const handleNext = () => {
    if (canNext()) setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);

  const handleSubmit = () => {
    const appointment = {
      patientId: user.email,
      patientName: `${patient.first_name} ${patient.last_name}`,
      patientEmail: user.email,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      doctorSpec: selectedDoctor.spec,
      appointmentType: apptType,
      date: apptDate,
      time: apptTime,
      concern: concern,
    };
    addAppointment(appointment);
    onSuccess();
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <div className="page-title">Book Appointment</div>
          <div className="page-sub">Schedule a new visit</div>
        </div>
      </div>

      <div className="portal-card">
        <div className="portal-stepper">
          {["Doctor & Type", "Schedule", "Confirm"].map((s, i) => (
            <div
              key={s}
              className={`step-item ${i === step ? "active" : i < step ? "done" : ""}`}
            >
              <div className="step-circle">{i < step ? "✓" : i + 1}</div>
              <div className="step-label">{s}</div>
              {i < 2 && <div className="step-line" />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <>
            <div className="step-title">Select Doctor & Type</div>
            <div className="form-group">
              <label>Appointment Type *</label>
              <div className="type-grid">
                {APPT_TYPES.map(t => (
                  <div
                    key={t}
                    className={`type-chip ${apptType === t ? "active" : ""}`}
                    onClick={() => setApptType(t)}
                  >
                    {t}
                  </div>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Doctor *</label>
              <div className="doctor-select-list">
                {doctors.map(d => (
                  <div
                    key={d.id}
                    className={`doctor-select-card ${
                      selectedDoctor?.id === d.id ? "active" : ""
                    }`}
                    onClick={() => setSelectedDoctor(d)}
                  >
                    <div className="dsc-avatar" style={{ background: d.color }}>
                      {d.init}
                    </div>
                    <div>
                      <div className="dsc-name">{d.name}</div>
                      <div className="dsc-spec">{d.spec}</div>
                    </div>
                    {selectedDoctor?.id === d.id && <div className="dsc-check">✓</div>}
                  </div>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Concern</label>
              <textarea
                className="form-input"
                rows="3"
                value={concern}
                onChange={e => setConcern(e.target.value)}
              />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="step-title">Pick a Schedule</div>
            <div className="form-group">
              <label>Date *</label>
              <input
                className="form-input"
                type="date"
                value={apptDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={e => setApptDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Time *</label>
              <div className="time-grid">
                {TIME_SLOTS.map(t => (
                  <div
                    key={t}
                    className={`time-slot ${apptTime === t ? "active" : ""}`}
                    onClick={() => setApptTime(t)}
                  >
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="step-title">Confirm Booking</div>
            <div className="confirm-grid">
              <div className="confirm-section">
                <div className="confirm-section-label">Patient</div>
                <div className="confirm-row">
                  <span>Name</span>
                  <strong>
                    {patient.first_name}
                    {patient.middle_name ? ` ${patient.middle_name}` : ""} {patient.last_name}
                  </strong>
                </div>
                <div className="confirm-row">
                  <span>Birthday</span>
                  <strong>{patient.dob}</strong>
                </div>
                <div className="confirm-row">
                  <span>Phone</span>
                  <strong>{patient.phone}</strong>
                </div>
                <div className="confirm-row">
                  <span>Address</span>
                  <strong>{patient.address}</strong>
                </div>
              </div>
              <div className="confirm-section">
                <div className="confirm-section-label">Appointment</div>
                <div className="confirm-row">
                  <span>Doctor</span>
                  <strong>{selectedDoctor?.name}</strong>
                </div>
                <div className="confirm-row">
                  <span>Type</span>
                  <strong>{apptType}</strong>
                </div>
                <div className="confirm-row">
                  <span>Date</span>
                  <strong>{apptDate}</strong>
                </div>
                <div className="confirm-row">
                  <span>Time</span>
                  <strong>{apptTime}</strong>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="portal-nav">
          {step > 0 && (
            <button className="btn-back" onClick={handleBack}>
              ← Back
            </button>
          )}
          {step < 2 ? (
            <button
              className="portal-btn"
              disabled={!canNext()}
              onClick={handleNext}
            >
              Continue →
            </button>
          ) : (
            <button className="portal-btn submit-btn" onClick={handleSubmit}>
              Submit Appointment ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ========== MY INFORMATION ==========
export function PatientInformation({ user, onSaveSuccess }) {
  const { showAlert } = useModal();
  const [form, setForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    dob: "",
    address: "",
    religion: "",
    phone: "",
    medical_conditions: "",
    medications: "",
    family_history: "",
    emergency_name: "",
    emergency_relationship: "",
    emergency_phone: "",
  });

  useEffect(() => {
    const p = getPatientByEmail(user.email);
    if (p) {
      setForm(prev => ({
        ...prev,
        first_name: p.first_name || (p.name ? p.name.split(" ")[0] : ""),
        middle_name: p.middle_name || "",
        last_name: p.last_name || (p.name ? p.name.split(" ").slice(1).join(" ") : ""),
        dob: p.dob || "",
        address: p.address || "",
        religion: p.religion || "",
        phone: p.phone || "",
        medical_conditions: p.medical_conditions || "",
        medications: p.medications || "",
        family_history: p.family_history || "",
        emergency_name: p.emergency_name || "",
        emergency_relationship: p.emergency_relationship || "",
        emergency_phone: p.emergency_phone || "",
      }));
    }
  }, [user.email]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (
      !form.first_name.trim() ||
      !form.last_name.trim() ||
      !form.dob ||
      !form.phone.trim() ||
      !form.address.trim()
    ) {
      await showAlert(
        "Please fill in all required fields: First Name, Last Name, Birthday, Address, and Contact Number.",
        "Missing Information"
      );
      return;
    }
    updatePatient(user.email, form);
    await showAlert("Your information has been saved.", "Success");
    if (onSaveSuccess) onSaveSuccess();
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <div className="page-title">My Information</div>
          <div className="page-sub">Manage your personal, medical, and emergency details</div>
        </div>
        <button className="btn btn-primary" onClick={handleSubmit}>
          Save All Information
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Personal Information</div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">First Name *</label>
            <input className="form-input" value={form.first_name} onChange={e => handleChange("first_name", e.target.value)} placeholder="First Name" />
          </div>
          <div className="form-group">
            <label className="form-label">Middle Name</label>
            <input className="form-input" value={form.middle_name} onChange={e => handleChange("middle_name", e.target.value)} placeholder="Middle Name" />
          </div>
          <div className="form-group">
            <label className="form-label">Last Name *</label>
            <input className="form-input" value={form.last_name} onChange={e => handleChange("last_name", e.target.value)} placeholder="Last Name" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Birthday *</label>
            <input className="form-input" type="date" value={form.dob} onChange={e => handleChange("dob", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Address *</label>
            <input className="form-input" value={form.address} onChange={e => handleChange("address", e.target.value)} placeholder="Enter Address" />
          </div>
          <div className="form-group">
            <label className="form-label">Religion</label>
            <input className="form-input" value={form.religion} onChange={e => handleChange("religion", e.target.value)} placeholder="Religion" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Contact Number *</label>
            <input className="form-input" value={form.phone} onChange={e => handleChange("phone", e.target.value)} placeholder="09XX-XXX-XXXX" />
          </div>
          <div className="form-group" />
          <div className="form-group" />
        </div>

        <div className="card-header" style={{ marginTop: 32 }}>
          <div className="card-title">Medical Information</div>
        </div>
        <div className="form-group">
          <label className="form-label">Past Medical Conditions</label>
          <textarea className="form-input" rows="3" value={form.medical_conditions} onChange={e => handleChange("medical_conditions", e.target.value)} placeholder="Type medical conditions..." />
        </div>
        <div className="form-group">
          <label className="form-label">Current Medications</label>
          <textarea className="form-input" rows="3" value={form.medications} onChange={e => handleChange("medications", e.target.value)} placeholder="Type current medications..." />
        </div>
        <div className="form-group">
          <label className="form-label">Family Medical History</label>
          <textarea className="form-input" rows="3" value={form.family_history} onChange={e => handleChange("family_history", e.target.value)} placeholder="Type family medical history..." />
        </div>

        <div className="card-header" style={{ marginTop: 32 }}>
          <div className="card-title">Emergency Information</div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Emergency Contact Name</label>
            <input className="form-input" value={form.emergency_name} onChange={e => handleChange("emergency_name", e.target.value)} placeholder="Full Name" />
          </div>
          <div className="form-group">
            <label className="form-label">Relationship</label>
            <select className="form-select" value={form.emergency_relationship} onChange={e => handleChange("emergency_relationship", e.target.value)}>
              <option value="">Select...</option>
              <option>Spouse</option>
              <option>Parent</option>
              <option>Sibling</option>
              <option>Friend</option>
              <option>Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Contact Number</label>
            <input className="form-input" value={form.emergency_phone} onChange={e => handleChange("emergency_phone", e.target.value)} placeholder="09XX-XXX-XXXX" />
          </div>
        </div>

        <div className="portal-nav" style={{ marginTop: 24, justifyContent: "flex-end" }}>
          <button className="btn btn-primary" onClick={handleSubmit}>
            Save All Information
          </button>
        </div>
      </div>
    </div>
  );
}

// ========== MEDICAL RECORDS ==========
export function PatientRecords() {
  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <div className="page-title">Medical Records</div>
          <div className="page-sub">Your health history</div>
        </div>
      </div>
      <div className="card">
        <div style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <p>No medical records yet.</p>
          <p style={{ fontSize: 13 }}>
            Your doctor will upload records here after your visits.
          </p>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { getAppointmentsByPatient, addAppointment, updatePatient, getPatientByEmail } from "../../data/storage";
import "./PatientPortal.css";

const DOCTORS = [
  { id: 1, name: "Dr. Maria Santos",    spec: "Cardiology",        color: "#6366f1", init: "MS", days: "Mon–Fri", time: "8AM–5PM"  },
  { id: 2, name: "Dr. Kevin Lim",       spec: "Neurology",         color: "#0ea5e9", init: "KL", days: "Mon–Thu", time: "9AM–4PM"  },
  { id: 3, name: "Dr. Rosa Villanueva", spec: "Pediatrics",        color: "#10b981", init: "RV", days: "Mon–Fri", time: "8AM–12PM" },
  { id: 4, name: "Dr. James Mendoza",   spec: "Orthopedics",       color: "#f59e0b", init: "JM", days: "Tue–Sat", time: "10AM–6PM" },
  { id: 5, name: "Dr. Clara Tan",       spec: "Internal Medicine", color: "#f43f5e", init: "CT", days: "Mon–Fri", time: "8AM–5PM"  },
  { id: 6, name: "Dr. Ricky Bautista",  spec: "Dermatology",       color: "#8b5cf6", init: "RB", days: "Wed–Fri", time: "1PM–5PM"  },
];

const TIME_SLOTS = [
  "8:00 AM","8:30 AM","9:00 AM","9:30 AM",
  "10:00 AM","10:30 AM","11:00 AM","11:30 AM",
  "1:00 PM","1:30 PM","2:00 PM","2:30 PM",
  "3:00 PM","3:30 PM","4:00 PM","4:30 PM",
];

const APPT_TYPES = ["Consultation","Follow-up","Check-up","Lab / Diagnostics","Vaccination","Emergency"];

function PatientPortal({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, book, profile
  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState({ name: "", phone: "", dob: "" });
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});

  // Booking state
  const [step, setStep] = useState(0);
  const [info, setInfo] = useState({
    firstName: "", lastName: "", dob: "", sex: "", phone: "", email: "", address: "",
    emergencyName: "", emergencyPhone: ""
  });
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [apptType, setApptType] = useState("");
  const [apptDate, setApptDate] = useState("");
  const [apptTime, setApptTime] = useState("");
  const [concern, setConcern] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Load appointments and profile
  useEffect(() => {
    const patient = getPatientByEmail(user.email);
    if (patient) {
      setProfile({ name: patient.name, phone: patient.phone || "", dob: patient.dob || "" });
      setInfo(prev => ({ ...prev, firstName: patient.name.split(" ")[0] || "", lastName: patient.name.split(" ")[1] || "", email: user.email, phone: patient.phone || "", dob: patient.dob || "" }));
    }
    const apts = getAppointmentsByPatient(user.email);
    setAppointments(apts);
  }, [user.email]);

  const updateInfo = (field, val) => setInfo(prev => ({ ...prev, [field]: val }));

  const canNext = () => {
    if (step === 0) return info.firstName && info.lastName && info.dob && info.sex && info.phone;
    if (step === 1) return selectedDoctor && apptType;
    if (step === 2) return apptDate && apptTime;
    return true;
  };

  const handleNext = () => { if (canNext()) setStep(step + 1); };
  const handleBack = () => setStep(step - 1);

  const handleSubmitBooking = () => {
    const appointment = {
      patientId: user.email,
      patientName: `${info.firstName} ${info.lastName}`,
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
    setSubmitted(true);
    setAppointments(getAppointmentsByPatient(user.email));
  };

  const handleProfileUpdate = () => {
    updatePatient(user.email, editedProfile);
    setProfile({ ...profile, ...editedProfile });
    setEditMode(false);
    alert("Profile updated!");
  };

  if (submitted) {
    return (
      <div className="portal-screen">
        <div className="portal-success">
          <div className="success-icon">✅</div>
          <h2>Appointment Submitted!</h2>
          <p>Your request has been received. Admin will confirm soon.</p>
          <button className="portal-btn" onClick={() => { setSubmitted(false); setActiveTab("dashboard"); setStep(0); }}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-screen">
      <div className="portal-wrap">
        <div className="portal-header">
          <div className="portal-brand">
            <div className="portal-brand-icon">🏥</div>
            <div>
              <div className="portal-brand-name">MediCare</div>
              <div className="portal-brand-sub">Patient Portal</div>
            </div>
          </div>
          <button className="portal-back-btn" onClick={onLogout}>Sign Out</button>
        </div>

        {/* Tabs */}
        <div className="portal-tabs">
          <button className={`tab-btn ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => setActiveTab("dashboard")}>My Appointments</button>
          <button className={`tab-btn ${activeTab === "book" ? "active" : ""}`} onClick={() => setActiveTab("book")}>Book New</button>
          <button className={`tab-btn ${activeTab === "profile" ? "active" : ""}`} onClick={() => setActiveTab("profile")}>My Profile</button>
        </div>

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="portal-card">
            <div className="step-title">My Appointments</div>
            {appointments.length === 0 ? (
              <p className="step-sub">No appointments yet. Click "Book New" to schedule one.</p>
            ) : (
              <div className="appointments-list">
                {appointments.map(apt => (
                  <div key={apt.id} className="appointment-card">
                    <div className="apt-header">
                      <span className={`apt-status ${apt.status}`}>{apt.status.toUpperCase()}</span>
                      <span className="apt-date">{apt.date} at {apt.time}</span>
                    </div>
                    <div className="apt-details">
                      <div><strong>Doctor:</strong> {apt.doctorName} ({apt.doctorSpec})</div>
                      <div><strong>Type:</strong> {apt.appointmentType}</div>
                      {apt.concern && <div><strong>Concern:</strong> {apt.concern}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BOOK APPOINTMENT */}
        {activeTab === "book" && (
          <div className="portal-card">
            {/* Stepper */}
            <div className="portal-stepper">
              {["Personal Info","Doctor & Type","Schedule","Confirm"].map((s, i) => (
                <div key={s} className={`step-item ${i === step ? "active" : i < step ? "done" : ""}`}>
                  <div className="step-circle">{i < step ? "✓" : i + 1}</div>
                  <div className="step-label">{s}</div>
                  {i < 3 && <div className="step-line" />}
                </div>
              ))}
            </div>

            {/* Step 0 */}
            {step === 0 && (
              <>
                <div className="step-title">Personal Information</div>
                <div className="step-sub">Fill in your details.</div>
                <div className="form-row"><div className="form-group"><label>First Name *</label><input className="form-input" value={info.firstName} onChange={e => updateInfo("firstName", e.target.value)} /></div><div className="form-group"><label>Last Name *</label><input className="form-input" value={info.lastName} onChange={e => updateInfo("lastName", e.target.value)} /></div></div>
                <div className="form-row"><div className="form-group"><label>Date of Birth *</label><input className="form-input" type="date" value={info.dob} onChange={e => updateInfo("dob", e.target.value)} /></div><div className="form-group"><label>Sex *</label><select className="form-select" value={info.sex} onChange={e => updateInfo("sex", e.target.value)}><option value="">Select</option><option>Male</option><option>Female</option></select></div></div>
                <div className="form-row"><div className="form-group"><label>Phone *</label><input className="form-input" value={info.phone} onChange={e => updateInfo("phone", e.target.value)} /></div><div className="form-group"><label>Email</label><input className="form-input" value={info.email} disabled /></div></div>
                <div className="portal-divider" />
                <div className="step-subtitle">Emergency Contact</div>
                <div className="form-row"><div className="form-group"><label>Name</label><input className="form-input" value={info.emergencyName} onChange={e => updateInfo("emergencyName", e.target.value)} /></div><div className="form-group"><label>Phone</label><input className="form-input" value={info.emergencyPhone} onChange={e => updateInfo("emergencyPhone", e.target.value)} /></div></div>
              </>
            )}

            {/* Step 1 */}
            {step === 1 && (
              <>
                <div className="step-title">Select Doctor & Type</div>
                <div className="form-group"><label>Appointment Type *</label><div className="type-grid">{APPT_TYPES.map(t => <div key={t} className={`type-chip ${apptType === t ? "active" : ""}`} onClick={() => setApptType(t)}>{t}</div>)}</div></div>
                <div className="form-group"><label>Doctor *</label><div className="doctor-select-list">{DOCTORS.map(d => <div key={d.id} className={`doctor-select-card ${selectedDoctor?.id === d.id ? "active" : ""}`} onClick={() => setSelectedDoctor(d)}><div className="dsc-avatar" style={{ background: d.color }}>{d.init}</div><div><div className="dsc-name">{d.name}</div><div className="dsc-spec">{d.spec}</div></div>{selectedDoctor?.id === d.id && <div className="dsc-check">✓</div>}</div>)}</div></div>
                <div className="form-group"><label>Concern</label><textarea className="form-input" rows="3" value={concern} onChange={e => setConcern(e.target.value)} /></div>
              </>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <>
                <div className="step-title">Pick a Schedule</div>
                <div className="form-group"><label>Date *</label><input className="form-input" type="date" value={apptDate} min={new Date().toISOString().split("T")[0]} onChange={e => setApptDate(e.target.value)} /></div>
                <div className="form-group"><label>Time *</label><div className="time-grid">{TIME_SLOTS.map(t => <div key={t} className={`time-slot ${apptTime === t ? "active" : ""}`} onClick={() => setApptTime(t)}>{t}</div>)}</div></div>
              </>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <>
                <div className="step-title">Confirm</div>
                <div className="confirm-grid">
                  <div className="confirm-section"><div className="confirm-section-label">Patient</div><div className="confirm-row"><span>Name</span><strong>{info.firstName} {info.lastName}</strong></div><div className="confirm-row"><span>DOB</span><strong>{info.dob}</strong></div><div className="confirm-row"><span>Phone</span><strong>{info.phone}</strong></div></div>
                  <div className="confirm-section"><div className="confirm-section-label">Appointment</div><div className="confirm-row"><span>Doctor</span><strong>{selectedDoctor?.name}</strong></div><div className="confirm-row"><span>Type</span><strong>{apptType}</strong></div><div className="confirm-row"><span>Date</span><strong>{apptDate}</strong></div><div className="confirm-row"><span>Time</span><strong>{apptTime}</strong></div></div>
                </div>
              </>
            )}

            {/* Navigation buttons */}
            <div className="portal-nav">
              {step > 0 && <button className="btn-back" onClick={handleBack}>← Back</button>}
              {step < 3 ? (
                <button className="portal-btn" disabled={!canNext()} onClick={handleNext}>Continue →</button>
              ) : (
                <button className="portal-btn submit-btn" onClick={handleSubmitBooking}>Submit Appointment ✓</button>
              )}
            </div>
          </div>
        )}

        {/* PROFILE SETTINGS */}
        {activeTab === "profile" && (
          <div className="portal-card">
            <div className="step-title">My Profile</div>
            {!editMode ? (
              <>
                <div className="profile-info"><strong>Name:</strong> {profile.name}</div>
                <div className="profile-info"><strong>Email:</strong> {user.email}</div>
                <div className="profile-info"><strong>Phone:</strong> {profile.phone || "Not set"}</div>
                <div className="profile-info"><strong>Date of Birth:</strong> {profile.dob || "Not set"}</div>
                <button className="portal-btn" style={{ marginTop: 20 }} onClick={() => { setEditedProfile({ phone: profile.phone, dob: profile.dob }); setEditMode(true); }}>Edit Profile</button>
              </>
            ) : (
              <>
                <div className="form-group"><label>Phone</label><input className="form-input" value={editedProfile.phone} onChange={e => setEditedProfile({...editedProfile, phone: e.target.value})} /></div>
                <div className="form-group"><label>Date of Birth</label><input className="form-input" type="date" value={editedProfile.dob} onChange={e => setEditedProfile({...editedProfile, dob: e.target.value})} /></div>
                <div className="portal-nav" style={{ marginTop: 20 }}>
                  <button className="btn-back" onClick={() => setEditMode(false)}>Cancel</button>
                  <button className="portal-btn" onClick={handleProfileUpdate}>Save Changes</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientPortal;
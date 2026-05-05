import { useState } from "react";
import { getPatients, savePatients, getPatientByEmail } from "../data/storage";
import { useModal } from "../components/ModalContext";
import "./Login.css";

const STAFF_CREDENTIALS = {
  admin: { role: "Admin", name: "Admin User" },
  doctor: { role: "Doctor", name: "Dr. Maria Santos" }
};

function RegisterModal({ onClose, onRegister }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    address: "",
    phone: "",
    dob: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    const existing = getPatients();
    if (existing.find(p => p.email === form.email)) {
      setError("Email already registered");
      return;
    }
    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.address.trim() ||
      !form.phone.trim() ||
      !form.dob ||
      !form.email.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    const fullName = `${form.firstName} ${form.middleName ? form.middleName + " " : ""}${form.lastName}`;
    const newPatient = {
      name: fullName,
      first_name: form.firstName,
      last_name: form.lastName,
      middle_name: form.middleName,
      address: form.address,
      phone: form.phone,
      dob: form.dob,
      email: form.email,
      password: form.password,
      role: "Patient"
    };
    existing.push(newPatient);
    savePatients(existing);
    onRegister();
  };

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <button className="modal-close-x" onClick={onClose}>✕</button>
        <div className="modal-title">Register as Patient</div>
        <div className="modal-sub">Fill in your details to create an account.</div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">First Name *</label><input className="form-input" value={form.firstName} onChange={e => handleChange("firstName", e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Middle Name</label><input className="form-input" value={form.middleName} onChange={e => handleChange("middleName", e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Last Name *</label><input className="form-input" value={form.lastName} onChange={e => handleChange("lastName", e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Address *</label><input className="form-input" value={form.address} onChange={e => handleChange("address", e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Phone *</label><input className="form-input" value={form.phone} onChange={e => handleChange("phone", e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Date of Birth *</label><input className="form-input" type="date" value={form.dob} onChange={e => handleChange("dob", e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Email (used as login) *</label><input className="form-input" type="email" value={form.email} onChange={e => handleChange("email", e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Password *</label><input className="form-input" type="password" value={form.password} onChange={e => handleChange("password", e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Confirm Password *</label><input className="form-input" type="password" value={form.confirmPassword} onChange={e => handleChange("confirmPassword", e.target.value)} /></div>
          </div>
          {error && <div style={{ color: "var(--rose)", fontSize: 12, marginBottom: 12 }}>{error}</div>}
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Register</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [error, setError] = useState("");
  const { showAlert } = useModal();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const prefix = email.split("@")[0].toLowerCase();
    if (STAFF_CREDENTIALS[prefix] && password === "123") {
      const staff = STAFF_CREDENTIALS[prefix];
      onLogin({ role: staff.role, email, name: staff.name });
      return;
    }

    const patient = getPatientByEmail(email);
    if (patient && patient.password === password) {
      onLogin({ role: "Patient", email, name: patient.name });
      return;
    }

    setError("Invalid credentials. For staff, use admin@any.com / 123, doctor@ / 123. Or register as patient.");
  };

  const handleRegistration = async () => {
    setShowRegister(false);
    await showAlert("Registration successful! You can now log in.", "Success");
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-brand-icon">🏥</div>
          <div>
            <h1 className="login-brand-name">MediCare</h1>
            <p className="login-brand-sub">Hospital Management System</p>
          </div>
        </div>
        <h2 className="login-title">Welcome back</h2>
        <p className="login-sub">Sign in with your email and password.</p>
        <form onSubmit={handleSubmit}>
          <div className="field-wrap">
            <div className="field-label">Email Address</div>
            <input className="field-input" type="email" placeholder="admin@medicare.ph" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field-wrap">
            <div className="field-label">Password</div>
            <input className="field-input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <div style={{ color: "#f87171", fontSize: 12, marginBottom: 12 }}>{error}</div>}
          <button className="login-btn" type="submit">Sign In</button>
        </form>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button className="btn btn-outline" onClick={() => setShowRegister(true)}>Register as Patient</button>
        </div>
        <p className="login-footer">MediCare v2.0 · Philippine General Hospital</p>
      </div>
      {showRegister && (
        <RegisterModal
          onClose={() => setShowRegister(false)}
          onRegister={handleRegistration}
        />
      )}
    </div>
  );
}

export default Login;
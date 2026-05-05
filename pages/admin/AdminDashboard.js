import { useState, useEffect } from "react";
import { getAppointments } from "../../data/storage";
import "./Admin.css";

function AdminDashboard() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    setAppointments(getAppointments());
  }, []);

  const stats = [
    { label: "Total Appointments", value: appointments.length, change: "Real-time", up: true, fill: "#3b82f6", width: "72%" },
    { label: "Pending", value: appointments.filter(a => a.status === "pending").length, change: "Awaiting confirmation", up: true, fill: "#f59e0b", width: "48%" },
    { label: "Confirmed", value: appointments.filter(a => a.status === "confirmed").length, change: "Approved", up: true, fill: "#10b981", width: "60%" },
    { label: "Cancelled", value: appointments.filter(a => a.status === "cancelled").length, change: "Cancelled", up: false, fill: "#f43f5e", width: "24%" },
  ];

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <div className="page-title">Admin Dashboard</div>
          <div className="page-sub">Overview of all appointments</div>
        </div>
      </div>
      <div className="stat-grid">
        {stats.map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className={`stat-change ${s.up ? "up" : "down"}`}>{s.change}</div>
            <div className="stat-bar"><div className="stat-bar-fill" style={{ width: s.width, background: s.fill }} /></div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-header"><div className="card-title">Recent Appointments</div><div className="card-action">View all →</div></div>
        <table className="data-table">
          <thead><tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th></tr></thead>
          <tbody>
            {appointments.slice(0,5).map(a => (
              <tr key={a.id}>
                <td><strong>{a.patientName}</strong><br/>{a.patientEmail}</td>
                <td>{a.doctorName}</td>
                <td>{a.date}</td><td>{a.time}</td>
                <td><span className={`badge ${a.status}`}>{a.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;
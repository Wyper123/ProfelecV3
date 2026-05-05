import { useState, useEffect, useCallback } from "react";
import { getNotifications } from "../data/storage";
import "./AppShell.css";

const getCurrentDate = () => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date().toLocaleDateString(undefined, options);
};

const pageTitles = {
  dashboard:    { title: "Dashboard",    sub: getCurrentDate() },
  appointments: { title: "Appointments", sub: "Manage patient appointments" },
  doctors:      { title: "Doctors",      sub: "Hospital doctor directory" },
  schedule:     { title: "Schedule",     sub: "Weekly doctor schedules" },
  patients:     { title: "Patients",     sub: "Registered patient directory" },
  reports:      { title: "Reports",      sub: "Analytics and performance" },
  settings:     { title: "Settings",     sub: "System configuration" },
  mySchedule:   { title: "My Schedule",  sub: "Your weekly availability" },
  myAppointments: { title: "My Appointments", sub: "Appointments assigned to you" },
  myPatients:   { title: "My Patients",  sub: "Patients under your care" },
  profile:      { title: "My Profile",   sub: "Your account details" },
  information:  { title: "My Information", sub: "Manage your details" },
  records:      { title: "Medical Records", sub: "Your health history" },
  book:         { title: "Book Appointment", sub: "Schedule a new visit" },
};

const roleAccent = {
  Admin:   { bg: "#0f1f3d", accent: "#3b82f6" },
  Doctor:  { bg: "#0c2340", accent: "#0ea5e9" },
  Patient: { bg: "#0f1f3d", accent: "#3b82f6" },
};

function AppShell({ user, navItems, page, setPage, onLogout, children }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const info = pageTitles[page] || { title: page, sub: "" };
  const colors = roleAccent[user.role] || roleAccent.Admin;

  useEffect(() => {
    setNotifications(getNotifications());
  }, [page]);

  const toggleNotif = () => setShowNotif(prev => !prev);
  const toggleMenu = () => setShowMenu(prev => !prev);

  // Handle "My Profile" click – navigate to appropriate page
  const handleProfileClick = useCallback(() => {
    setShowMenu(false);
    if (user.role === 'Admin') {
      setPage('settings');
    } else if (user.role === 'Patient') {
      setPage('information');
    } else {
      setPage('profile');
    }
  }, [user.role, setPage]);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* SIDEBAR */}
      <div className="sidebar" style={{ "--sb-bg": colors.bg, "--sb-accent": colors.accent }}>
        <div className="sidebar-brand">
          <div className="brand-icon" style={{ background: colors.accent }}>🏥</div>
          <div className="brand-text">
            <h2>MediCare</h2>
            <p>{user.role} Portal</p>
          </div>
        </div>

        <div className="sidebar-nav">
          {navItems.map((section) => (
            <div key={section.label} className="sidebar-section">
              <div className="sidebar-section-label">{section.label}</div>
              {section.items.map((item) => (
                <div
                  key={item.id}
                  className={`nav-item ${page === item.id ? "active" : ""}`}
                  style={page === item.id ? { "--ni-accent": colors.accent } : {}}
                  onClick={() => setPage(item.id)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                  {item.badge && <span className="nav-badge" style={{ background: colors.accent }}>{item.badge}</span>}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="user-avatar" style={{ background: colors.accent }}>{user.initials}</div>
            <div className="user-info">
              <p className="user-name">{user.name}</p>
              <p className="user-role">{user.role}</p>
            </div>
          </div>
          <button className="logout-btn" onClick={onLogout} title="Sign Out">↩</button>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--surface)" }}>
        {/* NAVBAR */}
        <div className="navbar">
          <div>
            <div className="navbar-title">{info.title}</div>
            <div className="navbar-subtitle">{info.sub}</div>
          </div>

          <div style={{ marginLeft: "auto", fontSize: 13, color: "var(--muted)", marginRight: 16 }}>
            {getCurrentDate()}
          </div>

          <div className="navbar-actions">
            {/* Notification Button */}
            <div className="nav-action-btn" onClick={toggleNotif} style={{ position: "relative" }}>
              🔔
              {notifications.length > 0 && <div className="notif-dot" />}
              {showNotif && (
                <div className="notif-dropdown">
                  <div className="notif-dropdown-header">Notifications</div>
                  {notifications.length === 0 ? (
                    <div className="notif-item" style={{ justifyContent: "center", color: "var(--muted)" }}>
                      No new notifications
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="notif-item">
                        <span className="notif-icon" style={{ background: item.bg }}>{item.icon}</span>
                        <div className="notif-text">
                          {item.text} <strong>{item.bold}</strong>
                        </div>
                        <div className="notif-time">{item.time}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="nav-user-btn" onClick={toggleMenu}>
              <div className="nav-user-avatar" style={{ background: colors.accent }}>{user.initials}</div>
              <span className="nav-user-name">{user.name}</span>
              <span style={{ fontSize: 10, color: "var(--muted)" }}>▾</span>
              {showMenu && (
                <div className="user-dropdown">
                  <div className="dropdown-info">
                    <div className="dropdown-name">{user.name}</div>
                    <div className="dropdown-role">{user.role}</div>
                  </div>
                  <div className="dropdown-divider" />
                  <div className="dropdown-item" onClick={handleProfileClick}>
                    👤 My Profile
                  </div>
                  <div className="dropdown-divider" />
                  <div className="dropdown-item logout" onClick={onLogout}>↩ Sign Out</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default AppShell;
import { allDoctors, scheduleData } from "./mockData";

const STORAGE_KEYS = {
  PATIENTS: 'hospital_patients',
  APPOINTMENTS: 'hospital_appointments',
  NOTIFICATIONS: 'hospital_notifications',
  DOCTORS: 'hospital_doctors',
  SCHEDULES: 'hospital_schedules'
};

// ----- PATIENTS -----
export function getPatients() {
  const data = localStorage.getItem(STORAGE_KEYS.PATIENTS);
  return data ? JSON.parse(data) : [];
}

export function savePatients(patients) {
  localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
}

export function getPatientByEmail(email) {
  const patients = getPatients();
  return patients.find(p => p.email === email);
}

export function updatePatient(email, updatedData) {
  const patients = getPatients();
  const index = patients.findIndex(p => p.email === email);
  if (index !== -1) {
    patients[index] = { ...patients[index], ...updatedData };
    savePatients(patients);
    return true;
  }
  return false;
}

// ----- APPOINTMENTS -----
export function getAppointments() {
  const data = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
  return data ? JSON.parse(data) : [];
}

export function saveAppointments(appointments) {
  localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
}

export function addAppointment(appointment) {
  const appointments = getAppointments();
  const newId = 'APT-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
  const newAppt = {
    ...appointment,
    id: newId,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  appointments.push(newAppt);
  saveAppointments(appointments);

  addNotification({
    icon: '📅',
    bg: '#dbeafe',
    text: `New appointment booked by`,
    bold: appointment.patientName,
    time: 'just now',
    createdAt: new Date().toISOString()
  });

  return newId;
}

export function updateAppointmentStatus(id, status) {
  const appointments = getAppointments();
  const index = appointments.findIndex(a => a.id === id);
  if (index !== -1) {
    const appt = appointments[index];
    appointments[index].status = status;
    saveAppointments(appointments);

    const action = status === 'confirmed' ? 'Confirmed' : 'Cancelled';
    addNotification({
      icon: status === 'confirmed' ? '✅' : '❌',
      bg: status === 'confirmed' ? '#dcfce7' : '#fee2e2',
      text: `Appointment ${action} for`,
      bold: appt.patientName,
      time: 'just now',
      createdAt: new Date().toISOString()
    });

    return true;
  }
  return false;
}

export function getAppointmentsByPatient(patientEmail) {
  return getAppointments().filter(a => a.patientEmail === patientEmail);
}

export function getPendingAppointments() {
  return getAppointments().filter(a => a.status === 'pending');
}

export function getConfirmedAppointments() {
  return getAppointments().filter(a => a.status === 'confirmed');
}

// ----- NOTIFICATIONS -----
export function getNotifications() {
  const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  return data ? JSON.parse(data) : [];
}

export function saveNotifications(notifications) {
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
}

export function addNotification(notification) {
  const notifications = getNotifications();
  notifications.unshift(notification);
  if (notifications.length > 20) notifications.pop();
  saveNotifications(notifications);
}

// ----- DOCTORS -----
export function getDoctors() {
  const data = localStorage.getItem(STORAGE_KEYS.DOCTORS);
  if (!data) {
    saveDoctors(allDoctors);
    return allDoctors;
  }
  return JSON.parse(data);
}

export function saveDoctors(doctors) {
  localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(doctors));
}

export function addDoctor(doctor) {
  const doctors = getDoctors();
  const newId = doctors.length ? Math.max(...doctors.map(d => d.id)) + 1 : 1;
  const newDoctor = { ...doctor, id: newId };
  doctors.push(newDoctor);
  saveDoctors(doctors);
  return newId;
}
export function updateDoctor(id, updatedData) {
  const doctors = getDoctors();
  const index = doctors.findIndex(d => d.id === id);
  if (index !== -1) {
    doctors[index] = { ...doctors[index], ...updatedData };
    saveDoctors(doctors);
    return true;
  }
  return false;
}

export function removeDoctor(id) {
  const doctors = getDoctors();
  const filtered = doctors.filter(d => d.id !== id);
  if (filtered.length < doctors.length) {
    saveDoctors(filtered);
    return true;
  }
  return false;
}

// ----- SCHEDULES -----
export function getSchedules() {
  const data = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
  if (!data) {
    saveSchedules(scheduleData);
    return scheduleData;
  }
  return JSON.parse(data);
}

export function saveSchedules(schedules) {
  localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
}

export function addScheduleSlot(day, slot) {
  const schedules = getSchedules();
  if (!schedules[day]) schedules[day] = [];
  schedules[day].push(slot);
  saveSchedules(schedules);
}


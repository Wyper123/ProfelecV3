// REMOVED: allAppointments, allPatients (fake data replaced by real storage)
// Keep doctors and schedules as reference data.

export const allDoctors = [
  { id: 1, name: "Dr. Maria Santos",    spec: "Cardiology",        color: "#6366f1", init: "MS", days: "Mon–Fri", time: "8AM–5PM",  cases: 34, phone: "+63 2 8888-0001", email: "santos@medicare.ph" },
  { id: 2, name: "Dr. Kevin Lim",       spec: "Neurology",         color: "#0ea5e9", init: "KL", days: "Mon–Thu", time: "9AM–4PM",  cases: 22, phone: "+63 2 8888-0002", email: "lim@medicare.ph"    },
  { id: 3, name: "Dr. Rosa Villanueva", spec: "Pediatrics",        color: "#10b981", init: "RV", days: "Mon–Fri", time: "8AM–12PM", cases: 28, phone: "+63 2 8888-0003", email: "villanueva@medicare.ph" },
  { id: 4, name: "Dr. James Mendoza",   spec: "Orthopedics",       color: "#f59e0b", init: "JM", days: "Tue–Sat", time: "10AM–6PM", cases: 19, phone: "+63 2 8888-0004", email: "mendoza@medicare.ph" },
  { id: 5, name: "Dr. Clara Tan",       spec: "Internal Medicine", color: "#f43f5e", init: "CT", days: "Mon–Fri", time: "8AM–5PM",  cases: 41, phone: "+63 2 8888-0005", email: "tan@medicare.ph"    },
  { id: 6, name: "Dr. Ricky Bautista",  spec: "Dermatology",       color: "#8b5cf6", init: "RB", days: "Wed–Fri", time: "1PM–5PM",  cases: 15, phone: "+63 2 8888-0006", email: "bautista@medicare.ph" },
];

export const scheduleData = {
  mon: [
    { time: "8:00–12:00", doctor: "Dr. Maria Santos",    spec: "Cardiology",        color: "#6366f1", doctorId: 1 },
    { time: "9:00–4:00",  doctor: "Dr. Kevin Lim",       spec: "Neurology",         color: "#0ea5e9", doctorId: 2 },
  ],
  tue: [
    { time: "8:00–12:00", doctor: "Dr. Rosa Villanueva", spec: "Pediatrics",        color: "#10b981", doctorId: 3 },
    { time: "10:00–6:00", doctor: "Dr. James Mendoza",   spec: "Orthopedics",       color: "#f59e0b", doctorId: 4 },
  ],
  wed: [
    { time: "8:00–5:00",  doctor: "Dr. Clara Tan",       spec: "Internal Medicine", color: "#f43f5e", doctorId: 5 },
    { time: "8:00–12:00", doctor: "Dr. Maria Santos",    spec: "Cardiology",        color: "#6366f1", doctorId: 1 },
    { time: "1:00–5:00",  doctor: "Dr. Ricky Bautista",  spec: "Dermatology",       color: "#8b5cf6", doctorId: 6 },
  ],
  thu: [
    { time: "9:00–4:00",  doctor: "Dr. Kevin Lim",       spec: "Neurology",         color: "#0ea5e9", doctorId: 2 },
    { time: "8:00–5:00",  doctor: "Dr. Clara Tan",       spec: "Internal Medicine", color: "#f43f5e", doctorId: 5 },
  ],
  fri: [
    { time: "8:00–12:00", doctor: "Dr. Rosa Villanueva", spec: "Pediatrics",        color: "#10b981", doctorId: 3 },
    { time: "8:00–5:00",  doctor: "Dr. Maria Santos",    spec: "Cardiology",        color: "#6366f1", doctorId: 1 },
    { time: "1:00–5:00",  doctor: "Dr. Ricky Bautista",  spec: "Dermatology",       color: "#8b5cf6", doctorId: 6 },
  ],
};

export const activityFeed = [
  { icon: "📅", bg: "#dbeafe", text: "New appointment booked by", bold: "patient", time: "just now" },
  { icon: "✅", bg: "#dcfce7", text: "Appointment", bold: "confirmed", time: "5 min ago" },
];
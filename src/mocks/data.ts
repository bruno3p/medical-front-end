export type Role = 'patient' | 'doctor';

export interface Patient {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

export interface Doctor {
  id: number;
  name: string;
  email: string;
  specialty: string;
  avatar?: string;
}

export interface MedicalReport {
  id: number;
  name: string;
  details: string;
  patient_id: number;
  doctor_id: number | null; // null quando enviado pelo paciente
  date: string;
  isAiSummarized?: boolean;
  aiPointsOfAttention?: string[];
  originalFileName?: string;
}

export const mockDoctors: Doctor[] = [
  { id: 1, name: 'Dr. Roberto Almeida', email: 'roberto@clinic.com', specialty: 'Cardiologia', avatar: 'https://i.pravatar.cc/150?img=11' },
  { id: 2, name: 'Dra. Fernanda Costa', email: 'fernanda@clinic.com', specialty: 'Dermatologia', avatar: 'https://i.pravatar.cc/150?img=5' },
  { id: 3, name: 'Dr. Carlos Mendes', email: 'carlos@clinic.com', specialty: 'Ortopedia', avatar: 'https://i.pravatar.cc/150?img=14' },
  { id: 4, name: 'Dra. Juliana Silva', email: 'juliana@clinic.com', specialty: 'Pediatria', avatar: 'https://i.pravatar.cc/150?img=32' },
  { id: 5, name: 'Dr. Marcos Paulo', email: 'marcos@clinic.com', specialty: 'Neurologia', avatar: 'https://i.pravatar.cc/150?img=53' }
];

export const mockPatients: Patient[] = [
  { id: 101, name: 'João Silva', email: 'joao@email.com', avatar: 'https://i.pravatar.cc/150?img=12' },
  { id: 102, name: 'Maria Oliveira', email: 'maria@email.com', avatar: 'https://i.pravatar.cc/150?img=9' },
  { id: 103, name: 'Lucas Santos', email: 'lucas@email.com', avatar: 'https://i.pravatar.cc/150?img=60' }
];

export const mockReports: MedicalReport[] = [
  { id: 1001, name: 'Eletrocardiograma', details: 'Ritmo sinusal normal. Sem alterações isquêmicas agudas.', patient_id: 101, doctor_id: 1, date: '2023-10-15' },
  { id: 1002, name: 'Exame Dermatológico', details: 'Presença de nevo atípico no dorso. Recomendada biópsia.', patient_id: 102, doctor_id: 2, date: '2023-11-02' },
  { id: 1003, name: 'Raio-X de Joelho', details: 'Sinais leves de artrose. Sem fraturas evidentes.', patient_id: 101, doctor_id: 3, date: '2024-01-20' },
  { 
    id: 1004, 
    name: 'Ressonância Magnética do Ombro', 
    details: 'Paciente apresenta histórico de dor no ombro direito. O exame demonstra tendinopatia do supraespinhal.', 
    patient_id: 101, 
    doctor_id: null, 
    date: '2024-02-10',
    isAiSummarized: true,
    aiPointsOfAttention: [
      'Tendinopatia do músculo supraespinhal confirmada',
      'Ausência de rupturas tendíneas completas',
      'Derrames articulares leves'
    ],
    originalFileName: 'ressonancia_ombro_2024.pdf'
  }
];

export interface DoctorSettings {
  doctorId: number;
  workDays: number[]; // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  startTime: string; // Ex: '08:00'
  endTime: string; // Ex: '18:00'
  hasLunchBreak: boolean;
  lunchStart: string; // Ex: '12:00'
  lunchEnd: string; // Ex: '14:00'
}

export const mockDoctorSettings: DoctorSettings[] = [
  {
    doctorId: 1, // Dr. Roberto Almeida
    workDays: [1, 2, 3, 4, 5], // Seg a Sex
    startTime: '08:00',
    endTime: '17:00',
    hasLunchBreak: true,
    lunchStart: '12:00',
    lunchEnd: '14:00'
  },
  {
    doctorId: 2, // Dra. Beatriz Santos
    workDays: [1, 2, 3, 4, 5, 6], // Seg a Sáb
    startTime: '09:00',
    endTime: '19:00',
    hasLunchBreak: true,
    lunchStart: '13:00',
    lunchEnd: '14:00'
  },
  {
    doctorId: 3, // Dr. Carlos Mendes
    workDays: [1, 3, 5], // Seg, Qua, Sex
    startTime: '10:00',
    endTime: '20:00',
    hasLunchBreak: false,
    lunchStart: '12:00',
    lunchEnd: '13:00'
  },
  {
    doctorId: 4, // Dra. Juliana Silva (Tem agenda aberta)
    workDays: [2, 4], // Terça e Quinta
    startTime: '08:00',
    endTime: '12:00',
    hasLunchBreak: false,
    lunchStart: '12:00',
    lunchEnd: '13:00'
  },
  {
    doctorId: 5, // Dr. Marcos Paulo (Sem agenda / fechada)
    workDays: [], // Nenhum dia configurado
    startTime: '08:00',
    endTime: '18:00',
    hasLunchBreak: true,
    lunchStart: '12:00',
    lunchEnd: '13:00'
  }
];

export interface Appointment {
  id: number;
  doctor_id: number;
  patient_id: number | null; // null significa que o horário está livre
  date: string; // Formato YYYY-MM-DD
  time: string; // Formato HH:MM
  status: 'available' | 'booked';
}

// Simulando a agenda de amanhã e depois de amanhã
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const dayAfter = new Date(today);
dayAfter.setDate(dayAfter.getDate() + 2);

const formatDate = (d: Date) => d.toISOString().split('T')[0];

export const mockAppointments: Appointment[] = [
  // Horários Doutor 1
  { id: 1, doctor_id: 1, patient_id: null, date: formatDate(tomorrow), time: '09:00', status: 'available' },
  { id: 2, doctor_id: 1, patient_id: 102, date: formatDate(tomorrow), time: '10:00', status: 'booked' },
  { id: 3, doctor_id: 1, patient_id: null, date: formatDate(tomorrow), time: '11:00', status: 'available' },
  { id: 4, doctor_id: 1, patient_id: 103, date: formatDate(tomorrow), time: '14:00', status: 'booked' },
  { id: 5, doctor_id: 1, patient_id: null, date: formatDate(dayAfter), time: '09:00', status: 'available' },
  
  // Horários Doutor 2
  { id: 6, doctor_id: 2, patient_id: null, date: formatDate(tomorrow), time: '13:00', status: 'available' },
  { id: 7, doctor_id: 2, patient_id: null, date: formatDate(tomorrow), time: '14:00', status: 'available' },
  { id: 8, doctor_id: 2, patient_id: 101, date: formatDate(tomorrow), time: '15:00', status: 'booked' },

  // Horários Doutor 3
  { id: 9, doctor_id: 3, patient_id: 101, date: formatDate(tomorrow), time: '10:00', status: 'booked' },
  { id: 10, doctor_id: 3, patient_id: null, date: formatDate(tomorrow), time: '11:00', status: 'available' },
];

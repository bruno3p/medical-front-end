import { api } from './api';
import type { MedicalReport } from '../mocks/data';

// Helper types for Backend <-> Frontend conversion
interface BackendReport extends Omit<MedicalReport, 'aiPointsOfAttention'> {
  aiPointsOfAttention: string; // JSON string
}

const parseReport = (backendReport: BackendReport): MedicalReport => ({
  ...backendReport,
  aiPointsOfAttention: backendReport.aiPointsOfAttention 
    ? JSON.parse(backendReport.aiPointsOfAttention) 
    : undefined
});

const formatReport = (frontendReport: Partial<MedicalReport>): Partial<BackendReport> => {
  const result: any = { ...frontendReport };
  if (frontendReport.aiPointsOfAttention) {
    result.aiPointsOfAttention = JSON.stringify(frontendReport.aiPointsOfAttention);
  }
  return result;
};

export const ReportService = {
  getByDoctor: async (doctorId: number) => {
    const response = await api.get<BackendReport[]>(`/reports/doctor/${doctorId}`);
    return response.data.map(parseReport);
  },
  getByPatient: async (patientId: number) => {
    const response = await api.get<BackendReport[]>(`/reports/patient/${patientId}`);
    return response.data.map(parseReport);
  },
  getById: async (id: number) => {
    const response = await api.get<BackendReport>(`/reports/${id}`);
    return parseReport(response.data);
  },
  uploadFile: async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<BackendReport>(`/reports/${id}/upload`, formData);
    return parseReport(response.data);
  },
  create: async (data: Omit<MedicalReport, 'id'>) => {
    const response = await api.post<BackendReport>('/reports', formatReport(data));
    return parseReport(response.data);
  },
  update: async (id: number, data: Partial<MedicalReport>) => {
    const response = await api.put<BackendReport>(`/reports/${id}`, formatReport(data));
    return parseReport(response.data);
  },
  search: async (term: string) => {
    const response = await api.get<BackendReport[]>(`/reports/search?name=${encodeURIComponent(term)}`);
    return response.data.map(parseReport);
  }
};

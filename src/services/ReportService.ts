import { api } from './api';
import type { MedicalReport } from '../mocks/data';

// Helper types for Backend <-> Frontend conversion
interface BackendReport extends Omit<MedicalReport, 'aiPointsOfAttention'> {
  aiPointsOfAttention: string; // JSON string
}

const parseReport = (backendReport: any): MedicalReport => {
  let parsedPoints;
  if (Array.isArray(backendReport.aiPointsOfAttention)) {
    parsedPoints = backendReport.aiPointsOfAttention;
  } else if (typeof backendReport.aiPointsOfAttention === 'string' && backendReport.aiPointsOfAttention.trim() !== '') {
    try {
      parsedPoints = JSON.parse(backendReport.aiPointsOfAttention);
    } catch (e) {
      parsedPoints = [backendReport.aiPointsOfAttention];
    }
  }

  return {
    ...backendReport,
    aiPointsOfAttention: parsedPoints,
    isAiSummarized: backendReport.isAiSummarized || (parsedPoints && parsedPoints.length > 0) || false
  };
};

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
    const response = await api.post<any>(`/reports/${id}/upload`, formData);
    
    let responseData = response.data;
    if (typeof responseData === 'string') {
      try {
        responseData = JSON.parse(responseData);
      } catch (e) {
        console.warn('Response is a string but not valid JSON', responseData);
      }
    }
    
    return parseReport(responseData);
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

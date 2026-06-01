import { api } from './api';
import type { MedicalReport } from '../mocks/data';

// Helper types for Backend <-> Frontend conversion
interface BackendReport extends Omit<MedicalReport, 'aiPointsOfAttention'> {
  aiPointsOfAttention: string; // JSON string
}

const parseReport = (backendReport: any): MedicalReport => {
  let parsedPoints;
  
  // O backend pode ter retornado em diferentes formatos ou nomenclaturas:
  const rawPoints = backendReport?.aiPointsOfAttention 
                 || backendReport?.aipointsofattention 
                 || backendReport?.ai_points_of_attention 
                 || backendReport?.summary
                 || backendReport?.points;

  if (Array.isArray(rawPoints)) {
    parsedPoints = rawPoints;
  } else if (typeof rawPoints === 'string' && rawPoints.trim() !== '') {
    try {
      parsedPoints = JSON.parse(rawPoints);
      if (!Array.isArray(parsedPoints)) {
        parsedPoints = [rawPoints];
      }
    } catch (e) {
      // Se não for um JSON válido, transforma a string pura num array de 1 item
      parsedPoints = [rawPoints];
    }
  } else if (typeof rawPoints === 'object' && rawPoints !== null) {
    parsedPoints = [JSON.stringify(rawPoints)];
  }

  const isSummarized = backendReport?.isAiSummarized === true 
                    || backendReport?.isAiSummarized === 'true' 
                    || (parsedPoints && parsedPoints.length > 0) 
                    || false;

  return {
    ...backendReport,
    aiPointsOfAttention: parsedPoints,
    isAiSummarized: isSummarized
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

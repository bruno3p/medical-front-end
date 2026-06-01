import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PatientService } from '../../services/PatientService';
import { ReportService } from '../../services/ReportService';
import { DoctorService } from '../../services/DoctorService';
import type { MedicalReport, Patient, Doctor } from '../../mocks/data';
import { ArrowLeft, FileText, PlusCircle, Activity, Sparkles, UploadCloud, X, Loader2 } from 'lucide-react';
import './PatientDetails.css';

export default function PatientDetails() {
  const { id } = useParams<{ id: string }>();
  const patientId = Number(id);
  
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [reports, setReports] = useState<(MedicalReport & { doctorObj?: Doctor })[]>([]);
  const [attendingDoctors, setAttendingDoctors] = useState<Doctor[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [pat, reps, docs] = await Promise.all([
          PatientService.getById(patientId),
          ReportService.getByPatient(patientId),
          DoctorService.getAll()
        ]);
        
        setPatient(pat);
        
        const doctorIds = Array.from(new Set(reps.map(r => r.doctor_id).filter(Boolean)));
        setAttendingDoctors(docs.filter(d => doctorIds.includes(d.id)));
        
        setReports(reps.map(r => ({ ...r, doctorObj: docs.find(d => d.id === r.doctor_id) })));
      } catch (err) {
        console.error("Erro ao carregar detalhes", err);
      } finally {
        setLoading(false);
      }
    };
    if (patientId) fetchData();
  }, [patientId]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'extracting' | 'analyzing' | 'done'>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (loading) {
    return <div className="flex-center" style={{ height: '50vh' }}><Loader2 className="icon-spin icon-primary" size={40} /></div>;
  }

  if (!patient) {
    return <div>Paciente não encontrado.</div>;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleProcessAI = async () => {
    if (!selectedFile || !patient) return;

    setUploadStatus('uploading');
    
    try {
      // 1. Cria o laudo sem pontos de atenção
      const newReportData = await ReportService.create({
        name: `Documento do Paciente: ${selectedFile.name}`,
        details: 'Laudo externo enviado pelo paciente e processado pela Inteligência Artificial.',
        patient_id: patient.id,
        doctor_id: null, 
        date: new Date().toISOString().split('T')[0],
        isAiSummarized: false,
        originalFileName: selectedFile.name,
      });

      setUploadStatus('extracting');
      
      // 2. Faz o POST do arquivo para a rota de IA e recebe o laudo processado
      const updatedReport = await ReportService.uploadFile(newReportData.id, selectedFile);
      updatedReport.isAiSummarized = true; // Força a exibição da caixa de IA
      
      setUploadStatus('done');
      setReports([{ ...updatedReport, doctorObj: undefined }, ...reports]);
      
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadStatus('idle');
        setSelectedFile(null);
      }, 1500);

    } catch (err) {
      console.error("Erro ao criar laudo e analisar IA", err);
      alert("Erro ao enviar o laudo para processamento na nuvem.");
      setShowUploadModal(false);
      setUploadStatus('idle');
      setSelectedFile(null);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="page-header flex-between">
        <div>
          <Link to="/app" className="back-link">
            <ArrowLeft size={16} /> Voltar para lista
          </Link>
          <h1>Prontuário: {patient.name}</h1>
          <p>Visão geral e histórico de laudos.</p>
        </div>
        
        <button className="btn-primary flex-center" onClick={() => setShowUploadModal(true)}>
          <PlusCircle size={18} /> Novo Laudo (IA)
        </button>
      </header>

      <div className="details-grid">
        {/* Lado Esquerdo: Info e Médicos */}
        <div className="details-sidebar">
          <div className="dashboard-section mb-4">
            <div className="flex-center-gap mb-3">
              <img src={patient.avatar} alt={patient.name} className="avatar" style={{ marginBottom: 0 }} />
              <div>
                <h3 style={{ margin: 0 }}>{patient.name}</h3>
                <span className="text-muted">{patient.email}</span>
              </div>
            </div>
          </div>

          <div className="dashboard-section">
            <div className="section-title" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
              <Activity className="icon" size={18} />
              <h4>Equipe Médica Vinculada</h4>
            </div>
            <div className="patient-list">
              {attendingDoctors.length === 0 && <p className="text-muted">Nenhum médico vinculado.</p>}
              {attendingDoctors.map(doc => (
                <div key={doc.id} className="patient-list-item" style={{ padding: '0.75rem' }}>
                  <div className="patient-info">
                    <img src={doc.avatar} alt={doc.name} className="avatar-sm" style={{ width: '36px', height: '36px' }} />
                    <div>
                      <h4 style={{ fontSize: '0.9rem' }}>{doc.name}</h4>
                      <p className="text-muted" style={{ fontSize: '0.8rem' }}>{doc.specialty}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lado Direito: Timeline de Laudos */}
        <div className="details-main dashboard-section">
          <div className="section-title">
            <FileText className="icon" />
            <h2>Histórico de Laudos</h2>
          </div>

          <div className="timeline">
            {reports.length === 0 ? (
              <p className="text-muted">Nenhum laudo encontrado para este paciente.</p>
            ) : (
              [...reports].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(report => {
                const doc = report.doctorObj;
                return (
                  <div key={report.id} className={`timeline-item ${report.isAiSummarized ? 'ai-item' : ''}`}>
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <h4>{report.name}</h4>
                        <div className="timeline-meta">
                          {report.isAiSummarized && (
                            <span className="badge-ai"><Sparkles size={14}/> Resumo IA</span>
                          )}
                          <span className="timeline-date">{new Date(report.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                      
                      <p className="timeline-details">{report.details}</p>

                      {/* Exibição Estruturada da IA */}
                      {(report.isAiSummarized || (report.aiPointsOfAttention && report.aiPointsOfAttention.length > 0)) ? (
                        <div className="ai-summary-box">
                          <h5>📌 Pontos de Atenção (Extraídos automaticamente):</h5>
                          {report.aiPointsOfAttention && report.aiPointsOfAttention.length > 0 ? (
                            <ul>
                              {report.aiPointsOfAttention.map((point, idx) => (
                                <li key={idx}>{point}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-muted">A IA processou o documento, mas não foi possível exibir os tópicos neste momento.</p>
                          )}
                          <div className="original-file-action">
                            <button className="btn-outline-sm" onClick={() => alert('Abrindo PDF original: ' + report.originalFileName)}>
                              <FileText size={14} /> Ver Laudo Original (PDF)
                            </button>
                            <span className="text-muted">{report.originalFileName}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="upload-to-report mt-3">
                          <label className="btn-outline-sm" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
                            <UploadCloud size={14} style={{ marginRight: '4px' }} /> 
                            Enviar PDF para Resumo IA
                            <input 
                              type="file" 
                              accept="application/pdf" 
                              style={{ display: 'none' }} 
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                  alert('Enviando para processamento...');
                                  const updatedReport = await ReportService.uploadFile(report.id, file);
                                  updatedReport.isAiSummarized = true; // Força a exibição
                                  setReports(prev => prev.map(r => r.id === report.id ? { ...updatedReport, doctorObj: r.doctorObj } : r));
                                  alert('Laudo processado com sucesso!');
                                } catch (err) {
                                  console.error('Erro ao fazer upload:', err);
                                  alert('Erro ao processar laudo.');
                                }
                              }} 
                            />
                          </label>
                        </div>
                      )}

                      <div className="timeline-footer mt-2">
                        {doc ? (
                          <>
                            <img src={doc.avatar} alt={doc.name} className="avatar-xs" />
                            <span className="text-muted">Emitido por {doc.name}</span>
                          </>
                        ) : (
                          <span className="text-muted">Enviado externamente</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modal de Upload com IA */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal-content upload-modal">
            <button className="modal-close" onClick={() => {
              if (uploadStatus === 'idle' || uploadStatus === 'done') {
                setShowUploadModal(false);
                setSelectedFile(null);
                setUploadStatus('idle');
              }
            }}>
              <X size={24} />
            </button>
            
            <div className="modal-header">
              <Sparkles size={32} className="icon-ai" />
              <h3>Processar Novo Laudo</h3>
              <p className="text-muted">Envie um PDF de exames de outros médicos para gerar um resumo inteligente.</p>
            </div>

            <div className="modal-body">
              {uploadStatus === 'idle' && (
                <div className="upload-dropzone">
                  <UploadCloud size={48} className="upload-icon" />
                  <h4>Selecione um arquivo PDF</h4>
                  <input type="file" accept=".pdf" onChange={handleFileChange} id="file-upload" className="file-input" />
                  <label htmlFor="file-upload" className="btn-outline mt-2">Procurar Arquivo</label>
                  {selectedFile && <p className="mt-2 text-success">Arquivo selecionado: {selectedFile.name}</p>}
                </div>
              )}

              {uploadStatus !== 'idle' && (
                <div className="ai-processing-state">
                  {uploadStatus === 'done' ? (
                    <div className="success-state">
                      <Sparkles size={48} className="icon-ai mb-2" />
                      <h4>Laudo Processado com Sucesso!</h4>
                      <p>Os pontos de atenção foram extraídos.</p>
                    </div>
                  ) : (
                    <div className="loading-state">
                      <Loader2 size={48} className="icon-spin icon-primary mb-2" />
                      <h4>
                        {uploadStatus === 'uploading' && 'Enviando arquivo seguro...'}
                        {uploadStatus === 'extracting' && 'Extraindo texto do PDF...'}
                        {uploadStatus === 'analyzing' && 'Lendo e estruturando com IA...'}
                      </h4>
                      <div className="progress-bar-container mt-2">
                        <div className={`progress-bar ${uploadStatus}`}></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {uploadStatus === 'idle' && (
              <div className="modal-footer mt-4">
                <button className="btn-outline" onClick={() => setShowUploadModal(false)}>Cancelar</button>
                <button className="btn-primary" disabled={!selectedFile} onClick={handleProcessAI}>
                  <Sparkles size={18} /> Analisar e Salvar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockPatients, mockReports, mockDoctors } from '../../mocks/data';
import type { MedicalReport } from '../../mocks/data';
import { ArrowLeft, FileText, PlusCircle, Activity, Sparkles, UploadCloud, X, Loader2 } from 'lucide-react';
import './PatientDetails.css';

export default function PatientDetails() {
  const { id } = useParams<{ id: string }>();
  const patientId = Number(id);
  
  const patient = mockPatients.find(p => p.id === patientId);
  const initialReports = mockReports.filter(r => r.patient_id === patientId);
  
  const [reports, setReports] = useState<MedicalReport[]>(initialReports);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'extracting' | 'analyzing' | 'done'>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Encontrar outros médicos que atenderam esse paciente
  const doctorIds = Array.from(new Set(reports.map(r => r.doctor_id).filter(Boolean)));
  const attendingDoctors = mockDoctors.filter(d => doctorIds.includes(d.id));

  if (!patient) {
    return <div>Paciente não encontrado.</div>;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleProcessAI = () => {
    if (!selectedFile) return;

    setUploadStatus('uploading');
    
    // Simulação do fluxo de processamento de IA
    setTimeout(() => {
      setUploadStatus('extracting');
      
      setTimeout(() => {
        setUploadStatus('analyzing');
        
        setTimeout(() => {
          setUploadStatus('done');
          
          // Criar novo laudo simulado
          const newReport: MedicalReport = {
            id: Date.now(),
            name: `Análise IA: ${selectedFile.name}`,
            details: 'Laudo externo processado e resumido pela Inteligência Artificial.',
            patient_id: patientId,
            doctor_id: null, // Enviado de forma autônoma
            date: new Date().toISOString().split('T')[0],
            isAiSummarized: true,
            originalFileName: selectedFile.name,
            aiPointsOfAttention: [
              'Valores de glicemia ligeiramente alterados',
              'Sinais vitais dentro da normalidade',
              'Recomenda-se acompanhamento nutricional'
            ]
          };
          
          setReports([newReport, ...reports]);

          setTimeout(() => {
            setShowUploadModal(false);
            setUploadStatus('idle');
            setSelectedFile(null);
          }, 1500);

        }, 2000);
      }, 1500);
    }, 1000);
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
              reports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(report => {
                const doc = mockDoctors.find(d => d.id === report.doctor_id);
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
                      {report.isAiSummarized && report.aiPointsOfAttention && (
                        <div className="ai-summary-box">
                          <h5>📌 Pontos de Atenção (Extraídos automaticamente):</h5>
                          <ul>
                            {report.aiPointsOfAttention.map((point, idx) => (
                              <li key={idx}>{point}</li>
                            ))}
                          </ul>
                          <div className="original-file-action">
                            <button className="btn-outline-sm" onClick={() => alert('Abrindo PDF original: ' + report.originalFileName)}>
                              <FileText size={14} /> Ver Laudo Original (PDF)
                            </button>
                            <span className="text-muted">{report.originalFileName}</span>
                          </div>
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

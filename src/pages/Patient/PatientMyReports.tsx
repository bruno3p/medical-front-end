import { useState } from 'react';
import { mockReports, mockDoctors } from '../../mocks/data';
import type { MedicalReport } from '../../mocks/data';
import { FileText, PlusCircle, Sparkles, UploadCloud, X, Loader2 } from 'lucide-react';
import './PatientDetails.css'; // Reusing the same CSS for timeline and modals

export default function PatientMyReports() {
  // Simular que o paciente 101 está logado
  const loggedPatientId = 101;
  
  const initialReports = mockReports.filter(r => r.patient_id === loggedPatientId);
  const [reports, setReports] = useState<MedicalReport[]>(initialReports);
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'extracting' | 'analyzing' | 'done'>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleProcessAI = () => {
    if (!selectedFile) return;

    setUploadStatus('uploading');
    
    setTimeout(() => {
      setUploadStatus('extracting');
      setTimeout(() => {
        setUploadStatus('analyzing');
        setTimeout(() => {
          setUploadStatus('done');
          
          const newReport: MedicalReport = {
            id: Date.now(),
            name: `Documento do Paciente: ${selectedFile.name}`,
            details: 'Laudo externo enviado pelo paciente e processado pela Inteligência Artificial.',
            patient_id: loggedPatientId,
            doctor_id: null, 
            date: new Date().toISOString().split('T')[0],
            isAiSummarized: true,
            originalFileName: selectedFile.name,
            aiPointsOfAttention: [
              'Exame sem alterações significativas',
              'Leve deficiência de vitamina D'
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
          <h1>Meus Laudos e Exames</h1>
          <p>Gerencie seus documentos médicos para compartilhar com seus doutores.</p>
        </div>
        
        <button className="btn-primary flex-center" onClick={() => setShowUploadModal(true)}>
          <PlusCircle size={18} /> Enviar Exame (IA)
        </button>
      </header>

      <section className="dashboard-section mt-4">
        <div className="section-title">
          <FileText className="icon" />
          <h2>Meu Histórico de Laudos</h2>
        </div>

        <div className="timeline mt-4">
          {reports.length === 0 ? (
            <p className="text-muted">Você ainda não possui laudos enviados.</p>
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
                        <span className="text-muted">Enviado por você</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Modal de Upload */}
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
              <h3>Enviar Exame Externo</h3>
              <p className="text-muted">Envie os resultados dos seus exames de outros locais. Nossa IA vai estruturá-los para seus médicos lerem mais rápido.</p>
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
                      <h4>Exame Processado com Sucesso!</h4>
                      <p>Agora seus médicos podem visualizar os pontos principais.</p>
                    </div>
                  ) : (
                    <div className="loading-state">
                      <Loader2 size={48} className="icon-spin icon-primary mb-2" />
                      <h4>
                        {uploadStatus === 'uploading' && 'Enviando arquivo seguro...'}
                        {uploadStatus === 'extracting' && 'Extraindo texto do PDF...'}
                        {uploadStatus === 'analyzing' && 'Analisando os resultados...'}
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
                  <Sparkles size={18} /> Enviar e Analisar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

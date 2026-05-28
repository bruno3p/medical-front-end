import { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockAppointments, mockDoctors } from '../../mocks/data';
import type { Appointment } from '../../mocks/data';
import { Calendar, Clock, MapPin, XCircle, AlertCircle } from 'lucide-react';
import './PatientAppointments.css';

export default function PatientAppointments() {
  const loggedPatientId = 101; // Mock do paciente logado
  
  // Pegar os agendamentos deste paciente e inicializar o estado
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const apts = mockAppointments.filter(a => a.patient_id === loggedPatientId);
    return apts.sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
  });

  const handleCancel = (aptId: number, date: string, time: string) => {
    const aptDateTime = new Date(`${date}T${time}:00`);
    const now = new Date();
    // Diferença em horas
    const diffHours = (aptDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < 4) {
      alert('Atenção: Só é possível cancelar uma consulta com no mínimo 4 horas de antecedência.');
      return;
    }

    if (window.confirm('Tem certeza que deseja cancelar esta consulta?')) {
      setAppointments(prev => prev.filter(a => a.id !== aptId));
      alert('Consulta cancelada com sucesso!');
    }
  };

  return (
    <div className="dashboard-container">
      <header className="page-header">
        <h1>Meus Agendamentos</h1>
        <p>Acompanhe suas próximas consultas marcadas.</p>
        <div className="alert-info mt-3">
          <AlertCircle size={16} />
          <span>Lembrete: O cancelamento só é permitido com até <strong>4 horas</strong> de antecedência.</span>
        </div>
      </header>

      <section className="dashboard-section">
        {appointments.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} className="text-muted mb-3" />
            <h3>Nenhuma consulta agendada</h3>
            <p className="text-muted">Você ainda não possui consultas marcadas.</p>
            <Link to="/app" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem', textDecoration: 'none' }}>
              Encontrar um Médico
            </Link>
          </div>
        ) : (
          <div className="appointments-list">
            {appointments.map(apt => {
              const doc = mockDoctors.find(d => d.id === apt.doctor_id);
              if (!doc) return null;
              
              const dateObj = new Date(apt.date + 'T12:00:00');
              const dayStr = dateObj.toLocaleDateString('pt-BR');
              
              return (
                <div key={apt.id} className="appointment-card">
                  <div className="apt-date-box">
                    <span className="apt-day">{dateObj.getDate()}</span>
                    <span className="apt-month">{dateObj.toLocaleDateString('pt-BR', { month: 'short' })}</span>
                  </div>
                  
                  <div className="apt-details">
                    <div className="apt-doc-info">
                      <img src={doc.avatar} alt={doc.name} className="avatar-sm" />
                      <div>
                        <h4>{doc.name}</h4>
                        <span className="badge">{doc.specialty}</span>
                      </div>
                    </div>
                    
                    <div className="apt-meta-info">
                      <div className="meta-item">
                        <Calendar size={16} /> {dayStr}
                      </div>
                      <div className="meta-item">
                        <Clock size={16} /> {apt.time}
                      </div>
                      <div className="meta-item text-muted">
                        <MapPin size={16} /> Clínica MediCare
                      </div>
                    </div>
                  </div>
                  
                  <div className="apt-actions">
                    <button 
                      className="btn-cancel" 
                      onClick={() => handleCancel(apt.id, apt.date, apt.time)}
                      title="Cancelar Consulta"
                    >
                      <XCircle size={20} />
                      <span className="cancel-text">Cancelar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

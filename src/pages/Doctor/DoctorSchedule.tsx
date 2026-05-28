import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockDoctors, mockAppointments, mockDoctorSettings } from '../../mocks/data';
import type { Appointment } from '../../mocks/data';
import { ArrowLeft, Calendar, Clock, CheckCircle, ChevronLeft, ChevronRight, X } from 'lucide-react';
import './DoctorSchedule.css';

export default function DoctorSchedule() {
  const { id } = useParams<{ id: string }>();
  const doctorId = Number(id);
  const doctor = mockDoctors.find(d => d.id === doctorId);
  const docSettings = mockDoctorSettings.find(s => s.doctorId === doctorId);

  const loggedPatientId = 101;

  const [appointments, setAppointments] = useState<Appointment[]>(
    mockAppointments.filter(a => a.doctor_id === doctorId)
  );

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());

  if (!doctor || !docSettings) {
    return <div>Médico ou configurações não encontradas.</div>;
  }

  // Funções de Calendário
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    // Empty slots before 1st day
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateString = date.toISOString().split('T')[0];
      const isPast = date < today;
      const isWorkDay = docSettings.workDays.includes(date.getDay());
      const isSelectable = !isPast && isWorkDay;

      days.push({ day: i, dateString, isSelectable });
    }
    return days;
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Geração de Horários para o dia selecionado
  const generateSlots = (dateStr: string) => {
    const slots = [];
    const startHour = parseInt(docSettings.startTime.split(':')[0]);
    const endHour = parseInt(docSettings.endTime.split(':')[0]);
    const lunchStartHour = parseInt(docSettings.lunchStart.split(':')[0]);
    const lunchEndHour = parseInt(docSettings.lunchEnd.split(':')[0]);

    for (let h = startHour; h < endHour; h++) {
      if (docSettings.hasLunchBreak && h >= lunchStartHour && h < lunchEndHour) {
        continue; // Pula horário de almoço
      }

      const timeStr = `${h.toString().padStart(2, '0')}:00`;
      
      // Verifica se existe consulta marcada neste dia e horário
      const isBooked = appointments.some(a => a.date === dateStr && a.time === timeStr && a.status === 'booked');

      slots.push({
        time: timeStr,
        status: isBooked ? 'booked' : 'available'
      });
    }
    return slots;
  };

  const slotsForDate = selectedDate ? generateSlots(selectedDate) : [];

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    setShowCalendar(false);
    setSelectedTime(''); // Reseta horário ao mudar de dia
  };

  const handleSlotClick = (time: string, status: string) => {
    if (status === 'available') {
      setSelectedTime(time);
      setShowConfirmModal(true);
    }
  };

  const confirmAppointment = () => {
    if (selectedDate && selectedTime) {
      const newApt: Appointment = {
        id: Date.now(),
        doctor_id: doctorId,
        patient_id: loggedPatientId,
        date: selectedDate,
        time: selectedTime,
        status: 'booked'
      };
      setAppointments([...appointments, newApt]);
      setShowConfirmModal(false);

      const emailMsg = `
📧 E-MAIL ENVIADO COM SUCESSO!
======================================
Para: paciente@email.com
Assunto: Confirmação de Consulta - MediCare

Olá! Sua consulta está confirmada.
Médico: ${doctor.name} (${doctor.specialty})
Data: ${selectedDate.split('-').reverse().join('/')}
Horário: ${selectedTime}
Local: Clínica MediCare - Av. Principal, 1000.
======================================
      `;
      console.log(emailMsg);
      alert('Consulta confirmada com sucesso! Verifique o console (F12) para ver o e-mail simulado.');
    }
  };

  return (
    <div className="dashboard-container">
      <header className="page-header">
        <Link to="/app" className="back-link">
          <ArrowLeft size={16} /> Voltar para lista
        </Link>
        <h1>Agendar Consulta</h1>
      </header>

      <section className="dashboard-section profile-banner">
        <img src={doctor.avatar} alt={doctor.name} className="avatar" />
        <div>
          <h2>{doctor.name}</h2>
          <p className="badge">{doctor.specialty}</p>
        </div>
      </section>

      <section className="dashboard-section mt-4">
        <div className="section-title">
          <Calendar className="icon" />
          <h3>Escolha a Data</h3>
        </div>
        
        <button className="btn-outline btn-calendar-trigger" onClick={() => setShowCalendar(true)}>
          <Calendar size={18} />
          {selectedDate ? selectedDate.split('-').reverse().join('/') : 'Selecionar Data no Calendário'}
        </button>

        {selectedDate && (
          <div className="slots-container mt-4">
            <div className="section-title">
              <Clock className="icon" />
              <h3>Horários Disponíveis ({selectedDate.split('-').reverse().join('/')})</h3>
            </div>

            {slotsForDate.length === 0 ? (
              <p className="text-muted">Nenhum horário gerado. O médico não atende neste dia.</p>
            ) : (
              <div className="slots-grid">
                {slotsForDate.map((slot, index) => (
                  <button
                    key={index}
                    className={`slot-btn ${slot.status === 'available' ? 'available' : 'booked'}`}
                    disabled={slot.status === 'booked'}
                    onClick={() => handleSlotClick(slot.time, slot.status)}
                    title={slot.status === 'booked' ? 'Horário Indisponível' : 'Clique para agendar'}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            )}
            
            <div className="legend mt-4">
              <div className="legend-item">
                <div className="legend-color available"></div> Livre
              </div>
              <div className="legend-item">
                <div className="legend-color booked"></div> Ocupado
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Modal do Calendário Completo */}
      {showCalendar && (
        <div className="modal-overlay">
          <div className="modal-content calendar-modal">
            <button className="modal-close" onClick={() => setShowCalendar(false)}>
              <X size={24} />
            </button>
            <div className="calendar-header">
              <button onClick={handlePrevMonth}><ChevronLeft /></button>
              <h3>{currentMonth.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}</h3>
              <button onClick={handleNextMonth}><ChevronRight /></button>
            </div>
            <div className="calendar-grid weekdays">
              {weekDays.map(d => <div key={d} className="calendar-day-header">{d}</div>)}
            </div>
            <div className="calendar-grid days">
              {calendarDays.map((d, i) => (
                <div key={i} className="calendar-cell">
                  {d && (
                    <button 
                      className={`calendar-day-btn ${d.isSelectable ? '' : 'disabled'} ${d.dateString === selectedDate ? 'selected' : ''}`}
                      disabled={!d.isSelectable}
                      onClick={() => handleDateSelect(d.dateString)}
                      title={d.isSelectable ? 'Disponível' : 'Indisponível'}
                    >
                      {d.day}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação */}
      {showConfirmModal && selectedTime && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <CheckCircle size={32} className="icon-success" />
              <h3>Confirmar Agendamento</h3>
            </div>
            <div className="modal-body">
              <p>Você está prestes a agendar uma consulta com:</p>
              <div className="modal-doc-info">
                <strong>{doctor.name}</strong> - {doctor.specialty}
              </div>
              <div className="modal-time-info">
                Data: <strong>{selectedDate.split('-').reverse().join('/')}</strong><br/>
                Horário: <strong>{selectedTime}</strong>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowConfirmModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={confirmAppointment}>Confirmar e Agendar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

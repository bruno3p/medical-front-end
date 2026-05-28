import { useState, useMemo, useRef, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { mockDoctors, mockPatients, mockAppointments, mockReports, mockDoctorSettings } from '../../mocks/data';
import type { Role, Doctor } from '../../mocks/data';
import { Users, Stethoscope, ChevronRight, Search, Filter, ChevronDown, Heart } from 'lucide-react';
import './Dashboard.css';

interface DashboardContext {
  role: Role;
}

// Componente Customizado para Input com Busca + Dropdown
function SearchSelect({ 
  value, 
  onChange, 
  options, 
  placeholder 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  options: string[]; 
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(opt => opt.toLowerCase().includes(value.toLowerCase()));

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="custom-search-select" ref={wrapperRef}>
      <div className="input-wrapper">
        <Search className="input-icon" size={16} />
        <input 
          type="text" 
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        <ChevronDown className="dropdown-icon" size={16} onClick={() => setIsOpen(!isOpen)} />
      </div>
      
      {isOpen && (
        <ul className="dropdown-list">
          {filteredOptions.length > 0 ? (
            filteredOptions.map(opt => (
              <li 
                key={opt} 
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
              >
                {opt}
              </li>
            ))
          ) : (
            <li className="no-options">Nenhuma opção encontrada</li>
          )}
        </ul>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { role } = useOutletContext<DashboardContext>();

  // Mock de usuário logado (Paciente 101)
  const loggedPatientId = 101;

  // Estados de Filtro e Favoritos
  const [searchName, setSearchName] = useState('');
  const [searchSpecialty, setSearchSpecialty] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [favoriteDoctors, setFavoriteDoctors] = useState<Set<number>>(new Set());

  // Função para favoritar/desfavoritar
  const toggleFavorite = (e: React.MouseEvent, doctorId: number) => {
    e.preventDefault(); // Evita que o click no link dispare
    const newFavorites = new Set(favoriteDoctors);
    if (newFavorites.has(doctorId)) {
      newFavorites.delete(doctorId);
    } else {
      newFavorites.add(doctorId);
    }
    setFavoriteDoctors(newFavorites);
  };

  // Lógica de Separação de Médicos (Para o Paciente)
  const { myDoctors, otherDoctors } = useMemo(() => {
    const linkedDoctorIds = new Set<number>();
    
    mockAppointments.forEach(apt => {
      if (apt.patient_id === loggedPatientId) linkedDoctorIds.add(apt.doctor_id);
    });
    
    mockReports.forEach(rep => {
      if (rep.patient_id === loggedPatientId && rep.doctor_id) linkedDoctorIds.add(rep.doctor_id);
    });

    const mine: Doctor[] = [];
    const others: Doctor[] = [];

    mockDoctors.forEach(doc => {
      // É considerado "Meu Médico" se tiver vínculo de dados OU se foi favoritado
      if (linkedDoctorIds.has(doc.id) || favoriteDoctors.has(doc.id)) {
        mine.push(doc);
      } else {
        others.push(doc);
      }
    });

    return { myDoctors: mine, otherDoctors: others };
  }, [favoriteDoctors]);

  // Lógica de Filtro dos "Outros Médicos"
  const filteredOtherDoctors = useMemo(() => {
    return otherDoctors.filter(doc => {
      if (searchName && !doc.name.toLowerCase().includes(searchName.toLowerCase())) return false;
      if (searchSpecialty && !doc.specialty.toLowerCase().includes(searchSpecialty.toLowerCase())) return false;
      
      if (onlyAvailable) {
        const settings = mockDoctorSettings.find(s => s.doctorId === doc.id);
        if (!settings || settings.workDays.length === 0) return false;
      }
      return true;
    });
  }, [otherDoctors, searchName, searchSpecialty, onlyAvailable]);

  const availableNames = Array.from(new Set(otherDoctors.map(d => d.name)));
  const availableSpecialties = Array.from(new Set(otherDoctors.map(d => d.specialty)));

  return (
    <div className="dashboard-container">
      <header className="page-header">
        <h1>{role === 'patient' ? 'Olá, Paciente!' : 'Olá, Doutor(a)!'}</h1>
        <p>Bem-vindo ao seu painel de controle.</p>
      </header>

      {role === 'patient' ? (
        <>
          <section className="dashboard-section mb-4">
            <div className="section-title">
              <Stethoscope className="icon" />
              <h2>Meus Médicos</h2>
            </div>
            
            {myDoctors.length === 0 ? (
              <p className="text-muted">Você ainda não tem consultas, laudos ou médicos favoritos.</p>
            ) : (
              <div className="card-grid">
                {myDoctors.map(doctor => (
                  <Link to={`/app/doctor/${doctor.id}`} key={doctor.id} className="user-card" style={{ textDecoration: 'none' }}>
                    <div className="card-actions">
                      <button 
                        className={`btn-favorite ${favoriteDoctors.has(doctor.id) ? 'active' : ''}`}
                        onClick={(e) => toggleFavorite(e, doctor.id)}
                        title="Remover dos favoritos"
                      >
                        <Heart size={20} fill={favoriteDoctors.has(doctor.id) ? "currentColor" : "none"} />
                      </button>
                    </div>
                    <img src={doctor.avatar} alt={doctor.name} className="avatar" />
                    <div className="card-info">
                      <h3>{doctor.name}</h3>
                      <span className="badge">{doctor.specialty}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="dashboard-section">
            <div className="section-title">
              <Search className="icon" />
              <h2>Encontrar Especialistas</h2>
            </div>

            <div className="search-bar">
              <div className="search-group">
                <label>Nome do Médico</label>
                <SearchSelect 
                  value={searchName} 
                  onChange={setSearchName} 
                  options={availableNames} 
                  placeholder="Buscar por nome" 
                />
              </div>

              <div className="search-group">
                <label>Especialidade</label>
                <SearchSelect 
                  value={searchSpecialty} 
                  onChange={setSearchSpecialty} 
                  options={availableSpecialties} 
                  placeholder="Buscar especialidade" 
                />
              </div>

              <div className="search-group toggle-group">
                <label className="toggle-label">
                  <Filter size={16} /> Disponibilidade
                </label>
                <div className="toggle-switch-wrapper">
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={onlyAvailable}
                      onChange={(e) => setOnlyAvailable(e.target.checked)}
                    />
                    <span className="slider round"></span>
                  </label>
                  <span className="text-sm">Apenas agenda aberta</span>
                </div>
              </div>
            </div>

            {filteredOtherDoctors.length === 0 ? (
              <p className="text-muted mt-4">Nenhum médico encontrado com estes filtros.</p>
            ) : (
              <div className="card-grid mt-4">
                {filteredOtherDoctors.map(doctor => (
                  <Link to={`/app/doctor/${doctor.id}`} key={doctor.id} className="user-card" style={{ textDecoration: 'none' }}>
                    <div className="card-actions">
                      <button 
                        className="btn-favorite"
                        onClick={(e) => toggleFavorite(e, doctor.id)}
                        title="Adicionar aos favoritos"
                      >
                        <Heart size={20} />
                      </button>
                    </div>
                    <img src={doctor.avatar} alt={doctor.name} className="avatar" />
                    <div className="card-info">
                      <h3>{doctor.name}</h3>
                      <span className="badge">{doctor.specialty}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      ) : (
        <section className="dashboard-section">
          <div className="section-title">
            <Users className="icon" />
            <h2>Meus Pacientes</h2>
          </div>

          <div className="patient-list">
            {mockPatients.map(patient => (
              <Link to={`/app/patient/${patient.id}`} key={patient.id} className="patient-list-item">
                <div className="patient-info">
                  <img src={patient.avatar} alt={patient.name} className="avatar-sm" />
                  <div>
                    <h4>{patient.name}</h4>
                    <p className="text-muted">{patient.email}</p>
                  </div>
                </div>
                <ChevronRight className="text-muted" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

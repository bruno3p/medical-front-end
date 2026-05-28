import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, User, LogOut, HeartPulse, ShieldAlert, Calendar, Settings, Menu, X, FileText } from 'lucide-react';
import './DashboardLayout.css';
import type { Role } from '../mocks/data';

// Componente Wrapper para simular estado de autenticação
export default function DashboardLayout() {
  const [role, setRole] = useState<Role>('patient');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    navigate('/');
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="layout-container">
      {/* Header Mobile */}
      <div className="mobile-header">
        <div className="logo-section">
          <HeartPulse size={24} className="logo-icon" />
          <h2>MediCare</h2>
        </div>
        <button className="btn-mobile-menu" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay para fechar o menu no mobile clicando fora */}
      {isMobileMenuOpen && <div className="sidebar-overlay" onClick={closeMobileMenu}></div>}

      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header desktop-only">
          <HeartPulse size={28} className="logo-icon" />
          <h2>MediCare</h2>
        </div>
        
        <nav className="sidebar-nav">
          <Link to="/app" className={`nav-item ${isActive('/app') ? 'active' : ''}`} onClick={closeMobileMenu}>
            <Home size={20} />
            <span>Início</span>
          </Link>
          {role === 'patient' && (
            <>
              <Link to="/app/appointments" className={`nav-item ${isActive('/app/appointments') ? 'active' : ''}`} onClick={closeMobileMenu}>
                <Calendar size={20} />
                <span>Meus Agendamentos</span>
              </Link>
              <Link to="/app/my-reports" className={`nav-item ${isActive('/app/my-reports') ? 'active' : ''}`} onClick={closeMobileMenu}>
                <FileText size={20} />
                <span>Meus Laudos</span>
              </Link>
            </>
          )}
          {role === 'doctor' && (
            <Link to="/app/agenda-setup" className={`nav-item ${isActive('/app/agenda-setup') ? 'active' : ''}`} onClick={closeMobileMenu}>
              <Settings size={20} />
              <span>Minha Agenda</span>
            </Link>
          )}
          <Link to="/app/profile" className={`nav-item ${isActive('/app/profile') ? 'active' : ''}`} onClick={closeMobileMenu}>
            <User size={20} />
            <span>Meu Perfil</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          {/* FAKE TOGGLER PARA TESTES */}
          <div className="role-toggler">
            <span className="toggler-label"><ShieldAlert size={16} /> Teste Visual:</span>
            <select 
              className="toggler-select"
              value={role} 
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option value="patient">Ver como Paciente</option>
              <option value="doctor">Ver como Médico</option>
            </select>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        {/* Passa o role atual via contexto para as rotas filhas usarem */}
        <Outlet context={{ role }} />
      </main>
    </div>
  );
}

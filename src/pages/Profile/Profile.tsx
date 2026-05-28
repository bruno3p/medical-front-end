import React from 'react';
import { useOutletContext } from 'react-router-dom';
import type { Role } from '../../mocks/data';
import { Save, User, Image as ImageIcon } from 'lucide-react';
import './Profile.css';

interface DashboardContext {
  role: Role;
}

export default function Profile() {
  const { role } = useOutletContext<DashboardContext>();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Perfil atualizado com sucesso! (Simulado)');
  };

  return (
    <div className="dashboard-container">
      <header className="page-header">
        <h1>Meu Perfil</h1>
        <p>Atualize suas informações pessoais.</p>
      </header>

      <section className="profile-section">
        <form className="profile-form" onSubmit={handleSave}>
          <div className="profile-avatar-section">
            <div className="avatar-placeholder">
              <User size={40} className="text-muted" />
            </div>
            <button type="button" className="btn-outline">
              <ImageIcon size={18} />
              Alterar Foto
            </button>
          </div>

          <div className="form-grid">
            <div className="input-group">
              <label>Nome Completo</label>
              <input type="text" className="form-input" defaultValue="Usuário Teste" />
            </div>

            <div className="input-group">
              <label>E-mail</label>
              <input type="email" className="form-input" defaultValue="teste@email.com" />
            </div>

            {role === 'doctor' && (
              <div className="input-group">
                <label>Especialidade</label>
                <input type="text" className="form-input" defaultValue="Cardiologia" />
              </div>
            )}

            <div className="input-group">
              <label>Nova Senha</label>
              <input type="password" className="form-input" placeholder="Deixe em branco para não alterar" />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Save size={18} />
              Salvar Alterações
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

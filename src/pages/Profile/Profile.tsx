import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { PatientService } from '../../services/PatientService';
import { DoctorService } from '../../services/DoctorService';
import type { Role } from '../../mocks/data';
import { Save, User, Image as ImageIcon, Loader2 } from 'lucide-react';
import './Profile.css';

interface DashboardContext {
  role: Role;
}

export default function Profile() {
  const { role } = useOutletContext<DashboardContext>();
  const loggedUserId = Number(localStorage.getItem('loggedUserId')) || 1;

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (role === 'patient') {
          const p = await PatientService.getById(loggedUserId);
          setUserData(p);
          setAvatarPreview(p?.avatar || null);
        } else {
          const d = await DoctorService.getById(loggedUserId);
          setUserData(d);
          setAvatarPreview(d?.avatar || null);
        }
      } catch (err) {
        console.error('Erro ao buscar perfil', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [role, loggedUserId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Cria um URL temporário para o preview da imagem
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      setUserData({ ...userData, avatar: previewUrl }); // Num cenário real isso seria um upload multipart
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (role === 'patient') {
        await PatientService.update(loggedUserId, userData);
      } else {
        await DoctorService.update(loggedUserId, userData);
      }
      alert('Perfil atualizado com sucesso no servidor!');
    } catch (err) {
      alert('Erro ao atualizar perfil.');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="flex-center" style={{ height: '50vh' }}><Loader2 className="icon-spin icon-primary" size={40} /></div>;
  }

  if (!userData) {
    return <div>Erro ao carregar perfil.</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="page-header">
        <h1>Meu Perfil</h1>
        <p>Atualize suas informações pessoais.</p>
      </header>

      <section className="profile-section">
        <form className="profile-form" onSubmit={handleSave}>
          <div className="profile-avatar-section">
            <div className="avatar-placeholder" style={{ overflow: 'hidden' }}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={40} className="text-muted" />
              )}
            </div>
            
            {/* Input de arquivo invisível */}
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleImageChange} 
            />
            
            <button 
              type="button" 
              className="btn-outline" 
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon size={18} />
              Alterar Foto
            </button>
          </div>

          <div className="form-grid">
            <div className="input-group">
              <label>Nome Completo</label>
              <input 
                type="text" 
                className="form-input" 
                value={userData.name || ''} 
                onChange={e => setUserData({...userData, name: e.target.value})}
              />
            </div>

            <div className="input-group">
              <label>E-mail</label>
              <input 
                type="email" 
                className="form-input" 
                value={userData.email || ''} 
                onChange={e => setUserData({...userData, email: e.target.value})}
              />
            </div>

            {role === 'doctor' && (
              <div className="input-group">
                <label>Especialidade</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={userData.specialty || ''} 
                  onChange={e => setUserData({...userData, specialty: e.target.value})}
                />
              </div>
            )}

            <div className="input-group">
              <label>Nova Senha</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="Deixe em branco para não alterar" 
                onChange={e => setUserData({...userData, password: e.target.value})}
              />
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

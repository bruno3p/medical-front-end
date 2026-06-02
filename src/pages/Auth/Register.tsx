import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Stethoscope, HeartPulse, Activity } from 'lucide-react';
import { PatientService } from '../../services/PatientService';
import { DoctorService } from '../../services/DoctorService';
import './Auth.css';
import bgImage from '../../assets/login-bg.png';

export default function Register() {
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const validatePassword = (pass: string) => {
    if (pass.length < 8) return 'A senha deve ter no mínimo 8 caracteres.';
    if (!/[A-Z]/.test(pass)) return 'A senha deve conter pelo menos uma letra maiúscula.';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) return 'A senha deve conter pelo menos um caractere especial.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    try {
      if (role === 'patient') {
        await PatientService.create({ name, email, password, avatar: 'https://i.pravatar.cc/150?u=' + email } as any);
      } else {
        await DoctorService.create({ name, email, password, specialty, avatar: 'https://i.pravatar.cc/150?u=' + email } as any);
      }
      alert('Cadastro realizado com sucesso! Faça login.');
      navigate('/');
    } catch (err: any) {
      setError('Erro ao se conectar com o servidor. Tente novamente.');
      console.error(err);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-image-side">
        <img src={bgImage} alt="Medical Background" className="auth-bg-img" />
        <div className="auth-image-overlay"></div>
      </div>
      
      <div className="auth-form-side">
        <div className="auth-header">
          <div className="auth-logo">
            <HeartPulse size={40} />
          </div>
          <h1 className="auth-title">Crie sua conta</h1>
          <p className="auth-subtitle">Junte-se ao nosso sistema de gestão médica.</p>
        </div>

        <div className="role-selector">
          <button 
            type="button" 
            className={`role-btn ${role === 'patient' ? 'active' : ''}`}
            onClick={() => setRole('patient')}
          >
            <User size={18} />
            Paciente
          </button>
          <button 
            type="button" 
            className={`role-btn ${role === 'doctor' ? 'active' : ''}`}
            onClick={() => setRole('doctor')}
          >
            <Stethoscope size={18} />
            Médico
          </button>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 'bold' }}>Atenção:</span> {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <User className="input-icon" />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Seu nome completo" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="input-wrapper">
            <Mail className="input-icon" />
            <input 
              type="email" 
              className="input-field" 
              placeholder="Seu e-mail" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {role === 'doctor' && (
            <div className="input-wrapper">
              <Activity className="input-icon" />
              <input 
                type="text" 
                className="input-field" 
                placeholder="Sua especialidade (ex: Cardiologia)" 
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                required
              />
            </div>
          )}

          <div className="input-wrapper">
            <Lock className="input-icon" />
            <input 
              type="password" 
              className="input-field" 
              placeholder="Crie uma senha" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary">
            Cadastrar como {role === 'patient' ? 'Paciente' : 'Médico'}
          </button>
        </form>

        <div className="auth-footer">
          Já tem uma conta?{' '}
          <Link to="/" className="auth-link">
            Faça login aqui
          </Link>
        </div>
      </div>
    </div>
  );
}

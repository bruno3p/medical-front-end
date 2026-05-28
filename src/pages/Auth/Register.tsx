import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Stethoscope, HeartPulse, Activity } from 'lucide-react';
import './Auth.css';
import bgImage from '../../assets/login-bg.png';

export default function Register() {
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [specialty, setSpecialty] = useState('');

  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/app');
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

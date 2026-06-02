import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, HeartPulse, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import './Auth.css';
import bgImage from '../../assets/login-bg.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Chama a nova rota de login protegida por JWT
      const response = await api.post('/auth/login', { email, password });
      
      const { token, role, user } = response.data;
      
      if (token && user && user.id) {
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', role ? role.toLowerCase() : 'patient');
        localStorage.setItem('loggedUserId', String(user.id));
        
        navigate('/app');
      } else {
        setError('Resposta inválida do servidor.');
      }
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        setError('E-mail ou senha incorretos.');
      } else {
        setError('Erro ao se conectar com o servidor.');
      }
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
          <h1 className="auth-title">Bem-vindo de volta</h1>
          <p className="auth-subtitle">Acesse o sistema para gerenciar laudos e consultas.</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
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

          <div className="input-wrapper">
            <Lock className="input-icon" />
            <input 
              type="password" 
              className="input-field" 
              placeholder="Sua senha" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary">
            Entrar
          </button>
        </form>

        <div className="auth-footer">
          Não tem uma conta?{' '}
          <Link to="/register" className="auth-link">
            Cadastre-se aqui
          </Link>
        </div>
      </div>
    </div>
  );
}

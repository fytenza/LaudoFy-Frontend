// src/pages/Auth/Login.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';
import csrfService from '../../services/scrfService';
import { FiAlertCircle, FiEye, FiEyeOff, FiLock, FiLogIn, FiMail } from 'react-icons/fi';
import ReCAPTCHA from 'react-google-recaptcha';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, usuario } = useAuth();
  const navigate = useNavigate();
  const RECAPTCHA_SITE_KEY='6LcUBBMrAAAAABM98FN5ArSihn2AIcO5xMF7u_Os'
  const [captchaReady, setCaptchaReady] = useState(false)
  const [captchaValido, setCaptchaValido] = useState(false);
  const [csrfCarregado, setCsrfCarregado] = useState(false);

  useEffect(() => {
    
    // Inicializar CSRF token
    const initializeCSRF = async () => {
      try {
        await csrfService.initializeCsrfToken();
        setCsrfCarregado(true);
      } catch (error) {
        setErro('Problema de conexão com o servidor');
      }
    };

    initializeCSRF();
  }, []);

  useEffect(() => {
    if (usuario) {
      navigate('/dashboard');
    }
  }, [usuario]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      const csrfToken = document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1];

      const response = await api.post('/auth/login', { 
        email, 
        senha 
      });

      // Processar resposta de sucesso
      login(response.data.accessToken, response.data.refreshToken);
      navigate('/dashboard');
      
    } catch (error) {
      
      let mensagemErro = 'Erro ao fazer login';
      if (error.response) {
        if (error.response.status === 400) {  // Changed from 401 to 400
          mensagemErro = error.response.data.erro || 'Email ou senha incorretos';
        } else if (error.response.status === 403) {
          mensagemErro = 'Problema de segurança. Por favor, recarregue a página.';
          await csrfService.refreshCsrfToken();
        }
      }
      setErro(mensagemErro);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      {/* Card de Login */}
      <div className="w-full max-w-md px-6 py-8">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          {/* Cabeçalho */}
          <div className="text-center mb-8">
            <div className="mb-4 flex justify-center">
              <div className="p-3 bg-blue-600 rounded-lg shadow">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Bem-vindo ao Laudofy</h1>
            <p className="text-slate-500 text-sm">Sistema de Gestão de Laudos Médicos</p>
          </div>

          {/* Mensagem de erro */}
          {erro && (
            <div className="mb-5 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center">
              <FiAlertCircle className="text-red-500 mr-2 flex-shrink-0" size={16} />
              <span className="text-red-600 text-sm">{erro}</span>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-3">
              {/* Campo Email */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <FiMail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-700 placeholder-slate-400 text-sm transition-all"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              {/* Campo Senha */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <FiLock size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-700 placeholder-slate-400 text-sm transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* Link Esqueci a Senha */}
            <div className="flex justify-end">
              <button 
                type="button"
                onClick={() => navigate('/esqueci-senha')}
                className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
              >
                Esqueceu a senha?
              </button>
            </div>

            {/* Botão de Login */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center items-center py-2.5 px-4 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-sm hover:shadow-md transition-all duration-200 ${
                  loading ? 'opacity-80 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Acessando...
                  </>
                ) : (
                  <>
                    <FiLogIn className="mr-2" size={16} />
                    Entrar no sistema
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Rodapé */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} Fytenza
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';
import { 
  IoArrowBack, 
  IoDocumentTextOutline,
  IoCheckmarkCircleOutline,
  IoDownloadOutline,
  IoPrintOutline,
  IoPersonOutline,
  IoCalendarOutline,
  IoTimeOutline
} from 'react-icons/io5';
import { FaFileMedicalAlt, FaUserAlt } from 'react-icons/fa';

const CriarLaudo = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const exameId = location.state?.exameId;

  const [exame, setExame] = useState(null);
  const [conclusao, setConclusao] = useState('');
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [laudoCriado, setLaudoCriado] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Paleta de cores moderna
  const COLORS = {
    primary: '#3B82F6',
    primaryLight: '#93C5FD',
    primaryDark: '#1D4ED8',
    secondary: '#10B981',
    accent: '#8B5CF6',
    warning: '#F59E0B',
    danger: '#EF4444',
    background: '#F8FAFC',
    cardBg: '#FFFFFF',
    text: '#1E293B',
    muted: '#64748B',
    border: '#E2E8F0'
  };

  useEffect(() => {
    const fetchExame = async () => {
      try {
        setIsLoading(true);
        setErro('');
        
        if (!exameId) {
          throw new Error('ID do exame não fornecido');
        }

        const response = await api.get(`/exames/${exameId}`);
        
        if (!response.data) {
          throw new Error('Exame não encontrado');
        }
        
        setExame(response.data);
      } catch (err) {
        console.error('Erro ao buscar exame:', err);
        
        if (err.response?.status === 401) {
          setErro('Sessão expirada. Redirecionando para login...');
          setTimeout(() => logout(), 2000);
        } else if (err.response?.status === 404) {
          setErro('Exame não encontrado. Verifique o ID fornecido.');
          setTimeout(() => navigate('/exames'), 3000);
        } else if (err.message === 'ID do exame não fornecido') {
          setErro(err.message);
          navigate('/exames');
        } else {
          setErro(err.message || 'Erro ao carregar detalhes do exame');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchExame();
  }, [exameId, navigate, logout]);

  const handleDownloadLaudoOriginal = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(
        `/laudos/${laudoCriado._id}/pdf`,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `laudo_${laudoCriado._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setMensagem('Download iniciado com sucesso');
    } catch (err) {
      if (err.response?.status === 401) {
        setErro('Sessão expirada. Redirecionando para login...');
        setTimeout(() => logout(), 2000);
      } else {
        setErro(err.response?.data?.message || 'Falha ao baixar o laudo');
        console.error('Erro no download:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!exameId) {
      setErro('Selecione um exame para continuar');
      return;
    }
  
    if (!conclusao.trim()) {
      setErro('A conclusão médica é obrigatória e deve ter pelo menos 10 caracteres');
      return;
    }
  
    if (conclusao.trim().length < 10) {
      setErro('A conclusão deve conter pelo menos 10 caracteres');
      return;
    }
  
    try {
      setIsLoading(true);
      setErro('');
      setMensagem('Criando laudo...');
      
      const response = await api.post('/laudos', { 
        exameId,
        conclusao: conclusao.trim()
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
  
      setLaudoCriado(response.data.laudo);
      setMensagem('Laudo criado com sucesso! Gerando PDF...');
  
    } catch (err) {
      console.error('Erro detalhado:', err);
      
      if (err.response) {
        switch (err.response.status) {
          case 400:
            setErro(err.response.data?.erro || 'Dados inválidos. Verifique os campos e tente novamente.');
            break;
            
          case 401:
            setErro('Sessão expirada. Redirecionando para login...');
            setTimeout(() => logout(), 2000);
            break;
            
          case 404:
            setErro('Exame não encontrado');
            break;
            
          case 500:
            setErro('Erro no servidor. Tente novamente mais tarde.');
            break;
            
          default:
            setErro(err.response.data?.message || 'Erro ao processar a requisição');
        }
      } else if (err.request) {
        setErro('Sem resposta do servidor. Verifique sua conexão.');
      } else {
        setErro('Erro ao configurar a requisição: ' + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoltar = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-slate-700 font-medium">Processando...</p>
        </div>
      </div>
    );
  }

  if (!exame) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full text-center border border-slate-200">
          <p className="text-red-500 font-medium mb-4">{erro || 'Carregando informações...'}</p>
          <button
            onClick={handleVoltar}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleVoltar}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <IoArrowBack className="text-lg" />
              <span className="font-medium">Voltar</span>
            </button>
            
            <div className="hidden md:block h-6 w-px bg-slate-300"></div>
            
            <h1 className="text-2xl font-bold text-slate-800">
              Criar Laudo Médico
            </h1>
          </div>
        </div>

        {/* Mensagens de feedback */}
        {erro && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
            <div className="flex items-center">
              <svg className="text-red-500 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700">{erro}</p>
            </div>
          </div>
        )}

        {mensagem && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg mb-6">
            <div className="flex items-center">
              <svg className="text-green-500 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-700">{mensagem}</p>
            </div>
          </div>
        )}

        {!laudoCriado ? (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Seção Informações do Exame */}
            <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <FaFileMedicalAlt className="text-blue-500" />
                Informações do Exame
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-slate-500">
                    <IoPersonOutline />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Paciente</p>
                    <p className="font-semibold text-slate-800">{exame.paciente?.nome || 'Não identificado'}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-slate-500">
                    <IoDocumentTextOutline />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Tipo de Exame</p>
                    <p className="font-semibold text-slate-800">{exame.tipoExame}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-slate-500">
                    <IoCalendarOutline />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Data</p>
                    <p className="font-semibold text-slate-800">
                      {new Date(exame.dataExame).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-slate-500">
                    <IoTimeOutline />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Hora</p>
                    <p className="font-semibold text-slate-800">
                      {new Date(exame.dataExame).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Seção Conclusão */}
            <div className="px-6 py-4 border-t border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <FaFileMedicalAlt className="text-blue-500" />
                Conclusão Médica
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Descreva detalhadamente as suas conclusões <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={conclusao}
                  onChange={(e) => {
                    setConclusao(e.target.value);
                    setErro('');
                  }}
                  className="w-full px-4 py-3 border border-slate-300 text-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  rows="10"
                  placeholder="Descreva os achados do exame, diagnóstico e recomendações..."
                  required
                />
              </div>
            </div>

            {/* Botão de Envio */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-lg font-semibold text-white transition-colors flex items-center justify-center gap-2 ${
                  isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700 shadow-sm'
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    <IoCheckmarkCircleOutline className="text-lg" />
                    <span>Emitir Laudo</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Seção Sucesso */}
            <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <IoCheckmarkCircleOutline className="text-green-500" />
                Laudo Criado com Sucesso
              </h2>
            </div>
            <div className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IoCheckmarkCircleOutline className="text-green-500 text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Laudo registrado no sistema</h3>
                <p className="text-slate-600 mb-6">O laudo foi criado com sucesso e está disponível para download.</p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">                  
                  <button
                    onClick={() => navigate(`/laudos`)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <IoDocumentTextOutline />
                    <span>Ir para laudos</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CriarLaudo;
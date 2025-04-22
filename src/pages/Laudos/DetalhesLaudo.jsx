import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  IoArrowBack, 
  IoCloudUploadOutline, 
  IoReload, 
  IoMail,
  IoDocumentTextOutline,
  IoDownloadOutline,
  IoPersonOutline,
  IoCalendarOutline,
  IoTimeOutline,
  IoCloseOutline
} from 'react-icons/io5';
import { 
  FaFilePdf, 
  FaCheckCircle, 
  FaFileMedicalAlt, 
  FaStethoscope, 
  FaUserAlt,
  FaExclamationTriangle, 
  FaInfoCircle,
  FaHistory
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import Modal from 'react-modal';
import api from '../../api';

// Configuração do modal para acessibilidade
Modal.setAppElement('#root');

const DetalhesLaudo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  
  // Estados principais
  const [laudo, setLaudo] = useState(null);
  const [paciente, setPaciente] = useState(null);
  const [historicoVersoes, setHistoricoVersoes] = useState([]);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para upload
  const fileInputRef = useRef(null);
  const [arquivoSelecionado, setArquivoSelecionado] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Estados para refazer laudo
  const [modalRefazerAberto, setModalRefazerAberto] = useState(false);
  const [novaConclusao, setNovaConclusao] = useState('');
  const [motivoRefacao, setMotivoRefacao] = useState('');
  
  // Estados para email
  const [estaEnviandoEmail, setEstaEnviandoEmail] = useState(false);
  const [mostrarHistorico, setMostrarHistorico] = useState(false);

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

  // Buscar dados do laudo
  const fetchLaudoData = async () => {
    try {
      setIsLoading(true);
      setErro('');
      
      // Buscar laudo
      const responseLaudo = await api.get(`/laudos/${id}`);
      setLaudo(responseLaudo.data);
      setNovaConclusao(responseLaudo.data.conclusao);
      
      // Buscar histórico
      const responseHistorico = await api.get(`/laudos/${id}/historico`);
      setHistoricoVersoes(responseHistorico.data.historico || []);
      
      // Buscar paciente se existir
      if (responseLaudo.data.exame?.paciente) {
        try {
          const responsePaciente = await api.get(`/pacientes/${responseLaudo.data.exame.paciente}`);
          setPaciente(responsePaciente.data);
        } catch (error) {
          console.error('Erro ao buscar paciente:', error);
        }
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setErro('Sessão expirada. Redirecionando para login...');
        setTimeout(() => logout(), 2000);
      } else {
        setErro(err.response?.data?.message || 'Erro ao carregar dados do laudo');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLaudoData();
  }, [id, modalRefazerAberto]);

  // Função para refazer laudo
  const handleRefazerLaudo = async () => {
    try {
      setIsLoading(true);
      setErro('');
      
      const response = await api.post(`/laudos/${id}/refazer`, {
        conclusao: novaConclusao,
        motivo: motivoRefacao
      });
      
      navigate(`/laudos/${response.data.laudo._id}`);
      setMensagem({
        texto: 'Laudo refeito com sucesso! Novo laudo criado.',
        tipo: 'sucesso'
      });
    } catch (err) {
      if (err.response?.status === 401) {
        setErro('Sessão expirada. Redirecionando para login...');
        setTimeout(() => logout(), 2000);
      } else {
        setErro(err.response?.data?.message || 'Erro ao refazer laudo');
      }
    } finally {
      setIsLoading(false);
      setModalRefazerAberto(false);
    }
  };

  // Função para download de laudo
  const handleDownloadLaudo = async (tipo) => {
    try {
      setIsLoading(true);
      setErro('');
      
      // Verifica se é para baixar o original ou assinado
      const url = tipo === 'assinado' 
        ? laudo.laudoAssinado 
        : laudo.laudoOriginal;
  
      if (!url) {
        throw new Error(`Laudo ${tipo} não disponível`);
      }
  
      // Se for uma URL do UploadCare (contém ucarecdn.com)
      if (url.includes('ucarecdn.com')) {
        // Cria link temporário para download
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('target', '_blank'); // abrir em nova aba
        link.setAttribute('download', `laudo_${tipo}_${laudo._id}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setMensagem({
          texto: `Download do laudo ${tipo} iniciado`,
          tipo: 'info'
        });
      } else {
        // Se for um endpoint da API (para compatibilidade com versões antigas)
        const endpoint = tipo === 'assinado' ? 'download/assinado' : 'download/original';
        const response = await api.get(`/laudos/${laudo._id}/${endpoint}`, {
          responseType: 'blob'
        });
  
        const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', `laudo_${tipo}_${laudo._id}.pdf`);
        document.body.appendChild(link);
        link.click();
        
        // Limpeza
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(link);
        
        setMensagem({
          texto: `Download do laudo ${tipo} iniciado`,
          tipo: 'info'
        });
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setErro('Sessão expirada. Redirecionando para login...');
        setTimeout(() => logout(), 2000);
      } else {
        setErro(err.message || `Erro ao baixar laudo ${tipo}`);
      }
    } finally {
      setIsLoading(false);
    }
  }; 

  // Funções para upload de arquivo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setErro('Por favor, envie um arquivo PDF');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErro('O arquivo deve ter no máximo 5MB');
        return;
      }
      setArquivoSelecionado(file);
      setErro('');
      setMensagem({ texto: `Arquivo selecionado: ${file.name}`, tipo: 'info' });
    }
  };

  const handleEnviarArquivo = async () => {
    if (!arquivoSelecionado) {
      setErro('Nenhum arquivo selecionado');
      return;
    }

    try {
      setIsLoading(true);
      setErro('');
      
      const formData = new FormData();
      formData.append('signedFile', arquivoSelecionado);

      const response = await api.post(`/laudos/${id}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });

      setLaudo({
        ...response.data.laudo,
        status: 'Laudo assinado'
      });
      
      setMensagem({
        texto: 'Laudo assinado enviado com sucesso!' + 
          (response.data.notificacao?.status === 'enviado' 
            ? ` Email enviado para ${response.data.notificacao.destinatario}`
            : ''),
        tipo: 'sucesso'
      });
      
      setArquivoSelecionado(null);
      setUploadProgress(0);
    } catch (err) {
      if (err.response?.status === 401) {
        setErro('Sessão expirada. Redirecionando para login...');
        setTimeout(() => logout(), 2000);
      } else {
        setErro(err.response?.data?.message || 'Erro ao enviar laudo assinado');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Função para enviar email
  const handleEnviarEmail = async () => {
    try {
      setEstaEnviandoEmail(true);
      setErro('');
      setMensagem({ texto: '', tipo: '' });
  
      // Verificação básica antes de enviar
      if (!laudo?.laudoAssinado) {
        throw new Error('O laudo precisa estar assinado antes de enviar por e-mail');
      }
  
      const response = await api.post(`/laudos/${id}/enviar-email`);
  
      // Modo sandbox/teste
      if (response.data?.sandbox) {
        setMensagem({
          texto: 'E-mail não enviado (modo teste)',
          tipo: 'info'
        });
        return;
      }
  
      // Atualiza os dados do laudo com a resposta do servidor
      if (response.data.laudo) {
        setLaudo(response.data.laudo);
      }
  
      // Atualiza o histórico
      try {
        const responseHistorico = await api.get(`/laudos/${id}/historico`);
        setHistoricoVersoes(responseHistorico.data.historico);
      } catch (error) {
        console.error('Erro ao atualizar histórico:', error);
      }
  
      // Feedback para o usuário
      setMensagem({
        texto: response.data.message || `E-mail enviado para ${response.data.destinatario}`,
        tipo: 'sucesso'
      });
  
    } catch (error) {
      // Tratamento de erros específicos
      let errorMessage = 'Erro ao enviar e-mail';
      
      if (error.response) {
        // Erros estruturados do backend
        errorMessage = error.response.data.error || error.response.data.message || errorMessage;
        
        // Atualiza o laudo se veio na resposta de erro
        if (error.response.data.laudo) {
          setLaudo(error.response.data.laudo);
        }
      } else if (error.message.includes('timeout')) {
        errorMessage = 'O servidor demorou muito para responder';
      } else if (error.request) {
        errorMessage = 'Sem resposta do servidor';
      } else {
        errorMessage = error.message || errorMessage;
      }
  
      setErro(errorMessage);
      
      // Tenta atualizar o histórico mesmo em caso de erro
      try {
        const responseHistorico = await api.get(`/laudos/${id}/historico`);
        setHistoricoVersoes(responseHistorico.data.historico);
      } catch (err) {
        console.error('Erro ao buscar histórico:', err);
      }
    } finally {
      setEstaEnviandoEmail(false);
    }
  };

  // Funções auxiliares
  const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return null;
    const nascimento = new Date(dataNascimento);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  const obterEnviosEmail = () => {
    if (!Array.isArray(historicoVersoes)) return [];
    return historicoVersoes
      .filter(item => item.acao === 'EnvioEmail')
      .sort((a, b) => new Date(b.data) - new Date(a.data));
  };

  const obterStatusEmail = () => {
    if (!laudo?.laudoAssinado) return null;
    
    const enviosEmail = obterEnviosEmail();
    if (enviosEmail.length === 0) return null;
    
    const ultimoEnvio = enviosEmail[0];
    return {
      status: ultimoEnvio.statusEnvio,
      data: ultimoEnvio.data,
      destinatario: ultimoEnvio.destinatarioEmail,
      mensagemErro: ultimoEnvio.mensagemErro
    };
  };

  // Funções de verificação
  const podeEnviarAssinatura = () => {
    return (
      usuario?.role === 'medico' &&
      laudo?.status === 'Laudo realizado' &&
      !laudo?.laudoAssinado &&
      laudo?.laudoOriginal
    );
  };

  const podeRefazerLaudo = () => {
    return (
      usuario?.role === 'medico' && 
      laudo?.status !== 'Cancelado' &&
      !laudo?.laudoSubstituto &&
      laudo?.status !== 'Laudo refeito'
    );
  };

  const podeReenviarEmail = () => {
    const statusEmail = obterStatusEmail();
    return (
      laudo?.laudoAssinado && 
      (statusEmail?.status === 'Falha' || !statusEmail)
    );
  };

  const statusEmail = obterStatusEmail();
  const enviosEmail = obterEnviosEmail();

  // Renderização condicional para estados de carregamento e erro
  if (isLoading && !laudo) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-slate-700 font-medium">Carregando laudo...</p>
        </div>
      </div>
    );
  }
  
  if (erro && !laudo) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full text-center border border-slate-200">
          <p className="text-red-500 font-medium mb-4">{erro}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }
  
  if (!laudo) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/laudos')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <IoArrowBack className="text-lg" />
              <span className="font-medium">Voltar</span>
            </button>
            
            <div className="hidden md:block h-6 w-px bg-slate-300"></div>
            
            <h1 className="text-2xl font-bold text-slate-800">
              Laudo <span className="text-blue-600">#{laudo._id?.toString()?.substring(0, 8)}</span>
              {laudo.versao > 1 && (
                <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Versão {laudo.versao}
                </span>
              )}
            </h1>
          </div>
          
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            {/* Botão Enviar Email */}
            {laudo.laudoAssinado && (
              <button
                onClick={handleEnviarEmail}
                disabled={estaEnviandoEmail || !podeReenviarEmail()}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-sm ${
                  estaEnviandoEmail 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : podeReenviarEmail()
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                } text-white`}
              >
                {estaEnviandoEmail ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <IoMail className="text-lg" />
                    <span>Enviar por E-mail</span>
                  </>
                )}
              </button>
            )}

            {/* Botão Refazer Laudo */}
            {podeRefazerLaudo() && (
              <button
                onClick={() => setModalRefazerAberto(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white transition-colors shadow-sm"
              >
                <IoReload />
                <span>Refazer Laudo</span>
              </button>
            )}

            {/* Botões Download */}
            <button
              onClick={() => handleDownloadLaudo('original')}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-50 transition-colors shadow-sm ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <FaFilePdf />
              <span>Original</span>
            </button>

            {laudo.laudoAssinado && (
              <button
                onClick={() => handleDownloadLaudo('assinado')}
                disabled={isLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors shadow-sm ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FaCheckCircle /> 
                <span>Assinado</span>
              </button>
            )}
          </div>
        </div>

        {/* Mensagens de feedback */}
        {mensagem.texto && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
            mensagem.tipo === 'sucesso' 
              ? 'bg-green-100 text-green-800 border-l-4 border-green-500' 
              : 'bg-blue-100 text-blue-800 border-l-4 border-blue-500'
          }`}>
            <div className="flex items-center gap-2">
              {mensagem.tipo === 'sucesso' ? (
                <FaCheckCircle className="text-green-500" />
              ) : (
                <FaInfoCircle className="text-blue-500" />
              )}
              <span>{mensagem.texto}</span>
              <button 
                onClick={() => setMensagem({ texto: '', tipo: '' })}
                className="ml-4 text-gray-500 hover:text-gray-700"
              >
                <IoCloseOutline />
              </button>
            </div>
          </div>
        )}

        {/* Status do Laudo e Email */}
        <div className="space-y-4 mb-8">
          {/* Status do Laudo */}
          <div className={`p-4 rounded-lg border-l-4 ${
            laudo.status === 'Laudo assinado' 
              ? 'bg-green-50 border-green-500 text-green-800' :
            laudo.status === 'Laudo realizado' 
              ? 'bg-blue-50 border-blue-500 text-blue-800' :
            laudo.status === 'Laudo refeito'
              ? 'bg-yellow-50 border-yellow-500 text-yellow-800' :
              'bg-slate-50 border-slate-400 text-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">
                  Status: <span className="capitalize">{laudo.status.toLowerCase()}</span>
                </p>
                {laudo.updatedAt && (
                  <p className="text-sm mt-1">
                    Última atualização: {new Date(laudo.updatedAt).toLocaleString()}
                  </p>
                )}
              </div>
              {laudo.status === 'Laudo assinado' && (
                <FaCheckCircle className="text-xl text-green-500" />
              )}
            </div>
          </div>

          {/* Status do Email */}
          {statusEmail && (
            <div className={`p-4 rounded-lg border-l-4 ${
              statusEmail.status === 'Enviado' 
                ? 'bg-green-50 border-green-500 text-green-800' :
                'bg-red-50 border-red-500 text-red-800'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold flex items-center gap-2">
                    <IoMail className="text-slate-600" />
                    Status do Email: <span className="capitalize">{statusEmail.status.toLowerCase()}</span>
                  </p>
                  <p className="text-sm mt-1">
                    Destinatário: {statusEmail.destinatario || 'Não especificado'}
                  </p>
                  {statusEmail.data && (
                    <p className="text-sm mt-1">
                      Última tentativa: {new Date(statusEmail.data).toLocaleString()}
                    </p>
                  )}
                </div>
                {statusEmail.status === 'Enviado' ? (
                  <FaCheckCircle className="text-xl text-green-500 mt-1" />
                ) : (
                  <FaExclamationTriangle className="text-xl text-red-500 mt-1" />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna 1 - Informações do Laudo */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card Informações do Laudo */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <FaFileMedicalAlt className="text-blue-500" />
                  Informações do Laudo
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500">ID do Laudo</p>
                    <p className="font-semibold text-slate-800">{laudo._id?.toString()?.substring(0, 8)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500">Médico Responsável</p>
                    <p className="font-semibold text-slate-800">{laudo.medicoResponsavel}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500">Data de Criação</p>
                    <p className="font-semibold text-slate-800">{new Date(laudo.createdAt).toLocaleString()}</p>
                  </div>
                  {laudo.laudoAnterior && typeof laudo.laudoAnterior === 'object' ? (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-500">Laudo Anterior</p>
                      <p className="font-semibold text-slate-800">
                        <button 
                          onClick={() => navigate(`/laudos/${laudo.laudoAnterior._id}`)}
                          className="text-blue-600 hover:underline"
                        >
                          #{laudo.laudoAnterior._id.toString().substring(0, 8)}
                        </button>
                      </p>
                    </div>
                  ) : laudo.laudoAnterior ? (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-500">Laudo Anterior</p>
                      <p className="font-semibold text-slate-800">
                        <button 
                          onClick={() => navigate(`/laudos/${laudo.laudoAnterior}`)}
                          className="text-blue-600 hover:underline"
                        >
                          #{laudo.laudoAnterior.toString().substring(0, 8)}
                        </button>
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Card Conclusão Médica */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <FaStethoscope className="text-blue-500" />
                  Conclusão Médica
                </h2>
              </div>
              <div className="p-6">
                <div className="prose max-w-none">
                  <p className="whitespace-pre-line text-slate-700">{laudo.conclusao}</p>
                </div>
              </div>
            </div>

            {/* Seção Upload */}
            {podeEnviarAssinatura() && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                  <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <IoCloudUploadOutline className="text-blue-500" />
                    Enviar Laudo Assinado
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="application/pdf"
                      className="hidden"
                    />
                    
                    <button
                      onClick={() => fileInputRef.current.click()}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                    >
                      <IoCloudUploadOutline className="text-xl text-slate-500" />
                      <span className="font-medium text-slate-700">Selecionar Arquivo PDF</span>
                    </button>
                    
                    {arquivoSelecionado && (
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-slate-800">{arquivoSelecionado.name}</p>
                            <p className="text-sm text-slate-500">
                              {(arquivoSelecionado.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <button
                            onClick={handleEnviarArquivo}
                            disabled={isLoading}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                              isLoading 
                                ? 'bg-slate-300 text-slate-600' 
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            } transition-colors shadow-sm`}
                          >
                            {isLoading ? (
                              <>
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Enviando...</span>
                              </>
                            ) : (
                              <>
                                <IoCloudUploadOutline />
                                <span>Enviar Laudo</span>
                              </>
                            )}
                          </button>
                        </div>
                        
                        {uploadProgress > 0 && (
                          <div className="mt-3">
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 text-right">
                              {uploadProgress}% completado
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Histórico de Versões */}
            {mostrarHistorico && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                  <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <FaHistory className="text-blue-500" />
                    Histórico de Alterações
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {historicoVersoes.length > 0 ? (
                      <ul className="divide-y divide-slate-200">
                        {historicoVersoes.map((item, index) => (
                          <li key={index} className="py-3">
                            <div className="flex justify-between">
                              <div>
                                <p className="font-medium text-slate-800 capitalize">{item.acao.replace(/([A-Z])/g, ' $1').trim()}</p>
                                {item.motivo && (
                                  <p className="text-sm text-slate-600 mt-1">
                                    <span className="font-medium">Motivo:</span> {item.motivo}
                                  </p>
                                )}
                                {item.destinatarioEmail && (
                                  <p className="text-sm text-slate-600 mt-1">
                                    <span className="font-medium">Destinatário:</span> {item.destinatarioEmail}
                                  </p>
                                )}
                                {item.statusEnvio && (
                                  <p className="text-sm text-slate-600 mt-1">
                                    <span className="font-medium">Status:</span> 
                                    <span className={`ml-1 ${
                                      item.statusEnvio === 'Enviado' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                      {item.statusEnvio}
                                    </span>
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-slate-500">
                                  {new Date(item.data).toLocaleString()}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                  por {item.usuario || 'Sistema'}
                                </p>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-500 text-center py-4">Nenhum histórico disponível</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Coluna 2 - Informações do Paciente e Exame */}
          <div className="space-y-6">
            {/* Card Informações do Paciente */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <FaUserAlt className="text-blue-500" />
                  Paciente
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-slate-500">
                      <IoPersonOutline />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Nome</p>
                      <p className="font-semibold text-slate-800 mt-1">{paciente?.nome || 'Não identificado'}</p>
                    </div>
                  </div>
                  
                  {paciente?.dataNascimento && (
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-slate-500">
                        <IoCalendarOutline />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500">Idade</p>
                        <p className="font-semibold text-slate-800 mt-1">{calcularIdade(paciente.dataNascimento)} anos</p>
                      </div>
                    </div>
                  )}
                  
                  {paciente?.email && (
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-slate-500">
                        <IoMail />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500">Email</p>
                        <p className="font-semibold text-slate-800 mt-1">{paciente.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Card Informações do Exame */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <FaFileMedicalAlt className="text-blue-500" />
                  Exame Relacionado
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                      <IoDocumentTextOutline />
                      Tipo de Exame
                    </p>
                    <p className="font-semibold text-slate-800 mt-1">{laudo.exame?.tipoExame?.toString() || '--'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                      <IoCalendarOutline />
                      Data do Exame
                    </p>
                    <p className="font-semibold text-slate-800 mt-1">
                      {laudo.exame?.dataExame 
                        ? new Date(laudo.exame.dataExame).toLocaleDateString('pt-BR') 
                        : '--'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para Refazer Laudo */}
      <Modal
        isOpen={modalRefazerAberto}
        onRequestClose={() => !isLoading && setModalRefazerAberto(false)}
        contentLabel="Refazer Laudo"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-auto">
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <IoReload className="text-yellow-500" />
              Refazer Laudo
            </h2>
          </div>
          
          <div className="p-6 space-y-4">
            {erro && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md border-l-4 border-red-500">
                {erro}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Motivo da Refação *
              </label>
              <input
                type="text"
                value={motivoRefacao}
                onChange={(e) => setMotivoRefacao(e.target.value)}
                placeholder="Ex: Correção de diagnóstico, informações incompletas..."
                className="w-full px-3 py-2 border border-slate-300 text-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nova Conclusão *
              </label>
              <textarea
                value={novaConclusao}
                onChange={(e) => setNovaConclusao(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-slate-300 text-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="px-6 py-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 flex justify-end gap-3">
            <button
              onClick={() => setModalRefazerAberto(false)}
              disabled={isLoading}
              className="px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              onClick={handleRefazerLaudo}
              disabled={isLoading || !motivoRefacao || !novaConclusao}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 ${
                isLoading || !motivoRefacao || !novaConclusao ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Processando...' : 'Confirmar Refação'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Estilos para o modal */}
      <style>{`
        .modal {
          position: fixed;
          top: 50%;
          left: 50%;
          right: auto;
          bottom: auto;
          margin-right: -50%;
          transform: translate(-50%, -50%);
          padding: 0;
          border: none;
          outline: none;
          max-width: 95vw;
          width: 100%;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 1000;
        }
      `}</style>
    </div>
  );
};

export default DetalhesLaudo;
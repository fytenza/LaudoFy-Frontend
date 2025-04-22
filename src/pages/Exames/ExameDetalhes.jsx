import React, { useEffect, useState } from 'react';
import api from '../../api';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  IoArrowBack, 
  IoDocumentTextOutline, 
  IoDownloadOutline,
  IoPersonOutline,
  IoCalendarOutline,
  IoTimeOutline,
  IoPulseOutline,
  IoPrintOutline,
  IoCloseOutline
} from 'react-icons/io5';
import { 
  FaFileMedicalAlt,
  FaCheckCircle,
  FaUserAlt,
  FaWeight,
  FaRulerVertical
} from 'react-icons/fa';
import { GiHeartBeats } from 'react-icons/gi';
import ReactModal from 'react-modal';

// Configuração do modal para acessibilidade
ReactModal.setAppElement('#root');

const API_URL = 'http://localhost:3000';

const ExameDetalhes = () => {
  const { id } = useParams();
  const [exame, setExame] = useState(null);
  const [laudoExistente, setLaudoExistente] = useState(false);
  const [erro, setErro] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const [modalIsOpen, setModalIsOpen] = useState(false);

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
        
        const [exameResponse, laudoResponse] = await Promise.all([
          api.get(`/exames/${id}`),
          api.get(`/laudos/exame/${id}`)
        ]);
        
        setExame(exameResponse.data);
        setLaudoExistente(laudoResponse.data.length > 0);
      } catch (err) {
        if (err.response?.status === 401) {
          setErro('Sessão expirada. Redirecionando para login...');
          setTimeout(() => logout(), 2000);
        } else if (err.response?.status === 404) {
          setErro('Exame não encontrado');
        } else {
          setErro('Erro ao carregar detalhes do exame. Tente novamente.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchExame();
  }, [id, logout]);

  const handleDownload = () => {
    if (!exame?.arquivo) return;
  
    const link = document.createElement('a');
    link.href = exame.arquivo;
    link.setAttribute('target', '_blank'); // abrir em nova aba
    link.setAttribute('download', '');     // sugere download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  

  const handleLaudar = () => {
    navigate(`/laudos/novo`, { state: { exameId: exame._id } });
  };

  const handleVoltar = () => {
    navigate(-1);
  };

  const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return '--';
    const nascimento = new Date(dataNascimento);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  const handlePrint = () => {
    if (!exame?.thumbnail) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Impressão do Exame</title>
          <style>
            body { margin: 0; padding: 20px; text-align: center; font-family: 'Segoe UI', Roboto, sans-serif; }
            img { max-width: 100%; height: auto; max-height: 90vh; object-fit: contain; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .header { margin-bottom: 20px; }
            .header h1 { color: #1E293B; font-size: 1.5rem; margin-bottom: 0.5rem; }
            .header p { color: #64748B; margin: 0.25rem 0; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Exame ${exame.tipoExame || ''}</h1>
            <p>Paciente: ${exame.paciente?.nome || 'Não identificado'}</p>
            <p>Data: ${exame.dataExame ? new Date(exame.dataExame).toLocaleDateString() : '--'}</p>
          </div>
          <img src="${API_URL}/${exame.thumbnail}" onerror="this.onerror=null;this.src='https://via.placeholder.com/500x300?text=Imagem+não+disponível';" />
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-slate-700 font-medium">Carregando exame...</p>
        </div>
      </div>
    );
  }

  if (!exame) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full text-center border border-slate-200">
          <p className="text-red-500 font-medium mb-4">{erro || 'Exame não encontrado'}</p>
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

  const paciente = exame.paciente || {};

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              Exame <span className="text-blue-600">#{exame._id.substring(0, 8)}</span>
            </h1>
          </div>
          
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            {usuario?.role === 'medico' && (
              <button
                onClick={handleLaudar}
                disabled={laudoExistente}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-sm ${
                  laudoExistente 
                    ? 'bg-slate-100 text-slate-600 cursor-not-allowed' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {laudoExistente ? (
                  <>
                    <FaCheckCircle />
                    <span>Laudo Existente</span>
                  </>
                ) : (
                  <>
                    <FaFileMedicalAlt />
                    <span>Emitir Laudo</span>
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={handleDownload}
              disabled={!exame.arquivo}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors shadow-sm ${
                exame.arquivo 
                  ? 'border-blue-500 text-blue-600 hover:bg-blue-50' 
                  : 'border-slate-300 text-slate-400 cursor-not-allowed'
              }`}
            >
              <IoDownloadOutline />
              <span>Baixar Exame</span>
            </button>
          </div>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna 1 - Informações do Paciente */}
          <div className="space-y-6">
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
                      <p className="font-semibold text-slate-800 mt-1">{paciente.nome || 'Não identificado'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-slate-500">
                      <IoCalendarOutline />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Idade</p>
                      <p className="font-semibold text-slate-800 mt-1">{calcularIdade(paciente.dataNascimento)} anos</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-slate-500">
                        <FaRulerVertical />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500">Altura</p>
                        <p className="font-semibold text-slate-800 mt-1">{exame.altura || '--'} cm</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-slate-500">
                        <FaWeight />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500">Peso</p>
                        <p className="font-semibold text-slate-800 mt-1">{exame.peso || '--'} kg</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Thumbnail do Exame */}
            {exame.thumbnail && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <IoDocumentTextOutline className="text-blue-500" />
                    Imagem do Exame
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                    >
                      <IoDownloadOutline size={14} />
                      Baixar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal de Visualização Ampliada */}
          <ReactModal
            isOpen={modalIsOpen}
            onRequestClose={() => setModalIsOpen(false)}
            contentLabel="Visualização do Exame"
            className="fixed inset-0 flex items-center justify-center p-4"
            overlayClassName="fixed inset-0 top-0 pt-12 backdrop-blur-sm backdrop-brightness-50 z-50"
            style={{
              content: {
                position: 'relative',
                maxWidth: '90vw',
                maxHeight: '90vh',
                width: 'auto',
                height: 'auto',
                padding: '0',
                border: 'none',
                borderRadius: '8px',
                background: 'transparent',
                inset: 'auto',
                transform: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }
            }}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={`${API_URL}/${exame.thumbnail}`}
                alt="Exame completo"
                className="max-w-[90vw] max-h-[90vh] object-contain shadow-xl"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/800x600?text=Imagem+não+disponível';
                }}
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={handlePrint}
                  className="p-3 bg-white rounded-full shadow-lg hover:bg-slate-100 transition-colors"
                  title="Imprimir"
                >
                  <IoPrintOutline className="text-slate-700 text-xl" />
                </button>
                <button
                  onClick={() => setModalIsOpen(false)}
                  className="p-3 bg-white rounded-full shadow-lg hover:bg-slate-100 transition-colors"
                  title="Fechar"
                >
                  <IoCloseOutline className="text-slate-700 text-xl" />
                </button>
              </div>
            </div>
          </ReactModal>

          {/* Coluna 2 - Informações do Exame */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <FaFileMedicalAlt className="text-blue-500" />
                  Detalhes do Exame
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                        <IoDocumentTextOutline />
                        Tipo de Exame
                      </p>
                      <p className="font-semibold text-slate-800 mt-1">{exame.tipoExame || '--'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                        <IoCalendarOutline />
                        Data do Exame
                      </p>
                      <p className="font-semibold text-slate-800 mt-1">
                        {exame.dataExame 
                          ? new Date(exame.dataExame).toLocaleDateString('pt-BR') 
                          : '--'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                        <IoTimeOutline />
                        Hora do Exame
                      </p>
                      <p className="font-semibold text-slate-800 mt-1">
                        {exame.dataExame 
                          ? new Date(exame.dataExame).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) 
                          : '--'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Sintomas Relatados</p>
                      <div className="mt-2 p-3 bg-slate-50 rounded-lg">
                        <p className="font-medium text-slate-800">
                          {exame.sintomas || 'Não informado'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dados do Exame (se for um exame com parâmetros específicos) */}
            {exame.frequenciaCardiaca && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                  <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <GiHeartBeats className="text-blue-500" />
                    Parâmetros do Exame
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <p className="text-sm font-medium text-blue-600 flex items-center gap-1">
                        <IoPulseOutline />
                        Freq. Cardíaca
                      </p>
                      <p className="font-bold text-xl text-blue-800 mt-2">{exame.frequenciaCardiaca || '--'} <span className="text-sm font-normal">bpm</span></p>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <p className="text-sm font-medium text-blue-600">Segmento PR</p>
                      <p className="font-bold text-xl text-blue-800 mt-2">{exame.segmentoPR || '--'} <span className="text-sm font-normal">ms</span></p>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <p className="text-sm font-medium text-blue-600">Duração QRS</p>
                      <p className="font-bold text-xl text-blue-800 mt-2">{exame.duracaoQRS || '--'} <span className="text-sm font-normal">ms</span></p>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <p className="text-sm font-medium text-blue-600">Eixo QRS</p>
                      <p className="font-bold text-xl text-blue-800 mt-2">{exame.eixoMedioQRS || '--'}°</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExameDetalhes;
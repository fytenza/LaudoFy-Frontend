import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Tabela from '../../components/Tabela';
import { 
  FiSearch, FiFilter, FiCalendar, FiX, 
  FiChevronDown, FiFileText, FiUser, FiAlertCircle,
  FiPlus, FiRefreshCw,
  FiEye
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';

const LaudosDashboard = () => {
  const [laudos, setLaudos] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalItens, setTotalItens] = useState(0);
  const [filtros, setFiltros] = useState({
    medicoResponsavel: '',
    status: '',
    paciente: '',
    dataInicio: '',
    dataFim: ''
  });
  const [erro, setErro] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  const socket = io('https://laudofy-backend-production.up.railway.app');

  // Nova paleta de cores tecnológica
  const COLORS = {
    primary: '#3B82F6',      // Azul principal
    primaryLight: '#93C5FD', // Azul claro
    primaryDark: '#1D4ED8',  // Azul escuro
    secondary: '#10B981',    // Verde
    accent: '#8B5CF6',       // Roxo
    warning: '#F59E0B',      // Amarelo
    danger: '#EF4444',       // Vermelho
    background: '#F8FAFC',   // Fundo
    cardBg: '#FFFFFF',       // Fundo dos cards
    text: '#1E293B',         // Texto escuro
    muted: '#64748B',        // Texto cinza
    border: '#E2E8F0'        // Bordas
  };

  const opcoesStatus = [
    { value: '', label: 'Todos' },
    { value: 'Rascunho', label: 'Rascunho' },
    { value: 'Laudo em processamento', label: 'Em processamento' },
    { value: 'Laudo realizado', label: 'Realizado' },
    { value: 'Laudo assinado', label: 'Assinado' },
    { value: 'Laudo refeito', label: 'Refeito' },
    { value: 'Cancelado', label: 'Cancelado' }
  ];

  const fetchLaudos = async () => {
    try {
      setIsLoading(true);
      setErro('');
      
      const params = {
        ...filtros,
        page: paginaAtual,
        limit: 10
      };

      // Remove campos vazios dos filtros
      Object.keys(params).forEach(key => {
        if (params[key] === '') {
          delete params[key];
        }
      });

      const response = await api.get('/laudos', { params });
      
      setLaudos(response.data.laudos || []);
      setTotalPaginas(response.data.totalPaginas || 1);
      setTotalItens(response.data.totalItens || 0);
    } catch (err) {
      if (err.response?.status === 401) {
        setErro('Sessão expirada. Redirecionando para login...');
        setTimeout(() => logout(), 2000);
      } else {
        setErro('Erro ao carregar laudos. Tente novamente.');
        console.error('Erro ao buscar laudos:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    socket.on('laudoCriado', (novoLaudo) => {
      setLaudos(prev => [novoLaudo, ...prev]);
    });

    socket.on('laudoAtualizado', (laudoAtualizado) => {
      setLaudos(prev => prev.map(laudo => 
        laudo._id === laudoAtualizado._id ? laudoAtualizado : laudo
      ));
    });

    return () => {
      socket.off('laudoCriado');
      socket.off('laudoAtualizado');
    };
  }, []);

  useEffect(() => {
    fetchLaudos();
  }, [paginaAtual, filtros]);

  const mudarPagina = (novaPagina) => {
    setPaginaAtual(novaPagina);
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const limparFiltros = () => {
    setFiltros({
      medicoResponsavel: '',
      status: '',
      paciente: '',
      dataInicio: '',
      dataFim: ''
    });
    setPaginaAtual(1);
  };

  const aplicarFiltros = () => {
    setPaginaAtual(1);
    setMostrarFiltros(false);
  };

  const colunas = [
    { 
      header: 'Médico Responsável', 
      key: 'medicoResponsavel',
      render: (value) => (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3">
            <FiUser className="text-blue-500" />
          </div>
          <span className="font-medium text-slate-800">{value || 'Não informado'}</span>
        </div>
      )
    },
    { 
      header: 'Paciente',
      render: (_, laudo) => {
        let pacienteNome = 'Não informado';
        
        try {
          if (laudo.paciente && typeof laudo.paciente === 'object') {
            pacienteNome = laudo.paciente.nome || 'Não informado';
          } else if (laudo.exame?.paciente && typeof laudo.exame.paciente === 'object') {
            pacienteNome = laudo.exame.paciente.nome || 'Não informado';
          } else if (typeof laudo.exame?.paciente === 'string') {
            pacienteNome = laudo.exame.paciente;
          } else if (laudo.nomePaciente) {
            pacienteNome = laudo.nomePaciente;
          }
        } catch (e) {
          console.error('Erro ao extrair nome do paciente:', e);
        }

        return (
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center mr-3">
              <FiUser className="text-purple-500" />
            </div>
            <span className="font-medium text-slate-800">{pacienteNome}</span>
          </div>
        );
      }
    },
    { 
      header: 'Conclusão', 
      key: 'conclusao', 
      render: (value) => (
        <p className="text-slate-800">
          {value ? `${value.substring(0, 50)}${value.length > 50 ? '...' : ''}` : 'Não informado'}
        </p>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (value) => {
        const statusCores = {
          'Laudo em processamento': { bg: 'bg-amber-100', text: 'text-amber-800' },
          'Laudo realizado': { bg: 'bg-blue-100', text: 'text-blue-800' },
          'Laudo assinado': { bg: 'bg-green-100', text: 'text-green-800' },
          'Erro ao gerar PDF': { bg: 'bg-red-100', text: 'text-red-800' },
          'Cancelado': { bg: 'bg-red-100', text: 'text-red-800' },
          'Rascunho': { bg: 'bg-purple-100', text: 'text-purple-800' },
          'Laudo refeito': { bg: 'bg-indigo-100', text: 'text-indigo-800' }
        };
        
        const cores = statusCores[value] || { bg: 'bg-slate-100', text: 'text-slate-800' };
        
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${cores.bg} ${cores.text}`}>
            {value || 'Não informado'}
          </span>
        );
      }
    },
    { 
      header: 'Data Criação', 
      key: 'createdAt',
      render: (value) => (
        <div>
          <p className="text-slate-800">
            {value ? new Date(value).toLocaleDateString('pt-BR') : '—'}
          </p>
          {value && (
            <p className="text-xs text-slate-500">
              {new Date(value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      )
    },
  ];

  const acoes = [
    {
      label: 'Ver detalhes',
      acao: (laudo) => navigate(`/laudos/${laudo._id}`),
      icon: <FiEye className="h-4 w-4" />,
      style: 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Container principal */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
        {/* Cabeçalho com efeito de vidro */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center">
                <FiFileText className="text-blue-500 mr-3" />
                Laudos Médicos
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {totalItens > 0 ? `${totalItens} laudos encontrados` : 'Gerencie e visualize todos os laudos'}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Botão de recarregar */}
              <button
                onClick={fetchLaudos}
                className="flex items-center justify-center px-4 py-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <FiRefreshCw className="mr-2" />
                <span>Recarregar</span>
              </button>
              
              {/* Botão de filtros */}
              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className={`flex items-center justify-center px-4 py-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors ${
                  mostrarFiltros 
                    ? 'bg-blue-50 border-blue-200 text-blue-600' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <FiFilter className="mr-2" />
                <span>Filtros</span>
                {mostrarFiltros && <FiX className="ml-2" />}
              </button>
              
              {/* Botão novo laudo */}
              <button
                onClick={() => navigate('/laudos/novo')}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <FiPlus className="mr-2" />
                <span>Novo Laudo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filtros avançados */}
        {mostrarFiltros && (
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
            <div className="max-w-6xl mx-auto">
              <h3 className="text-lg font-medium text-slate-800 mb-4 flex items-center">
                <FiFilter className="text-blue-500 mr-2" />
                Filtros Avançados
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Médico */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Médico Responsável</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiSearch className="text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="medicoResponsavel"
                      value={filtros.medicoResponsavel}
                      onChange={handleFiltroChange}
                      placeholder="Buscar por médico..."
                      className="block w-full pl-10 pr-3 py-2 border border-slate-300 text-slate-500 outline-none rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <div className="relative">
                    <select
                      name="status"
                      value={filtros.status}
                      onChange={handleFiltroChange}
                      className="block w-full pl-3 pr-8 py-2 border border-slate-300 text-slate-500 outline-none rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    >
                      {opcoesStatus.map((opcao) => (
                        <option key={opcao.value} value={opcao.value}>
                          {opcao.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <FiChevronDown className="text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Paciente */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Paciente</label>
                  <input
                    type="text"
                    name="paciente"
                    value={filtros.paciente}
                    onChange={handleFiltroChange}
                    placeholder="Nome do paciente"
                    className="block w-full px-3 py-2 border border-slate-300 text-slate-500 outline-none rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Período */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Período</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiCalendar className="text-slate-400" />
                      </div>
                      <input
                        type="date"
                        name="dataInicio"
                        value={filtros.dataInicio}
                        onChange={handleFiltroChange}
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 text-slate-500 outline-none rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiCalendar className="text-slate-400" />
                      </div>
                      <input
                        type="date"
                        name="dataFim"
                        value={filtros.dataFim}
                        onChange={handleFiltroChange}
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 text-slate-500 outline-none rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6 gap-3">
                <button
                  onClick={limparFiltros}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 outline-none rounded-lg hover:bg-slate-50 focus:ring-2 focus:ring-blue-500"
                >
                  Limpar
                </button>
                <button
                  onClick={aplicarFiltros}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 shadow-sm"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mensagem de erro */}
        {erro && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex items-center">
              <FiAlertCircle className="text-red-500 mr-2" />
              <p className="text-red-700">{erro}</p>
            </div>
          </div>
        )}

        {/* Tabela */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <Tabela 
              colunas={colunas} 
              dados={laudos} 
              acoes={acoes}
              mensagemSemDados={
                <div className="text-center py-12">
                  <FiFileText className="mx-auto text-slate-300 text-4xl mb-3" />
                  <h3 className="text-lg font-medium text-slate-500">Nenhum laudo encontrado</h3>
                  <p className="text-slate-400 mt-1">Tente ajustar seus filtros de busca</p>
                </div>
              }
            />
          )}
        </div>

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-slate-600">
                Página {paginaAtual} de {totalPaginas} • {totalItens} itens
              </p>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => mudarPagina(paginaAtual - 1)}
                  disabled={paginaAtual === 1}
                  className={`px-3 py-1 rounded-md border ${
                    paginaAtual === 1 
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Anterior
                </button>
                
                {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                  const pageNum = paginaAtual <= 3 
                    ? i + 1 
                    : paginaAtual >= totalPaginas - 2 
                      ? totalPaginas - 4 + i 
                      : paginaAtual - 2 + i;
                  
                  if (pageNum < 1 || pageNum > totalPaginas) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => mudarPagina(pageNum)}
                      className={`px-3 py-1 rounded-md border ${
                        paginaAtual === pageNum 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => mudarPagina(paginaAtual + 1)}
                  disabled={paginaAtual === totalPaginas}
                  className={`px-3 py-1 rounded-md border ${
                    paginaAtual === totalPaginas 
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Próxima
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LaudosDashboard;
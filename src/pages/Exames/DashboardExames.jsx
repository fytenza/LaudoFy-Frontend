import React, { useEffect, useState } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import Tabela from '../../components/Tabela';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FiPlus, FiSearch, FiFilter, FiCalendar, 
  FiX, FiChevronDown, FiUser, FiFileText,
  FiAlertCircle, FiCheckCircle, FiClock,
  FiRefreshCw,
  FiEye,
  FiEdit,
  FiTrash
} from 'react-icons/fi';

const DashboardExames = () => {
  const [exames, setExames] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalItens, setTotalItens] = useState(0);
  const [filtros, setFiltros] = useState({
    paciente: '',
    tipoExame: '',
    status: '',
    dataInicio: '',
    dataFim: '',
    tecnico: ''
  });
  const [erro, setErro] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

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

  // Opções para filtros
  const opcoesTipoExame = [
    { value: '', label: 'Todos' },
    { value: 'ECG', label: 'ECG' },
    { value: 'Holter', label: 'Holter' },
    { value: 'Ergometria', label: 'Ergometria' },
    { value: 'Mapa', label: 'Mapa' },
    { value: 'Outro', label: 'Outro' }
  ];

  const opcoesStatus = [
    { value: '', label: 'Todos' },
    { value: 'Pendente', label: 'Pendente' },
    { value: 'Concluído', label: 'Concluído' },
    { value: 'Laudo realizado', label: 'Laudo realizado' },
    { value: 'Cancelado', label: 'Cancelado' }
  ];

  // Busca os exames
  const fetchExames = async () => {
    setIsLoading(true);
    setErro('');
    
    try {
      const params = {
        ...filtros,
        page: paginaAtual, 
        limit: 10
      };

      // Remove campos vazios
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });

      const response = await api.get('/exames', { params });
      
      setExames(response.data.exames || []);
      setTotalPaginas(response.data.totalPaginas || 1);
      setTotalItens(response.data.totalItens || 0);
    } catch (err) {
      if (err.response?.status === 401) {
        setErro('Sessão expirada. Redirecionando para login...');
        setTimeout(() => logout(), 2000);
      } else {
        setErro('Erro ao carregar exames. Tente novamente.');
      }
      setExames([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExames();
  }, [paginaAtual, filtros, logout]);

  // Manipuladores
  const mudarPagina = (novaPagina) => setPaginaAtual(novaPagina);
  
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const limparFiltros = () => {
    setFiltros({
      paciente: '',
      tipoExame: '',
      status: '',
      dataInicio: '',
      dataFim: '',
      tecnico: ''
    });
    setPaginaAtual(1);
  };

  const aplicarFiltros = () => {
    setPaginaAtual(1);
    setMostrarFiltros(false);
  };

  // Configuração da tabela
  const colunas = [
    { 
      header: 'Paciente', 
      key: 'paciente.nome',
      render: (value, row) => (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3">
            <FiUser className="text-blue-500" />
          </div>
          <div>
            <p className="font-medium text-slate-800">{value || '—'}</p>
            {row.paciente?.idade && (
              <p className="text-xs text-slate-500">{row.paciente.idade} anos</p>
            )}
          </div>
        </div>
      )
    },
    {
      header: 'Tipo de Exame',
      key: 'tipoExame',
      render: (value) => {
        const tipoCores = {
          'ECG': { bg: 'bg-purple-100', text: 'text-purple-800' },
          'Holter': { bg: 'bg-pink-100', text: 'text-pink-800' },
          'Ergometria': { bg: 'bg-indigo-100', text: 'text-indigo-800' },
          'Mapa': { bg: 'bg-indigo-100', text: 'text-emerald-800' },
          'Outro': { bg: 'bg-blue-100', text: 'text-blue-800' }
        };
        
        const cores = tipoCores[value] || { bg: 'bg-slate-100', text: 'text-slate-800' };
        
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${cores.bg} ${cores.text}`}>
            {value || '—'}
          </span>
        );
      }
    },
    {
      header: 'Status',
      key: 'status',
      render: (value) => {
        const statusCores = {
          'Pendente': { bg: 'bg-amber-100', text: 'text-amber-800' },
          'Concluído': { bg: 'bg-green-100', text: 'text-green-800' },
          'Laudo realizado': { bg: 'bg-emerald-100', text: 'text-emerald-800' },
          'Cancelado': { bg: 'bg-red-100', text: 'text-red-800' }
        };
        
        const cores = statusCores[value] || { bg: 'bg-slate-100', text: 'text-slate-800' };
        
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${cores.bg} ${cores.text}`}>
            {value || '—'}
          </span>
        );
      }
    },
    { 
      header: 'Data', 
      key: 'dataExame',
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
    }
  ];

  const acoes = [
    {
      label: 'Ver detalhes',
      acao: (exame) => navigate(`/exames/${exame._id}`),
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
                Exames
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {totalItens > 0 ? `${totalItens} exames encontrados` : 'Gerencie e visualize todos os exames'}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Botão de recarregar */}
              <button
                onClick={fetchExames}
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
              
              {/* Botão novo exame */}
              <button
                onClick={() => navigate('/exames/novo')}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <FiPlus className="mr-2" />
                <span>Novo Exame</span>
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
                {/* Paciente */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Paciente</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiSearch className="text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="paciente"
                      value={filtros.paciente}
                      onChange={handleFiltroChange}
                      placeholder="Buscar paciente..."
                      className="block w-full pl-10 pr-3 py-2 border border-slate-300 text-slate-500 outline-none rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Tipo de exame */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Exame</label>
                  <div className="relative">
                    <select
                      name="tipoExame"
                      value={filtros.tipoExame}
                      onChange={handleFiltroChange}
                      className="block w-full pl-3 pr-8 py-2 border border-slate-300 text-slate-500 outline-none rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    >
                      {opcoesTipoExame.map((opcao) => (
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

                {/* Técnico */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Técnico</label>
                  <input
                    type="text"
                    name="tecnico"
                    value={filtros.tecnico}
                    onChange={handleFiltroChange}
                    placeholder="Filtrar por técnico..."
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
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:ring-2 focus:ring-blue-500"
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
              dados={exames} 
              acoes={acoes}
              mensagemSemDados={
                <div className="text-center py-12">
                  <FiFileText className="mx-auto text-slate-300 text-4xl mb-3" />
                  <h3 className="text-lg font-medium text-slate-500">Nenhum exame encontrado</h3>
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

export default DashboardExames;
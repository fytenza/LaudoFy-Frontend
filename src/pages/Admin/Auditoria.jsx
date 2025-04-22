import React, { useState, useEffect } from 'react';
import { FiFileText, FiSearch, FiDownload, FiUser, FiDatabase, FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaFilePdf, FaFileExcel } from 'react-icons/fa';
import { HiOutlineDocumentReport } from 'react-icons/hi';
import { MdOutlineSecurity } from 'react-icons/md';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const Auditoria = () => {
  const { usuario } = useAuth();
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState({
    dataInicio: new Date(new Date().setDate(new Date().getDate() - 7)),
    dataFim: new Date(),
    action: '',
    collectionName: '',
    userId: '',
    status: ''
  });
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalPages: 1
  });

  // Cores personalizadas
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

  const buscarRegistros = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sort: '-createdAt',
        ...filtros,
        dataInicio: filtros.dataInicio?.toISOString(),
        dataFim: filtros.dataFim?.toISOString()
      };

      // Remove campos vazios
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === undefined) delete params[key];
      });

      const response = await api.get('/auditoria', { params });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro ao buscar registros');
      }

      setRegistros(response.data.data);
      setTotalRegistros(response.data.pagination.total);
      setPagination({
        ...pagination,
        totalPages: response.data.pagination.pages
      });

    } catch (err) {
      console.error('Erro ao buscar registros:', err);
      setError(err.response?.data?.error || err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarRegistros();
  }, [pagination.page, filtros]);

  const exportarParaExcel = () => {
    if (!registros || registros.length === 0) return;
    
    const dados = registros.map(registro => ({
      'Data/Hora': new Date(registro.createdAt).toLocaleString(),
      'Ação': registro.action,
      'Usuário': registro.userId?.nome || 'Sistema',
      'Coleção': registro.collectionName,
      'Descrição': registro.description,
      'Status': registro.status || 'success',
      'IP': registro.ip,
      'Dispositivo': registro.userAgent
    }));

    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registros Auditoria");
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    saveAs(data, `auditoria_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const formatarData = (data) => {
    return data ? new Date(data).toLocaleString('pt-BR') : '-';
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <MdOutlineSecurity className="text-blue-600 text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Registros de Auditoria</h1>
              <p className="text-sm text-slate-500">Monitoramento de atividades do sistema</p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <FiSearch className="text-blue-500" />
              Filtros de Busca
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Período */}
            <div className="col-span-1 md:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-700">Data Inicial</label>
                  <DatePicker
                    selected={filtros.dataInicio}
                    onChange={(date) => setFiltros({ ...filtros, dataInicio: date })}
                    className="w-full p-2 border border-slate-300 text-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    dateFormat="dd/MM/yyyy"
                    selectsStart
                    startDate={filtros.dataInicio}
                    endDate={filtros.dataFim}
                    maxDate={filtros.dataFim || new Date()}
                    calendarClassName="text-sm"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-700">Data Final</label>
                  <DatePicker
                    selected={filtros.dataFim}
                    onChange={(date) => setFiltros({ ...filtros, dataFim: date })}
                    className="w-full p-2 border border-slate-300 text-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    dateFormat="dd/MM/yyyy"
                    selectsEnd
                    startDate={filtros.dataInicio}
                    endDate={filtros.dataFim}
                    minDate={filtros.dataInicio}
                    calendarClassName="text-sm"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                  />
                </div>
              </div>
            </div>

            {/* Ação */}
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700">Ação</label>
              <select
                value={filtros.action}
                onChange={(e) => setFiltros({ ...filtros, action: e.target.value })}
                className="w-full p-2 border border-slate-300 text-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Todas as ações</option>
                <option value="create">Criação</option>
                <option value="update">Atualização</option>
                <option value="delete">Exclusão</option>
                <option value="login">Login</option>
                <option value="sign">Assinatura</option>
              </select>
            </div>

            {/* Coleção */}
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700">Coleção</label>
              <select
                value={filtros.collectionName}
                onChange={(e) => setFiltros({ ...filtros, collectionName: e.target.value })}
                className="w-full p-2 border border-slate-300 text-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Todas as coleções</option>
                <option value="usuarios">Usuários</option>
                <option value="pacientes">Pacientes</option>
                <option value="exames">Exames</option>
                <option value="laudos">Laudos</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6">
            <button
              onClick={buscarRegistros}
              disabled={loading}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors shadow-sm ${
                loading 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white w-full sm:w-auto`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Buscando...</span>
                </>
              ) : (
                <>
                  <FiSearch />
                  <span>Buscar Registros</span>
                </>
              )}
            </button>

            {registros.length > 0 && (
              <button 
                onClick={exportarParaExcel}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-sm w-full sm:w-auto"
              >
                <FaFileExcel />
                <span>Exportar Excel</span>
              </button>
            )}
          </div>
        </div>

        {/* Mensagens de erro */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg">
            <div className="flex items-start gap-2">
              <MdOutlineSecurity className="text-red-500 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <FiDatabase className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-600">Total Registros</h3>
                <p className="text-2xl font-bold text-blue-800">{totalRegistros}</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <FiFileText className="text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-purple-600">Criações</h3>
                <p className="text-2xl font-bold text-purple-800">
                  {registros.filter(r => r.action === 'create').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <FiUser className="text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-green-600">Atualizações</h3>
                <p className="text-2xl font-bold text-green-800">
                  {registros.filter(r => r.action === 'update').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-full">
                <FiCalendar className="text-red-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-red-600">Falhas</h3>
                <p className="text-2xl font-bold text-red-800">
                  {registros.filter(r => r.status === 'failed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de Resultados */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <HiOutlineDocumentReport className="text-blue-500" />
              <span>Registros de Atividade</span>
            </h2>
          </div>
          
          <div className="p-6">
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Data/Hora</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ação</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Usuário</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Coleção</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Descrição</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {registros.map((registro) => (
                    <tr key={registro._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {formatarData(registro.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          registro.action === 'create' 
                            ? 'bg-green-100 text-green-800' 
                            : registro.action === 'update' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {registro.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {registro.userId?.nome || 'Sistema'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {registro.collectionName}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {registro.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          registro.status === 'failed' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {registro.status || 'success'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-300 ${
                    pagination.page === 1 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                      : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <FiChevronLeft />
                  <span>Anterior</span>
                </button>
                
                <span className="text-sm text-slate-600">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-300 ${
                    pagination.page === pagination.totalPages 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                      : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>Próxima</span>
                  <FiChevronRight />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auditoria;
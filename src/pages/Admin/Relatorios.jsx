import React, { useState, useEffect } from 'react';
import { FiPieChart, FiCalendar, FiUser, FiFileText, FiDownload } from 'react-icons/fi';
import { FaFilePdf, FaFileExcel, FaSearch, FaCheckCircle } from 'react-icons/fa';
import { HiOutlineDocumentReport } from 'react-icons/hi';
import { MdOutlineMedicalServices } from 'react-icons/md';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const Relatorios = () => {
  const { usuario } = useAuth();
  const [relatorio, setRelatorio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState({
    dataInicio: new Date(new Date().setDate(new Date().getDate() - 7)),
    dataFim: new Date(),
    tipoExame: '',
    medicoId: usuario?.role === 'admin' ? '' : usuario?.id,
    statusLaudo: ''
  });
  const [medicos, setMedicos] = useState([]);
  const [loadingMedicos, setLoadingMedicos] = useState(false);

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

  useEffect(() => {
    const fetchMedicos = async () => {
      if (usuario?.role === 'admin') {
        setLoadingMedicos(true);
        try {
          const response = await api.get('/usuarios', { 
            params: { role: 'medico' } 
          });
          
          if (response.data && Array.isArray(response.data.usuarios)) {
            setMedicos(response.data.usuarios);
          } else if (Array.isArray(response.data)) {
            setMedicos(response.data);
          } else {
            setMedicos([]);
          }
        } catch (err) {
          console.error('Erro ao carregar médicos:', err);
          setMedicos([]);
        } finally {
          setLoadingMedicos(false);
        }
      }
    };

    fetchMedicos();
  }, [usuario?.role]);

  const gerarRelatorio = async () => {
    setLoading(true);
    setError('');
    
    try {

      const ajustarDataFim = (date) => {
        if (!date) return '';
        const d = new Date(date);
        d.setHours(23, 59, 59, 999); // Inclui todo o dia até o último milissegundo
        return d.toISOString();
      };

      const params = {
        medicoId: filtros.medicoId || '',
        tipoExame: filtros.tipoExame || '',
        status: filtros.statusLaudo || '',
        dataInicio: filtros.dataInicio?.toISOString().split('T')[0] || '',
        dataFim: ajustarDataFim(filtros.dataFim).split('T')[0] || ''
      };

      const response = await api.get('/laudos/reports/laudos', { params });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro ao gerar relatório');
      }

      setRelatorio({
        ...response.data.data,
        laudos: response.data.data.laudos.map(laudo => ({
          ...laudo,
          dataCriacao: laudo.dataCriacao ? new Date(laudo.dataCriacao) : null,
          dataAtualizacao: laudo.dataAtualizacao ? new Date(laudo.dataAtualizacao) : null
        }))
      });

    } catch (err) {
      console.error('Erro ao gerar relatório:', err);
      setError(err.response?.data?.error || err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const exportarParaExcel = () => {
    if (!relatorio || !Array.isArray(relatorio.laudos)) return;
    
    const dados = relatorio.laudos.map(l => ({
      ID: l._id || '-',
      Data: l.createdAt ? new Date(l.createdAt).toLocaleDateString() : '-',
      Médico: l.medicoResponsavel || '-',
      'Tipo Exame': l.exame?.tipoExame || '-',
      Paciente: l.exame?.paciente?.nome || '-',
      Status: l.status || '-',
      Válido: l.valido ? 'Sim' : 'Não',
      'Data Assinatura': l.dataAssinatura ? new Date(l.dataAssinatura).toLocaleDateString() : '-',
      'Data Envio Email': l.dataEnvioEmail ? new Date(l.dataEnvioEmail).toLocaleDateString() : '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório Laudos");
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    saveAs(data, `relatorio_laudos_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportarParaPDF = async () => {
    try {
      const params = { ...filtros };
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });

      const response = await api.get(`/laudos/relatorios/exportar-pdf`, {
        params,
        responseType: 'blob'
      });
      
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      saveAs(pdfBlob, `relatorio_laudos_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Erro ao exportar PDF:', err);
      setError('Erro ao exportar para PDF');
    }
  };

  const formatarData = (data) => {
    return data ? new Date(data).toLocaleDateString('pt-BR') : '-';
  };

  const isValidId = (id) => {
    return id && typeof id === 'string' && id.length === 24 && /^[0-9a-fA-F]+$/.test(id);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <HiOutlineDocumentReport className="text-blue-600 text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Relatórios de Laudos</h1>
              <p className="text-sm text-slate-500">Gere relatórios personalizados dos laudos médicos</p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <FaSearch className="text-blue-500" />
              Filtros do Relatório
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Filtro de Período */}
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

            {/* Médico (apenas para admin) */}
            {usuario?.role === 'admin' && (
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700">Médico</label>
                {loadingMedicos ? (
                  <div className="p-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-500 text-sm">
                    Carregando médicos...
                  </div>
                ) : (
                  <select
                    value={filtros.medicoId}
                    onChange={(e) => setFiltros({ ...filtros, medicoId: e.target.value })}
                    className="w-full p-2 border border-slate-300 text-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">Todos os médicos</option>
                    {medicos.map((medico) => (
                      <option key={medico._id} value={medico._id}>
                        {medico.nome}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Status do Laudo */}
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700">Status do Laudo</label>
              <select
                value={filtros.statusLaudo}
                onChange={(e) => setFiltros({ ...filtros, statusLaudo: e.target.value })}
                className="w-full p-2 border border-slate-300 text-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Todos os status</option>
                <option value="Laudo realizado">Realizado</option>
                <option value="Laudo assinado">Assinado</option>
                <option value="Laudo refeito">Refeito</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6">
            <button
              onClick={gerarRelatorio}
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
                  <span>Gerando...</span>
                </>
              ) : (
                <>
                  <FiPieChart />
                  <span>Gerar Relatório</span>
                </>
              )}
            </button>

            {relatorio && (
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button 
                  onClick={exportarParaExcel}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-sm w-full sm:w-auto"
                >
                  <FaFileExcel />
                  <span>Exportar Excel</span>
                </button>
                <button 
                  onClick={exportarParaPDF}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-sm w-full sm:w-auto"
                >
                  <FaFilePdf />
                  <span>Exportar PDF</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mensagens de erro */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg">
            <div className="flex items-start gap-2">
              <FaTimesCircle className="text-red-500 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Resultados */}
        {relatorio && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Cabeçalho do Relatório */}
            <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <MdOutlineMedicalServices className="text-blue-500" />
                  <span>
                    Relatório de Laudos
                    <span className="text-sm font-normal ml-2 text-slate-500">
                      ({formatarData(relatorio.periodo.inicio)} a {formatarData(relatorio.periodo.fim)})
                    </span>
                  </span>
                </h2>
                <div className="text-sm text-slate-500">
                  Gerado em: {new Date().toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Cards de Totais */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <FiFileText className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-blue-600">Total Laudos</h3>
                      <p className="text-2xl font-bold text-blue-800">
                        {relatorio?.totais?.quantidade || 0}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <FaCheckCircle className="text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-green-600">Assinados</h3>
                      <p className="text-2xl font-bold text-green-800">
                        {relatorio?.totais?.assinados || 0}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <FiCalendar className="text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-purple-600">Pendentes</h3>
                      <p className="text-2xl font-bold text-purple-800">
                        {relatorio?.totais?.pendentes || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabela de Detalhes */}
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Data</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Médico</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Paciente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tipo Exame</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Assinatura</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {relatorio.laudos.map((laudo) => (
                      <tr key={laudo._id || Math.random().toString(36).substr(2, 9)} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {isValidId(laudo._id) ? (
                            <a 
                              href={`/laudos/${laudo._id}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {laudo._id.substring(0, 8)}
                            </a>
                          ) : (
                            <span className="text-slate-500">{laudo._id?.substring(0, 8) || '-'}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {formatarData(laudo.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                          {laudo.medicoResponsavel}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {laudo.exame?.paciente?.nome || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {laudo.exame?.tipoExame || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            laudo.status === 'Laudo assinado' 
                              ? 'bg-green-100 text-green-800' 
                              : laudo.status === 'Laudo realizado' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {laudo.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {formatarData(laudo.dataAssinatura)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Relatorios;
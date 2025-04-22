import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiDownload, FiEye } from 'react-icons/fi';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ListaFaturas = () => {
  const [faturas, setFaturas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState({
    medico: '',
    status: '',
    dataInicio: new Date(new Date().setMonth(new Date().getMonth() - 3)),
    dataFim: new Date()
  });
  const [medicos, setMedicos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMedicos = async () => {
      try {
        const response = await api.get('/usuarios', { params: { role: 'medico' } });
        setMedicos(response.data);
      } catch (err) {
        console.error('Erro ao carregar médicos:', err);
      }
    };
    fetchMedicos();
    buscarFaturas();
  }, []);

  const buscarFaturas = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        ...filtros,
        dataInicio: filtros.dataInicio.toISOString(),
        dataFim: filtros.dataFim.toISOString()
      };
      const response = await api.get('/financeiro/faturas', { params });
      setFaturas(response.data);
    } catch (err) {
      setError(err.response?.data?.erro || 'Erro ao buscar faturas');
    } finally {
      setLoading(false);
    }
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paga': return 'bg-green-100 text-green-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <FiDollarSign className="mr-2" />
        Faturas de Médicos
      </h1>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Médico</label>
            <select
              value={filtros.medico}
              onChange={(e) => setFiltros({...filtros, medico: e.target.value})}
              className="w-full p-2 border rounded"
            >
              <option value="">Todos</option>
              {Array.isArray(medicos) && medicos.map((medico) => (
                <option key={medico._id} value={medico._id}>{medico.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={filtros.status}
              onChange={(e) => setFiltros({...filtros, status: e.target.value})}
              className="w-full p-2 border rounded"
            >
              <option value="">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="paga">Paga</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data Início</label>
            <DatePicker
              selected={filtros.dataInicio}
              onChange={(date) => setFiltros({...filtros, dataInicio: date})}
              className="w-full p-2 border rounded"
              dateFormat="dd/MM/yyyy"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data Fim</label>
            <DatePicker
              selected={filtros.dataFim}
              onChange={(date) => setFiltros({...filtros, dataFim: date})}
              className="w-full p-2 border rounded"
              dateFormat="dd/MM/yyyy"
              minDate={filtros.dataInicio}
            />
          </div>
        </div>
        <button
          onClick={buscarFaturas}
          disabled={loading}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          Filtrar
        </button>
      </div>

      {/* Lista de Faturas */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Médico</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Período</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {faturas.map(fatura => (
              <tr key={fatura._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{fatura.medico.nome}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {new Date(fatura.periodoInicio).toLocaleDateString()} a {' '}
                    {new Date(fatura.periodoFim).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatarMoeda(fatura.valorTotal)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(fatura.status)}`}>
                    {fatura.status === 'paga' ? 'Paga' : fatura.status === 'cancelada' ? 'Cancelada' : 'Pendente'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => navigate(`/financeiro/faturas/${fatura._id}`)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <FiEye className="inline mr-1" /> Detalhes
                  </button>
                  <button className="text-green-600 hover:text-green-900">
                    <FiDownload className="inline mr-1" /> PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListaFaturas;
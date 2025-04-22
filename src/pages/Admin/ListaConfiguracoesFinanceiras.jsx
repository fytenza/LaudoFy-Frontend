import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiUser, FiPlus, FiEdit } from 'react-icons/fi';
import api from '../../api';
import { Link } from 'react-router-dom';

const ListaConfiguracoesFinanceiras = () => {
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMedicos = async () => {
      try {
        setLoading(true);
        const response = await api.get('/usuarios', { params: { role: 'medico' } });
        
        // Verifica se a resposta contém um array
        const dadosMedicos = Array.isArray(response.data) 
          ? response.data 
          : response.data?.usuarios || response.data?.items || [];
        
        setMedicos(dadosMedicos);
      } catch (err) {
        setError(err.response?.data?.message || 'Erro ao carregar médicos');
        console.error('Erro na requisição:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMedicos();
  }, []);

  if (loading) return <div className="text-center py-8">Carregando médicos...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <FiDollarSign className="mr-2" />
          Configurações Financeiras
        </h1>
        <Link
          to="/usuarios"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
        >
          <FiPlus className="mr-1" />
          Novo Médico
        </Link>
      </div>

      {medicos.length === 0 ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 p-4">
          <p>Nenhum médico cadastrado encontrado.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Médico</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {medicos.map((medico) => (
                <tr key={medico._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-full mr-3">
                        <FiUser className="text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{medico.nome}</div>
                        <div className="text-sm text-gray-500">CRM: {medico.crm || 'Não informado'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {medico.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      to={`/financeiro/configurar/${medico._id}`}
                      className="text-blue-600 hover:text-blue-900 flex items-center"
                    >
                      <FiEdit className="mr-1" />
                      Configurar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListaConfiguracoesFinanceiras;
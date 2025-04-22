import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiPieChart, FiBarChart2, FiCalendar } from 'react-icons/fi';
import { Bar, Pie } from 'react-chartjs-2';
import api from '../../api';
import 'chart.js/auto';

const DashboardFinanceiro = () => {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/financeiro/dashboard');
        setDados(response.data);
      } catch (err) {
        setError(err.response?.data?.erro || 'Erro ao carregar dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <FiBarChart2 className="mr-2" />
        Dashboard Financeiro
      </h1>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-600">Total Laudos</h3>
          <p className="text-2xl font-bold">{dados.resumoMes.count}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-600">Faturamento Bruto</h3>
          <p className="text-2xl font-bold">{formatarMoeda(dados.resumoMes.totalBase)}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-600">Lucro Clínica</h3>
          <p className="text-2xl font-bold">{formatarMoeda(dados.resumoMes.totalClinica)}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-600">Total Médicos</h3>
          <p className="text-2xl font-bold">{formatarMoeda(dados.resumoMes.totalMedico)}</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Gráfico de barras - histórico mensal */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiBarChart2 className="mr-2" />
            Faturamento Últimos Meses
          </h3>
          <Bar
            data={{
              labels: dados.historicoMensal.map(item => item.mes),
              datasets: [
                {
                  label: 'Faturamento Bruto',
                  data: dados.historicoMensal.map(item => item.totalBase),
                  backgroundColor: 'rgba(54, 162, 235, 0.6)'
                },
                {
                  label: 'Lucro Clínica',
                  data: dados.historicoMensal.map(item => item.totalClinica),
                  backgroundColor: 'rgba(75, 192, 192, 0.6)'
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return `${context.dataset.label}: ${formatarMoeda(context.raw)}`;
                    }
                  }
                }
              },
              scales: {
                y: {
                  ticks: {
                    callback: function(value) {
                      return formatarMoeda(value);
                    }
                  }
                }
              }
            }}
          />
        </div>

        {/* Gráfico de pizza - top médicos */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiPieChart className="mr-2" />
            Top Médicos (Este Mês)
          </h3>
          {dados.topMedicos.length > 0 ? (
            <Pie
              data={{
                labels: dados.topMedicos.map(item => item._id.nome),
                datasets: [{
                  data: dados.topMedicos.map(item => item.total),
                  backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)'
                  ]
                }]
              }}
              options={{
                responsive: true,
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `${context.label}: ${formatarMoeda(context.raw)}`;
                      }
                    }
                  }
                }
              }}
            />
          ) : (
            <p className="text-gray-500">Nenhum dado disponível</p>
          )}
        </div>
      </div>

      {/* Transações recentes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FiCalendar className="mr-2" />
          Últimos Laudos Processados
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Médico</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comissão</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dados.transacoesRecentes.map((transacao) => (
                <tr key={transacao._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transacao.dataLaudo).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {transacao.medico.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatarMoeda(transacao.valorBase)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transacao.comissao}% ({formatarMoeda(transacao.valorMedico)})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardFinanceiro;
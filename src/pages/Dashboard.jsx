import React, { useEffect, useState } from 'react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, LineChart, Line, ResponsiveContainer 
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Header from '../components/Header';
import Loader from '../components/Loader';
import { 
  FiAlertCircle, FiCalendar, FiFileText, FiUser, 
  FiTrendingUp, FiPieChart, FiClock, FiCheckCircle,
  FiBarChart2, FiDatabase, FiActivity, FiPlus,
  FiArrowRight, FiUsers, FiHeart, FiAlertTriangle,
  FiBell, FiSettings, FiMessageSquare, FiHelpCircle,
  FiClipboard
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [tiposExames, setTiposExames] = useState([]);
  const [evolucaoMensal, setEvolucaoMensal] = useState([]);
  const [examesRecentes, setExamesRecentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { logout, usuario } = useAuth();
  const navigate = useNavigate();

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
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('Não autenticado');
        }

        const [statsRes, tiposRes, evolucaoRes, recentesRes] = await Promise.all([
          api.get('/estatisticas/estatisticas'),
          api.get('/estatisticas/tipos-exames'),
          api.get('/estatisticas/evolucao-mensal'),
          api.get('/exames?limit=5&sort=-createdAt')
        ]);

        setStats(statsRes.data);
        setTiposExames(tiposRes.data);
        setEvolucaoMensal(evolucaoRes.data.map(item => ({
          mes: format(new Date(item._id.year, item._id.month - 1), 'MMM/yy', { locale: ptBR }),
          total: item.total,
          concluidos: item.concluidos
        })));
        setExamesRecentes(recentesRes.data.exames);
      } catch (err) {
        console.error('Erro no dashboard:', err);
        
        if (err.response?.status === 401 || err.message === 'Não autenticado') {
          setError('Sessão expirada. Redirecionando para login...');
          setTimeout(() => {
            logout();
            navigate('/login');
          }, 2000);
        } else {
          setError('Erro ao carregar dados do dashboard');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [logout, navigate]);

  if (loading) return <Loader />;
  if (error) return (
    <div className="min-h-screen bg-slate-50 p-6">
      <Header />
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="text-red-500 text-center py-8 flex flex-col items-center">
          <FiAlertCircle className="text-2xl mb-2" />
          {error}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <Header title="Visão Geral" />
      
      {/* Cards Estatísticos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Card Total de Exames */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Total de Exames</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{stats.totalExames}</h3>
              <p className="text-xs text-slate-500 mt-2">Todos os exames registrados</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
              <FiDatabase className="text-xl" />
            </div>
          </div>
          <div className="mt-4 h-1 w-full bg-slate-100 overflow-hidden rounded-full">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600" 
              style={{ width: '100%' }}
            ></div>
          </div>
        </div>

        {/* Card Pendentes */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Pendentes</p>
              <h3 className="text-3xl font-bold text-amber-500 mt-1">{stats.examesPendentes}</h3>
              <p className="text-xs text-slate-500 mt-2">Aguardando análise</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 text-amber-500 group-hover:bg-amber-100 transition-colors">
              <FiAlertCircle className="text-xl" />
            </div>
          </div>
          <div className="mt-4 h-1 w-full bg-slate-100 overflow-hidden rounded-full">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500" 
              style={{ width: `${(stats.examesPendentes / stats.totalExames) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Card Concluídos */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Concluídos</p>
              <h3 className="text-3xl font-bold text-green-500 mt-1">{stats.examesFinalizados}</h3>
              <p className="text-xs text-slate-500 mt-2">Exames finalizados</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 text-green-500 group-hover:bg-green-100 transition-colors">
              <FiCheckCircle className="text-xl" />
            </div>
          </div>
          <div className="mt-4 h-1 w-full bg-slate-100 overflow-hidden rounded-full">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-green-500" 
              style={{ width: `${(stats.examesFinalizados / stats.totalExames) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Seção de Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div 
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
          onClick={() => navigate('/exames/novo')}
        >
          <div className="flex items-center">
            <div className="p-3 mr-4 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
              <FiPlus className="text-xl" />
            </div>
            <div>
              <h3 className="font-medium text-slate-800">Novo Exame</h3>
              <p className="text-xs text-slate-500">Registrar novo exame</p>
            </div>
          </div>
          <FiArrowRight className="text-slate-400 group-hover:text-blue-600 transition-colors" />
        </div>

        <div 
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
          onClick={() => navigate('/pacientes/novo')}
        >
          <div className="flex items-center">
            <div className="p-3 mr-4 rounded-lg bg-green-50 text-green-600 group-hover:bg-green-100 transition-colors">
              <FiUser className="text-xl" />
            </div>
            <div>
              <h3 className="font-medium text-slate-800">Novo Paciente</h3>
              <p className="text-xs text-slate-500">Cadastrar novo paciente</p>
            </div>
          </div>
          <FiArrowRight className="text-slate-400 group-hover:text-green-600 transition-colors" />
        </div>

        {usuario.role == 'admin' &&
        <div 
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
          onClick={() => navigate('/usuarios')}
        >
          <div className="flex items-center">
            <div className="p-3 mr-4 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors">
              <FiUsers className="text-xl" />
            </div>
            <div>
              <h3 className="font-medium text-slate-800">Gerenciar Usuários</h3>
              <p className="text-xs text-slate-500">Administrar acessos</p>
            </div>
          </div>
          <FiArrowRight className="text-slate-400 group-hover:text-purple-600 transition-colors" />
        </div>
        }

        {usuario.role == 'admin' &&
        <div 
        className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
        onClick={() => navigate('/relatorios')}
        >
        <div className="flex items-center">
            <div className="p-3 mr-4 rounded-lg bg-orange-50 text-orange-600 group-hover:bg-orange-100 transition-colors">
            <FiPieChart className="text-xl" />
            </div>
            <div>
            <h3 className="font-medium text-slate-800">Emitir Relatórios</h3>
            <p className="text-xs text-slate-500">Gerar análises e dados</p>
            </div>
        </div>
        <FiArrowRight className="text-slate-400 group-hover:text-purple-600 transition-colors" />
        </div>
        }

        {['medico', 'tecnico'] .includes(usuario.role) &&
        <div 
        className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
        onClick={() => navigate('/laudos')}
        >
        <div className="flex items-center">
            <div className="p-3 mr-4 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors">
            <FiClipboard className="text-xl" />
            </div>
            <div>
            <h3 className="font-medium text-slate-800">Ver Laudos</h3>
            <p className="text-xs text-slate-500">Visualizar laudos</p>
            </div>
        </div>
        <FiArrowRight className="text-slate-400 group-hover:text-purple-600 transition-colors" />
        </div>
        }
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Distribuição de Tipos */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Distribuição de Tipos</h3>
              <p className="text-xs text-slate-500">Por tipo de exame</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
              <FiPieChart className="text-lg" />
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tiposExames}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={2}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {tiposExames.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={[
                        COLORS.primary,
                        COLORS.primaryDark,
                        COLORS.secondary,
                        COLORS.accent,
                        COLORS.warning,
                        '#94A3B8'
                      ][index % 6]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} exames`, 'Quantidade']}
                  labelFormatter={(label) => `Tipo: ${label}`}
                  contentStyle={{
                    background: COLORS.cardBg,
                    borderColor: COLORS.border,
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right"
                  wrapperStyle={{ 
                    paddingLeft: '20px',
                    fontSize: '12px',
                    color: COLORS.text
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Evolução Mensal */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Evolução Mensal</h3>
              <p className="text-xs text-slate-500">Últimos 12 meses</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
              <FiActivity className="text-lg" />
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolucaoMensal}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis 
                  dataKey="mes" 
                  stroke={COLORS.muted}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke={COLORS.muted}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value) => [`${value} exames`, 'Quantidade']}
                  labelFormatter={(label) => `Mês: ${label}`}
                  contentStyle={{
                    background: COLORS.cardBg,
                    borderColor: COLORS.border,
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend 
                  wrapperStyle={{
                    fontSize: '12px',
                    color: COLORS.text
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Total de Exames"
                  stroke={COLORS.primaryDark}
                  strokeWidth={2}
                  dot={{ r: 4, stroke: COLORS.primaryDark, strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: COLORS.primaryDark }}
                />
                <Line
                  type="monotone"
                  dataKey="concluidos"
                  name="Exames Concluídos"
                  stroke={COLORS.secondary}
                  strokeWidth={2}
                  dot={{ r: 4, stroke: COLORS.secondary, strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: COLORS.secondary }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Seção Inferior */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Tabela de Exames Recentes */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden lg:col-span-2">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 mr-3 rounded-lg bg-blue-100 text-blue-600">
                <FiFileText className="text-lg" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Últimos Exames Registrados</h3>
                <p className="text-xs text-slate-500">Os 5 exames mais recentes</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/exames')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center transition-colors"
            >
              Ver todos <FiArrowRight className="ml-1" />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Responsável
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {examesRecentes.length > 0 ? (
                  examesRecentes.map((exame) => (
                    <tr 
                      key={exame._id} 
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/exames/${exame._id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                            <FiUser className="text-slate-500" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">
                              {exame.paciente?.nome || 'Não informado'}
                            </div>
                            <div className="text-xs text-slate-500">
                              {exame.paciente?.idade ? `${exame.paciente.idade} anos` : 'Idade não informada'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">{exame.tipoExame}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          exame.status === 'Pendente' ? 'bg-amber-100 text-amber-800' :
                          exame.status === 'Concluído' ? 'bg-green-100 text-green-800' :
                          exame.status === 'Cancelado' ? 'bg-red-100 text-red-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {exame.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">
                          {exame.dataExame ? 
                            format(parseISO(exame.dataExame), 'dd/MM/yyyy', { locale: ptBR }) : 
                            <span className="text-slate-400">Não informada</span>
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {exame.tecnico?.nome || 'Não atribuído'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-slate-500">
                      Nenhum exame encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Seção de Avisos e Links Úteis */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 mr-3 rounded-lg bg-amber-100 text-amber-600">
                <FiBell className="text-lg" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Avisos e Alertas</h3>
                <p className="text-xs text-slate-500">Informações importantes</p>
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-slate-200">
            <div className="p-4 hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="flex items-start">
                <div className="p-1.5 mr-3 rounded-full bg-red-100 text-red-500">
                  <FiAlertTriangle className="text-sm" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-800">Exames Pendentes</h4>
                  <p className="text-sm text-slate-500 mt-1">
                    Você tem {stats.examesPendentes} exames aguardando análise
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="flex items-start">
                <div className="p-1.5 mr-3 rounded-full bg-blue-100 text-blue-500">
                  <FiMessageSquare className="text-sm" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-800">Atualização do Sistema</h4>
                  <p className="text-sm text-slate-500 mt-1">
                    Sistema atualizado conforme demanda
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="flex items-start">
                <div className="p-1.5 mr-3 rounded-full bg-green-100 text-green-500">
                  <FiHeart className="text-sm" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-800">Dica do Dia</h4>
                  <p className="text-sm text-slate-500 mt-1">
                    Verifique sempre os dados do paciente antes de registrar um exame
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="flex items-start">
                <div className="p-1.5 mr-3 rounded-full bg-purple-100 text-purple-500">
                  <FiHelpCircle className="text-sm" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-800">Precisa de Ajuda?</h4>
                  <p className="text-sm text-slate-500 mt-1">
                    Consulte nossa documentação ou entre em contato com o suporte
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
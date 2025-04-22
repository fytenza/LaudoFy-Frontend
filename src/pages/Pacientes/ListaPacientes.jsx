import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiPlus, FiFilter, FiX, FiUser, FiRefreshCw } from 'react-icons/fi';
import Tabela from '../../components/Tabela';
import { useAuth } from '../../contexts/AuthContext';

const ListaPacientes = () => {
    const [pacientes, setPacientes] = useState([]);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [totalItens, setTotalItens] = useState(0);
    const [filtros, setFiltros] = useState({
        nome: '',
        cpf: ''
    });
    const [erro, setErro] = useState('');
    const [notification, setNotification] = useState('');
    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPaciente, setSelectedPaciente] = useState(null);
    const navigate = useNavigate();
    const { usuario, logout } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // Funções auxiliares para manipulação de datas
    const formatarDataLocal = (dataString) => {
        if (!dataString || !dataString.match(/^\d{4}-\d{2}-\d{2}$/)) return 'Data inválida';
        
        // Separa os componentes diretamente da string
        const [year, month, day] = dataString.split('-');
        
        // Cria uma data UTC (ignora completamente o fuso horário do navegador)
        return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    };
    
    const calcularIdade = (dataString) => {
        if (!dataString || !dataString.match(/^\d{4}-\d{2}-\d{2}$/)) return 0;
        
        const [year, month, day] = dataString.split('-');
        const hoje = new Date();
        const nascimento = new Date(Date.UTC(year, month - 1, day));
        
        let idade = hoje.getUTCFullYear() - nascimento.getUTCFullYear();
        const mes = hoje.getUTCMonth() - nascimento.getUTCMonth();
        
        if (mes < 0 || (mes === 0 && hoje.getUTCDate() < nascimento.getUTCDate())) {
            idade--;
        }
        
        return idade;
    };

    const fetchPacientes = async () => {
        setIsLoading(true);
        setErro('');
        
        try {
            const params = {
                ...filtros,
                page: paginaAtual,
                limit: 10
            };
    
            // Remove filtros vazios
            Object.keys(params).forEach(key => {
                if (params[key] === '') {
                    delete params[key];
                }
            });
    
            const response = await api.get('/pacientes', { params });
            
            // Tratamento para diferentes formatos de resposta
            if (response.data && Array.isArray(response.data)) {
                setPacientes(response.data);
                setTotalPaginas(Math.ceil(response.data.length / 10));
                setTotalItens(response.data.length);
            } else if (response.data && response.data.pacientes) {
                setPacientes(response.data.pacientes);
                setTotalPaginas(response.data.totalPaginas || 1);
                setTotalItens(response.data.totalItens || 0);
            } else {
                setPacientes([]);
                setTotalPaginas(1);
                setTotalItens(0);
            }
        } catch (err) {
            if (err.response?.status === 401) {
                setErro('Sessão expirada. Redirecionando para login...');
                setTimeout(() => logout(), 2000);
            } else if (err.response) {
                setErro(`Erro ao carregar pacientes: ${err.response.data?.message || err.response.statusText}`);
            } else if (err.request) {
                setErro('Não foi possível conectar ao servidor. Verifique sua conexão.');
            } else {
                setErro('Ocorreu um erro inesperado.');
            }
            setPacientes([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPacientes();
    }, [paginaAtual, filtros]);

    const mudarPagina = (novaPagina) => {
        setPaginaAtual(novaPagina);
    };

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({ ...prev, [name]: value }));
    };

    const aplicarFiltros = () => {
        setPaginaAtual(1);
        fetchPacientes();
        setMostrarFiltros(false);
    };

    const limparFiltros = () => {
        setFiltros({
            nome: '',
            cpf: '',
        });
        setPaginaAtual(1);
    };

    const handleCancelDelete = () => {
        setIsModalOpen(false);
        setSelectedPaciente(null);
    };

    const colunas = [
        { 
            header: 'Nome', 
            key: 'nome',
            render: (value, row) => (
                <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                        <FiUser className="text-blue-500" />
                    </div>
                    <span className="font-medium text-slate-800">
                        {value || 'Não informado'}
                    </span>
                </div>
            )
        },
        { 
            header: 'Email', 
            key: 'email',
            render: (value) => value || '—'
        },
        { 
            header: 'Telefone', 
            key: 'telefone',
            render: (value) => value ? (
                <span className="text-slate-700">{value}</span>
            ) : '—'
        },
        { 
            header: 'Nascimento', 
            key: 'dataNascimento',
            render: (value) => value ? (
                <div>
                    <p className="text-slate-800">
                        {formatarDataLocal(value)}
                    </p>
                    <p className="text-xs text-slate-500">
                        {calcularIdade(value)} anos
                    </p>
                </div>
            ) : '—'
        }
    ];

    const acoes = [
        {
            label: 'Editar',
            acao: (paciente) => navigate(`/pacientes/editar/${paciente._id}`),
            icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>,
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
                                <FiUser className="text-blue-500 mr-3" />
                                Pacientes
                            </h1>
                            <p className="text-sm text-slate-500 mt-1">
                                {totalItens > 0 ? `${totalItens} pacientes encontrados` : 'Gerencie e visualize todos os pacientes'}
                            </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            {/* Botão de recarregar */}
                            <button
                                onClick={fetchPacientes}
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
                            
                            {/* Botão novo paciente */}
                            <button
                                onClick={() => navigate('/pacientes/novo')}
                                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                <FiPlus className="mr-2" />
                                <span>Novo Paciente</span>
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
                                {/* Nome */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiSearch className="text-slate-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="nome"
                                            value={filtros.nome}
                                            onChange={handleFiltroChange}
                                            placeholder="Buscar por nome..."
                                            className="block w-full pl-10 pr-3 py-2 border border-slate-300 text-slate-500 outline-none rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* CPF */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
                                    <input
                                        type="text"
                                        name="cpf"
                                        value={filtros.cpf}
                                        onChange={handleFiltroChange}
                                        placeholder="Buscar por CPF..."
                                        className="block w-full px-3 py-2 border border-slate-300 text-slate-500 outline-none rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
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
                            <svg className="text-red-500 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-700">{erro}</p>
                        </div>
                    </div>
                )}

                {/* Mensagem de notificação */}
                {notification && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4">
                        <div className="flex items-center">
                            <svg className="text-green-500 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-green-700">{notification}</p>
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
                            dados={pacientes} 
                            acoes={acoes}
                            mensagemSemDados={
                                <div className="text-center py-12">
                                    <FiUser className="mx-auto text-slate-300 text-4xl mb-3" />
                                    <h3 className="text-lg font-medium text-slate-500">Nenhum paciente encontrado</h3>
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

            {/* Modal de Confirmação */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Confirmar Exclusão</h2>
                        <p className="mb-4">
                            Tem certeza que deseja excluir o paciente{' '}
                            <strong>{selectedPaciente?.nome}</strong>? Esta ação não pode ser desfeita.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={handleCancelDelete}
                                className="px-4 py-2 rounded bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
                            >
                                Confirmar Exclusão
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListaPacientes;
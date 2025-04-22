import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiPlus, FiFilter, FiCalendar, FiX, FiChevronDown, FiUser, FiRefreshCw } from 'react-icons/fi';
import Tabela from '../../components/Tabela';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';

const ListaUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [totalItens, setTotalItens] = useState(0);
    const [filtros, setFiltros] = useState({
        nome: '',
        email: '',
        role: '',
        dataInicio: '',
        dataFim: ''
    });
    const [erro, setErro] = useState('');
    const [notification, setNotification] = useState({ texto: '', tipo: '' });
    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUsuario, setSelectedUsuario] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { usuario, logout } = useAuth();

    const opcoesRole = [
        { value: '', label: 'Todos' },
        { value: 'admin', label: 'Administrador' },
        { value: 'medico', label: 'Médico' },
        { value: 'tecnico', label: 'Técnico' }
    ];

    const fetchUsuarios = async () => {
        try {
            setIsLoading(true);
            setErro('');
            
            const params = {
                ...filtros,
                page: paginaAtual,
                limit: 10
            };
    
            // Remove campos vazios
            Object.keys(params).forEach(key => {
                if (params[key] === '') {
                    delete params[key];
                }
            });
    
            const response = await api.get('/usuarios', { params });
            
            if (response.data && Array.isArray(response.data.usuarios)) {
                setUsuarios(response.data.usuarios);
                setTotalPaginas(response.data.totalPaginas || 1);
                setTotalItens(response.data.totalItens || 0);
            } else {
                setUsuarios([]);
                setTotalPaginas(1);
                setTotalItens(0);
            }
        } catch (err) {
            if (err.response?.status === 401) {
                setErro('Sessão expirada. Redirecionando para login...');
                setTimeout(() => logout(), 2000);
            } else {
                setErro(err.response?.data?.message || 'Erro ao carregar usuários');
                console.error('Erro ao buscar usuários:', err);
            }
            setUsuarios([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsuarios();
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
            nome: '',
            email: '',
            role: '',
            dataInicio: '',
            dataFim: ''
        });
        setPaginaAtual(1);
    };

    const aplicarFiltros = () => {
        setPaginaAtual(1);
        setMostrarFiltros(false);
    };

    const handleExcluirClick = (usuario) => {
        setSelectedUsuario(usuario);
        setIsModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            setIsLoading(true);
            await api.delete(`/usuarios/${selectedUsuario._id}`);
            
            setUsuarios(prev => prev.filter(u => u._id !== selectedUsuario._id));
            setNotification({
                texto: 'Usuário excluído com sucesso!',
                tipo: 'sucesso'
            });
        } catch (err) {
            if (err.response?.status === 401) {
                setErro('Sessão expirada. Redirecionando para login...');
                setTimeout(() => logout(), 2000);
            } else {
                setNotification({
                    texto: err.response?.data?.message || 'Erro ao excluir usuário',
                    tipo: 'erro'
                });
            }
        } finally {
            setIsModalOpen(false);
            setSelectedUsuario(null);
            setIsLoading(false);
            
            // Limpar notificação após 5 segundos
            setTimeout(() => setNotification({ texto: '', tipo: '' }), 5000);
        }
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
            render: (value) => (
                <span className="text-slate-700">{value || '—'}</span>
            )
        },
        {
            header: 'Função',
            key: 'role',
            render: (value) => (
                <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                        value === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : value === 'medico'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                    }`}
                >
                    {opcoesRole.find(r => r.value === value)?.label || value}
                </span>
            ),
        },
        { 
            header: 'Data Cadastro', 
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
            label: 'Editar',
            acao: (usuario) => navigate(`/usuarios/editar/${usuario._id}`),
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
                                Usuários do Sistema
                            </h1>
                            <p className="text-sm text-slate-500 mt-1">
                                {totalItens > 0 ? `${totalItens} usuários encontrados` : 'Gerencie e visualize todos os usuários'}
                            </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            {/* Botão de recarregar */}
                            <button
                                onClick={fetchUsuarios}
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
                            
                            {/* Botão novo usuário */}
                            {usuario?.role === 'admin' && (
                                <button
                                    onClick={() => navigate('/usuarios/novo')}
                                    className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    <FiPlus className="mr-2" />
                                    <span>Novo Usuário</span>
                                </button>
                            )}
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

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                    <input
                                        type="text"
                                        name="email"
                                        value={filtros.email}
                                        onChange={handleFiltroChange}
                                        placeholder="Buscar por email..."
                                        className="block w-full px-3 py-2 border border-slate-300 text-slate-500 outline-none rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                {/* Função */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Função</label>
                                    <div className="relative">
                                        <select
                                            name="role"
                                            value={filtros.role}
                                            onChange={handleFiltroChange}
                                            className="block w-full pl-3 pr-8 py-2 border border-slate-300 text-slate-500 outline-none rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                                        >
                                            {opcoesRole.map((opcao) => (
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
                            <svg className="text-red-500 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-700">{erro}</p>
                        </div>
                    </div>
                )}

                {/* Mensagem de notificação */}
                {notification.texto && (
                    <div className={`border-l-4 p-4 ${
                        notification.tipo === 'sucesso' 
                            ? 'bg-green-50 border-green-500 text-green-700' 
                            : 'bg-red-50 border-red-500 text-red-700'
                    }`}>
                        <div className="flex items-center">
                            <svg className={`mr-2 h-5 w-5 ${
                                notification.tipo === 'sucesso' ? 'text-green-500' : 'text-red-500'
                            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {notification.tipo === 'sucesso' ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                )}
                            </svg>
                            <p>{notification.texto}</p>
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
                            dados={usuarios} 
                            acoes={acoes}
                            mensagemSemDados={
                                <div className="text-center py-12">
                                    <FiUser className="mx-auto text-slate-300 text-4xl mb-3" />
                                    <h3 className="text-lg font-medium text-slate-500">Nenhum usuário encontrado</h3>
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
                                    disabled={paginaAtual === 1 || isLoading}
                                    className={`px-3 py-1 rounded-md border ${
                                        paginaAtual === 1 || isLoading 
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
                                            onClick={() => !isLoading && mudarPagina(pageNum)}
                                            disabled={isLoading}
                                            className={`px-3 py-1 rounded-md border ${
                                                paginaAtual === pageNum 
                                                    ? 'bg-blue-600 text-white border-blue-600' 
                                                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                
                                <button
                                    onClick={() => mudarPagina(paginaAtual + 1)}
                                    disabled={paginaAtual === totalPaginas || isLoading}
                                    className={`px-3 py-1 rounded-md border ${
                                        paginaAtual === totalPaginas || isLoading 
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
                        <p className="mb-4 text-slate-700">
                            Tem certeza que deseja excluir o usuário <strong>{selectedUsuario?.nome}</strong>?
                            Esta ação não pode ser desfeita.
                        </p>
                        {selectedUsuario?.email && (
                            <p className="mb-4 text-slate-600">Email: {selectedUsuario.email}</p>
                        )}
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                disabled={isLoading}
                                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={isLoading}
                                className={`px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Excluindo...
                                    </>
                                ) : 'Confirmar Exclusão'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListaUsuarios;
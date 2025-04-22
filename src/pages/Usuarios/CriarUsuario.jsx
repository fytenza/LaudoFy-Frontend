import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  IoArrowBack, 
  IoPersonOutline,
  IoDocumentTextOutline,
  IoLockClosedOutline,
  IoMailOutline
} from 'react-icons/io5';
import { FaUserAlt, FaUserShield } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const CriarUsuario = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        senha: '',
        role: 'tecnico',
        crm: ''
    });
    const [erro, setErro] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);

    useEffect(() => {
        if (id) {
            const fetchUsuario = async () => {
                try {
                    setIsLoading(true);
                    setErro('');
                    
                    const response = await api.get(`/usuarios/${id}`);
                    setFormData(response.data);
                    setModoEdicao(true);
                } catch (err) {
                    if (err.response?.status === 401) {
                        setErro('Sessão expirada. Redirecionando para login...');
                        setTimeout(() => logout(), 2000);
                    } else {
                        setErro('Erro ao carregar dados do usuário. Tente novamente.');
                    }
                } finally {
                    setIsLoading(false);
                }
            };
            fetchUsuario();
        }
    }, [id, logout]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validarFormulario = () => {
        if (!formData.email.includes('@') || !formData.email.includes('.')) {
            setErro('Por favor, insira um email válido.');
            return false;
        }

        if (!modoEdicao && !formData.senha) {
            setErro('A senha é obrigatória para novo usuário.');
            return false;
        }

        if ((modoEdicao && formData.role === 'medico' || 
            (!modoEdicao && formData.role === 'medico')) && !formData.crm) {
            setErro('O CRM é obrigatório para médicos.');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validarFormulario()) {
            return;
        }

        setIsLoading(true);
        setErro('');
        setMensagem('');

        try {
            const usuarioData = { ...formData };

            if (modoEdicao && !usuarioData.senha) {
                delete usuarioData.senha;
            }

            if (usuarioData.role !== 'medico') {
                delete usuarioData.crm;
            }

            if (modoEdicao) {
                await api.put(`/usuarios/${id}`, usuarioData);
                setMensagem('Usuário atualizado com sucesso!');
            } else {
                await api.post('/usuarios', usuarioData);
                setMensagem('Usuário cadastrado com sucesso!');
            }

            setTimeout(() => navigate('/usuarios'), 1500);
        } catch (err) {
            if (err.response?.status === 401) {
                setErro('Sessão expirada. Redirecionando para login...');
                setTimeout(() => logout(), 2000);
            } else if (err.response?.data?.errors) {
                const errorMessages = err.response.data.errors.map(e => e.msg).join(', ');
                setErro(`Erro de validação: ${errorMessages}`);
            } else {
                setErro(err.response?.data?.message || 'Erro ao salvar usuário. Tente novamente.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const mostrarCampoCRM = () => {
        if (modoEdicao) {
            return formData.role === 'medico';
        }
        return formData.role === 'medico';
    };

    if (isLoading && id) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-slate-700">Carregando dados do usuário...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Cabeçalho */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/usuarios')}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            <IoArrowBack className="text-lg" />
                            <span className="font-medium">Voltar</span>
                        </button>
                        
                        <div className="hidden md:block h-6 w-px bg-slate-300"></div>
                        
                        <h1 className="text-2xl font-bold text-slate-800">
                            {modoEdicao ? 'Editar Usuário' : 'Cadastrar Novo Usuário'}
                        </h1>
                    </div>
                </div>

                {/* Mensagens de feedback */}
                {erro && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                        <div className="flex items-center">
                            <svg className="text-red-500 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-700">{erro}</p>
                        </div>
                    </div>
                )}
                {mensagem && (
                    <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                        <div className="flex items-center">
                            <svg className="text-green-500 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-green-700">{mensagem}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Seção Informações Básicas */}
                    <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 backdrop-blur-sm">
                        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <FaUserAlt className="text-blue-500" />
                            Informações Básicas
                        </h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Campo Nome */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                <IoPersonOutline className="text-slate-500" />
                                Nome Completo *
                            </label>
                            <input
                                type="text"
                                name="nome"
                                value={formData.nome}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-slate-300 text-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Digite o nome completo"
                                required
                            />
                        </div>

                        {/* Campo Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                <IoMailOutline className="text-slate-500" />
                                Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-slate-300 text-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Digite o email"
                                required
                            />
                        </div>

                        {/* Campo Senha */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                <IoLockClosedOutline className="text-slate-500" />
                                Senha {!modoEdicao && <span className="text-red-500">*</span>}
                            </label>
                            <input
                                type="password"
                                name="senha"
                                value={formData.senha}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-slate-300 text-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder={modoEdicao ? "Deixe em branco para manter" : "Digite uma senha segura"}
                                required={!modoEdicao}
                            />
                            {modoEdicao && (
                                <p className="mt-1 text-xs text-slate-500">
                                    Deixe em branco para manter a senha atual
                                </p>
                            )}
                        </div>

                        {/* Campo Função */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                <FaUserShield className="text-slate-500" />
                                Função *
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-slate-300 text-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                            >
                                <option value="tecnico">Técnico</option>
                                <option value="medico">Médico</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>

                        {/* Campo CRM - Exibido condicionalmente */}
                        {mostrarCampoCRM() && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                    <IoDocumentTextOutline className="text-slate-500" />
                                    CRM *
                                </label>
                                <input
                                    type="text"
                                    name="crm"
                                    value={formData.crm}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-slate-300 text-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Digite o CRM"
                                    required={formData.role === 'medico'}
                                />
                            </div>
                        )}
                    </div>

                    {/* Botão de Envio */}
                    <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3 rounded-lg font-semibold text-white transition-colors flex items-center justify-center gap-2 ${
                                isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700 shadow-sm'
                            }`}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Processando...</span>
                                </>
                            ) : (
                                <>
                                    <IoDocumentTextOutline className="text-lg" />
                                    <span>{modoEdicao ? 'Atualizar Usuário' : 'Cadastrar Usuário'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CriarUsuario;
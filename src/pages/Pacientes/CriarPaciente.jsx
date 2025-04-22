import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  IoArrowBack, 
  IoPersonOutline,
  IoDocumentTextOutline,
  IoCalendarOutline,
  IoLocationOutline,
  IoCallOutline,
  IoMailOutline,
  IoTimeOutline,
  IoDownloadOutline
} from 'react-icons/io5';
import { FaUserAlt, FaIdCard } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import DatePicker from 'react-datepicker';

const CriarPaciente = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [formData, setFormData] = useState({
        nome: '',
        cpf: '',
        dataNascimento: '',
        endereco: '',
        telefone: '',
        email: ''
    });
    const [erro, setErro] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('dados');
    const [laudos, setLaudos] = useState([]);
    const [loadingLaudos, setLoadingLaudos] = useState(false);
    const usuarioLogado = useAuth();

    useEffect(() => {
        if (id) {
            const fetchPaciente = async () => {
                try {
                    setIsLoading(true);
                    setErro('');
                    
                    const response = await api.get(`/pacientes/${id}`);
                    setFormData(response.data);
                } catch (err) {
                    if (err.response?.status === 401) {
                        setErro('Sessão expirada. Redirecionando para login...');
                        setTimeout(() => logout(), 2000);
                    } else {
                        setErro('Erro ao carregar dados do paciente. Tente novamente.');
                    }
                } finally {
                    setIsLoading(false);
                }
            };
            fetchPaciente();
        }
    }, [id, logout]);

    useEffect(() => {
        if (id && activeTab === 'historico') {
            fetchLaudos();
        }
    }, [id, activeTab]);

    const handleApiError = (err, defaultMessage) => {
        if (err.response?.status === 401) {
            setErro('Sessão expirada. Redirecionando para login...');
            setTimeout(() => logout(), 2000);
        } else {
            setErro(err.response?.data?.message || defaultMessage);
        }
    };

    const fetchLaudos = async () => {
        try {
          setLoadingLaudos(true);
          setErro('');
          const response = await api.get(`/laudos/pacientes/${id}`);
          
          // Ajuste para a estrutura de retorno do aggregate
          const laudosData = response.data?.laudos || response.data?.data?.laudos || response.data || [];
          
          setLaudos(laudosData);
        } catch (err) {
          handleApiError(err, 'Erro ao carregar histórico de laudos. Tente novamente.');
          setLaudos([]);
        } finally {
          setLoadingLaudos(false);
        }
      };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const formatarCPF = (value) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    };

    const formatarTelefone = (value) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1');
    };

    const validarFormulario = () => {
        if (formData.cpf.replace(/\D/g, '').length !== 11) {
            setErro('CPF inválido. Deve conter 11 dígitos.');
            return false;
        }

        if (formData.telefone.replace(/\D/g, '').length < 10) {
            setErro('Telefone inválido. Deve conter pelo menos 10 dígitos.');
            return false;
        }

        if (!formData.dataNascimento) {
            setErro('Data de nascimento é obrigatória.');
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
            let dataNormalizada = '';
            if (formData.dataNascimento) {
                const date = new Date(formData.dataNascimento);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                dataNormalizada = `${year}-${month}-${day}`;
            }

            const pacienteData = {
                nome: formData.nome,
                cpf: formData.cpf,
                dataNascimento: formData.dataNascimento,
                endereco: formData.endereco,
                telefone: formData.telefone,
                email: formData.email
            };
    
            const response = id 
                ? await api.put(`/pacientes/${id}`, pacienteData)
                : await api.post('/pacientes', pacienteData);
    
            if (response.data.success) {
                setMensagem(id 
                    ? 'Paciente atualizado com sucesso!' 
                    : 'Paciente cadastrado com sucesso!');
                setTimeout(() => navigate('/pacientes'), 1500);
            } else {
                setErro(response.data.erro || 'Operação concluída, mas com avisos.');
            }
        } catch (err) {
            console.error('Erro na requisição:', err);
            
            if (err.response?.status === 401) {
                setErro('Sessão expirada. Redirecionando para login...');
                setTimeout(() => logout(), 2000);
            } else if (err.response?.data?.erro) {
                setErro(err.response.data.erro);
            } else if (err.response?.data?.errors) {
                const errorMessages = err.response.data.errors.map(e => e.msg).join(', ');
                setErro(`Erro de validação: ${errorMessages}`);
            } else {
                setErro(err.message || 'Erro ao salvar paciente. Tente novamente.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && id && activeTab === 'dados') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-slate-700">Carregando dados do paciente...</p>
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
                            onClick={() => navigate('/pacientes')}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            <IoArrowBack className="text-lg" />
                            <span className="font-medium">Voltar</span>
                        </button>
                        
                        <div className="hidden md:block h-6 w-px bg-slate-300"></div>
                        
                        <h1 className="text-2xl font-bold text-slate-800">
                            {id ? 'Editar Paciente' : 'Cadastrar Novo Paciente'}
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

                {/* Abas */}
                {id && (
                    <div className="mb-6 border-b border-slate-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('dados')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'dados' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                            >
                                Dados do Paciente
                            </button>
                            <button
                                onClick={() => setActiveTab('historico')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'historico' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                            >
                                Histórico de Laudos
                            </button>
                        </nav>
                    </div>
                )}

                {activeTab === 'dados' ? (
                    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        {/* Seção Informações Pessoais */}
                        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 backdrop-blur-sm">
                            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                <FaUserAlt className="text-blue-500" />
                                Informações Pessoais
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

                            {/* Campo CPF */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                    <FaIdCard className="text-slate-500" />
                                    CPF *
                                </label>
                                <input
                                    type="text"
                                    name="cpf"
                                    value={formatarCPF(formData.cpf)}
                                    onChange={(e) => {
                                        const formatted = formatarCPF(e.target.value);
                                        setFormData(prev => ({
                                            ...prev,
                                            cpf: formatted
                                        }));
                                    }}
                                    className="w-full px-4 py-3 border border-slate-300 text-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="000.000.000-00"
                                    maxLength="14"
                                    required
                                />
                            </div>

                            {/* Campo Data de Nascimento */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                    <IoCalendarOutline className="text-slate-500" />
                                    Data de Nascimento *
                                </label>
                                <input
                                    type="date"
                                    name="dataNascimento"
                                    value={formData.dataNascimento}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-slate-300 text-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    required
                                    max={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            {/* Campo Endereço */}
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                    <IoLocationOutline className="text-slate-500" />
                                    Endereço Completo *
                                </label>
                                <input
                                    type="text"
                                    name="endereco"
                                    value={formData.endereco}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-slate-300 text-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Digite o endereço completo" 
                                    required
                                />
                            </div>
                        </div>

                        {/* Seção Informações de Contato */}
                        <div className="px-6 py-4 border-t border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 backdrop-blur-sm">
                            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                <IoCallOutline className="text-blue-500" />
                                Informações de Contato
                            </h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Campo Telefone */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                    <IoCallOutline className="text-slate-500" />
                                    Telefone *
                                </label>
                                <input
                                    type="text"
                                    name="telefone"
                                    value={formatarTelefone(formData.telefone)}
                                    onChange={(e) => {
                                        const formatted = formatarTelefone(e.target.value);
                                        setFormData(prev => ({
                                            ...prev,
                                            telefone: formatted
                                        }));
                                    }}
                                    className="w-full px-4 py-3 border border-slate-300 text-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="(00) 00000-0000"
                                    maxLength="15"
                                    required
                                />
                            </div>

                            {/* Campo Email */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                    <IoMailOutline className="text-slate-500" />
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-slate-300 text-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Digite o email"
                                />
                            </div>
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
                                        <span>{id ? 'Atualizar Paciente' : 'Cadastrar Paciente'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 backdrop-blur-sm">
                            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                <IoTimeOutline className="text-blue-500" />
                                Histórico de Laudos
                            </h2>
                        </div>

                        {/* Lista de laudos */}
                        {loadingLaudos ? (
                            <div className="p-8 flex justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        ) : laudos.length === 0 ? (
                            <div className="p-6 text-center text-slate-500">
                                Nenhum laudo encontrado para este paciente.
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-200">
                                {laudos.map((laudo) => (
                                    <div key={laudo.id} className="p-6 hover:bg-slate-50 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-medium text-slate-900">
                                                    Laudo #{laudo.id}
                                                </h3>
                                                <p className="text-sm text-slate-500 mt-1">
                                                    Data: {new Date(laudo.createdAt).toLocaleDateString()}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    Médico: {laudo.medicoResponsavel || 'Não informado'}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => navigate(`/laudos/${laudo.id}`)}
                                                className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-sm hover:bg-blue-100 transition-colors"
                                            >
                                                Ver Detalhes
                                            </button>
                                        </div>
                                        <div className="mt-3">
                                            <p className="text-sm text-slate-700 line-clamp-2">
                                                {laudo.conclusao || 'Nenhum diagnóstico registrado'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CriarPaciente;
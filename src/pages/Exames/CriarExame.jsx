import React, { useEffect, useState } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import { 
  IoArrowBack, 
  IoDocumentTextOutline,
  IoPersonOutline,
  IoPulseOutline,
  IoBodyOutline,
  IoAddCircleOutline,
  IoClose
} from 'react-icons/io5';
import { FaFileUpload, FaUserAlt, FaWeight, FaRulerVertical } from 'react-icons/fa';
import { GiHeartBeats } from 'react-icons/gi';
import { useAuth } from '../../contexts/AuthContext';

const CriarExame = () => {
    const [pacientes, setPacientes] = useState([]);
    const [nomePaciente, setNomePaciente] = useState('');
    const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
    const [tipoExame, setTipoExame] = useState('ECG');
    const [sintomas, setSintomas] = useState('');
    const [segmentoPR, setSegmentoPR] = useState('');
    const [frequenciaCardiaca, setFrequenciaCardiaca] = useState('');
    const [duracaoQRS, setDuracaoQRS] = useState('');
    const [eixoMedioQRS, setEixoMedioQRS] = useState('');
    const [altura, setAltura] = useState('');
    const [peso, setPeso] = useState('');
    const [arquivo, setArquivo] = useState(null);
    const [erro, setErro] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPacientesDropdown, setShowPacientesDropdown] = useState(false);
    const navigate = useNavigate();
    const { logout } = useAuth();

    // Paleta de cores moderna e tecnológica
    const COLORS = {
        primary: '#3B82F6',      // Azul principal
        primaryLight: '#93C5FD', // Azul claro
        primaryDark: '#1D4ED8',  // Azul escuro
        secondary: '#10B981',    // Verde
        accent: '#8B5CF6',       // Roxo
        warning: '#F59E0B',      // Amarelo
        danger: '#EF4444',       // Vermelho
        background: '#F8FAFC',   // Fundo
        cardBg: '#FFFFFF',       // Fundo dos cards
        text: '#1E293B',         // Texto escuro
        muted: '#64748B',        // Texto cinza
        border: '#E2E8F0'        // Bordas
    };

    const fetchPacientes = async (query) => {
        try {
            const response = await api.get(`/pacientes?nome=${query}`);
            setPacientes(response.data || []);
            setShowPacientesDropdown(true);
        } catch (err) {
            if (err.response?.status === 401) {
                setErro('Sessão expirada. Redirecionando para login...');
                setTimeout(() => logout(), 2000);
            } else {
                setErro('Erro ao buscar pacientes.');
            }
            setPacientes([]);
        }
    };

    useEffect(() => {
        if (nomePaciente.trim() === '') {
            setPacientes([]);
            setShowPacientesDropdown(false);
            return;
        }

        const debounceFetch = setTimeout(() => {
            fetchPacientes(nomePaciente);
        }, 300);

        return () => clearTimeout(debounceFetch);
    }, [nomePaciente, logout]);

    const validarFormulario = () => {
        if (!pacienteSelecionado) {
            setErro('Selecione um paciente válido');
            return false;
        }

        if (!sintomas.trim()) {
            setErro('Descreva os sintomas do paciente');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErro('');
        setMensagem('');

        if (!validarFormulario()) {
            setIsLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('paciente', pacienteSelecionado);
            formData.append('tipoExame', tipoExame);
            formData.append('sintomas', sintomas);
            if (segmentoPR) formData.append('segmentoPR', segmentoPR);
            if (frequenciaCardiaca) formData.append('frequenciaCardiaca', frequenciaCardiaca);
            if (duracaoQRS) formData.append('duracaoQRS', duracaoQRS);
            if (eixoMedioQRS) formData.append('eixoMedioQRS', eixoMedioQRS);
            formData.append('altura', altura);
            formData.append('peso', peso);
            
            if (arquivo) {
                formData.append('arquivo', arquivo);
            }

            await api.post('/exames', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setMensagem('Exame criado com sucesso!');
            setTimeout(() => navigate('/exames'), 1500);
        } catch (err) {
            if (err.response?.status === 401) {
                setErro('Sessão expirada. Redirecionando para login...');
                setTimeout(() => logout(), 2000);
            } else if (err.response?.data?.errors) {
                const errorMessages = err.response.data.errors.map(e => e.msg).join(', ');
                setErro(`Erro de validação: ${errorMessages}`);
            } else {
                setErro(err.response?.data?.message || 'Erro ao criar exame. Tente novamente.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const selecionarPaciente = (paciente) => {
        setPacienteSelecionado(paciente._id);
        setNomePaciente(paciente.nome);
        setShowPacientesDropdown(false);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 100 * 1024 * 1024) { // 10MB
                setErro('O arquivo deve ter no máximo 100MB');
                return;
            }
            setArquivo(file);
        }
    };

    const removeFile = () => {
        setArquivo(null);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Cabeçalho */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/exames')}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            <IoArrowBack className="text-lg" />
                            <span className="font-medium">Voltar</span>
                        </button>
                        
                        <div className="hidden md:block h-6 w-px bg-slate-300"></div>
                        
                        <h1 className="text-2xl font-bold text-slate-800">
                            Novo Exame
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
                            <IoAddCircleOutline className="text-blue-500" />
                            Informações Básicas
                        </h2>
                    </div>
                    <div className="p-6 space-y-6">
                        {/* Seção Paciente */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                <IoPersonOutline className="text-slate-500" />
                                Paciente *
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={nomePaciente}
                                    onChange={(e) => {
                                        setNomePaciente(e.target.value);
                                        setPacienteSelecionado(null);
                                    }}
                                    onFocus={() => nomePaciente && setShowPacientesDropdown(true)}
                                    className="w-full px-4 py-3 border border-slate-300 text-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Digite o nome do paciente"
                                    required
                                />
                                {showPacientesDropdown && pacientes.length > 0 && (
                                    <ul className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {pacientes.map((paciente) => (
                                            <li
                                                key={paciente._id}
                                                onClick={() => selecionarPaciente(paciente)}
                                                className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors flex items-center gap-3"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                                                    <FaUserAlt className="text-blue-500 text-sm" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-800">{paciente.nome}</p>
                                                    <p className="text-sm text-slate-500">{paciente.cpf}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {/* Seção Tipo de Exame */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                <IoDocumentTextOutline className="text-slate-500" />
                                Tipo de Exame *
                            </label>
                            <select
                                value={tipoExame}
                                onChange={(e) => setTipoExame(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-300 text-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                                required
                            >
                                <option value="ECG">Eletrocardiograma (ECG)</option>
                                <option value="Holter">Holter</option>
                                <option value="Ergometria">Ergometria</option>
                                <option value="Mapa">Mapa</option>
                                <option value="Outro">Outro</option>
                            </select>
                        </div>

                        {/* Seção Sintomas */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                <GiHeartBeats className="text-slate-500" />
                                Sintomas *
                            </label>
                            <textarea
                                value={sintomas}
                                onChange={(e) => setSintomas(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-300 text-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                rows="3"
                                placeholder="Descreva os sintomas apresentados pelo paciente"
                                required
                            />
                        </div>
                    </div>

                    {/* Seção Parâmetros do Exame */}
                    <div className="px-6 py-4 border-t border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 backdrop-blur-sm">
                        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <IoPulseOutline className="text-blue-500" />
                            Parâmetros do Exame
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Segmento PR (ms)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        value={segmentoPR}
                                        onChange={(e) => setSegmentoPR(e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-300 text-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="120"
                                    />
                                    <span className="absolute right-3 top-3 text-slate-400">ms</span>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Frequência Cardíaca (bpm)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        value={frequenciaCardiaca}
                                        onChange={(e) => setFrequenciaCardiaca(e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-300 text-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="75"
                                    />
                                    <span className="absolute right-3 top-3 text-slate-400">bpm</span>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Duração QRS (ms)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        value={duracaoQRS}
                                        onChange={(e) => setDuracaoQRS(e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-300 text-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="90"
                                    />
                                    <span className="absolute right-3 top-3 text-slate-400">ms</span>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Eixo Médio QRS (°)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        max="360"
                                        value={eixoMedioQRS}
                                        onChange={(e) => setEixoMedioQRS(e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-300 text-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="45"
                                    />
                                    <span className="absolute right-3 top-3 text-slate-400">°</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Seção Dados Antropométricos */}
                    <div className="px-6 py-4 border-t border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 backdrop-blur-sm">
                        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <IoBodyOutline className="text-blue-500" />
                            Dados Antropométricos
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                    <FaRulerVertical className="text-slate-500" />
                                    Altura (cm)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        value={altura}
                                        onChange={(e) => setAltura(e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-300 text-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="170"
                                    />
                                    <span className="absolute right-3 top-3 text-slate-400">cm</span>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                    <FaWeight className="text-slate-500" />
                                    Peso (kg)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        value={peso}
                                        onChange={(e) => setPeso(e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-300 text-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="70"
                                    />
                                    <span className="absolute right-3 top-3 text-slate-400">kg</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Seção Arquivo */}
                    <div className="px-6 py-4 border-t border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 backdrop-blur-sm">
                        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <FaFileUpload className="text-blue-500" />
                            Arquivo do Exame
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Selecione o arquivo (PDF, JPG, PNG)</label>
                            
                            {arquivo ? (
                                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                                <FaFileUpload className="text-blue-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800">{arquivo.name}</p>
                                                <p className="text-sm text-slate-500">{(arquivo.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={removeFile}
                                            className="text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            <IoClose className="text-lg" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <FaFileUpload className="text-2xl text-slate-400 mb-2" />
                                        <p className="text-sm text-slate-500">
                                            Clique para selecionar ou arraste o arquivo
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">Tamanho máximo: 100MB</p>
                                    </div>
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        onChange={handleFileChange}
                                        accept=".pdf,.jpg,.jpeg,.png"
                                    />
                                </label>
                            )}
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
                                    <IoAddCircleOutline className="text-lg" />
                                    <span>Criar Exame</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CriarExame;
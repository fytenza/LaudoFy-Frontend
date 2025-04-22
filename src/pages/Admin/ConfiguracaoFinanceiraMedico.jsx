import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiUser, FiPlus, FiTrash2 } from 'react-icons/fi';
import api from '../../api';
import { useParams } from 'react-router-dom';

const ConfiguracaoFinanceiraMedico = () => {
  const { medicoId } = useParams();
  const [config, setConfig] = useState({
    medico: medicoId,
    valoresPorTipo: [],
    comissao: 30,
    ativo: true
  });
  const [medico, setMedico] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [novoTipo, setNovoTipo] = useState({
    tipoExame: '',
    valor: '' // Mantenha como string inicialmente
  });
  const [tipoExame, setTipoExame] = useState([]);

  const tiposExameFixos = [
    { value: 'ECG', label: 'Eletrocardiograma (ECG)' },
    { value: 'EEG', label: 'Eletroencefalograma (EEG)' },
    { value: 'Holter', label: 'Monitoramento Holter' },
    { value: 'Outro', label: 'Outro' }
  ];


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [medicoResponse, configResponse] = await Promise.all([
          api.get(`/usuarios/${medicoId}`),
          api.get(`/financeiro/configurar/${medicoId}`)
        ]);
        
        setMedico(medicoResponse.data);
        setConfig(configResponse.data);
        
      } catch (err) {
        if (err.response?.status === 404) {
          setConfig({
            medico: medicoId,
            valoresPorTipo: [],
            comissao: 30,
            ativo: true
          });
        } else {
          setError(err.response?.data?.erro || 'Erro ao carregar dados');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [medicoId]);

  const handleAddTipo = () => {
    if (!novoTipo.tipoExame || !novoTipo.valor) return;
    
    // Converte para número apenas quando for adicionar
    const valorNumerico = parseFloat(novoTipo.valor);
    
    if (isNaN(valorNumerico)) {
      setError('Por favor, insira um valor numérico válido');
      return;
    }
  
    setConfig(prev => ({
      ...prev,
      valoresPorTipo: [
        ...prev.valoresPorTipo,
        {
          tipoExame: novoTipo.tipoExame,
          valor: valorNumerico
        }
      ]
    }));
    
    setNovoTipo({ tipoExame: '', valor: '' });
  };

  const handleRemoveTipo = (index) => {
    setConfig(prev => ({
      ...prev,
      valoresPorTipo: prev.valoresPorTipo.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Preparar dados garantindo que valores são números
      const dadosParaEnviar = {
        valoresPorTipo: config.valoresPorTipo.map(item => ({
          tipoExame: item.tipoExame,
          valor: typeof item.valor === 'string' ? parseFloat(item.valor) : item.valor
        })),
        comissao: Number(config.comissao)
      };
  
      // Validar dados antes de enviar
      if (dadosParaEnviar.valoresPorTipo.some(item => isNaN(item.valor))) {
        throw new Error('Valores inválidos encontrados');
      }
  
      const response = await api.post(`/financeiro/configurar/${medicoId}`, dadosParaEnviar);
      
      if (response.data) {
        // Atualizar estado com os dados formatados corretamente
        const configAtualizada = {
          ...config,
          valoresPorTipo: response.data.valoresPorTipo || [],
          comissao: response.data.comissao || 30
        };
        
        setConfig(configAtualizada);
        alert('Configuração salva com sucesso!');
      } else {
        throw new Error('Resposta inválida da API');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.erro || 
                          err.response?.data?.message || 
                          err.message || 
                          'Erro ao salvar configuração';
      
      setError(errorMessage);
      console.error('Erro ao salvar:', err);
      
      // Mostrar detalhes do erro apenas em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.error('Detalhes do erro:', err.response?.data);
      }
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <FiDollarSign className="mr-2" />
        Configuração Financeira
      </h1>

      {medico && (
        <div className="flex items-center mb-6">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <FiUser className="text-blue-600 text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{medico.nome}</h2>
            <p className="text-gray-600">{medico.email}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Comissão do Médico</h2>
        <div className="flex items-center">
          <input
            type="range"
            min="0"
            max="100"
            value={config.comissao}
            onChange={(e) => setConfig({ ...config, comissao: parseInt(e.target.value) })}
            className="w-full md:w-1/2 mr-4"
          />
          <span className="text-lg font-medium">{config.comissao}%</span>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Percentual que o médico recebe sobre o valor de cada laudo
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Valores por Tipo de Exame</h2>
        
        {/* Adicionar novo tipo */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
        <select
        value={novoTipo.tipoExame}
        onChange={(e) => setNovoTipo({...novoTipo, tipoExame: e.target.value})}
        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        required
        >
        <option value="">Selecione um tipo de exame</option>
        {tiposExameFixos.map((tipo) => (
            <option key={tipo.value} value={tipo.value}>
            {tipo.label}
            </option>
        ))}
        </select>
          
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">R$</span>
            <input
            type="number"
            min="0"
            step="0.01"
            value={novoTipo.valor}
            onChange={(e) => {
                // Permite números, ponto decimal e vírgula
                const value = e.target.value.replace(/[^0-9.,]/g, '')
                .replace(',', '.'); // Converte vírgula para ponto
                setNovoTipo({ ...novoTipo, valor: value });
            }}
            placeholder="Valor"
            className="w-full pl-8 pr-20 p-2 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          
          <button
            onClick={handleAddTipo}
            disabled={!novoTipo.tipoExame || !novoTipo.valor}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300 flex items-center justify-center"
          >
            <FiPlus className="mr-1" /> Adicionar
          </button>
        </div>

        {/* Lista de tipos configurados */}
        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de Exame</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comissão ({config.comissao}%)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {config.valoresPorTipo.length > 0 ? (
                config.valoresPorTipo.map((item, index) => {
                const comissao = (item.valor * config.comissao) / 100;
                return (
                    <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.tipoExame}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatarMoeda(item.valor)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatarMoeda(comissao)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                        onClick={() => handleRemoveTipo(index)}
                        className="text-red-500 hover:text-red-700"
                        >
                        <FiTrash2 />
                        </button>
                    </td>
                    </tr>
                );
                })
            ) : (
                <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                    Nenhum tipo de exame configurado
                </td>
                </tr>
            )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
      <button
        onClick={handleSubmit}
        disabled={loading}
        className={`bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors ${
            loading ? 'opacity-75 cursor-not-allowed' : ''
        }`}
        >
        {loading ? (
            <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                {/* Ícone de loading */}
            </svg>
            Salvando...
            </span>
        ) : (
            'Salvar Configuração'
        )}
        </button>
      </div>
    </div>
  );
};

export default ConfiguracaoFinanceiraMedico;
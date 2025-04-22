import React from 'react';
import { FiEdit, FiTrash, FiEye, FiMoreHorizontal, FiFileText } from 'react-icons/fi';

const Tabela = ({ colunas, dados, acoes, mensagemSemDados }) => {
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

    const getNestedValue = (obj, path) => {
        if (!path || typeof path !== 'string') return undefined;
        return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : null), obj);
    };

    const renderCellContent = (item, coluna) => {
        if (coluna.render) {
            return coluna.render(coluna.key ? getNestedValue(item, coluna.key) : undefined, item);
        }
        
        if (!coluna.key) return null;
        
        const value = getNestedValue(item, coluna.key);
        return value !== null && value !== undefined ? value : '—';
    };

    return (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm backdrop-blur-sm bg-opacity-90">
            <table className="w-full divide-y divide-slate-200">
                {/* Cabeçalho moderno com efeito de vidro */}
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 backdrop-blur-sm">
                    <tr>
                        {colunas.map((coluna, index) => (
                            <th
                                key={index}
                                className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                            >
                                <div className="flex items-center">
                                    {coluna.header}
                                    {coluna.sortable && (
                                        <button className="ml-2 text-slate-400 hover:text-slate-600">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </th>
                        ))}
                        {acoes && acoes.length > 0 && (
                            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Ações
                            </th>
                        )}
                    </tr>
                </thead>

                {/* Corpo da tabela com linhas zebradas */}
                <tbody className="divide-y divide-slate-200 bg-white">
                    {dados.length > 0 ? (
                        dados.map((item, index) => (
                            <tr 
                                key={index} 
                                className={`transition-all duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-slate-100`}
                            >
                                {colunas.map((coluna, colIndex) => (
                                    <td 
                                        key={colIndex} 
                                        className={`px-6 py-4 whitespace-nowrap ${coluna.className || ''}`}
                                    >
                                        <div className={`text-sm font-medium ${coluna.textColor || 'text-slate-800'}`}>
                                            {renderCellContent(item, coluna)}
                                        </div>
                                    </td>
                                ))}
                                
                                {acoes && acoes.length > 0 && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            {acoes.map((acao, acaoIndex) => {
                                                // Menu dropdown para mais de 3 ações
                                                if (acoes.length > 3 && acaoIndex >= 2) {
                                                    if (acaoIndex === 2) {
                                                        return (
                                                            <div className="relative" key="more-actions">
                                                                <button 
                                                                    className="p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-all"
                                                                    aria-label="Mais ações"
                                                                >
                                                                    <FiMoreHorizontal />
                                                                </button>
                                                                <div className="absolute right-0 z-10 mt-1 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                                                    <div className="py-1">
                                                                        {acoes.slice(2).map((subAcao, subIndex) => (
                                                                            <button
                                                                                key={subIndex}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    subAcao.acao(item);
                                                                                }}
                                                                                className={`flex w-full items-center px-4 py-2 text-sm ${subAcao.style || 'text-slate-700 hover:bg-slate-100'}`}
                                                                            >
                                                                                {subAcao.icon && React.cloneElement(subAcao.icon, { className: 'mr-3 h-5 w-5 text-slate-500' })}
                                                                                {subAcao.label}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }
                                                
                                                // Botões de ação principais
                                                return (
                                                    <button
                                                        key={acaoIndex}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            acao.acao(item);
                                                        }}
                                                        className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium shadow-sm ${acao.style || 
                                                            (acao.icon.type === FiEye ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' :
                                                             acao.icon.type === FiEdit ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' :
                                                             acao.icon.type === FiTrash ? 'bg-red-50 text-red-600 hover:bg-red-100' :
                                                             'bg-slate-50 text-slate-600 hover:bg-slate-100')} transition-colors`}
                                                        title={acao.label}
                                                        aria-label={acao.label}
                                                    >
                                                        {acao.icon && React.cloneElement(acao.icon, { className: 'h-4 w-4' })}
                                                        {acoes.length <= 3 && <span className="ml-2">{acao.label}</span>}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td 
                                colSpan={colunas.length + (acoes ? 1 : 0)} 
                                className="px-6 py-16 text-center"
                            >
                                {mensagemSemDados || (
                                    <div className="text-center">
                                        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                            <FiFileText className="h-8 w-8" />
                                        </div>
                                        <h3 className="mt-3 text-lg font-medium text-slate-900">Nenhum registro encontrado</h3>
                                        <p className="mt-1 text-sm text-slate-500">Tente ajustar seus critérios de busca</p>
                                        <div className="mt-4">
                                            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                                Recarregar dados
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Rodapé moderno */}
            {dados.length > 0 && (
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                        Mostrando <span className="font-medium">1-{dados.length}</span> de <span className="font-medium">{dados.length}</span> resultados
                    </div>
                    <div className="flex space-x-2">
                        <button className="px-3 py-1 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50">
                            Anterior
                        </button>
                        <button className="px-3 py-1 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50">
                            Próximo
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tabela;
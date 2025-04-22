import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSidebar } from '../contexts/SidebarContext';
import { 
  FiLogOut, 
  FiMenu, 
  FiBell, 
  FiHelpCircle,
  FiSettings,
  FiMessageSquare,
  FiInfo
} from 'react-icons/fi';
import Modal from 'react-modal';

// Estilos do Modal (adicione isso ao seu arquivo CSS global ou no mesmo componente)
const customStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    border: 'none',
    borderRadius: '8px',
    padding: '0',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    maxWidth: '90vw',
    width: '600px',
    maxHeight: '90vh',
  },
};

Modal.setAppElement('#root');

Modal.setAppElement('#root'); // Make sure to set this to your app element

const Header = () => {
  const { usuario, logout } = useAuth();
  const { toggle } = useSidebar();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('about');

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50 border-b border-slate-200">
      <div className="mx-auto px-6 flex justify-between items-center h-16">
        {/* Lado Esquerdo */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggle}
            className="text-slate-600 hover:text-blue-600 transition-colors md:hidden"
            aria-label="Toggle sidebar"
          >
            <FiMenu className="h-5 w-5" />
          </button>
          
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600">
              <span className="font-extrabold">LAUDO</span>FY
            </h1>
          </div>
        </div>

        {/* Lado Direito */}
        <div className="flex items-center space-x-4">
          {/* Botão de Ajuda/Documentação */}
          <button 
            onClick={openModal}
            className="text-slate-600 hover:text-blue-600 transition-colors"
            aria-label="Documentação do sistema"
          >
            <FiInfo className="h-5 w-5" />
          </button>

          {/* Perfil do Usuário */}
          <div className="flex items-center space-x-2 ml-2">
            <div className="relative group">
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-slate-800">{usuario?.nome}</p>
                  <p className="text-xs text-slate-500 capitalize">{usuario?.role}</p>
                </div>
                
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                  {usuario?.nome?.charAt(0).toUpperCase()}
                </div>
              </div>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 border border-slate-200 divide-y divide-slate-100">
                <div className="px-4 py-2 text-sm text-slate-500">
                  Logado como <span className="font-medium text-slate-800">{usuario?.email}</span>
                </div>
                <div>
                  <button
                    onClick={logout}
                    className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 w-full text-left"
                  >
                    <FiLogOut className="mr-2" />
                    Sair do Sistema
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Documentação */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          style={customStyles}
          contentLabel="Documentação do Sistema"
          shouldCloseOnOverlayClick={true}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Cabeçalho do Modal */}
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Documentação do Sistema</h2>
              <button 
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                &times;
              </button>
            </div>
            
            {/* Abas de Navegação */}
            <div className="border-b border-slate-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('about')}
                  className={`px-4 py-3 text-sm font-medium ${activeTab === 'about' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Sobre o sistema
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-4 py-3 text-sm font-medium ${activeTab === 'users' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Tipos de usuários
                </button>
                <button
                  onClick={() => setActiveTab('steps')}
                  className={`px-4 py-3 text-sm font-medium ${activeTab === 'steps' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Etapas do uso
                </button>
                <button
                  onClick={() => setActiveTab('files')}
                  className={`px-4 py-3 text-sm font-medium ${activeTab === 'files' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Arquivos e Laudos
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`px-4 py-3 text-sm font-medium ${activeTab === 'security' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Segurança
                </button>
              </nav>
            </div>
            
            {/* Conteúdo das Abas */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'about' && (
                <div>
                  <h3 className="text-lg font-medium text-slate-800 mb-4">🧾 Sobre o sistema</h3>
                  <p className="text-slate-600">
                    O LaudoFy é um sistema de gerenciamento de laudos médicos, com funcionalidades para criação,
                    assinatura digital e liberação de acesso público aos documentos.
                  </p>
                </div>
              )}
              
              {activeTab === 'users' && (
                <div>
                  <h3 className="text-lg font-medium text-slate-800 mb-4">👥 Tipos de usuários</h3>
                  <ul className="space-y-3 text-slate-600">
                    <li><strong>Técnico:</strong> Cadastra pacientes e exames, gerencia arquivos</li>
                    <li><strong>Médico:</strong> Cria e assina laudos médicos</li>
                    <li><strong>Admin:</strong> Gerencia usuários e configurações do sistema</li>
                  </ul>
                </div>
              )}
              
              {activeTab === 'steps' && (
                <div>
                  <h3 className="text-lg font-medium text-slate-800 mb-4">📌 Etapas do uso</h3>
                  <ol className="list-decimal pl-5 space-y-2 text-slate-600">
                    <li>Cadastrar paciente</li>
                    <li>Criar exame associado ao paciente</li>
                    <li>Médico cria o laudo baseado no exame</li>
                    <li>Assinar digitalmente e liberar acesso público (quando aplicável)</li>
                  </ol>
                </div>
              )}
              
              {activeTab === 'files' && (
                <div>
                  <h3 className="text-lg font-medium text-slate-800 mb-4">📁 Arquivos e Laudos</h3>
                  <ul className="space-y-3 text-slate-600">
                    <li><strong>Formatos aceitos:</strong> PDF, JPG, PNG</li>
                    <li><strong>Armazenamento:</strong> Os arquivos são armazenados no UploadCare</li>
                    <li><strong>Limite de tamanho:</strong> 20MB por arquivo</li>
                  </ul>
                </div>
              )}
              
              {activeTab === 'security' && (
                <div>
                  <h3 className="text-lg font-medium text-slate-800 mb-4">🔒 Segurança</h3>
                  <ul className="space-y-3 text-slate-600">
                    <li>Acesso ao sistema requer autenticação com login e senha</li>
                    <li>Todas as comunicações são protegidas por criptografia</li>
                    <li>Autenticação de dois fatores disponível para contas administrativas</li>
                  </ul>
                </div>
              )}
            </div>
            
            {/* Rodapé do Modal */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
              <p className="text-sm text-slate-600">
                🆘 <strong>Dúvidas?</strong> Entre em contato com o suporte interno (suporte@fytenza.com.br) ou com o administrador do sistema.
              </p>
              <div className="mt-2 flex gap-4 text-sm">
                <a 
                  href="/termos" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline"
                >
                  Termos de Uso
                </a>
                <a 
                  href="/privacidade" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline"
                >
                  Política de Privacidade
                </a>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </header>
  );
};

export default Header;
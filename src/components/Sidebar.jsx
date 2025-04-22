import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSidebar } from '../contexts/SidebarContext';
import { 
  FiHome, 
  FiFileText, 
  FiUsers, 
  FiUser, 
  FiPieChart, 
  FiDatabase, 
  FiX, 
  FiLogOut,
  FiPlusCircle, 
  FiActivity, 
  FiClipboard,
  FiChevronDown,
  FiChevronRight
} from 'react-icons/fi';

const Sidebar = () => {
  const { usuario, logout } = useAuth();
  const { isOpen, close } = useSidebar();
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  // Grupos de menus para melhor organização
  const menuGroups = [
    {
      title: "Principal",
      items: [
        { path: "/dashboard", icon: FiHome, label: "Dashboard" },
        { path: "/exames", icon: FiFileText, label: "Exames", roles: ['tecnico', 'medico', 'admin'] },
        { path: "/laudos", icon: FiClipboard, label: "Laudos", roles: ['tecnico', 'medico', 'admin'] },
        { path: "/pacientes", icon: FiUsers, label: "Pacientes" }
      ]
    },
    {
      title: "Administração",
      items: [
        { path: "/usuarios", icon: FiUser, label: "Usuários", roles: ['admin'] },
        { path: "/relatorios", icon: FiPieChart, label: "Relatórios", roles: ['admin'] },
        { path: "/auditoria", icon: FiDatabase, label: "Auditoria", roles: ['admin'] }
      ],
      roles: ['admin']
    }
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 backdrop-blur-sm bg-opacity-30 z-40 lg:hidden"
          onClick={close}
        />
      )}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40 transform transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:top-16 lg:h-[calc(100vh-4rem)] border-r border-slate-200`}>
        <div className="p-4 h-full flex flex-col">
          {/* Mobile Header */}
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                {usuario?.nome?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">{usuario?.nome}</p>
                <p className="text-xs text-slate-500">{usuario?.role}</p>
              </div>
            </div>
            <button
              onClick={close}
              className="text-slate-500 hover:text-slate-700 transition-colors"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          {/* Botão de Novo Exame (destaque) */}
          {['tecnico', 'medico', 'admin'].includes(usuario?.role) && (
            <Link
              to="/exames/novo"
              onClick={close}
              className="mb-6 flex items-center justify-center space-x-2 p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              <FiPlusCircle className="text-lg" />
              <span className="font-medium">Novo Exame</span>
            </Link>
          )}

          {/* Navigation */}
          <nav className="space-y-1 flex-1 overflow-y-auto">
            {menuGroups.map((group, index) => {
              // Verifica se o grupo deve ser exibido baseado nas roles
              if (group.roles && !group.roles.includes(usuario?.role)) {
                return null;
              }

              const hasVisibleItems = group.items.some(item => 
                !item.roles || item.roles.includes(usuario?.role)
              );

              if (!hasVisibleItems) {
                return null;
              }

              return (
                <div key={`group-${index}`} className="mb-6">
                  {group.title && (
                    <p className="text-xs uppercase text-slate-500 mb-2 px-3 font-medium">
                      {group.title}
                    </p>
                  )}
                  
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      // Verifica se o item deve ser exibido baseado nas roles
                      if (item.roles && !item.roles.includes(usuario?.role)) {
                        return null;
                      }

                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={close}
                          className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                            isActive(item.path) 
                              ? 'bg-blue-50 text-blue-600 font-medium' 
                              : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
                          }`}
                        >
                          <item.icon className={`text-lg ${
                            isActive(item.path) ? 'text-blue-600' : 'text-slate-500'
                          }`} />
                          <span>{item.label}</span>
                          {isActive(item.path) ? (
                            <FiChevronDown className="ml-auto text-blue-600" />
                          ) : (
                            <FiChevronRight className="ml-auto text-slate-400" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Mobile Footer */}
          <div className="lg:hidden mt-auto pt-4 border-t border-slate-200">
            <button
              onClick={() => {
                close();
                logout();
              }}
              className="w-full flex items-center justify-center space-x-2 text-slate-600 hover:text-blue-600 px-4 py-2 rounded-lg hover:bg-slate-100 transition-all duration-200"
            >
              <FiLogOut className="text-lg" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
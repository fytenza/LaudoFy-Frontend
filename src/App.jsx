import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Auth/Login';
import ExameDetalhes from './pages/Exames/ExameDetalhes';
import CriarLaudo from './pages/Laudos/CriarLaudo';
import Usuarios from './pages/Usuarios/ListaUsuarios';
import LaudosDashboard from './pages/Laudos/LaudosDashboard';
import ListaPacientes from './pages/Pacientes/ListaPacientes';
import CriarPaciente from './pages/Pacientes/CriarPaciente';
import CriarUsuario from './pages/Usuarios/CriarUsuario';
import CriarExame from './pages/Exames/CriarExame';
import DetalhesLaudo from './pages/Laudos/DetalhesLaudo';
import DashboardExames from './pages/Exames/DashboardExames';
import Relatorios from './pages/Admin/Relatorios';
import VisualizacaoPublicaLaudo from './pages/Laudos/VisualizacaoPublicaLaudo';
import Auditoria from './pages/Admin/Auditoria';
import EsqueciSenha from './pages/Auth/EsqueciSenha';
import ResetarSenha from './pages/Auth/ResetarSenha';
import RequireAuth from './components/RequireAuth';
import RequireRole from './components/RequireRole';
import PaginaErro from './pages/PaginaErro';
import TermosDeUso from './pages/TermosDeUso';
import PoliticaDePrivacidade from './pages/PoliticaDePrivacidade';

function App() {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/publico/:id" element={<VisualizacaoPublicaLaudo />} />

      {/* Rotas autenticadas */}
      <Route path="/dashboard" element={
        <RequireAuth>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </RequireAuth>
      } />

      <Route path="/exames" element={
        <RequireAuth>
          <MainLayout>
            <DashboardExames />
          </MainLayout>
        </RequireAuth>
      } />

      <Route path="/exames/novo" element={
        <RequireAuth>
          <MainLayout>
            <CriarExame />
          </MainLayout>
        </RequireAuth>
      } />

      <Route path="/exames/:id" element={
        <RequireAuth>
          <MainLayout>
            <ExameDetalhes />
          </MainLayout>
        </RequireAuth>
      } />

      <Route path="/laudos" element={
        <RequireAuth>
          <MainLayout>
            <LaudosDashboard />
          </MainLayout>
        </RequireAuth>
      } />

      <Route path="/laudos/novo" element={
        <RequireAuth>
          <MainLayout>
            <CriarLaudo />
          </MainLayout>
        </RequireAuth>
      } />

      <Route path="/laudos/:id" element={
        <RequireAuth>
          <MainLayout>
            <DetalhesLaudo />
          </MainLayout>
        </RequireAuth>
      } />

      <Route path="/pacientes" element={
        <RequireAuth>
          <MainLayout>
            <ListaPacientes />
          </MainLayout>
        </RequireAuth>
      } />

      <Route path="/pacientes/novo" element={
        <RequireAuth>
          <MainLayout>
            <CriarPaciente />
          </MainLayout>
        </RequireAuth>
      } />

      <Route path="/pacientes/editar/:id" element={
        <RequireAuth>
          <MainLayout>
            <CriarPaciente />
          </MainLayout>
        </RequireAuth>
      } />

      <Route path="/usuarios" element={
        <RequireAuth>
          <RequireRole roles={['admin']}>
            <MainLayout>
              <Usuarios />
            </MainLayout>
          </RequireRole>
        </RequireAuth>
      } />

      <Route path="/usuarios/novo" element={
        <RequireAuth>
          <RequireRole roles={['admin']}>
            <MainLayout>
              <CriarUsuario />
            </MainLayout>
          </RequireRole>
        </RequireAuth>
      } />

      <Route path="/usuarios/editar/:id" element={
        <RequireAuth>
          <RequireRole roles={['admin']}>
            <MainLayout>
              <CriarUsuario />
            </MainLayout>
          </RequireRole>
        </RequireAuth>
      } />

      <Route path="/relatorios" element={
        <RequireAuth>
          <RequireRole roles={['admin']}>
            <MainLayout>
              <Relatorios />
            </MainLayout>
          </RequireRole>
        </RequireAuth>
      } />

      <Route path="/auditoria" element={
        <RequireAuth>
          <RequireRole roles={['admin']}>
            <MainLayout>
              <Auditoria />
            </MainLayout>
          </RequireRole>
        </RequireAuth>
      } />

      <Route path="/termos" element={
          <TermosDeUso />
      } />

      <Route path="/privacidade" element={
          <PoliticaDePrivacidade />
      } />

      {/* Rotas públicas */}
      <Route path="/erro" element={<PaginaErro />} />
      <Route path="/" element={<AuthLayout><Login /></AuthLayout>} />
      <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
      <Route path="/esqueci-senha" element={<AuthLayout><EsqueciSenha /></AuthLayout>} />
      <Route path="/resetar-senha" element={<AuthLayout><ResetarSenha /></AuthLayout>} />
    </Routes>
  );
}

export default App;
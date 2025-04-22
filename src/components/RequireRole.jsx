// src/components/RequireRole.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RequireRole = ({ children, roles }) => {
  const { usuario } = useAuth();
  if (!usuario || !roles.includes(usuario.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export default RequireRole;

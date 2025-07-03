import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Spinner } from '../ui/Spinner';

interface ProfessionalRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  fallbackPath?: string;
}

const ProfessionalRoute: React.FC<ProfessionalRouteProps> = ({
  children,
  requiredPermission,
  fallbackPath = '/dashboard'
}) => {
  const { user, loading: authLoading, userRole } = useAuth();
  const location = useLocation();

  // Mostrar loading enquanto carrega
  if (authLoading || professionalLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // Se não está autenticado, redirecionar para login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se não é um profissional, redirecionar
  if (userRole !== 'professional' || !professionalUser) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Se tem permissão específica requerida, verificar
  if (requiredPermission && !hasPermission(requiredPermission as any)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default ProfessionalRoute; 
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, sessionChecked } = useAuth();
  const location = useLocation();

  if (!sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-warm dark:bg-surface-dark">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-crimson-600/20 border-t-crimson-600 rounded-full animate-spin" />
          <span className="text-xs font-semibold text-ink-500 tracking-wider uppercase">Loading Credisense...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

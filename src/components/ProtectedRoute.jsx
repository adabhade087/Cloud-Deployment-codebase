import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingState from './LoadingState';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingState message="Checking authentication..." />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

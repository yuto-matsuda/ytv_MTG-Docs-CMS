import { useAuth } from '@/components/AuthProvider';
import { Navigate } from 'react-router';

export default function ProtectedRoute({
  children
}: {
  children: React.ReactNode
}) {
  const { token, tokenLoading } = useAuth();

  if (tokenLoading) return <p>Loading...</p>
  
  if (!token) return <Navigate to='/' replace />;
  
  return children;
}

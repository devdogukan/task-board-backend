import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import Dashboard from '@/pages/Dashboard';
import ProjectDetail from '@/pages/ProjectDetail';
import FolderDetail from '@/pages/FolderDetail';
import { ROUTES } from '@/lib/constants';

function App() {
  const { isAuthenticated, token, getCurrentUser } = useAuth();

  useEffect(() => {
    // Try to restore session on mount
    if (token && !isAuthenticated) {
      getCurrentUser().catch(() => {
        // If getCurrentUser fails, user will need to login again
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path={`${ROUTES.PROJECT_DETAIL}/:id`}
          element={
            <ProtectedRoute>
              <ProjectDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path={`${ROUTES.FOLDER_DETAIL}/:id`}
          element={
            <ProtectedRoute>
              <FolderDetail />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


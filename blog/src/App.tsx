import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuthGateProvider } from './context/AuthGateContext';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import ArticlePage from './pages/ArticlePage';
import ProfilePage from './pages/ProfilePage';
import WritePage from './pages/WritePage';
import SearchPage from './pages/SearchPage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AuthGateProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/article/:id" element={<ArticlePage />} />
            <Route path="/profile/:username" element={<ProfilePage />} />
            <Route
              path="/write"
              element={
                <ProtectedRoute>
                  <WritePage />
                </ProtectedRoute>
              }
            />
            <Route path="/search" element={<SearchPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthGateProvider>
      </Router>
    </AuthProvider>
  );
}

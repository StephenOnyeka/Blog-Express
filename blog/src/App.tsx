import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ArticlePage from './pages/ArticlePage';
import ProfilePage from './pages/ProfilePage';
import WritePage from './pages/WritePage';
import SearchPage from './pages/SearchPage';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<HomePage isLoggedIn={isLoggedIn} onAuthChange={setIsLoggedIn} />}
        />
        <Route
          path="/article/:id"
          element={<ArticlePage isLoggedIn={isLoggedIn} onAuthChange={setIsLoggedIn} />}
        />
        <Route
          path="/profile/:username"
          element={<ProfilePage isLoggedIn={isLoggedIn} onAuthChange={setIsLoggedIn} />}
        />
        <Route
          path="/write"
          element={<WritePage isLoggedIn={isLoggedIn} onAuthChange={setIsLoggedIn} />}
        />
        <Route
          path="/search"
          element={<SearchPage isLoggedIn={isLoggedIn} onAuthChange={setIsLoggedIn} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

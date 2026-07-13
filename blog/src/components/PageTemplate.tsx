import { useState } from 'react';
import type { ReactNode } from 'react';
import Navbar, { AuthModal } from './Navbar';
import Footer from './Footer';

interface PageTemplateProps {
  children: ReactNode;
  showFooter?: boolean;
}

export default function PageTemplate({
  children,
  showFooter = true,
}: PageTemplateProps) {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const openSignIn = () => { setAuthMode('signin'); setAuthOpen(true); };

  const handleAuthSuccess = () => {
    setAuthOpen(false);
  };

  return (
    <>
      <Navbar onSignIn={openSignIn} />

      <main className="flex-1">
        {children}
      </main>

      {showFooter && <Footer />}

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        mode={authMode}
        onToggleMode={() => setAuthMode(m => m === 'signin' ? 'signup' : 'signin')}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}

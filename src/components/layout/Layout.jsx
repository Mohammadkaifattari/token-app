import React from 'react';
import { Navbar } from './Navbar';
import { useLocation } from 'react-router-dom';

export const Layout = ({ children }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-medical-background">
      <Navbar />
      <main className={isLoginPage ? '' : 'pt-20'}>
        {children}
      </main>
      
      {/* Toast notifications container can go here */}
    </div>
  );
};

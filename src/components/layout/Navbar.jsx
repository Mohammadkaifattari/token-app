import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Stethoscope, LogOut, User as UserIcon } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (location.pathname === '/login') return null;

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 z-40 flex items-center px-6 lg:px-12">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-medical-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-medical-primary/20">
            <Stethoscope size={24} />
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">
            Clinic<span className="text-medical-primary">Flow</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-slate-700">{user.name}</span>
                <span className="text-xs text-medical-muted capitalize">{user.role}</span>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-medical-primary/20 overflow-hidden bg-slate-100">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-full h-full p-2 text-slate-400" />
                )}
              </div>
              <Button variant="ghost" className="p-2 min-w-0 px-2" onClick={logout} title="Logout">
                <LogOut size={20} />
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button variant="primary">Get Started</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

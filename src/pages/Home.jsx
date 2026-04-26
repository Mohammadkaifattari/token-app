import React, { useEffect, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Building2, Users, ArrowRight } from 'lucide-react';
import { fadeIn, slideIn } from '../animations/gsapHelpers';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Home = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const containerRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const cards = containerRef.current?.querySelectorAll('.selection-card');
    if (cards) {
      cards.forEach((card, index) => {
        slideIn(card, 'bottom', 0.2 + index * 0.1);
      });
    }
    fadeIn(containerRef.current?.querySelector('.header-text'), 0.1);
  }, []);

  if (loading) return null;

  return (
    <div ref={containerRef} className="max-w-5xl mx-auto px-6 py-12 lg:py-24">
      <div className="header-text text-center space-y-4 mb-16">
        <h1 className="text-4xl lg:text-5xl font-bold text-slate-800 tracking-tight">
          How would you like to <span className="text-medical-primary">proceed?</span>
        </h1>
        <p className="text-xl text-medical-muted">Choose your portal to continue with ClinicFlow.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div 
          className="selection-card cursor-pointer group"
          onClick={() => navigate('/company')}
        >
          <Card 
            animate 
            className="h-full flex flex-col items-center text-center p-10 group-hover:border-medical-primary/30"
          >
            <div className="w-20 h-20 bg-medical-primary/10 rounded-2xl flex items-center justify-center text-medical-primary mb-8 group-hover:bg-medical-primary group-hover:text-white transition-all duration-300">
              <Building2 size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Are you a Company?</h2>
            <p className="text-medical-muted mb-8 flex-1">
              Manage your clinic, set token limits, and monitor patient flow in real-time.
            </p>
            <div className="flex items-center gap-2 text-medical-primary font-semibold group-hover:gap-4 transition-all">
              Manage Dashboard <ArrowRight size={20} />
            </div>
          </Card>
        </div>

        <div 
          className="selection-card cursor-pointer group"
          onClick={() => navigate('/search')}
        >
          <Card 
            animate 
            className="h-full flex flex-col items-center text-center p-10 group-hover:border-medical-secondary/30"
          >
            <div className="w-20 h-20 bg-medical-secondary/10 rounded-2xl flex items-center justify-center text-medical-secondary mb-8 group-hover:bg-medical-secondary group-hover:text-white transition-all duration-300">
              <Users size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Finding Tokens?</h2>
            <p className="text-medical-muted mb-8 flex-1">
              Search for clinics, book your turn, and track waiting time from anywhere.
            </p>
            <div className="flex items-center gap-2 text-medical-secondary font-semibold group-hover:gap-4 transition-all">
              Find Clinics <ArrowRight size={20} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;

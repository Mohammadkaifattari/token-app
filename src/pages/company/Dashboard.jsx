import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Plus, Building2, MapPin, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { AddCompanyModal } from '../../components/company/AddCompanyModal';
import { useNavigate } from 'react-router-dom';

const CompanyDashboard = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'companies'),
      where('ownerId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const companyList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCompanies(companyList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-medical-muted hover:text-medical-primary mb-8 transition-colors group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-800">Your Companies</h1>
          <p className="text-medical-muted">Manage your clinical facilities and token queues.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="md:w-auto">
          <Plus size={20} /> Add New Company
        </Button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-clinical"></div>
          ))}
        </div>
      ) : companies.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-24 text-center border-dashed border-2">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
            <Building2 size={32} />
          </div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No companies found</h3>
          <p className="text-medical-muted mb-8 max-w-xs">You haven't added any clinical companies yet. Start by adding your first one.</p>
          <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
            Add Company Now
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map(company => (
            <Card 
              key={company.id} 
              animate 
              className="cursor-pointer group flex flex-col h-full"
              onClick={() => navigate(`/company/${company.id}`)}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 bg-medical-primary/10 rounded-xl flex items-center justify-center text-medical-primary group-hover:bg-medical-primary group-hover:text-white transition-all">
                  <Building2 size={24} />
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${company.allowTokens ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                  {company.allowTokens ? 'ONLINE' : 'OFFLINE'}
                </div>
              </div>
              
              <div className="flex-1 space-y-4">
                <h3 className="text-xl font-bold text-slate-800">{company.name}</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-medical-muted">
                    <MapPin size={16} />
                    <span className="truncate">{company.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-medical-muted">
                    <Clock size={16} />
                    <span>{company.timings}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-medical-muted">
                    <Calendar size={16} />
                    <span>Since {new Date(company.since).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="text-xs font-semibold text-medical-muted uppercase tracking-wider">
                  Tokens Today
                </div>
                <div className="text-lg font-bold text-medical-primary">
                  {company.todayTokens || 0}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AddCompanyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default CompanyDashboard;

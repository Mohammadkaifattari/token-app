import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Building2, Search as SearchIcon, MapPin, Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(
      collection(db, 'companies'),
      where('allowTokens', '==', true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCompanies(list);
      setFilteredCompanies(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const filtered = companies.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCompanies(filtered);
  }, [searchTerm, companies]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-medical-muted hover:text-medical-primary mb-8 transition-colors group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </button>

      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold text-slate-800">Find a Clinic</h1>
        <p className="text-medical-muted text-lg">Search for available medical centers and book your token instantly.</p>
        
        <div className="max-w-2xl mx-auto pt-6">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-0 shadow-lg shadow-slate-200/50 focus:ring-2 focus:ring-medical-primary/20 transition-all text-lg"
              placeholder="Search by clinic name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-slate-50 animate-pulse rounded-clinical"></div>
          ))}
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
            <SearchIcon size={32} />
          </div>
          <h3 className="text-xl font-semibold text-slate-600">No clinics found</h3>
          <p className="text-medical-muted">Try adjusting your search terms or check back later.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCompanies.map(company => (
            <Card 
              key={company.id} 
              animate 
              className="group cursor-pointer flex flex-col h-full border-b-4 border-b-medical-primary/10 hover:border-b-medical-primary transition-all duration-300"
              onClick={() => navigate(`/search/${company.id}`)}
            >
              <div className="w-14 h-14 bg-medical-primary/10 rounded-2xl flex items-center justify-center text-medical-primary mb-6 group-hover:scale-110 transition-transform">
                <Building2 size={28} />
              </div>

              <div className="flex-1 space-y-4">
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{company.name}</h3>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm text-medical-muted">
                    <MapPin className="mt-0.5 shrink-0" size={16} />
                    <span className="line-clamp-2">{company.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-medical-muted">
                    <Clock size={16} />
                    <span>{company.timings}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black text-medical-muted uppercase tracking-[0.2em] mb-1">Queue Status</div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-bold text-emerald-600">Active</span>
                  </div>
                </div>
                <Button variant="ghost" className="p-2 min-w-0 group-hover:bg-medical-primary group-hover:text-white transition-all">
                  <ArrowRight size={20} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchCompanies;

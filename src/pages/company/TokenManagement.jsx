import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { 
  doc, 
  onSnapshot, 
  updateDoc, 
  collection, 
  query, 
  where, 
  orderBy,
  increment,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft, 
  Play, 
  Pause,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

const TokenManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Daily Reset Logic
    const checkAndReset = async (data) => {
      const lastReset = data.lastReset?.toDate();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (!lastReset || lastReset < today) {
        await updateDoc(doc(db, 'companies', id), {
          todayTokens: 0,
          currentToken: 0,
          lastReset: today,
          allowTokens: false
        });
      }
    };

    const unsubscribeCompany = onSnapshot(doc(db, 'companies', id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCompany({ id: docSnap.id, ...data });
        checkAndReset(data);
      }
      setLoading(false);
    });

    const unsubscribeBookings = onSnapshot(
      query(
        collection(db, 'bookings'),
        where('companyId', '==', id),
        where('status', '==', 'pending'),
        orderBy('tokenNumber', 'asc')
      ),
      (snapshot) => {
        setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    );

    return () => {
      unsubscribeCompany();
      unsubscribeBookings();
    };
  }, [id]);

  const updateSetting = async (field, value) => {
    setUpdating(true);
    try {
      await updateDoc(doc(db, 'companies', id), { [field]: value });
    } catch (error) {
      console.error('Update Error:', error);
    } finally {
      setUpdating(false);
    }
  };

  const markAsDone = async () => {
    if (bookings.length === 0) return;
    setUpdating(true);
    try {
      const batch = writeBatch(db);
      
      // Update booking status
      const bookingRef = doc(db, 'bookings', bookings[0].id);
      batch.update(bookingRef, { status: 'completed', completedAt: new Date() });

      // Update company current token
      const companyRef = doc(db, 'companies', id);
      batch.update(companyRef, { currentToken: increment(1) });

      await batch.commit();
    } catch (error) {
      console.error('Mark as Done Error:', error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !company) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-primary"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <button 
        onClick={() => navigate('/company')}
        className="flex items-center gap-2 text-medical-muted hover:text-medical-primary mb-8 transition-colors group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Settings Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <TrendingUp size={20} className="text-medical-primary" />
              Settings
            </h2>

            <div className="space-y-6">
              <Input 
                label="Total Tokens Today" 
                type="number" 
                value={company.todayTokens}
                onChange={(e) => updateSetting('todayTokens', parseInt(e.target.value) || 0)}
              />
              <Input 
                label="Estimated Time (min/token)" 
                type="number" 
                value={company.estimatedTimePerToken}
                onChange={(e) => updateSetting('estimatedTimePerToken', parseInt(e.target.value) || 0)}
              />

              <div className="pt-4 flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  {company.allowTokens ? (
                    <Play className="text-emerald-500 fill-emerald-500" size={20} />
                  ) : (
                    <Pause className="text-slate-400 fill-slate-400" size={20} />
                  )}
                  <div>
                    <div className="text-sm font-bold text-slate-700">Allow Bookings</div>
                    <div className="text-xs text-medical-muted">{company.allowTokens ? 'Open for users' : 'Closed'}</div>
                  </div>
                </div>
                <button 
                  onClick={() => updateSetting('allowTokens', !company.allowTokens)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${company.allowTokens ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${company.allowTokens ? 'translate-x-6' : ''}`} />
                </button>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-medical-primary text-white border-0 shadow-lg shadow-medical-primary/20">
            <h3 className="text-sm font-bold uppercase tracking-wider opacity-80 mb-4">Live Status</h3>
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-4xl font-black">#{company.currentToken || 0}</div>
                <div className="text-xs font-medium opacity-80 mt-1">Current Serving Token</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{bookings.length}</div>
                <div className="text-xs font-medium opacity-80 mt-1">Waiting Users</div>
              </div>
            </div>
          </Card>
        </div>

        {/* User Queue Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-8 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Users size={24} className="text-medical-primary" />
                Patient Queue
              </h2>
              {bookings.length > 0 && (
                <Button 
                  onClick={markAsDone} 
                  loading={updating}
                  className="bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
                >
                  <CheckCircle size={18} /> Mark as Done
                </Button>
              )}
            </div>

            {bookings.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                  <Users size={32} />
                </div>
                <h3 className="text-lg font-semibold text-slate-600">Queue is empty</h3>
                <p className="text-medical-muted max-w-xs">Waiting for patients to book tokens. Current status: {company.allowTokens ? 'Accepting' : 'Closed'}.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking, index) => (
                  <div 
                    key={booking.id}
                    className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${index === 0 ? 'bg-medical-primary/5 border-medical-primary/20 ring-1 ring-medical-primary/10' : 'bg-white border-slate-100'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-black ${index === 0 ? 'bg-medical-primary text-white shadow-lg shadow-medical-primary/20' : 'bg-slate-100 text-slate-400'}`}>
                        {booking.tokenNumber}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{booking.userName}</div>
                        <div className="text-xs text-medical-muted">{booking.userEmail}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="hidden md:block text-right">
                        <div className="text-xs font-bold text-medical-muted uppercase tracking-wider">Booked At</div>
                        <div className="text-sm font-medium text-slate-600">
                          {new Date(booking.createdAt?.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      {index === 0 && (
                        <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-black animate-pulse">
                          NOW SERVING
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TokenManagement;

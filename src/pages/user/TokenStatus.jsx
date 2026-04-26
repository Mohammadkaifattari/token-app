import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  getDoc, 
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Bell, 
  Building2, 
  MapPin,
  Trash2,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TokenStatus = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [notified, setNotified] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', user.uid),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (!snapshot.empty) {
        const bookingData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        setBooking(bookingData);

        // Fetch company live data
        const companyRef = doc(db, 'companies', bookingData.companyId);
        const companySnap = await getDoc(companyRef);
        if (companySnap.exists()) {
          setCompany(companySnap.data());
          
          // Notification Logic: 10 minutes before turn
          const waitTime = (bookingData.tokenNumber - companySnap.data().currentToken) * companySnap.data().estimatedTimePerToken;
          if (waitTime <= 10 && waitTime > 0 && !notified) {
            sendNotification();
          }
        }
      } else {
        setBooking(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, notified]);

  const sendNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('ClinicFlow: Your turn is approaching!', {
        body: 'Estimated waiting time is less than 10 minutes.',
        icon: '/favicon.ico'
      });
      setNotified(true);
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  };

  const cancelToken = async () => {
    if (!booking) return;
    if (!window.confirm('Are you sure you want to cancel your token?')) return;
    
    setCancelling(true);
    try {
      await updateDoc(doc(db, 'bookings', booking.id), { status: 'cancelled' });
      alert('Token cancelled successfully.');
    } catch (error) {
      console.error('Cancel Error:', error);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-primary"></div>
    </div>
  );

  if (!booking) return (
    <div className="max-w-xl mx-auto px-6 py-24 text-center">
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6">
        <Calendar size={40} />
      </div>
      <h2 className="text-3xl font-bold text-slate-800 mb-4">No Active Tokens</h2>
      <p className="text-medical-muted text-lg mb-8">You haven't booked any tokens yet today. Search for a clinic to get started.</p>
      <Button onClick={() => navigate('/search')} className="px-12 py-4">
        Find a Clinic
      </Button>
    </div>
  );

  const waitTime = (booking.tokenNumber - (company?.currentToken || 0)) * (company?.estimatedTimePerToken || 0);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Your Token Status</h1>
        <p className="text-medical-muted">Live updates on your clinical appointment.</p>
      </div>

      <div className="grid md:grid-cols-5 gap-8">
        {/* Token Card */}
        <div className="md:col-span-3">
          <Card className="p-0 overflow-hidden relative border-0 shadow-2xl ring-1 ring-slate-100">
            <div className="bg-medical-primary p-8 text-center text-white relative">
              <div className="absolute top-4 right-4 bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                Active Token
              </div>
              <div className="text-sm font-bold uppercase tracking-[0.2em] opacity-80 mb-2">Token Number</div>
              <div className="text-8xl font-black mb-2">#{booking.tokenNumber}</div>
              <div className="flex items-center justify-center gap-2 text-sm font-medium opacity-90">
                <Clock size={16} />
                <span>Booked at {new Date(booking.createdAt?.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-[10px] font-black text-medical-muted uppercase tracking-wider">Estimated Wait</div>
                  <div className="text-2xl font-bold text-slate-800">{waitTime <= 0 ? 'NOW' : `${waitTime} mins`}</div>
                </div>
                <div className="space-y-1 text-right">
                  <div className="text-[10px] font-black text-medical-muted uppercase tracking-wider">Current Serving</div>
                  <div className="text-2xl font-bold text-medical-primary">#{company?.currentToken || 0}</div>
                </div>
              </div>

              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-medical-primary transition-all duration-1000 ease-in-out"
                  style={{ width: `${Math.min(100, (company?.currentToken / booking.tokenNumber) * 100)}%` }}
                />
              </div>

              <div className="flex items-start gap-3 p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                <Bell size={20} className="shrink-0 animate-bounce" />
                <div className="text-sm">
                  <span className="font-bold">Notifications Active:</span> We will notify you 10 minutes before your turn. Please stay nearby.
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200"
                onClick={cancelToken}
                loading={cancelling}
              >
                <Trash2 size={18} /> Cancel Token
              </Button>
            </div>
          </Card>
        </div>

        {/* Clinic Info Card */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="w-12 h-12 bg-medical-primary/10 rounded-xl flex items-center justify-center text-medical-primary mb-4">
              <Building2 size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{booking.companyName}</h3>
            
            <div className="space-y-4 pt-4 border-t border-slate-50">
              <div className="flex items-start gap-3">
                <MapPin className="text-medical-muted shrink-0 mt-1" size={16} />
                <span className="text-sm text-medical-muted leading-snug">{company?.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="text-medical-muted shrink-0" size={16} />
                <span className="text-sm text-medical-muted">{company?.timings}</span>
              </div>
            </div>

            <div className="mt-8">
              <img src={booking.patientImage} className="w-full h-32 object-cover rounded-xl border border-slate-100" alt="Patient" />
              <div className="text-[10px] font-bold text-medical-muted uppercase tracking-wider mt-2 text-center">Patient ID Photo</div>
            </div>
          </Card>

          <Card className="p-6 bg-slate-900 text-white border-0">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="text-medical-primary" size={20} />
              <h4 className="text-sm font-bold">Important Note</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Please present your token number and patient ID photo at the reception counter. Tokens are non-transferable and valid for today only.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TokenStatus;

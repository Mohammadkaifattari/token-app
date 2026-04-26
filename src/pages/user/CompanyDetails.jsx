import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, storage } from '../../lib/firebase';
import { doc, getDoc, collection, addDoc, query, where, getDocs, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Building2, 
  MapPin, 
  Clock, 
  Calendar, 
  ArrowLeft, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Users
} from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const CompanyDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [patientImage, setPatientImage] = useState(null);
  const [existingToken, setExistingToken] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !user) return;
      
      try {
        const docSnap = await getDoc(doc(db, 'companies', id));
        if (docSnap.exists()) {
          setCompany({ id: docSnap.id, ...docSnap.data() });
        }

        // Check if user already has a token for this company today
        const today = new Date();
        today.setHours(0,0,0,0);
        
        const q = query(
          collection(db, 'bookings'),
          where('companyId', '==', id),
          where('userId', '==', user.uid),
          where('status', '==', 'pending')
        );
        
        const bookingSnap = await getDocs(q);
        if (!bookingSnap.empty) {
          setExistingToken(bookingSnap.docs[0].data());
        }
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  const handleBuyToken = async () => {
    if (!patientImage) {
      alert('Please upload a patient image.');
      return;
    }

    setBooking(true);
    try {
      // Get the next token number
      const q = query(
        collection(db, 'bookings'),
        where('companyId', '==', id),
        orderBy('tokenNumber', 'desc'),
        limit(1)
      );
      const lastBookingSnap = await getDocs(q);
      const nextTokenNumber = lastBookingSnap.empty ? 1 : lastBookingSnap.docs[0].data().tokenNumber + 1;

      // Upload image
      const storageRef = ref(storage, `patients/${user.uid}/${Date.now()}.jpg`);
      await uploadBytes(storageRef, patientImage);
      const imageUrl = await getDownloadURL(storageRef);

      // Create booking
      await addDoc(collection(db, 'bookings'), {
        companyId: id,
        companyName: company.name,
        userId: user.uid,
        userName: user.name,
        userEmail: user.email,
        tokenNumber: nextTokenNumber,
        patientImage: imageUrl,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      navigate('/my-token');
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to book token. Please try again.');
    } finally {
      setBooking(false);
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
        onClick={() => navigate('/search')}
        className="flex items-center gap-2 text-medical-muted hover:text-medical-primary mb-8 transition-colors group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Results
      </button>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Info Section */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-slate-800">{company.name}</h1>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-sm font-bold">
                <CheckCircle2 size={16} /> Open Now
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-medical-primary/5 text-medical-primary rounded-full text-sm font-bold">
                <Users size={16} /> {company.todayTokens || 0} Total Tokens
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <Card className="p-6">
              <Clock className="text-medical-primary mb-4" size={24} />
              <h4 className="text-sm font-bold text-medical-muted uppercase tracking-wider mb-1">Timings</h4>
              <p className="font-semibold text-slate-700">{company.timings}</p>
            </Card>
            <Card className="p-6">
              <Calendar className="text-medical-primary mb-4" size={24} />
              <h4 className="text-sm font-bold text-medical-muted uppercase tracking-wider mb-1">Established</h4>
              <p className="font-semibold text-slate-700">Since {new Date(company.since).getFullYear()}</p>
            </Card>
          </div>

          <Card className="p-0 overflow-hidden border-slate-100 h-64">
            <MapContainer center={[company.lat, company.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[company.lat, company.lng]} />
            </MapContainer>
          </Card>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <MapPin size={20} className="text-medical-primary" />
              Address
            </h3>
            <p className="text-medical-muted leading-relaxed">
              {company.address}
            </p>
          </div>
        </div>

        {/* Booking Section */}
        <div className="lg:sticky lg:top-32 h-fit">
          {existingToken ? (
            <Card className="p-8 text-center border-medical-primary/20 bg-medical-primary/5">
              <div className="w-16 h-16 bg-medical-primary rounded-full flex items-center justify-center text-white mx-auto mb-6">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Token Already Booked</h3>
              <p className="text-medical-muted mb-8">You have an active token for this clinic. Track your turn in real-time.</p>
              <Button className="w-full" onClick={() => navigate('/my-token')}>
                View My Token
              </Button>
            </Card>
          ) : (
            <Card className="p-8 shadow-2xl border-0 ring-1 ring-slate-100">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Book Your Turn</h2>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 block">Upload Patient Image</label>
                  <div 
                    className={`relative h-48 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer ${patientImage ? 'border-medical-primary' : 'border-slate-200 hover:border-medical-primary/50'}`}
                    onClick={() => document.getElementById('patient-upload').click()}
                  >
                    {patientImage ? (
                      <img src={URL.createObjectURL(patientImage)} className="w-full h-full object-cover rounded-2xl" alt="Patient" />
                    ) : (
                      <>
                        <ImageIcon size={40} className="text-slate-300 mb-2" />
                        <span className="text-sm text-medical-muted">Click to upload photo</span>
                      </>
                    )}
                    <input 
                      id="patient-upload" 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={(e) => setPatientImage(e.target.files[0])} 
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-medical-muted font-medium">Estimated Wait Time</span>
                    <span className="font-bold text-slate-700">~{(company.todayTokens - company.currentToken) * company.estimatedTimePerToken} mins</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-medical-muted font-medium">Current Token serving</span>
                    <span className="font-bold text-medical-primary">#{company.currentToken || 0}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-50 text-blue-700 rounded-xl text-xs">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p>By buying a token, you agree to show up at least 15 minutes before your estimated time.</p>
                </div>

                <Button 
                  className="w-full py-6 text-lg" 
                  onClick={handleBuyToken} 
                  loading={booking}
                  disabled={!company.allowTokens}
                >
                  {company.allowTokens ? 'Generate Token' : 'Tokens Not Available'}
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyDetails;

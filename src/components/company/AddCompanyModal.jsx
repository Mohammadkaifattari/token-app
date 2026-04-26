import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { MapPin, Image as ImageIcon, X, Search, Loader2 } from 'lucide-react';
import { searchPlaces } from '../../utils/foursquare';
import { db, storage } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../../hooks/useAuth';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function ChangeView({ center }) {
  const map = useMap();
  map.setView(center, 13);
  return null;
}

export const AddCompanyModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    since: '',
    timings: '',
    address: '',
    lat: 24.8607,
    lng: 67.0011,
  });
  
  const [images, setImages] = useState([]);
  const [addressQuery, setAddressQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (addressQuery.length > 2 && addressQuery !== formData.address) {
      setIsTyping(true);
      const delayDebounceFn = setTimeout(() => {
        handleAddressSearch();
        setIsTyping(false);
      }, 400); // Fast 400ms debounce

      return () => clearTimeout(delayDebounceFn);
    } else {
      setSuggestions([]);
      setIsTyping(false);
    }
  }, [addressQuery]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 3) {
      alert('You can only upload up to 3 certificates.');
      return;
    }
    setImages([...images, ...files]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAddressSearch = async () => {
    if (!addressQuery) return;
    setSearching(true);
    const results = await searchPlaces(addressQuery);
    setSuggestions(results);
    setSearching(false);
  };

  const selectAddress = (suggestion) => {
    setFormData({
      ...formData,
      address: suggestion.location.formatted_address,
      lat: suggestion.location.lat,
      lng: suggestion.location.lng,
    });
    setAddressQuery(suggestion.location.formatted_address);
    setSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      // Upload images
      const imageUrls = await Promise.all(
        images.map(async (image) => {
          const storageRef = ref(storage, `certificates/${user.uid}/${Date.now()}-${image.name}`);
          await uploadBytes(storageRef, image);
          return getDownloadURL(storageRef);
        })
      );

      // Save to Firestore
      await addDoc(collection(db, 'companies'), {
        ...formData,
        ownerId: user.uid,
        certificates: imageUrls,
        createdAt: serverTimestamp(),
        allowTokens: false,
        todayTokens: 0,
        estimatedTimePerToken: 15, // Default
        currentToken: 0,
      });

      onClose();
      // Reset form
      setFormData({ name: '', since: '', timings: '', address: '', lat: 24.8607, lng: 67.0011 });
      setImages([]);
      setAddressQuery('');
    } catch (error) {
      console.error('Error adding company:', error);
      alert('Failed to add company. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Company" className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <Input 
            label="Company Name" 
            placeholder="e.g. HealthCare Clinic" 
            required 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <Input 
            label="Since" 
            type="date" 
            required 
            value={formData.since}
            onChange={(e) => setFormData({...formData, since: e.target.value})}
          />
        </div>

        <Input 
          label="Timings" 
          placeholder="e.g. 09:00 AM - 05:00 PM" 
          required 
          value={formData.timings}
          onChange={(e) => setFormData({...formData, timings: e.target.value})}
        />

        <div className="relative">
          <label className="text-sm font-medium text-medical-text ml-1 mb-1.5 block">Address</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                className="w-full px-4 py-2.5 rounded-clinical border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary transition-all bg-white"
                placeholder="Type address (e.g. Gohar Green City)..."
                value={addressQuery}
                onChange={(e) => setAddressQuery(e.target.value)}
              />
              {(searching || isTyping) && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="animate-spin text-medical-primary" size={18} />
                </div>
              )}
            </div>
            <Button type="button" variant="secondary" className="px-4" onClick={handleAddressSearch}>
              <Search size={18} />
            </Button>
          </div>

          {suggestions.length > 0 && (
            <div className="absolute z-[9999] w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-start gap-3 border-b border-slate-50 last:border-0"
                  onClick={() => selectAddress(s)}
                >
                  <MapPin className="text-medical-primary shrink-0 mt-0.5" size={16} />
                  <div>
                    <div className="font-semibold text-sm text-slate-800">{s.name}</div>
                    <div className="text-xs text-medical-muted">{s.location.formatted_address}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-48 w-full rounded-clinical overflow-hidden border border-slate-100 z-0">
          <MapContainer center={[formData.lat, formData.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[formData.lat, formData.lng]} />
            <ChangeView center={[formData.lat, formData.lng]} />
          </MapContainer>
        </div>

        <div>
          <label className="text-sm font-medium text-medical-text ml-1 mb-1.5 block">Certificates (Max 3)</label>
          <div className="grid grid-cols-3 gap-4">
            {images.map((img, index) => (
              <div key={index} className="relative h-24 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 group">
                <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" alt="Preview" />
                <button 
                  type="button"
                  className="absolute top-1 right-1 p-1 bg-white/80 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {images.length < 3 && (
              <label className="h-24 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-medical-muted hover:border-medical-primary hover:text-medical-primary cursor-pointer transition-all">
                <ImageIcon size={24} />
                <span className="text-[10px] font-bold mt-1 uppercase">Upload</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            )}
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1" loading={loading}>Save Company</Button>
        </div>
      </form>
    </Modal>
  );
};

import React, { useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Stethoscope, ShieldCheck, Zap } from 'lucide-react';
import { fadeIn, scaleUp } from '../animations/gsapHelpers';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { loginWithGoogle, user, loading } = useAuth();
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    fadeIn(cardRef.current, 0.2);
    scaleUp(logoRef.current, 0.4);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-medical-background overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-medical-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-medical-secondary/5 rounded-full blur-3xl" />

      <div ref={cardRef} className="max-w-md w-full">
        <Card className="p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col items-center text-center space-y-6">
            <div ref={logoRef} className="w-20 h-20 bg-medical-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-medical-primary/20">
              <Stethoscope size={40} />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Welcome Back</h1>
              <p className="text-medical-muted">Experience the future of clinical management. Secure, fast, and simple.</p>
            </div>

            <div className="w-full space-y-3 pt-4">
              <Button 
                variant="primary" 
                className="w-full py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200" 
                onClick={loginWithGoogle}
                loading={loading}
              >
                {!loading && (
                  <svg className="w-5 h-5" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                  </svg>
                )}
                Sign in with Google
              </Button>
              
              <div className="flex items-center gap-2 text-xs text-medical-muted justify-center">
                <ShieldCheck size={14} />
                <span>Protected by Firebase Authentication</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full pt-8 border-t border-slate-100">
              <div className="text-left">
                <div className="text-medical-primary mb-1"><Zap size={20} /></div>
                <h3 className="text-sm font-bold text-slate-700">Real-time</h3>
                <p className="text-xs text-medical-muted">Live token updates</p>
              </div>
              <div className="text-left">
                <div className="text-medical-secondary mb-1"><ShieldCheck size={20} /></div>
                <h3 className="text-sm font-bold text-slate-700">Secure</h3>
                <p className="text-xs text-medical-muted">Cloud data storage</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;

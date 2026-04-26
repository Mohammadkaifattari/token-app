import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import gsap from 'gsap';
import { cn } from './Button';

export const Modal = ({ isOpen, onClose, title, children, className }) => {
  const overlayRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.9, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }
      );
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 });
    gsap.to(modalRef.current, {
      opacity: 0,
      scale: 0.9,
      y: 20,
      duration: 0.2,
      onComplete: onClose,
    });
  };

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        className={cn(
          'bg-white rounded-clinical shadow-2xl max-w-lg w-full relative z-[51] flex flex-col max-h-[90vh]',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-xl font-semibold text-medical-text">{title}</h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-50 rounded-full transition-colors text-medical-muted"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>,
    document.body
  );
};

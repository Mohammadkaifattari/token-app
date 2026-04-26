import React, { useRef } from 'react';
import { cn } from './Button';
import { hoverScale, hoverScaleReset, glowEffect, glowEffectReset } from '../../animations/gsapHelpers';

export const Card = ({ children, className, animate = false, ...props }) => {
  const cardRef = useRef(null);

  const handleMouseEnter = () => {
    if (animate) {
      hoverScale(cardRef.current);
      glowEffect(cardRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (animate) {
      hoverScaleReset(cardRef.current);
      glowEffectReset(cardRef.current);
    }
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        'bg-white rounded-clinical shadow-clinical border border-slate-100 p-6 transition-all',
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </div>
  );
};

import gsap from 'gsap';

export const fadeIn = (element, delay = 0) => {
  gsap.fromTo(
    element,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.6, delay, ease: 'power2.out' }
  );
};

export const slideIn = (element, direction = 'left', delay = 0) => {
  const x = direction === 'left' ? -50 : direction === 'right' ? 50 : 0;
  const y = direction === 'top' ? -50 : direction === 'bottom' ? 50 : 0;

  gsap.fromTo(
    element,
    { opacity: 0, x, y },
    { opacity: 1, x: 0, y: 0, duration: 0.8, delay, ease: 'power3.out' }
  );
};

export const scaleUp = (element, delay = 0) => {
  gsap.fromTo(
    element,
    { opacity: 0, scale: 0.9 },
    { opacity: 1, scale: 1, duration: 0.5, delay, ease: 'back.out(1.7)' }
  );
};

export const hoverScale = (element) => {
  gsap.to(element, { scale: 1.03, duration: 0.3, ease: 'power2.out' });
};

export const hoverScaleReset = (element) => {
  gsap.to(element, { scale: 1, duration: 0.3, ease: 'power2.out' });
};

export const glowEffect = (element) => {
  gsap.to(element, { 
    boxShadow: '0 10px 30px -5px rgba(14, 165, 233, 0.3)', 
    duration: 0.3 
  });
};

export const glowEffectReset = (element) => {
  gsap.to(element, { 
    boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)', 
    duration: 0.3 
  });
};

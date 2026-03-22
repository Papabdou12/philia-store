import { useEffect, useRef, useState } from 'react';

/**
 * Hook pour animer les éléments au scroll avec IntersectionObserver
 * Optimisé pour performance 3G - utilise des seuils bas
 *
 * @param {Object} options - Options de configuration
 * @param {number} options.threshold - Seuil de visibilité (0-1), défaut 0.1
 * @param {string} options.rootMargin - Marge autour du viewport, défaut '0px'
 * @param {boolean} options.triggerOnce - Animer une seule fois, défaut true
 * @returns {[React.RefObject, boolean]} - Ref à attacher et état de visibilité
 */
export const useScrollReveal = (options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true,
  } = options;

  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Respecter prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, rootMargin, triggerOnce]);

  return [ref, isVisible];
};

/**
 * Hook pour animer plusieurs éléments en cascade
 *
 * @param {number} itemCount - Nombre d'éléments à animer
 * @param {number} staggerDelay - Délai entre chaque élément (ms), défaut 100
 * @returns {Object} - { containerRef, isVisible, getItemStyle }
 */
export const useStaggerReveal = (itemCount, staggerDelay = 100) => {
  const [containerRef, isVisible] = useScrollReveal();

  const getItemStyle = (index) => ({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
    transition: `all 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${index * staggerDelay}ms`,
  });

  return { containerRef, isVisible, getItemStyle };
};

export default useScrollReveal;

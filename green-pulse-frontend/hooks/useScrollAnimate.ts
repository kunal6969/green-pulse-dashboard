import { useState, useEffect, useRef } from 'react';

const useScrollAnimate = (options?: IntersectionObserverInit) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        // We can unobserve after it becomes visible to prevent re-triggering
        if (ref.current) {
            observer.unobserve(ref.current);
        }
      }
    }, {
      root: null,
      rootMargin: '0px',
      threshold: 0.2,
      ...options,
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, options]);

  return { ref, isVisible };
};

export default useScrollAnimate;
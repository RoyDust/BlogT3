'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button when page is scrolled down 300px
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed bottom-8 right-8 z-40
        btn-regular rounded-2xl w-12 h-12
        flex items-center justify-center
        shadow-lg
        transition-all duration-300
        ${isVisible ? 'translate-x-0 scale-100 opacity-100' : 'translate-x-20 scale-90 opacity-0 pointer-events-none'}
        hidden lg:flex
        active:scale-90
      `}
      aria-label="返回顶部"
    >
      <ArrowUp className="h-6 w-6" />
    </button>
  );
}

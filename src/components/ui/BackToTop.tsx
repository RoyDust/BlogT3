'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);

      // 计算滚动进度
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setScrollProgress(Math.min(window.scrollY / docHeight, 1));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // SVG 圆环进度参数
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - scrollProgress);

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed bottom-8 right-8 z-40
        rounded-2xl w-12 h-12
        flex items-center justify-center
        bg-[var(--card-bg)] shadow-lg
        transition-all duration-300 cursor-pointer
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}
        hidden lg:flex
        active:scale-90 hover:shadow-xl
      `}
      aria-label="返回顶部"
    >
      {/* 滚动进度圆环 */}
      <svg
        className="absolute inset-0 -rotate-90"
        width="48"
        height="48"
        viewBox="0 0 48 48"
      >
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-150"
        />
      </svg>
      <ArrowUp className="h-5 w-5 text-[var(--btn-content)]" />
    </button>
  );
}

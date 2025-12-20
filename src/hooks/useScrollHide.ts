"use client";

import { useState, useEffect } from "react";

interface UseScrollHideOptions {
  threshold?: number; // 触发隐藏的滚动距离阈值
  delta?: number; // 滚动变化的最小值才触发
}

export function useScrollHide(options: UseScrollHideOptions = {}) {
  const { threshold = 100, delta = 10 } = options;
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // 如果滚动距离小于阈值，始终显示
          if (currentScrollY < threshold) {
            setIsHidden(false);
            setLastScrollY(currentScrollY);
            ticking = false;
            return;
          }

          // 计算滚动方向和距离
          const scrollDelta = currentScrollY - lastScrollY;

          // 向下滚动且超过 delta 值，隐藏
          if (scrollDelta > delta) {
            setIsHidden(true);
          }
          // 向上滚动且超过 delta 值，显示
          else if (scrollDelta < -delta) {
            setIsHidden(false);
          }

          setLastScrollY(currentScrollY);
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY, threshold, delta]);

  return isHidden;
}

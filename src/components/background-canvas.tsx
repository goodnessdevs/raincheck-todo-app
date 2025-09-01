'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

export function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const iconPath = new Path2D(
      'M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242M8 19v1M8 15v1M12 19v1M12 15v1M16 19v1M16 15v1'
    );
    
    const iconSize = 24;
    const padding = 120;
    
    const draw = () => {
      if (!ctx) return;
      
      const isDark = theme === 'dark';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
      ctx.lineWidth = 1;

      for (let x = padding; x < canvas.width / dpr - padding; x += padding) {
        for (let y = padding; y < canvas.height / dpr - padding; y += padding) {
          ctx.save();
          const angle = Math.PI / 6;
          ctx.translate(x, y);
          ctx.rotate(angle);
          ctx.scale(1.5, 1.5);
          ctx.stroke(iconPath);
          ctx.restore();
        }
      }
    };

    draw();

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      draw();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);

  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
    />
  );
}

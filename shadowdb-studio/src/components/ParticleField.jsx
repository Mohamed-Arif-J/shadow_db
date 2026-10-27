import React, { useEffect, useRef } from 'react';

/**
 * ParticleField - Ambient, interactive constellation particle animation
 * Renders subtle floating nodes and neural-like connection lines in the Studio background.
 */
export default function ParticleField({ count = 42, active = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = canvas.parentElement.clientWidth);
    let height = (canvas.height = canvas.parentElement.clientHeight);

    // Particle pool
    const particles = [];
    const connectionDistance = 110;
    const mouse = { x: null, y: null, radius: 120 };

    // Multi-colored cosmic developer palette (Cyan, Indigo, Purple, Emerald, Amber)
    const isDark = document.documentElement.classList.contains('dark');
    const colorPalettes = isDark ? [
      { base: 'rgba(56, 189, 248, ', glow: 'rgba(0, 240, 255, 0.5)' },   // Cyan
      { base: 'rgba(129, 140, 248, ', glow: 'rgba(99, 102, 241, 0.5)' }, // Indigo
      { base: 'rgba(192, 132, 252, ', glow: 'rgba(168, 85, 247, 0.5)' }, // Purple
      { base: 'rgba(52, 211, 153, ', glow: 'rgba(16, 185, 129, 0.5)' },  // Emerald
      { base: 'rgba(251, 191, 36, ', glow: 'rgba(245, 158, 11, 0.5)' }   // Amber
    ] : [
      { base: 'rgba(2, 132, 199, ', glow: 'rgba(2, 132, 199, 0.25)' },   // Sky
      { base: 'rgba(79, 70, 229, ', glow: 'rgba(79, 70, 229, 0.25)' },   // Indigo
      { base: 'rgba(147, 51, 234, ', glow: 'rgba(147, 51, 234, 0.25)' }, // Purple
      { base: 'rgba(16, 185, 129, ', glow: 'rgba(16, 185, 129, 0.25)' }, // Emerald
      { base: 'rgba(217, 119, 6, ', glow: 'rgba(217, 119, 6, 0.25)' }    // Amber
    ];

    const lineColor = isDark ? 'rgba(99, 102, 241, ' : 'rgba(14, 165, 233, ';

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 1.2;
        this.baseX = this.x;
        this.baseY = this.y;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.alpha = Math.random() * 0.5 + 0.25;
        this.pulseSpeed = Math.random() * 0.02 + 0.008;
        this.palette = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
      }

      update() {
        // Natural floating drift
        this.x += this.vx;
        this.y += this.vy;

        // Bounce gently off boundaries
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Subtle alpha pulsation
        this.alpha += Math.sin(Date.now() * this.pulseSpeed * 0.05) * 0.005;
        if (this.alpha < 0.18) this.alpha = 0.18;
        if (this.alpha > 0.75) this.alpha = 0.75;

        // Gentle reaction to mouse
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x -= (dx / dist) * force * 1.5;
            this.y -= (dy / dist) * force * 1.5;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `${this.palette.base}${this.alpha})`;
        ctx.shadowBlur = this.size * 3;
        ctx.shadowColor = this.palette.glow;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // Initialize particles
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }

    // Animation Loop
    function render() {
      ctx.clearRect(0, 0, width, height);

      // Connect nearby particles
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const opacity = (1 - dist / connectionDistance) * 0.18;
            ctx.beginPath();
            ctx.strokeStyle = `${lineColor}${opacity})`;
            ctx.lineWidth = 0.75;
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }

      // Update & draw particles
      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(render);
    }

    render();

    // Resize observer to keep canvas perfectly synced with container
    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(canvas.parentElement);

    // Mouse movement
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [count, active]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 w-full h-full opacity-60 dark:opacity-40 transition-opacity duration-300"
      aria-hidden="true"
    />
  );
}

import { Injectable } from '@angular/core';
import { gsap } from 'gsap';
import { ThemeService } from '../theme/theme.service';

@Injectable({
  providedIn: 'root'
})
export class ParticlesBackgroundService {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particlesArray: any[] = [];
  private animationId: number | null = null;
  private isDarkMode: boolean = false;

  constructor(private themeService: ThemeService) {}

  initializeParticles(): void {
    if (typeof document !== 'undefined' && !document.getElementById('particles-canvas')) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'particles-canvas';
      Object.assign(this.canvas.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        zIndex: '-100',
        pointerEvents: 'none',
      });

      document.body.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d');

      if (!this.ctx) {
        console.error('No se pudo obtener el contexto 2D del canvas.');
        return;
      }

      this.resizeCanvas();
      this.isDarkMode = this.themeService.isDarkMode();
      this.createParticles(this.isDarkMode);
      this.startParticleAnimation();

      // Suscribirse al cambio de tema para actualizar las partículas
      this.themeService.darkMode$.subscribe(isDark => this.updateParticleColors(isDark));
    }
  }

  private resizeCanvas(): void {
    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  }

  private createParticles(isDark: boolean): void {
    const particleCount = Math.min(100, window.innerWidth / 12); // Reducir cantidad para mejor rendimiento
    this.particlesArray = [];

    for (let i = 0; i < particleCount; i++) {
      this.particlesArray.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2 + 1, // Partículas más pequeñas
        speedX: (Math.random() - 0.5) * 0.6, // Movimientos más suaves
        speedY: (Math.random() - 0.5) * 0.6,
        opacity: Math.random() * 0.5 + 0.3,
        gradient: isDark
          ? ['rgba(147, 197, 253, 0.8)', 'rgba(59, 130, 246, 0.5)']
          : ['rgba(147, 197, 253, 0.4)', 'rgba(59, 130, 246, 0.2)']
      });
    }
  }

  private startParticleAnimation(): void {
    const animate = () => {
      if (!this.ctx || !this.canvas) return;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.particlesArray.forEach(particle => {
        // Movimiento más fluido
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Rebote en los bordes
        if (particle.x < 0 || particle.x > this.canvas!.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > this.canvas!.height) particle.speedY *= -1;

        // Efecto visual de degradado más suave
        const gradient = this.ctx!.createRadialGradient(
          particle.x, particle.y, 0, particle.x, particle.y, particle.size * 1.5
        );
        gradient.addColorStop(0, particle.gradient[0]);
        gradient.addColorStop(1, particle.gradient[1]);

        this.ctx!.beginPath();
        this.ctx!.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx!.fillStyle = gradient;
        this.ctx!.globalAlpha = particle.opacity;
        this.ctx!.fill();
      });

      this.animationId = requestAnimationFrame(animate);
    };

    this.animationId = requestAnimationFrame(animate);
  }

  private updateParticleColors(isDark: boolean): void {
    this.particlesArray.forEach(particle => {
      gsap.to(particle, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          particle.gradient = isDark
            ? ['rgba(147, 197, 253, 0.8)', 'rgba(59, 130, 246, 0.5)']
            : ['rgba(147, 197, 253, 0.4)', 'rgba(59, 130, 246, 0.2)'];
          gsap.to(particle, { opacity: 1, duration: 0.3 });
        }
      });
    });
  }
  // Añade este método para limpiar los recursos
  destroyParticles(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
      this.canvas = null;
      this.ctx = null;
    }
    // Si tienes event listeners (como resize), también deberías removerlos aquí
    // window.removeEventListener('resize', this.resizeCanvasBound); // si lo hubieras vinculado
  }

}

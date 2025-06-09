// src/app/core/background/animated-lines-background.service.ts
import { Injectable } from '@angular/core';
import { gsap } from 'gsap';
import { ThemeService } from '../theme/theme.service';
import { distinctUntilChanged } from 'rxjs/operators';

interface Line {
  x: number;
  y: number;
  length: number;
  angle: number;
  color: string;
  opacity: number;
  speed: number;
  life: number;
  maxLife: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnimatedLinesBackgroundService {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private linesArray: Line[] = [];
  private animationId: number | null = null;
  private isDarkMode: boolean = false;

  // Definición de colores base para los destellos de línea (ajustados para ser más vistosos)
  private colors = {
    light: [
      'rgba(96, 165, 250, 0.6)',  // blue-400, opacidad subida de 0.4 a 0.6
      'rgba(52, 211, 153, 0.5)',  // green-400, opacidad subida de 0.3 a 0.5
      'rgba(251, 191, 36, 0.5)',  // yellow-400, opacidad subida de 0.3 a 0.5
      'rgba(248, 113, 113, 0.5)', // red-400, opacidad subida de 0.3 a 0.5
      'rgba(45, 212, 191, 0.5)',  // teal-400, opacidad subida de 0.3 a 0.5
      'rgba(168, 85, 247, 0.5)'   // purple-400, opacidad subida de 0.3 a 0.5
    ],
    dark: [
      'rgba(59, 130, 246, 0.3)',  // blue-500, opacidad subida de 0.2 a 0.3
      'rgba(16, 185, 129, 0.25)', // green-500, opacidad subida de 0.15 a 0.25
      'rgba(245, 158, 11, 0.25)', // yellow-500, opacidad subida de 0.15 a 0.25
      'rgba(239, 68, 68, 0.25)',  // red-500, opacidad subida de 0.15 a 0.25
      'rgba(20, 184, 166, 0.25)', // teal-500, opacidad subida de 0.15 a 0.25
      'rgba(139, 92, 246, 0.25)'  // purple-500, opacidad subida de 0.15 a 0.25
    ]
  };

  constructor(private themeService: ThemeService) {}

  initializeLines(): void {
    if (typeof document !== 'undefined' && !document.getElementById('animated-lines-canvas')) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'animated-lines-canvas';
      Object.assign(this.canvas.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        zIndex: '-110',
        pointerEvents: 'none',
        opacity: '0',
      });

      document.body.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d');

      if (!this.ctx) {
        console.error('No se pudo obtener el contexto 2D del canvas de líneas.');
        return;
      }

      this.resizeCanvas();
      this.isDarkMode = this.themeService.isDarkMode();
      this.createLines(this.isDarkMode);
      this.startLineAnimation();

      gsap.to(this.canvas, { opacity: 1, duration: 1.5, ease: 'power2.out', delay: 0.5 });

      this.themeService.darkMode$
        .pipe(distinctUntilChanged())
        .subscribe(isDark => this.updateLineColors(isDark));

      window.addEventListener('resize', () => this.resizeCanvas());
    }
  }

  private resizeCanvas(): void {
    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.createLines(this.isDarkMode);
    }
  }

  private createLines(isDark: boolean): void {
    const lineColorPalette = isDark ? this.colors.dark : this.colors.light;
    const lineCount = Math.min(Math.floor(window.innerWidth / 12), 250); // Aumenta un poco la cantidad de líneas
                                                                         // para que sean más notorias

    this.linesArray = [];
    for (let i = 0; i < lineCount; i++) {
      this.linesArray.push(this.createSingleLine(lineColorPalette));
    }
  }

  private createSingleLine(palette: string[]): Line {
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      length: Math.random() * 20 + 15, // Longitud de 15 a 35px (un poco más largas)
      angle: Math.random() * Math.PI * 2,
      color: palette[Math.floor(Math.random() * palette.length)],
      opacity: 0,
      speed: (Math.random() - 0.5) * 0.7 + 0.1, // Velocidad de movimiento un poco más notoria
      life: 0,
      maxLife: Math.random() * 120 + 80 // Duración de vida de 80 a 200 frames (ciclos más rápidos)
    };
  }

  private startLineAnimation(): void {
    const animate = () => {
      if (!this.ctx || !this.canvas) return;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (let i = this.linesArray.length - 1; i >= 0; i--) {
        const line = this.linesArray[i];

        line.x += Math.cos(line.angle) * line.speed;
        line.y += Math.sin(line.angle) * line.speed;

        if (line.x < 0 || line.x > this.canvas.width) { line.speed *= -1; line.angle = Math.atan2(Math.sin(line.angle), -Math.cos(line.angle)); }
        if (line.y < 0 || line.y > this.canvas.height) { line.speed *= -1; line.angle = Math.atan2(-Math.sin(line.angle), Math.cos(line.angle)); }

        line.life++;
        if (line.life < line.maxLife * 0.2) {
          line.opacity = gsap.utils.mapRange(0, line.maxLife * 0.2, 0, 1, line.life);
        } else if (line.life > line.maxLife * 0.8) {
          line.opacity = gsap.utils.mapRange(line.maxLife * 0.8, line.maxLife, 1, 0, line.life);
        } else {
          line.opacity = 1;
        }

        this.ctx.beginPath();
        this.ctx.strokeStyle = line.color;
        this.ctx.globalAlpha = line.opacity;
        this.ctx.lineWidth = Math.random() * 1 + 0.8; // Grosor de línea sutil (0.8 a 1.8)
        this.ctx.lineCap = 'round';

        const endX = line.x + Math.cos(line.angle) * line.length;
        const endY = line.y + Math.sin(line.angle) * line.length;
        this.ctx.moveTo(line.x, line.y);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();

        if (line.life >= line.maxLife) {
          this.linesArray[i] = this.createSingleLine(this.isDarkMode ? this.colors.dark : this.colors.light);
        }
      }

      this.animationId = requestAnimationFrame(animate);
    };

    this.animationId = requestAnimationFrame(animate);
  }

  private updateLineColors(isDark: boolean): void {
    this.isDarkMode = isDark;
    const newColorPalette = isDark ? this.colors.dark : this.colors.light;

    this.linesArray.forEach(line => {
      const newColor = newColorPalette[Math.floor(Math.random() * newColorPalette.length)];
      gsap.to(line, {
        color: newColor,
        duration: 0.6,
        ease: 'power1.inOut'
      });
    });
  }

  destroyLines(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
      this.canvas = null;
      this.ctx = null;
    }
    window.removeEventListener('resize', () => this.resizeCanvas());
  }
}
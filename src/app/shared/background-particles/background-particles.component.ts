import {
  Component,
  OnInit,
  OnDestroy,
  HostListener
} from '@angular/core';

@Component({
  selector: 'app-background-particles',
  standalone: true,
  template: `<canvas id="particles-canvas" class="fixed top-0 left-0 w-full h-full z-[-1]"></canvas>`,
  styleUrls: ['./background-particles.component.css']
})
export class BackgroundParticlesComponent implements OnInit, OnDestroy {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private particlesArray: any[] = [];
  private animationId = 0;
  private mousePosition = { x: 0, y: 0 };

  ngOnInit(): void {
    this.canvas = document.getElementById('particles-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.resizeCanvas();
    this.createParticles();
    this.animate();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
  }

  @HostListener('window:resize')
  resizeCanvas(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.mousePosition.x = (event.clientX - rect.width / 2) / rect.width;
    this.mousePosition.y = (event.clientY - rect.height / 2) / rect.height;
  }

  private createParticles(): void {
    const particleCount = Math.min(100, window.innerWidth / 10);
    for (let i = 0; i < particleCount; i++) {
      this.particlesArray.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        color: 'rgba(59, 130, 246, 0.4)'
      });
    }
  }

  private animate(): void {
    const step = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.particlesArray.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        const dx = this.mousePosition.x * window.innerWidth - p.x;
        const dy = this.mousePosition.y * window.innerHeight - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 100) {
          const force = (100 - dist) / 100;
          p.x -= dx * force * 0.01;
          p.y -= dy * force * 0.01;
        }

        if (p.x < 0 || p.x > this.canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > this.canvas.height) p.speedY *= -1;

        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = p.opacity;
        this.ctx.fill();
      });

      this.ctx.globalAlpha = 1;
      this.animationId = requestAnimationFrame(step);
    };

    step();
  }
}

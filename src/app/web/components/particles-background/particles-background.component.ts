import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  Inject,
  ElementRef,
  ViewChild
} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { ThemeService } from 'src/app/core/theme/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-particles-background',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './particles-background.component.html',
  styleUrls: ['./particles-background.component.css']
})
export class ParticlesBackgroundComponent implements OnInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D | null;
  private animationId!: number;
  private darkModeSubscription!: Subscription;
  private particlesArray: any[] = [];
  private mouse = { x: 0, y: 0 };

  constructor(
    private themeService: ThemeService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.darkModeSubscription = this.themeService.darkMode$.subscribe((isDark) => {
      this.createParticles(isDark);
    });

    setTimeout(() => this.initializeCanvas(), 0);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    if (this.darkModeSubscription) this.darkModeSubscription.unsubscribe();
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    this.mouse.x = (event.clientX - window.innerWidth / 2) / window.innerWidth;
    this.mouse.y = (event.clientY - window.innerHeight / 2) / window.innerHeight;
  }

  @HostListener('window:resize')
  onResize(): void {
    this.resizeCanvas();
    this.createParticles(this.themeService.isDarkMode());
  }

  private initializeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d');
    this.resizeCanvas();
    this.createParticles(this.themeService.isDarkMode());
    this.animate();
  }

  private resizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  private createParticles(isDark: boolean): void {
    const canvas = this.canvasRef.nativeElement;
    const total = Math.floor((canvas.width + canvas.height) / 15);
    const color = isDark ? 'rgba(147, 197, 253, 0.5)' : 'rgba(59, 130, 246, 0.3)';

    this.particlesArray = Array.from({ length: total }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.5 + 0.3,
      color
    }));
  }

  private animate(): void {
    const canvas = this.canvasRef.nativeElement;
    if (!this.ctx) return;

    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.particlesArray.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;

      const dx = this.mouse.x * canvas.width - p.x;
      const dy = this.mouse.y * canvas.height - p.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 100) {
        const force = (100 - distance) / 100;
        p.x -= dx * force * 0.01;
        p.y -= dy * force * 0.01;
      }

      if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
      if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

      this.ctx!.beginPath();
      this.ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx!.fillStyle = p.color;
      this.ctx!.globalAlpha = p.opacity;
      this.ctx!.fill();
    });

    this.ctx.globalAlpha = 1;
    this.animationId = requestAnimationFrame(() => this.animate());
  }
}

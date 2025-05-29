// src/app/web/pages/web-login/web-login.component.ts
import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs'; // Importa Observable y Subscription
import { ThemeService } from 'src/app/core/theme/theme.service'; // <-- Importa ThemeService

@Component({
  selector: 'app-web-login',
  templateUrl: './web-login.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  styleUrls: ['./web-login.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WebLoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  twoFactorEnabled: boolean = false;
  errorMessage: string | null = null;
  isLoading: boolean = false;
  // darkMode: boolean = false; // <-- ELIMINADO: Ahora se maneja por ThemeService

  // Observable para el estado del Dark Mode desde ThemeService
  isDarkMode$: Observable<boolean>;
  private darkModeSubscription!: Subscription; // Para desuscribirse del darkMode$

  // Parallax y animaciones
  mousePosition = { x: 0, y: 0 };
  particlesArray: any[] = [];
  animationId: number = 0;

  // Estados de animación
  showPassword: boolean = false;
  loginStep: 'credentials' | 'twoFactor' | 'success' = 'credentials';

  // Configuración de partículas
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService // <-- Inyecta ThemeService
  ) {
    // Inicializar formulario con validadores mejorados
    this.loginForm = this.fb.group({
      nombre_usuario: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern(/^[a-zA-Z0-9._-]+$/)
      ]],
      contrasena: ['', [
        Validators.required,
        Validators.minLength(6)
      ]],
      twoFactorCode: ['']
    });

    // Asigna el observable del ThemeService a tu propiedad local
    this.isDarkMode$ = this.themeService.darkMode$;

    // No es necesario llamar a detectSystemTheme() aquí, el ThemeService ya lo hace.
    // this.detectSystemTheme(); // <-- ELIMINADO
  }

  ngOnInit(): void {
    this.loginForm.markAsUntouched();
    this.initializeParticles();
    this.startParticleAnimation();

    // Suscribirse a los cambios de darkMode para actualizar el color de las partículas
    this.darkModeSubscription = this.isDarkMode$.subscribe(isDark => {
      this.updateParticleColors(isDark);
    });

    // Animación de entrada suave
    setTimeout(() => {
      this.addEntranceAnimations();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    // Desuscribirse del observable de darkMode
    if (this.darkModeSubscription) {
      this.darkModeSubscription.unsubscribe();
    }
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    const rect = document.body.getBoundingClientRect();
    this.mousePosition.x = (event.clientX - rect.width / 2) / rect.width;
    this.mousePosition.y = (event.clientY - rect.height / 2) / rect.height;

    // Efecto parallax en elementos flotantes
    this.updateParallaxElements();
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.resizeCanvas();
  }

  // --- MÉTODOS DE DARK MODE ELIMINADOS O REEMPLAZADOS ---
  // private detectSystemTheme(): void { ... } // <-- ELIMINADO
  // private applyTheme(): void { ... } // <-- ELIMINADO
  // private animateThemeTransition(): void { ... } // <-- ELIMINADO: Si quieres esta animación, debe estar en ThemeService o ser una función utilitaria global.

  // Método para alternar el tema (si quieres un botón en el login)
  // Si solo el header va a tener el control, puedes eliminar este método.
  toggleThemeFromLogin(): void {
    this.themeService.toggleDarkMode();
  }

  // Alternar visibilidad de contraseña
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    const passwordInput = document.getElementById('contrasena') as HTMLInputElement;
    if (passwordInput) {
      passwordInput.type = this.showPassword ? 'text' : 'password';
    }
  }

  // Inicializar sistema de partículas
  private initializeParticles(): void {
    if (typeof document !== 'undefined') {
      this.canvas = document.getElementById('particles-canvas') as HTMLCanvasElement;
      if (this.canvas) {
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        // Llama a createParticles con el estado actual del dark mode
        this.createParticles(this.themeService.isDarkMode());
      }
    }
  }

  private resizeCanvas(): void {
    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  }

  // Modificado para aceptar el estado del dark mode
  private createParticles(isDark: boolean): void {
    const particleCount = Math.min(100, window.innerWidth / 10);
    this.particlesArray = [];

    for (let i = 0; i < particleCount; i++) {
      this.particlesArray.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        color: isDark ? 'rgba(147, 197, 253, 0.6)' : 'rgba(59, 130, 246, 0.4)'
      });
    }
  }

  // Nuevo método para actualizar el color de las partículas cuando cambia el tema
  private updateParticleColors(isDark: boolean): void {
    this.particlesArray.forEach(particle => {
      particle.color = isDark ? 'rgba(147, 197, 253, 0.6)' : 'rgba(59, 130, 246, 0.4)';
    });
  }


  private startParticleAnimation(): void {
    const animate = () => {
      if (this.ctx && this.canvas) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particlesArray.forEach(particle => {
          // Actualizar posición
          particle.x += particle.speedX;
          particle.y += particle.speedY;

          // Efecto de mouse
          const dx = this.mousePosition.x * window.innerWidth - particle.x;
          const dy = this.mousePosition.y * window.innerHeight - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            const force = (100 - distance) / 100;
            particle.x -= dx * force * 0.01;
            particle.y -= dy * force * 0.01;
          }

          // Rebotar en los bordes
          if (particle.x < 0 || particle.x > this.canvas!.width) particle.speedX *= -1;
          if (particle.y < 0 || particle.y > this.canvas!.height) particle.speedY *= -1;

          // Dibujar partícula
          this.ctx!.beginPath();
          this.ctx!.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          this.ctx!.fillStyle = particle.color;
          this.ctx!.globalAlpha = particle.opacity;
          this.ctx!.fill();
        });

        this.ctx.globalAlpha = 1;
      }

      this.animationId = requestAnimationFrame(animate);
    };

    animate();
  }

  private updateParallaxElements(): void {
    const elements = document.querySelectorAll('.parallax-element');
    elements.forEach((element, index) => {
      const speed = (index + 1) * 0.5;
      const x = this.mousePosition.x * speed * 10;
      const y = this.mousePosition.y * speed * 10;

      (element as HTMLElement).style.transform = `translate(${x}px, ${y}px)`;
    });
  }

  private addEntranceAnimations(): void {
    const elements = document.querySelectorAll('.animate-on-load');
    elements.forEach((element, index) => {
      setTimeout(() => {
        element.classList.add('animate-fade-in-up');
      }, index * 100);
    });
  }

  // Manejo del formulario (mejorado)
  onSubmit(): void {
    this.errorMessage = null;
    this.isLoading = true;

    // Animación de envío
    this.addSubmitAnimation();

    this.markFormGroupTouched(this.loginForm);

    if (this.loginForm.invalid) {
      this.errorMessage = 'Por favor, completa todos los campos correctamente.';
      this.isLoading = false;
      this.addErrorAnimation();
      return;
    }

    if (!this.twoFactorEnabled) {
      this.performPhase1Login();
    } else {
      this.performPhase2Login();
    }
  }

  private performPhase1Login(): void {
    const { nombre_usuario, contrasena } = this.loginForm.value;

    this.authService.loginPhase1({ nombre_usuario, contrasena }).subscribe({
      next: (response) => {
        if (response.twoFactorRequired) {
          this.enableTwoFactorMode();
        } else {
          this.handleSuccessfulLogin();
        }
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.handleLoginError(err);
      }
    });
  }

  private performPhase2Login(): void {
    const { twoFactorCode } = this.loginForm.value;
    const { nombre_usuario, contrasena } = this.loginForm.getRawValue();

    if (!twoFactorCode || !this.loginForm.get('twoFactorCode')?.valid) {
      this.errorMessage = 'Por favor, ingresa un código de verificación válido de 6 dígitos.';
      this.isLoading = false;
      this.addErrorAnimation();
      return;
    }

    this.authService.loginPhase2({ nombre_usuario, contrasena, twoFactorCode }).subscribe({
      next: (response) => {
        this.handleSuccessfulLogin();
      },
      error: (err: HttpErrorResponse) => {
        this.handleLoginError(err, true);
      }
    });
  }

  private enableTwoFactorMode(): void {
    this.twoFactorEnabled = true;
    this.loginStep = 'twoFactor';

    // Animación de transición a 2FA
    const formContainer = document.querySelector('.form-container');
    formContainer?.classList.add('transform', 'scale-95');

    setTimeout(() => {
      this.loginForm.get('nombre_usuario')?.disable();
      this.loginForm.get('contrasena')?.disable();
      this.loginForm.get('twoFactorCode')?.setValidators([
        Validators.required,
        Validators.pattern(/^\d{6}$/),
        Validators.minLength(6),
        Validators.maxLength(6)
      ]);
      this.loginForm.get('twoFactorCode')?.updateValueAndValidity();

      formContainer?.classList.remove('scale-95');
      formContainer?.classList.add('scale-100');

      setTimeout(() => {
        const twoFactorInput = document.getElementById('twoFactorCode');
        twoFactorInput?.focus();
      }, 200);
    }, 300);
  }

  private handleSuccessfulLogin(): void {
    this.isLoading = false;
    this.loginStep = 'success';

    // Animación de éxito
    this.addSuccessAnimation();

    setTimeout(() => {
      this.router.navigate(['/dashboard-home']);
    }, 1500);
  }

  private handleLoginError(err: HttpErrorResponse, is2FA: boolean = false): void {
    this.isLoading = false;

    if (err.status === 401) {
      this.errorMessage = is2FA
        ? 'Código de verificación incorrecto. Por favor, inténtalo de nuevo.'
        : 'Credenciales incorrectas. Verifica tu nombre de usuario y contraseña.';
    } else if (err.status === 429) {
      this.errorMessage = 'Demasiados intentos fallidos. Por favor, espera unos minutos antes de intentar nuevamente.';
    } else if (err.status === 0) {
      this.errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
    } else {
      this.errorMessage = err.error?.message || 'Error inesperado. Por favor, inténtalo más tarde.';
    }

    this.addErrorAnimation();

    if (is2FA) {
      this.loginForm.get('twoFactorCode')?.setValue('');
      this.loginForm.get('twoFactorCode')?.markAsUntouched();

      setTimeout(() => {
        const twoFactorInput = document.getElementById('twoFactorCode');
        twoFactorInput?.focus();
      }, 100);
    } else {
      this.resetLogin();
    }
  }

  resetLogin(): void {
    // Animación de reset
    const formContainer = document.querySelector('.form-container');
    formContainer?.classList.add('animate-pulse');

    setTimeout(() => {
      this.loginForm.reset();
      this.twoFactorEnabled = false;
      this.loginStep = 'credentials';
      this.errorMessage = null;
      this.isLoading = false;

      this.loginForm.get('nombre_usuario')?.enable();
      this.loginForm.get('contrasena')?.enable();
      this.loginForm.get('twoFactorCode')?.clearValidators();
      this.loginForm.get('twoFactorCode')?.updateValueAndValidity();

      this.loginForm.markAsUntouched();
      this.loginForm.markAsPristine();

      formContainer?.classList.remove('animate-pulse');

      setTimeout(() => {
        const usernameInput = document.getElementById('nombre_usuario');
        usernameInput?.focus();
      }, 100);
    }, 300);
  }

  // Animaciones específicas
  private addSubmitAnimation(): void {
    const submitButton = document.querySelector('.submit-button');
    submitButton?.classList.add('animate-pulse', 'scale-95');
  }

  private addErrorAnimation(): void {
    const errorElement = document.querySelector('.error-message');
    errorElement?.classList.add('animate-shake');

    setTimeout(() => {
      errorElement?.classList.remove('animate-shake');
    }, 600);
  }

  private addSuccessAnimation(): void {
    const formContainer = document.querySelector('.form-container');
    formContainer?.classList.add('animate-bounce');

    // Efecto de confetti
    this.createConfettiEffect();
  }

  private createConfettiEffect(): void {
    const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'fixed inset-0 pointer-events-none z-50';
    document.body.appendChild(confettiContainer);

    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'absolute w-2 h-2 animate-ping';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.top = Math.random() * 100 + '%';
      confetti.style.animationDelay = Math.random() * 2 + 's';
      confettiContainer.appendChild(confetti);
    }

    setTimeout(() => {
      document.body.removeChild(confettiContainer);
    }, 3000);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control) {
        control.markAsTouched();
        if (control instanceof FormGroup) {
          this.markFormGroupTouched(control);
        }
      }
    });
  }

  get f() {
    return this.loginForm.controls;
  }
}
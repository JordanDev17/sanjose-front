// src/app/web/components/web-header/web-header.component.ts
import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA, AfterViewInit, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from 'src/app/core/auth/auth.service';
import { User } from '../../models/user.model';
import { ThemeService } from 'src/app/core/theme/theme.service';

// Importa GSAP
import { gsap } from 'gsap';

@Component({
  selector: 'app-web-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './web-header.component.html',
  styleUrl: './web-header.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WebHeaderComponent implements OnInit, OnDestroy, AfterViewInit {
  isAuthenticated$: Observable<boolean>;
  currentUser$: Observable<User | null>;
  currentUserRole: string | null = null;
  isDarkMode$: Observable<boolean>;
  
  // Estados separados para cada menú
  isMobileMenuOpen: boolean = false;
  isUserMenuOpen: boolean = false;

  private userSubscription!: Subscription;
  private gsapAnimations: gsap.core.Tween[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.currentUser$ = this.authService.currentUser$;
    this.isDarkMode$ = this.themeService.darkMode$;
  }

  ngOnInit(): void {
    this.userSubscription = this.currentUser$.subscribe(user => {
      this.currentUserRole = user ? user.rol : null;
    });
  }

  ngAfterViewInit(): void {
    this.setupGSAPAnimations();
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    // Limpiar todas las animaciones GSAP
    this.gsapAnimations.forEach(animation => animation.kill());
    gsap.killTweensOf('*');
  }

  // Cerrar menús al hacer clic fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    
    // Cerrar menú de usuario si se hace clic fuera
    if (this.isUserMenuOpen && !target.closest('.relative')) {
      this.closeUserMenu();
    }
    
    // Cerrar menú móvil si se hace clic fuera (opcional)
    if (this.isMobileMenuOpen && !target.closest('.hamburger-button') && !target.closest('.mobile-menu')) {
      this.closeMobileMenu();
    }
  }

  // Cerrar menús al presionar Escape
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.isUserMenuOpen) {
      this.closeUserMenu();
    }
    if (this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  /**
   * Genera un color de fondo dinámico para el avatar basado en el ID del usuario.
   */
  getAvatarColor(userId: number | undefined): string {
    if (userId === undefined || userId === null) {
      return '#6B7280'; // Color gris por defecto
    }
    const colors = [
      '#EF4444', '#F97316', '#EAB308', '#22C55E', '#10B981', '#06B6D4',
      '#3B82F6', '#6366F1', '#8B5CF6', '#D946EF', '#EC4899', '#F43F5E'
    ];
    const index = userId % colors.length;
    return colors[index];
  }

  /**
   * Configura animaciones GSAP para elementos interactivos del header.
   */
  private setupGSAPAnimations(): void {
    // Animación de entrada para el header
    const headerTimeline = gsap.timeline({ defaults: { ease: 'power2.out' } });
    headerTimeline.fromTo(
      'nav.animate-slide-in-from-top',
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7 }
    )
    .fromTo(
      '.flex.items-center.space-x-3 > *',
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.1 },
      "-=0.3"
    );

    // Animación para el botón de tema
    this.setupButtonAnimation('.theme-toggle-button', {
      scale: 1.1,
      boxShadow: '0px 0px 20px rgba(59, 130, 246, 0.6)',
      duration: 0.3
    });

    // Animación para el botón de avatar
    this.setupButtonAnimation('.user-avatar-button', {
      scale: 1.08,
      boxShadow: '0px 5px 15px rgba(0,0,0,0.2)',
      rotate: 5,
      duration: 0.2
    });

    // Animación para el botón de login
    this.setupButtonAnimation('a.animated-button', {
      scale: 1.05,
      boxShadow: '0px 8px 20px rgba(0,0,0,0.3)',
      y: -3,
      duration: 0.2
    });

    // Animaciones para enlaces de navegación
    this.setupNavigationLinksAnimation();
  }

  /**
   * Configura animación para un botón específico
   */
  private setupButtonAnimation(selector: string, animationProps: gsap.TweenVars): void {
    const element = document.querySelector(selector);
    if (element) {
      const animation = gsap.to(element, {
        ...animationProps,
        paused: true,
        onReverseComplete: () => {
          gsap.to(element, { 
            scale: 1, 
            boxShadow: 'none', 
            y: 0, 
            rotate: 0, 
            duration: 0.2 
          });
        }
      });
      
      this.gsapAnimations.push(animation);
      
      element.addEventListener('mouseenter', () => animation.play());
      element.addEventListener('mouseleave', () => animation.reverse());
    }
  }

  /**
   * Configura animaciones para los enlaces de navegación
   */
  private setupNavigationLinksAnimation(): void {
    document.querySelectorAll('.nav-link-item, .mobile-nav-link').forEach((linkElement: Element) => {
      const link = linkElement as HTMLElement;
      const linkHoverAnimation = gsap.to(link, {
        y: -3,
        color: '#60A5FA',
        ease: 'power2.out',
        duration: 0.2,
        paused: true,
        overwrite: 'auto',
        onReverseComplete: () => {
          gsap.to(link, { y: 0, duration: 0.2 });
        }
      });

      this.gsapAnimations.push(linkHoverAnimation);
      
      link.addEventListener('mouseenter', () => linkHoverAnimation.play());
      link.addEventListener('mouseleave', () => linkHoverAnimation.reverse());
    });
  }

  /**
   * Alternar menú móvil
   */
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    
    // Cerrar menú de usuario si está abierto
    if (this.isMobileMenuOpen && this.isUserMenuOpen) {
      this.closeUserMenu();
    }
    
    this.animateMobileMenu();
  }

  /**
   * Cerrar menú móvil
   */
  closeMobileMenu(): void {
    if (this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
      this.animateMobileMenu();
    }
  }

  /**
   * Animar menú móvil
   */
  private animateMobileMenu(): void {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
      if (this.isMobileMenuOpen) {
        gsap.fromTo(mobileMenu,
          { height: 0, opacity: 0 },
          { 
            height: 'auto', 
            opacity: 1, 
            duration: 0.3, 
            ease: 'power2.out',
            onStart: () => {
              mobileMenu.classList.remove('hidden');
            }
          }
        );
        
        // Animar elementos internos
        gsap.fromTo('.mobile-nav-link',
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.2, stagger: 0.05, delay: 0.1 }
        );
      } else {
        gsap.to(mobileMenu,
          { 
            height: 0, 
            opacity: 0, 
            duration: 0.3, 
            ease: 'power2.in',
            onComplete: () => {
              mobileMenu.classList.add('hidden');
            }
          }
        );
      }
    }
  }

  /**
   * Alternar menú de usuario
   */
  toggleUserMenu(): void {
    if (this.isMobileMenuOpen) {
      this.closeMobileMenu(); // Cierra el menú móvil antes de abrir el usuario
    }

    this.isUserMenuOpen = !this.isUserMenuOpen;
    this.animateUserMenu();
  }


  /**
   * Cerrar menú de usuario
   */
  closeUserMenu(): void {
    if (this.isUserMenuOpen) {
      this.isUserMenuOpen = false;
      this.animateUserMenu();
    }
  }

  /**
   * Animar menú de usuario
   */
private animateUserMenu(): void {
  const userDropdown = document.querySelector('.user-dropdown');
  if (userDropdown) {
    gsap.to(userDropdown, {
      opacity: this.isUserMenuOpen ? 1 : 1,
      y: this.isUserMenuOpen ? 0 : -10,
      scale: this.isUserMenuOpen ? 1 : 0.95,
      duration: 0.2,
      ease: 'back.inOut'
    });
  }
}


  /**
   * Verificar si el usuario tiene roles específicos
   */
  hasRole(allowedRoles: string[]): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      map(user => {
        if (!user || !user.rol) {
          return false;
        }
        return allowedRoles.includes(user.rol);
      })
    );
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    this.closeUserMenu();
    this.closeMobileMenu();
    this.authService.logout();
    this.router.navigate(['/login-web']);
  }

  /**
   * Alternar tema
   */
  toggleTheme(): void {
    this.themeService.toggleDarkMode();
  }
}
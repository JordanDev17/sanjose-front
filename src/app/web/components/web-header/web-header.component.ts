// src/app/web/components/web-header/web-header.component.ts
import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA, AfterViewInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from 'src/app/core/auth/auth.service';
import { User } from 'src/app/core/auth/auth.models';
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
  isMobileMenuOpen: boolean = false;

  private userSubscription!: Subscription;
  private mobileMenuToggleListener: (() => void) | undefined;

  private themeButtonHoverAnimation!: gsap.core.Tween;
  private loginButtonHoverAnimation!: gsap.core.Tween;
  private userAvatarHoverAnimation!: gsap.core.Tween;

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
    // La suscripción a currentUser$ ya está en el constructor, pero podemos asegurarnos de que
    // el rol se actualice cada vez que el componente se inicialice o el usuario cambie.
    this.userSubscription = this.currentUser$.subscribe(user => {
      this.currentUserRole = user ? user.rol : null;
      // console.log('WebHeaderComponent: Current User:', user); // Para depuración
      // console.log('WebHeaderComponent: Current User Role:', this.currentUserRole); // Para depuración
    });
  }

  ngAfterViewInit(): void {
    this.setupGSAPAnimations();
    this.setupFlowbiteMobileMenu();
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    gsap.killTweensOf('*');
    if (this.mobileMenuToggleListener) {
      this.mobileMenuToggleListener();
    }
  }

  /**
   * Genera un color de fondo dinámico para el avatar basado en el ID del usuario.
   * Esto proporciona una "personalización" simple sin imágenes de perfil.
   * @param userId El ID numérico del usuario.
   * @returns Una cadena de color hexadecimal.
   */
  getAvatarColor(userId: number | undefined): string {
    if (userId === undefined || userId === null) {
      return '#6B7280'; // Color gris por defecto si no hay ID
    }
    const colors = [
      '#EF4444', // red-500
      '#F97316', // orange-500
      '#EAB308', // yellow-500
      '#22C55E', // green-500
      '#10B981', // emerald-500
      '#06B6D4', // cyan-500
      '#3B82F6', // blue-500
      '#6366F1', // indigo-500
      '#8B5CF6', // violet-500
      '#D946EF', // fuchsia-500
      '#EC4899', // pink-500
      '#F43F5E'  // rose-500
    ];
    // Usa el ID del usuario para determinar el índice del color
    const index = userId % colors.length;
    return colors[index];
  }

  /**
   * Configura animaciones GSAP para elementos interactivos del header.
   */
  private setupGSAPAnimations(): void {
    // Animación de entrada para el header completo usando un timeline para orquestar
    const headerTimeline = gsap.timeline({ defaults: { ease: 'power2.out' } });
    headerTimeline.fromTo(
      'nav.animate-slide-in-from-top',
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7 }
    )
    .fromTo(
      'nav .flex.items-center.lg\\:order-2 > *', // Selecciona los elementos dentro del contenedor de botones de acción
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.1 },
      "-=0.3"
    )
    .fromTo(
      '#mobile-menu-2 ul li', // Selecciona cada elemento de la lista de navegación
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.3, stagger: 0.08 },
      "-=0.3"
    );

    // Animación de hover para el botón de toggle theme (efecto neón)
    const themeButton = document.querySelector('.theme-toggle-button');
    if (themeButton) {
      this.themeButtonHoverAnimation = gsap.to(themeButton, {
        scale: 1.1,
        boxShadow: '0px 0px 20px rgba(0, 128, 255, 0.8), 0px 0px 40px rgba(0, 128, 255, 0.4)', // Múltiples sombras para efecto neón
        duration: 0.3,
        paused: true,
        onReverseComplete: () => {
          gsap.to(themeButton, {
            scale: 1,
            boxShadow: '0px 0px rgba(0,0,0,0)',
            duration: 0.2
          });
        }
      });
      themeButton.addEventListener('mouseenter', () => this.themeButtonHoverAnimation.play());
      themeButton.addEventListener('mouseleave', () => this.themeButtonHoverAnimation.reverse());
    }

    // Animación de hover para el botón de Iniciar Sesión (.animated-button)
    const loginButton = document.querySelector('a.animated-button');
    if (loginButton) {
      this.loginButtonHoverAnimation = gsap.to(loginButton, {
        scale: 1.05,
        boxShadow: '0px 8px 20px rgba(0,0,0,0.3)',
        y: -3,
        duration: 0.2,
        paused: true,
        onReverseComplete: () => {
          gsap.to(loginButton, { scale: 1, boxShadow: 'none', y: 0, duration: 0.2 });
        }
      });
      loginButton.addEventListener('mouseenter', () => this.loginButtonHoverAnimation.play());
      loginButton.addEventListener('mouseleave', () => this.loginButtonHoverAnimation.reverse());
    }

    // Animación de hover para el botón de avatar de usuario (.user-avatar-button)
    const userAvatarButton = document.querySelector('button.user-avatar-button');
    if (userAvatarButton) {
        this.userAvatarHoverAnimation = gsap.to(userAvatarButton, {
            scale: 1.08,
            boxShadow: '0px 5px 15px rgba(0,0,0,0.2)',
            rotate: 5,
            duration: 0.2,
            paused: true,
            onReverseComplete: () => {
                gsap.to(userAvatarButton, { scale: 1, boxShadow: 'none', rotate: 0, duration: 0.2 });
            }
        });
        userAvatarButton.addEventListener('mouseenter', () => this.userAvatarHoverAnimation.play());
        userAvatarButton.addEventListener('mouseleave', () => this.userAvatarHoverAnimation.reverse());
    }

    // Animación de hover para los enlaces de navegación (sin subrayado)
    document.querySelectorAll('.nav-link-item').forEach((linkElement: Element) => {
      const link = linkElement as HTMLElement;
      // Creamos la animación de hover para cada enlace
      const linkHoverAnimation = gsap.to(link, {
        y: -3, // Ligero movimiento hacia arriba
        color: '#60A5FA', // Color de texto de hover (Tailwind blue-500)
        ease: 'power2.out',
        duration: 0.2,
        paused: true,
        overwrite: 'auto',
        onReverseComplete: () => {
          // Volver al color original basado en el modo oscuro
          // Necesitamos leer el color actual del enlace para el modo claro/oscuro
          const computedStyle = window.getComputedStyle(link);
          const originalColor = computedStyle.color; // Obtener el color real computado
          gsap.to(link, { color: originalColor, y: 0, duration: 0.2 });
        }
      });

      // Añadimos los event listeners para controlar la animación
      link.addEventListener('mouseenter', () => linkHoverAnimation.play());
      link.addEventListener('mouseleave', () => linkHoverAnimation.reverse());
    });
  }

  /**
   * Configura el listener para el menú móvil de Flowbite.
   */
  private setupFlowbiteMobileMenu(): void {
    const mobileMenuButton = document.querySelector('[data-collapse-toggle="mobile-menu-2"]');
    const mobileMenu = document.getElementById('mobile-menu-2');

    if (mobileMenuButton && mobileMenu) {
      const observer = new MutationObserver(() => {
        const expanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
        this.isMobileMenuOpen = expanded;

        if (expanded) {
          gsap.fromTo(mobileMenu,
            { opacity: 0, y: -20, display: 'none' },
            { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', display: 'block' }
          );
        } else {
          gsap.to(mobileMenu,
            { opacity: 0, y: -20, duration: 0.3, ease: 'power2.in', onComplete: () => { mobileMenu.style.display = 'none'; } }
          );
        }
      });

      observer.observe(mobileMenuButton, { attributes: true, attributeFilter: ['aria-expanded'] });
      this.mobileMenuToggleListener = () => observer.disconnect();
    }
  }

  toggleMobileMenu(): void {
    // La lógica del icono se actualiza a través del MutationObserver en setupFlowbiteMobileMenu
  }

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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login-web']);
  }

  toggleTheme(): void {
    this.themeService.toggleDarkMode();
  }
}
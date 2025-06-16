// warehouses.component.ts
import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChildren,
  QueryList,
  Renderer2,
  HostBinding,
} from '@angular/core';
import { WarehouseService } from '../../services/warehouse.service';
import { Warehouse } from '../../models/warehouse.model';
import { ThemeService } from '../../../core/theme/theme.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { gsap } from 'gsap'; // Importar GSAP
import { ScrollTrigger } from 'gsap/ScrollTrigger'; // Importar ScrollTrigger
import 'aos/dist/aos.css'; // Importar los estilos CSS de AOS
import AOS from 'aos'; // Importar AOS

// Registrar los plugins de GSAP
gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-warehouses',
  standalone: false, // Mantener como false si es parte de un módulo existente
  templateUrl: './warehouses.component.html',
  styleUrls: ['./warehouses.component.css'],
})
export class WarehousesComponent implements OnInit, OnDestroy, AfterViewInit {
  // Arreglo para almacenar las bodegas/empresas
  warehouses: Warehouse[] = [];
  // Indicador de estado de carga
  isLoading = true;
  // Mensaje de error si la carga falla
  error: string | null = null;

  // Enlace a la clase 'dark' en el elemento host para el modo oscuro
  @HostBinding('class.dark')
  isDarkMode = false;

  // Subject para desuscribirse de observables y prevenir fugas de memoria
  private destroy$ = new Subject<void>();
  // Array para almacenar funciones de 'unlisten' del Renderer2
  private listeners: (() => void)[] = [];

  // Estado actual del slide del carrusel
  currentSlide = 0;
  // Intervalo para el autoplay del carrusel
  private carouselInterval: any;

  // QueryList para acceder a todos los elementos con la referencia #warehouseCard
  @ViewChildren('warehouseCard') warehouseCards!: QueryList<ElementRef>;

  constructor(
    private warehouseService: WarehouseService, // Servicio para obtener datos de bodegas
    private themeService: ThemeService, // Servicio para gestionar el tema (modo oscuro/claro)
    private el: ElementRef<HTMLElement>, // Referencia al elemento nativo del componente
    private renderer: Renderer2, // Renderer para manipular el DOM de forma segura
  ) {}

  /**
   * Ciclo de vida OnInit: Se ejecuta al inicializar el componente.
   * Suscribe al tema, carga las bodegas y inicia el carrusel.
   */
  ngOnInit(): void {
    // Suscripción al servicio de tema para actualizar el estado de isDarkMode
    this.themeService.darkMode$.pipe(takeUntil(this.destroy$)).subscribe(isDark => {
      this.isDarkMode = isDark;
    });

    this.loadWarehouses(); // Cargar los datos de las bodegas
    this.startCarouselAutoPlay(); // Iniciar el carrusel automático
    AOS.init({ // Inicializar AOS (Animate On Scroll)
      once: true, // Las animaciones solo se ejecutan una vez al hacer scroll
      duration: 800, // Duración por defecto de la animación
    });
  }

  /**
   * Ciclo de vida AfterViewInit: Se ejecuta después de que la vista del componente ha sido inicializada.
   * Ideal para manipulaciones del DOM y animaciones que dependen de la renderización de elementos.
   */
  ngAfterViewInit(): void {
    // Inicializa las animaciones de la página principal (hero y carrusel)
    this.initPageAnimations();

    // Suscribirse a cambios en warehouseCards. Esto es crucial porque la QueryList
    // puede no estar populada inmediatamente si los datos se cargan asíncronamente.
    // Una vez que los datos de las bodegas se cargan y el *ngFor renderiza las tarjetas,
    // esta suscripción se activará.
    this.warehouseCards.changes.pipe(takeUntil(this.destroy$)).subscribe(() => {
      // Asegurarse de que haya tarjetas y que la carga haya terminado antes de animar
      if (this.warehouseCards.length > 0 && !this.isLoading) {
        this.setupCardHoverEffects(); // Configurar los efectos hover dinámicos
        // Nota: Las animaciones de entrada de las tarjetas ahora se manejan con AOS
        // directamente en el HTML con 'data-aos'.
      }
    });

    // En caso de que las tarjetas ya estén cargadas en la primera renderización
    // (ej. desde caché o una API muy rápida), se configuran los efectos hover.
    if (this.warehouseCards.length > 0 && !this.isLoading) {
      this.setupCardHoverEffects();
    }
  }

  /**
   * Ciclo de vida OnDestroy: Se ejecuta antes de que el componente sea destruido.
   * Realiza la limpieza de suscripciones, intervalos y listeners para prevenir fugas de memoria.
   */
  ngOnDestroy(): void {
    this.destroy$.next(); // Notifica a los observables que se desuscriban
    this.destroy$.complete(); // Completa el Subject
    clearInterval(this.carouselInterval); // Limpia el intervalo del carrusel
    this.listeners.forEach(listener => listener()); // Limpia todos los listeners del DOM
    // Asegurarse de limpiar los ScrollTriggers creados por GSAP para evitar fugas de memoria.
    // Aunque AOS maneja gran parte de esto, es buena práctica si se usaran ScrollTriggers directos.
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }

  /**
   * Inicializa las animaciones de entrada para la sección de héroe y el carrusel.
   * Utiliza GSAP para crear efectos de fade-in y deslizamiento.
   */
  private initPageAnimations(): void {
    // Animación de la sección de introducción (hero)
    gsap.from(this.el.nativeElement.querySelector('.hero-intro-section'), {
      opacity: 0,
      y: 60,
      duration: 1.2,
      ease: 'power3.out',
      delay: 0.2,
    });

    // Animación de la sección del carrusel
    gsap.from(this.el.nativeElement.querySelector('.carousel-section'), {
      opacity: 0,
      y: 60,
      duration: 1.2,
      ease: 'power3.out',
      delay: 0.5,
    });
  }

  /**
   * Configura los efectos de hover interactivos para cada tarjeta de bodega.
   * Utiliza GSAP para animaciones 3D y el Renderer2 para gestionar los eventos del DOM
   * y el efecto de "mouse-follow glow".
   */
  private setupCardHoverEffects(): void {
    // Limpiar listeners existentes para evitar duplicados si la función se llama varias veces
    this.listeners.forEach(listener => listener());
    this.listeners = []; // Resetear el array de listeners

    this.warehouseCards.forEach(cardRef => {
      const card = cardRef.nativeElement;

      // Animación GSAP al entrar el ratón (hover in)
      const onMouseEnter = () => {
        gsap.to(card, {
          duration: 0.8,
          scale: 1.05, // Escala ligeramente la tarjeta
          rotateX: 4, // Rotación sutil en el eje X para efecto 3D
          rotateY: -4, // Rotación sutil en el eje Y para efecto 3D
          ease: 'power3.out',
          boxShadow: 'var(--banner-hover-shadow)', // Cambia la sombra al hacer hover
        });
      };

      // Animación GSAP al salir el ratón (hover out)
      const onMouseLeave = () => {
        gsap.to(card, {
          duration: 1,
          scale: 1,
          rotateX: 0,
          rotateY: 0,
          ease: 'elastic.out(1, 0.5)', // Efecto elástico para un retorno suave
          boxShadow: 'var(--banner-shadow)', // Vuelve a la sombra original
        });
      };

      // Efecto de iluminación que sigue al cursor
      const onMouseMove = (event: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        // Calcula la posición relativa del ratón dentro de la tarjeta
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        // Establece las variables CSS personalizadas para el efecto de luz
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      };

      // Adjuntar listeners de eventos y almacenarlos para su limpieza posterior
      this.listeners.push(this.renderer.listen(card, 'mousemove', onMouseMove));
      this.listeners.push(this.renderer.listen(card, 'mouseenter', onMouseEnter));
      this.listeners.push(this.renderer.listen(card, 'mouseleave', onMouseLeave));
    });
  }

  /**
   * Carga los datos de las bodegas desde el servicio.
   * Muestra un spinner de carga y maneja posibles errores.
   */
  loadWarehouses(): void {
    this.isLoading = true;
    this.error = null; // Reinicia el error

    this.warehouseService
      .getWarehouses(1, 100, 'activa') // Obtiene hasta 100 bodegas activas
      .pipe(takeUntil(this.destroy$)) // Se desuscribe automáticamente al destruir el componente
      .subscribe({
        next: response => {
          this.warehouses = response; // Asigna los datos a la variable warehouses
          this.isLoading = false; // Oculta el spinner de carga
          // Después de cargar las bodegas, AOS detectará los nuevos elementos y aplicará las animaciones.
        },
        error: err => {
          // Manejo de errores
          this.error = 'No se pudieron cargar las empresas. Por favor, intenta de nuevo más tarde.';
          this.isLoading = false;
          console.error('Error loading warehouses:', err);
        },
      });
  }

  /**
   * Obtiene la URL de la imagen del logotipo de una bodega.
   * Proporciona una imagen de placeholder si no hay logotipo.
   * @param warehouse Objeto Warehouse.
   * @returns URL de la imagen del logotipo o de un placeholder.
   */
  getWarehouseImageUrl(warehouse: Warehouse): string {
    return warehouse.logotipo_url || 'assets/web/media/img/logo-screen.png';
  }

  /* -------------------------------------------------------------------------- */
  /* Funciones del Carrusel                     */
  /* -------------------------------------------------------------------------- */

  /**
   * Avanza al siguiente slide del carrusel.
   * Reinicia el temporizador del autoplay.
   */
  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % 3; // Lógica para un carrusel de 3 slides
    this.resetCarouselAutoPlay();
  }

  /**
   * Retrocede al slide anterior del carrusel.
   * Reinicia el temporizador del autoplay.
   */
  prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + 3) % 3; // Lógica para un carrusel de 3 slides
    this.resetCarouselAutoPlay();
  }

  /**
   * Navega directamente a un slide específico del carrusel.
   * Reinicia el temporizador del autoplay.
   * @param index Índice del slide al que se desea ir.
   */
  goToSlide(index: number): void {
    this.currentSlide = index;
    this.resetCarouselAutoPlay();
  }

  /**
   * Inicia el autoplay del carrusel.
   * El carrusel avanza cada 5 segundos.
   */
  private startCarouselAutoPlay(): void {
    this.carouselInterval = setInterval(() => this.nextSlide(), 5000); // Cambia cada 5 segundos
  }

  /**
   * Reinicia el temporizador del autoplay del carrusel.
   * Útil cuando el usuario interactúa manualmente con el carrusel.
   */
  private resetCarouselAutoPlay(): void {
    clearInterval(this.carouselInterval); // Detiene el intervalo actual
    this.startCarouselAutoPlay(); // Inicia un nuevo intervalo
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/web/media/img/logo-screen.png';
  }
}
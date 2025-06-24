// src/app/web/pages/warehouses/warehouses.component.ts
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
import { CommonModule } from '@angular/common';
import { WarehouseService } from '../../services/warehouse.service';
import { Warehouse, WarehousePaginatedResponse } from '../../models/warehouse.model';
import { ThemeService } from '../../../core/theme/theme.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
// NOTA: Eliminamos AOS.init() y sus imports ya que GSAP + ScrollTrigger manejarán las animaciones de entrada.
// import 'aos/dist/aos.css';
// import AOS from 'aos';

// Importa el componente de tarjeta
import { WarehouseCardComponent } from '../../components/warehouse-card/warehouse-card.component';
// Importa el componente modal
import { WarehouseDetailComponent } from '../../pages/warehouse-detail/warehouse-detail.component';


// Registrar los plugins de GSAP
gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-warehouses',
  standalone: true,
  imports: [
    CommonModule,
    WarehouseCardComponent,
    WarehouseDetailComponent
  ],
  templateUrl: './warehouses.component.html',
  styleUrls: ['./warehouses.component.css'],
})
export class WarehousesComponent implements OnInit, OnDestroy, AfterViewInit {
  warehouses: Warehouse[] = [];
  isLoading = true;
  error: string | null = null;

  @HostBinding('class.dark')
  isDarkMode = false;

  private destroy$ = new Subject<void>();
  private listeners: (() => void)[] = []; // Para los listeners de hover
  private cardEntryScrollTriggers: ScrollTrigger[] = []; // NUEVO: Para los ScrollTriggers de animación de entrada de tarjetas

  currentSlide = 0;
  private carouselInterval: any;

  // Propiedades para el modal de detalle
  showDetailModal: boolean = false;
  selectedWarehouseForDetail: Warehouse | null = null;

  // QueryList para acceder a los componentes de tarjeta (nativeElement para GSAP)
  @ViewChildren(WarehouseCardComponent, { read: ElementRef }) warehouseCardRefs!: QueryList<ElementRef>;


  constructor(
    private warehouseService: WarehouseService,
    private themeService: ThemeService,
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2,
  ) {}

  ngOnInit(): void {
    this.themeService.darkMode$.pipe(takeUntil(this.destroy$)).subscribe(isDark => {
      this.isDarkMode = isDark;
    });

    this.loadWarehouses();
    this.startCarouselAutoPlay();
    // NOTA: Eliminamos AOS.init() aquí
    // AOS.init({
    //   once: true,
    //   duration: 800,
    // });
  }

  ngAfterViewInit(): void {
    this.initPageAnimations();

    // Suscribirse a cambios en warehouseCardRefs para configurar los efectos hover y la animación de entrada.
    // Esto se dispara cuando las tarjetas se han renderizado en el DOM (ej. después de la carga de datos).
    this.warehouseCardRefs.changes.pipe(takeUntil(this.destroy$)).subscribe(() => {
      // Solo aplicar si hay tarjetas y no estamos en estado de carga (indica que los datos están listos)
      if (this.warehouseCardRefs.length > 0 && !this.isLoading) {
        this.setupCardHoverEffects();
        this.applyCardEntryAnimations(); // NUEVO: Aplicar las animaciones de entrada
      }
    });

    // En caso de que las tarjetas ya estén cargadas en la primera renderización (ej. desde caché o carga muy rápida).
    // Añadimos un pequeño retardo para asegurar que el DOM esté completamente listo antes de buscar los elementos.
    if (this.warehouseCardRefs.length > 0 && !this.isLoading) {
      setTimeout(() => {
        this.setupCardHoverEffects();
        this.applyCardEntryAnimations(); // NUEVO: Aplicar las animaciones de entrada
      }, 50); // Pequeño retardo
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    clearInterval(this.carouselInterval);
    this.listeners.forEach(listener => listener()); // Limpiar listeners de hover

    // NUEVO: Limpiar los ScrollTriggers creados para la animación de entrada de tarjetas
    this.cardEntryScrollTriggers.forEach(trigger => trigger.kill());
    this.cardEntryScrollTriggers = []; // Limpiar el array de referencias

    // Esto es una limpieza general por si acaso, pero con las limpiezas específicas es menos crítico.
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }

  private initPageAnimations(): void {
    gsap.from(this.el.nativeElement.querySelector('.hero-intro-section'), {
      opacity: 0,
      y: 60,
      duration: 1.2,
      ease: 'power3.out',
      delay: 0.2,
    });

    gsap.from(this.el.nativeElement.querySelector('.carousel-section'), {
      opacity: 0,
      y: 60,
      duration: 1.2,
      ease: 'power3.out',
      delay: 0.5,
    });
  }

  // NOTE: This setupCardHoverEffects assumes direct DOM manipulation via nativeElement.
  // If the hover effects apply *inside* the WarehouseCardComponent, this logic should
  // ideally be moved to WarehouseCardComponent itself for better encapsulation.
  // However, for a quick fix based on your existing code, we keep it here and access nativeElement.
  private setupCardHoverEffects(): void {
    // Limpiamos los listeners existentes antes de añadir nuevos
    this.listeners.forEach(listener => listener());
    this.listeners = [];

    this.warehouseCardRefs.forEach(cardRef => {
      const card = cardRef.nativeElement; // Acceder al elemento nativo del componente de tarjeta

      const onMouseEnter = () => {
        gsap.to(card, {
          duration: 0.8,
          scale: 1.05,
          rotateX: 4,
          rotateY: -4,
          ease: 'power3.out',
          boxShadow: 'var(--banner-hover-shadow)',
        });
      };

      const onMouseLeave = () => {
        gsap.to(card, {
          duration: 1,
          scale: 1,
          rotateX: 0,
          rotateY: 0,
          ease: 'elastic.out(1, 0.5)',
          boxShadow: 'var(--banner-shadow)',
        });
      };

      const onMouseMove = (event: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        this.renderer.setStyle(card, '--mouse-x', `${x}px`);
        this.renderer.setStyle(card, '--mouse-y', `${y}px`);
      };

      this.listeners.push(this.renderer.listen(card, 'mousemove', onMouseMove));
      this.listeners.push(this.renderer.listen(card, 'mouseenter', onMouseEnter));
      this.listeners.push(this.renderer.listen(card, 'mouseleave', onMouseLeave));
    });
  }

  /**
   * NUEVO: Aplica animaciones de entrada escalonadas a las tarjetas de empresa cuando entran en la vista.
   */
  private applyCardEntryAnimations(): void {
    // Primero, mata cualquier ScrollTrigger de entrada de tarjeta existente para evitar duplicados
    this.cardEntryScrollTriggers.forEach(trigger => trigger.kill());
    this.cardEntryScrollTriggers = []; // Limpia el array

    this.warehouseCardRefs.forEach((cardRef, index) => {
      const card = cardRef.nativeElement;

      // Define la animación GSAP
      const animation = gsap.from(card, {
        opacity: 0,       // Empieza invisible
        y: 80,            // Empieza 80px por debajo de su posición final
        scale: 0.8,       // Empieza al 80% de su tamaño
        rotationZ: -5,    // Ligera rotación inicial para un efecto más dinámico
        duration: 1.2,    // Duración de la animación
        ease: "back.out(1.2)", // Efecto de rebote al final de la animación
        delay: index * 0.15 // Efecto escalonado: cada tarjeta empieza 0.15s después de la anterior
      });

      // Crea un ScrollTrigger para cada tarjeta
      const trigger = ScrollTrigger.create({
        trigger: card,
        start: "top 85%", // La animación se activa cuando la parte superior de la tarjeta entra al 85% de la altura del viewport
        animation: animation, // Vincula la animación GSAP al trigger
        toggleActions: "play none none none", // Reproduce la animación una vez al entrar
        // markers: true // Descomentar para depurar y ver los marcadores del ScrollTrigger
      });

      this.cardEntryScrollTriggers.push(trigger); // Guarda el trigger para su limpieza posterior
    });
  }


  loadWarehouses(): void {
    this.isLoading = true;
    this.error = null;

    this.warehouseService
      .getWarehouses(1, 100, 'activa')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: WarehousePaginatedResponse) => {
          this.warehouses = response.data;
          this.isLoading = false;
          // Después de cargar las bodegas y si no hay tarjetas en la lista, aplicar animaciones
          // El ngAfterViewInit con el `changes` QueryList manejará la aplicación de animaciones
          // cuando las tarjetas ya estén en el DOM.
        },
        error: err => {
          this.error = 'No se pudieron cargar las empresas. Por favor, intenta de nuevo más tarde.';
          this.isLoading = false;
          console.error('Error loading warehouses:', err);
        },
      });
  }

  getWarehouseImageUrl(warehouse: Warehouse): string {
    // Si el logotipo_url no existe o no es una URL válida, usa el placeholder
    return warehouse.logotipo_url && warehouse.logotipo_url.startsWith('http')
      ? warehouse.logotipo_url
      : 'https://placehold.co/100x100/94a3b8/ffffff?text=Logo+N/A';
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % 3;
    this.resetCarouselAutoPlay();
  }

  prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + 3) % 3;
    this.resetCarouselAutoPlay();
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
    this.resetCarouselAutoPlay();
  }

  private startCarouselAutoPlay(): void {
    this.carouselInterval = setInterval(() => this.nextSlide(), 5000);
  }

  private resetCarouselAutoPlay(): void {
    clearInterval(this.carouselInterval);
    this.startCarouselAutoPlay();
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'https://placehold.co/100x100/94a3b8/ffffff?text=Logo+N/A';
  }

  /**
   * Abre el modal de detalle de la bodega.
   * @param warehouse La bodega seleccionada para mostrar en el modal.
   */
  openWarehouseDetailModal(warehouse: Warehouse): void {
    this.selectedWarehouseForDetail = warehouse;
    this.showDetailModal = true;
    // Opcional: Animar la aparición del modal con GSAP
    gsap.fromTo('.detail-modal-overlay', { opacity: 0 }, { opacity: 1, duration: 0.3 });
    gsap.fromTo('.detail-modal-card',
      { opacity: 0, y: -50, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.7)' }
    );
  }

  /**
   * Cierra el modal de detalle de la bodega.
   */
  closeWarehouseDetailModal(): void {
    // Opcional: Animar la desaparición del modal con GSAP
    gsap.to('.detail-modal-overlay', {
      opacity: 0, duration: 0.3, onComplete: () => {
        this.showDetailModal = false;
        this.selectedWarehouseForDetail = null; // Limpiar la bodega seleccionada al cerrar
      }
    });
    gsap.to('.detail-modal-card', { opacity: 0, y: 50, scale: 0.9, duration: 0.3, ease: 'power2.in' });
  }
}

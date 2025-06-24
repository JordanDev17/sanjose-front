// src/app/web/components/warehouse-card/warehouse-card.component.ts
import { Component, Input, Output, EventEmitter, OnInit, ElementRef, Renderer2, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Warehouse } from '../../models/warehouse.model';
import { ThemeService } from '../../../core/theme/theme.service';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { gsap } from 'gsap';

@Component({
  selector: 'app-warehouse-card',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './warehouse-card.component.html',
  styleUrls: ['./warehouse-card.component.css']
})
export class WarehouseCardComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() warehouse!: Warehouse;
  @Output() viewDetails = new EventEmitter<Warehouse>();

  darkMode$: Observable<boolean>;
  private destroy$ = new Subject<void>();
  private listeners: (() => void)[] = [];

  constructor(
    private themeService: ThemeService,
    private el: ElementRef,
    private renderer: Renderer2
  ) {
    this.darkMode$ = this.themeService.darkMode$;
  }

  ngOnInit(): void {
    // La lógica de inicialización si es necesaria
  }

  ngAfterViewInit(): void {
    this.setupCardHoverEffects();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.listeners.forEach(listener => listener());
  }

  /**
   * Configura los efectos de hover interactivos para esta tarjeta.
   * Utiliza GSAP para animaciones 3D y el Renderer2 para gestionar los eventos del DOM
   * y el efecto de "mouse-follow glow".
   */
  private setupCardHoverEffects(): void {
    const card = this.el.nativeElement; // El elemento nativo del componente (la tarjeta)
    const glowElement = card.querySelector('.c-banner-glow'); // El elemento del glow

    // Valores de sombra que definiremos en CSS para consistencia
    const defaultShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    const hoverShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)';
    const darkDefaultShadow = '0 4px 6px -1px rgba(255, 255, 255, 0.05), 0 2px 4px -1px rgba(255, 255, 255, 0.02)';
    const darkHoverShadow = '0 20px 25px -5px rgba(255, 255, 255, 0.1), 0 10px 10px -5px rgba(255, 255, 255, 0.05)';


    // Animación GSAP al entrar el ratón (hover in)
    const onMouseEnter = () => {
      // CORRECCIÓN: Llamar a isDarkMode() como una función
      const targetShadow = this.themeService.isDarkMode() ? darkHoverShadow : hoverShadow;

      gsap.to(card, {
        duration: 0.6,
        scale: 1.05,
        rotateX: 4,
        rotateY: -4,
        boxShadow: targetShadow,
        ease: 'power3.out',
      });
      // Animar el glow para que aparezca
      gsap.to(glowElement, { opacity: 1, duration: 0.3 });
    };

    // Animación GSAP al salir el ratón (hover out)
    const onMouseLeave = () => {
      // CORRECCIÓN: Llamar a isDarkMode() como una función
      const targetShadow = this.themeService.isDarkMode() ? darkDefaultShadow : defaultShadow;

      gsap.to(card, {
        duration: 0.8,
        scale: 1,
        rotateX: 0,
        rotateY: 0,
        boxShadow: targetShadow, // Resetea a la sombra por defecto
        ease: 'elastic.out(1, 0.5)',
      });
      // Animar el glow para que desaparezca
      gsap.to(glowElement, { opacity: 0, duration: 0.5 });
    };

    // Efecto de iluminación que sigue al cursor
    const onMouseMove = (event: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    };

    // Adjuntar listeners de eventos
    this.listeners.push(this.renderer.listen(card, 'mousemove', onMouseMove));
    this.listeners.push(this.renderer.listen(card, 'mouseenter', onMouseEnter));
    this.listeners.push(this.renderer.listen(card, 'mouseleave', onMouseLeave));
  }


  onViewDetails(): void {
    this.viewDetails.emit(this.warehouse);
  }

  getLogoUrl(warehouse: Warehouse): string {
    return warehouse.logotipo_url && warehouse.logotipo_url.startsWith('http')
      ? warehouse.logotipo_url
      : 'https://placehold.co/100x100/94a3b8/ffffff?text=Logo+N/A';
  }

  onLogoError(event: Event): void {
    (event.target as HTMLImageElement).src = 'https://placehold.co/100x100/94a3b8/ffffff?text=Logo+N/A';
  }
}

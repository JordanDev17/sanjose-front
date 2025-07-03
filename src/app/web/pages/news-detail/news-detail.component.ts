// src/app/web/pages/news-detail/news-detail.component.ts
import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnChanges, SimpleChanges, HostListener, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'; // Importa CUSTOM_ELEMENTS_SCHEMA
import { CommonModule } from '@angular/common'; // Necesario para *ngIf
import { News } from '../../models/news.model'; // Asegúrate de la ruta correcta a tu modelo News
import { gsap } from 'gsap';

@Component({
  selector: 'app-news-detail',
  standalone: true, // Esto lo convierte en un componente standalone
  imports: [
    CommonModule // Permite el uso de directivas como *ngIf
    // Aquí irían otros módulos si el HTML utiliza más componentes o directivas
    // Si `ion-icon` proviene de un módulo Angular específico (como IonicFramework), deberías importarlo aquí (e.g., IonicModule).
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // <--- AÑADIDO: Permite el uso de elementos no-Angular (Web Components)
  templateUrl: './news-detail.component.html',
  styleUrls: ['./news-detail.component.css']
})
export class NewsDetailComponent implements OnChanges {
  @Input() newsItem: News | null = null; // La noticia detallada a mostrar, ahora de tipo News
  @Output() closeModal = new EventEmitter<void>(); // Emite un evento cuando el modal debe cerrarse

  @ViewChild('modalBackdrop') modalBackdropRef!: ElementRef<HTMLDivElement>; // Referencia al fondo del modal
  @ViewChild('modalContent') modalContentRef!: ElementRef<HTMLDivElement>; // Referencia al contenido del modal

  constructor() { }

  // Detecta cambios en el Input newsItem para disparar animaciones de apertura
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['newsItem'] && changes['newsItem'].currentValue) {
      // Si newsItem cambia a un valor no nulo (es decir, una noticia ha sido seleccionada),
      // abre el modal con animación.
      this.openModalAnimation();
    }
  }

  // Animación de apertura del modal usando GSAP
  private openModalAnimation(): void {
    // Configura el estado inicial del modal (invisible, ligeramente escalado hacia abajo, desplazado)
    gsap.set(this.modalBackdropRef.nativeElement, { opacity: 0 });
    gsap.set(this.modalContentRef.nativeElement, { scale: 0.8, opacity: 0, y: 50 });

    // Crea una línea de tiempo GSAP para orquestar las animaciones del fondo y el contenido
    const tl = gsap.timeline();

    tl.to(this.modalBackdropRef.nativeElement, {
      opacity: 1, // El fondo se vuelve completamente opaco
      duration: 0.3, // Duración de la animación del fondo
      ease: 'power2.out' // Función de suavizado
    })
    .to(this.modalContentRef.nativeElement, {
      scale: 0.9, // El contenido del modal se escala a su tamaño normal
      opacity: 1, // Se vuelve visible
      y: 0, // Vuelve a su posición original (desde donde estaba desplazado)
      duration: 0.4, // Duración de la animación del contenido
      ease: 'back.out(1.2)' // Efecto de rebote sutil para una entrada dinámica
    }, "-=0.2"); // Comienza esta animación 0.2 segundos antes de que termine la anterior
  }

  // Cierra el modal con una animación usando GSAP
  onClose(): void {
    const tl = gsap.timeline();

    tl.to(this.modalContentRef.nativeElement, {
      scale: 0.8, // Escala el contenido del modal hacia abajo
      opacity: 0, // Lo hace invisible
      y: 50, // Lo desplaza ligeramente hacia abajo
      duration: 0.3, // Duración de la animación de salida del contenido
      ease: 'power2.in' // Función de suavizado para el cierre
    })
    .to(this.modalBackdropRef.nativeElement, {
      opacity: 0, // El fondo se vuelve transparente
      duration: 0.2, // Duración de la animación de salida del fondo
      ease: 'power2.in',
      onComplete: () => {
        // Una vez que las animaciones de cierre han terminado, emite el evento
        // para que el componente padre (web-home) cierre el modal y limpie el estado.
        this.closeModal.emit();
      }
    }, "-=0.2"); // Comienza esta animación 0.2 segundos antes de que termine la anterior
  }

  // Permite cerrar el modal con la tecla 'Escape'
  @HostListener('document:keydown.escape', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.onClose(); // Llama al método de cierre del modal
    }
  }

  /**
   * Formatea una fecha ISO 8601 a un formato legible.
   * @param isoDate La fecha en formato ISO 8601.
   * @returns La fecha formateada (ej. "15 de Junio, 2025").
   */
  formatDate(isoDate: string): string {
    if (!isoDate) {
      return '';
    }
    const date = new Date(isoDate);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
  }

  /**
   * Maneja el evento de error cuando la imagen destacada del modal no se carga correctamente.
   * Reemplaza la URL de la imagen por una de placeholder para evitar imágenes rotas.
   * @param event El evento de error del elemento <img>.
   */
  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'https://placehold.co/800x600/94a3b8/ffffff?text=Image+Not+Found'; // Puedes usar tu propia imagen de placeholder
  }
}
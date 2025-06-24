// src/app/web/components/warehouse-detail-modal/warehouse-detail-modal.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // DatePipe para formatear fechas
import { Warehouse } from '../../models/warehouse.model'; // Importa la interfaz de la bodega
import { ThemeService } from '../../../core/theme/theme.service';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { gsap } from 'gsap'; // Para animaciones del modal

@Component({
  selector: 'app-warehouse-detail',
  standalone: true, // Componente standalone
  imports: [
    CommonModule,
    DatePipe // Para usar el pipe de fecha en el template
  ],
  templateUrl: './warehouse-detail.component.html',
  styleUrls: ['./warehouse-detail.component.css']
})
export class WarehouseDetailComponent implements OnInit, OnDestroy {
  // @Input() para recibir el objeto de la bodega a mostrar
  @Input() warehouse: Warehouse | null = null;

  // @Output() para emitir un evento cuando el modal debe cerrarse
  @Output() closeModal = new EventEmitter<void>();

  darkMode$: Observable<boolean>;
  private destroy$ = new Subject<void>();

  constructor(private themeService: ThemeService) {
    this.darkMode$ = this.themeService.darkMode$;
  }

  ngOnInit(): void {
    // Asegura que el modo oscuro se aplique al modal si es necesario
    this.themeService.darkMode$.pipe(takeUntil(this.destroy$)).subscribe(isDark => {
      // Puedes aplicar clases aquí si el modal necesita ajustes de tema directos
      // o dejar que Tailwind lo maneje con las clases en el HTML.
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Emite el evento para cerrar el modal.
   */
  onCloseModal(): void {
    this.closeModal.emit();
  }

  /**
   * Obtiene la URL segura para un sitio web.
   * @param url La URL del sitio web.
   * @returns La URL con 'http://' si falta.
   */
  getSafeWebsiteUrl(url: string | undefined): string {
    if (!url) return '';
    return url.startsWith('http://') || url.startsWith('https://') ? url : `http://${url}`;
  }

  /**
   * Maneja el error cuando la imagen del logotipo no se carga.
   * Sustituye la fuente de la imagen por una URL de placeholder.
   * @param event Evento de error de la imagen.
   */
  onLogoError(event: Event): void {
    (event.target as HTMLImageElement).src = 'https://placehold.co/150x150/94a3b8/ffffff?text=Logo+N/A';
  }
}

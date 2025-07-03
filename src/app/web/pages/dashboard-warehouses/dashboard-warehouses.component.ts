// src/app/web/pages/dashboard-warehouses/dashboard-warehouses.component.ts
import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, Renderer2 } from '@angular/core'; // Importar Renderer2
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { gsap } from 'gsap';

// Tus servicios y modelos
import { WarehouseService } from '../../services/warehouse.service';
import { Warehouse, CreateWarehouseDto, UpdateWarehouseDto, WarehousePaginatedResponse } from '../../models/warehouse.model';
import { ThemeService } from '../../../core/theme/theme.service';


@Component({
  selector: 'app-dashboard-warehouses',
  standalone: true, // Componente Standalone
  imports: [
    CommonModule,        // Para *ngIf, *ngFor, [ngClass]
    FormsModule,         // Para [(ngModel)] y NgForm
    ReactiveFormsModule,  // Si decides usar formularios reactivos en el futuro
    DatePipe             // Para formatear fechas en el template
  ],
  templateUrl: './dashboard-warehouses.component.html',
  styleUrls: ['./dashboard-warehouses.component.css']
})
export class DashboardWarehousesComponent implements OnInit, OnDestroy, AfterViewInit {
  // --- Propiedades del Componente ---
  warehouses: Warehouse[] = []; // Lista de bodegas
  isLoading: boolean = false;    // Indicador de carga
  errorMessage: string | null = null; // Mensaje de error general
  successMessage: string | null = null; // Mensaje de éxito general
  formErrorMessage: string | null = null; // Mensaje de error del formulario

  // Propiedades para la paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;

  private destroy$ = new Subject<void>(); // Para gestionar la desuscripción de observables

  showWarehouseForm: boolean = false; // Controla la visibilidad del formulario modal
  isEditing: boolean = false;          // Indica si el formulario está en modo edición
  selectedWarehouse: Warehouse | null = null; // Bodega seleccionada para edición

  // DTO para la creación/edición de una bodega
  newWarehouse: CreateWarehouseDto = {
    nombre: '',
    slug: '',
    descripcion: '',
    sector: '',
    logotipo_url: '', // URL final del logotipo
    sitio_web: '',
    contacto_email: '',
    contacto_telefono: '',
    direccion_bodega: '',
    estado: 'activa'
  };

  // --- Propiedades para la gestión de imágenes (logotipos) ---
  selectedFile: File | null = null; // Almacena el archivo de logotipo seleccionado
  imagePreviewUrl: string | ArrayBuffer | null = null; // Para mostrar una previsualización del logotipo

  // Propiedades para el diálogo de confirmación (eliminar)
  showConfirmationDialog: boolean = false;
  confirmDialogTitle: string = '';
  confirmDialogMessage: string = '';
  confirmActionCallback: (() => void) | null = null; // Callback para la acción a confirmar

  darkMode$: Observable<boolean>; // Observable para el modo oscuro/claro

  // Referencias a elementos del DOM para animaciones y manejo de formularios
  @ViewChild('warehouseNgForm') warehouseNgFormRef!: NgForm; // Renombrado a warehouseNgFormRef
  @ViewChild('successMessageDiv') successMessageDiv!: ElementRef;
  @ViewChild('errorMessageDiv') errorMessageDiv!: ElementRef;
  @ViewChild('formErrorMessageDiv') formErrorMessageDiv!: ElementRef;

  // Referencias a los elementos del modal para GSAP
  @ViewChild('warehouseFormOverlay') warehouseFormOverlayRef!: ElementRef;
  @ViewChild('warehouseFormCard') warehouseFormCardRef!: ElementRef;
  @ViewChild('confirmationDialogOverlay') confirmationDialogOverlayRef!: ElementRef;
  @ViewChild('confirmationDialogCard') confirmationDialogCardRef!: ElementRef;


  constructor(
    private warehouseService: WarehouseService,
    public themeService: ThemeService, // Inyecta el servicio de tema
    private renderer: Renderer2 // Inyectar Renderer2 para manipular el DOM
  ) {
    this.darkMode$ = this.themeService.darkMode$;
  }

  ngOnInit(): void {
    this.loadWarehouses(); // Carga las bodegas al inicializar el componente
  }

  ngAfterViewInit(): void {
    // Animaciones GSAP para elementos iniciales del dashboard
    gsap.from('.dashboard-container h1', { duration: 0.8, y: -20, opacity: 0, ease: 'power3.out', delay: 0.2 });
    gsap.fromTo('.add-warehouse-button',
      { x: 20, autoAlpha: 0 },
      { duration: 0.8, x: 0, autoAlpha: 1, ease: 'power3.out', delay: 0.3 }
    );

    // Inicializar los overlays como ocultos para GSAP, aunque hidden ya los oculta
    // Esto asegura que GSAP los "conozca" en un estado inicial
    gsap.set(this.warehouseFormOverlayRef.nativeElement, { autoAlpha: 0 });
    gsap.set(this.confirmationDialogOverlayRef.nativeElement, { autoAlpha: 0 });
  }

  ngOnDestroy(): void {
    // Asegura que todas las suscripciones sean canceladas al destruir el componente
    this.destroy$.next();
    this.destroy$.complete();
    // Asegurarse de limpiar el overflow del body si el componente se destruye con un modal abierto
    this.renderer.removeStyle(document.body, 'overflow');
  }

  /**
   * Controla el overflow del body para evitar el scroll cuando un modal está abierto.
   * @param hidden Si el overflow debe estar oculto (true) o restaurado (false).
   */
  private toggleBodyScroll(hidden: boolean): void {
    if (hidden) {
      this.renderer.setStyle(document.body, 'overflow', 'hidden');
    } else {
      this.renderer.removeStyle(document.body, 'overflow');
    }
  }

  // --- Métodos de UI / Mensajes ---
  private showSuccess(message: string): void {
    this.successMessage = message;
    if (this.successMessageDiv?.nativeElement) {
      gsap.fromTo(this.successMessageDiv.nativeElement,
        { autoAlpha: 0, y: -20 },
        { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' }
      );
      setTimeout(() => {
        gsap.to(this.successMessageDiv.nativeElement,
          { autoAlpha: 0, y: -20, duration: 0.5, ease: 'power3.in', onComplete: () => this.successMessage = null }
        );
      }, 3000); // El mensaje desaparece después de 3 segundos
    }
  }

  private showError(message: string, type: 'general' | 'form' = 'general'): void {
    if (type === 'general') {
      this.errorMessage = message;
      if (this.errorMessageDiv?.nativeElement) {
        gsap.fromTo(this.errorMessageDiv.nativeElement,
          { autoAlpha: 0, y: -20 },
          { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' }
        );
      }
    } else {
      this.formErrorMessage = message;
      if (this.formErrorMessageDiv?.nativeElement) {
        gsap.fromTo(this.formErrorMessageDiv.nativeElement,
          { autoAlpha: 0, y: -10 },
          { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' }
        );
      }
    }
  }

  // --- Utilidades de Datos ---
  /**
   * Obtiene la fecha actual en formato 'YYYY-MM-DD' para inputs de tipo fecha.
   * @returns Fecha actual formateada.
   */
  private getCurrentDateForInput(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Genera un slug a partir del nombre de la bodega.
   * Se llama automáticamente al cambiar el campo 'nombre'.
   */
  onNombreChange(): void {
    if (this.newWarehouse.nombre) {
      this.newWarehouse.slug = this.generateSlug(this.newWarehouse.nombre);
    } else {
      this.newWarehouse.slug = ''; // Limpia el slug si el nombre está vacío
    }
  }

  /**
   * Función para generar un slug limpio y amigable para URL.
   * @param text El texto de entrada (ej. nombre de la bodega).
   * @returns El slug generado.
   */
  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')    // Elimina caracteres no alfanuméricos (excepto espacios y guiones)
      .replace(/[\s_-]+/g, '-')    // Reemplaza espacios y múltiples guiones/guiones bajos con un solo guion
      .replace(/^-+|-+$/g, '');   // Elimina guiones al principio o al final
  }

  // --- Gestión de Archivos (Logotipos) ---
  /**
   * Maneja la selección de un archivo de logotipo por parte del usuario.
   * Genera una URL de previsualización.
   * @param event El evento de cambio del input de tipo 'file'.
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile = file; // Guarda el archivo seleccionado

      // Previsualiza la imagen usando FileReader
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    } else {
      this.selectedFile = null;
      this.imagePreviewUrl = null;
    }
    this.formErrorMessage = null; // Limpia errores de validación de imagen si había
  }

  /**
   * Maneja el error cuando una imagen (logotipo) no se carga correctamente en el frontend.
   * Reemplaza la URL de la imagen por una de placeholder.
   * @param event El evento de error del elemento <img>.
   */
  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'https://placehold.co/100x100/94a3b8/ffffff?text=Logo+N/A'; // Placeholder para logos
  }

  // --- Operaciones CRUD (Carga, Creación, Edición, Eliminación) ---
  /**
   * Carga la lista de bodegas desde el servicio.
   */
  loadWarehouses(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.warehouseService.getWarehouses(this.currentPage, this.itemsPerPage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: WarehousePaginatedResponse) => { // 'response' es de tipo WarehousePaginatedResponse
          this.warehouses = response.data; // <--- ¡AQUÍ ESTÁ LA CORRECCIÓN CLAVE! Acceder a la propiedad 'data'
          this.totalItems = response.totalItems;
          this.currentPage = response.currentPage;
          this.totalPages = response.totalPages;
          this.itemsPerPage = response.itemsPerPage;
          this.isLoading = false;

          // Animaciones GSAP para la tabla al cargar las bodegas
          if (this.warehouses.length > 0) {
            gsap.from('.warehouse-table-wrapper', { duration: 0.8, y: 50, opacity: 0, ease: 'power3.out', delay: 0.1 });
            gsap.from('.warehouse-row', { duration: 0.5, opacity: 0, x: -20, stagger: 0.05, ease: 'power2.out', delay: 0.2 });
          }
        },
        error: (error: HttpErrorResponse) => {
          this.showError(`Error al cargar bodegas: ${error.message || error.statusText}`, 'general');
          this.isLoading = false;
          console.error('Error al cargar bodegas:', error);
        }
      });
  }

  /**
   * Cambia la página de la tabla de bodegas.
   * @param page El número de página a cargar.
   */
  onPageChange(page: number): void {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadWarehouses();
    }
  }

  /**
   * Abre el formulario en modo creación.
   * Resetea todos los campos y la previsualización de la imagen.
   */
  openCreateWarehouseForm(): void {
    this.isEditing = false;
    this.selectedWarehouse = null;

    // Resetea el DTO y los campos de imagen
    this.newWarehouse = {
      nombre: '',
      slug: '',
      descripcion: '',
      sector: '',
      logotipo_url: '',
      sitio_web: '',
      contacto_email: '',
      contacto_telefono: '',
      direccion_bodega: '',
      estado: 'activa'
    };
    this.selectedFile = null;
    this.imagePreviewUrl = null;
    this.formErrorMessage = null;

    // Si el formulario ya existe en el DOM, lo resetea por completo
    if (this.warehouseNgFormRef) {
      setTimeout(() => {
        this.warehouseNgFormRef.resetForm(this.newWarehouse);
      }, 0);
    }

    // Animaciones GSAP para la apertura del formulario
    this.showWarehouseForm = true; // Primero muestra el elemento (hidden=false)
    this.toggleBodyScroll(true); // Oculta el scroll del body
    gsap.fromTo(this.warehouseFormOverlayRef.nativeElement,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.3 }
    );
    gsap.fromTo(this.warehouseFormCardRef.nativeElement,
      { opacity: 0, scale: 0.8, y: 50 }, // Añadimos un ligero movimiento en Y para la entrada
      { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }
    );
  }

  /**
   * Abre el formulario en modo edición con los datos de la bodega seleccionada.
   * @param item La bodega a editar.
   */
  editWarehouse(item: Warehouse): void {
    this.isEditing = true;
    this.selectedWarehouse = { ...item }; // Crea una copia para evitar mutar el original

    // Carga los datos de la bodega en el DTO para el formulario
    this.newWarehouse = {
      nombre: item.nombre,
      slug: item.slug || this.generateSlug(item.nombre),
      descripcion: item.descripcion,
      sector: item.sector,
      logotipo_url: item.logotipo_url || '',
      sitio_web: item.sitio_web,
      contacto_email: item.contacto_email,
      contacto_telefono: item.contacto_telefono,
      direccion_bodega: item.direccion_bodega,
      estado: item.estado
    };
    this.selectedFile = null; // No hay archivo seleccionado al editar inicialmente
    this.imagePreviewUrl = item.logotipo_url || null; // Muestra la URL existente como previsualización
    this.formErrorMessage = null;

    // Si el formulario ya existe en el DOM, lo resetea y rellena con los nuevos datos
    if (this.warehouseNgFormRef) {
      setTimeout(() => {
        this.warehouseNgFormRef.resetForm(this.newWarehouse);
      }, 0);
    }

    // Animaciones GSAP para la apertura del formulario
    this.showWarehouseForm = true; // Primero muestra el elemento (hidden=false)
    this.toggleBodyScroll(true); // Oculta el scroll del body
    gsap.fromTo(this.warehouseFormOverlayRef.nativeElement,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.3 }
    );
    gsap.fromTo(this.warehouseFormCardRef.nativeElement,
      { opacity: 0, scale: 0.8, y: 50 }, // Añadimos un ligero movimiento en Y para la entrada
      { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }
    );
  }

  /**
   * Cierra el formulario modal de creación/edición.
   * Limpia los estados y activa las animaciones de cierre.
   */
  closeWarehouseForm(): void {
    gsap.to(this.warehouseFormOverlayRef.nativeElement, {
      autoAlpha: 0, duration: 0.3, onComplete: () => {
        this.showWarehouseForm = false; // Oculta el elemento al finalizar la animación
        this.selectedWarehouse = null;
        this.formErrorMessage = null;
        this.selectedFile = null;    // Limpia el archivo seleccionado
        this.imagePreviewUrl = null;  // Limpia la previsualización
        this.toggleBodyScroll(false); // Restaura el scroll del body
      }
    });
    gsap.to(this.warehouseFormCardRef.nativeElement, {
      opacity: 0, scale: 0.8, y: -50, duration: 0.3, ease: 'power2.in' // Añadimos un ligero movimiento en Y para la salida
    });
  }

  /**
   * Guarda una nueva bodega o actualiza una existente.
   * Maneja la subida de imágenes si se selecciona un archivo.
   */
  async saveWarehouse(): Promise<void> {
    // Marca todos los controles del formulario como 'touched' para mostrar validaciones
    if (this.warehouseNgFormRef) {
      Object.keys(this.warehouseNgFormRef.controls).forEach(key => {
        this.warehouseNgFormRef.controls[key].markAsTouched();
        this.warehouseNgFormRef.controls[key].updateValueAndValidity();
      });
    }

    // Valida el formulario antes de proceder
    if (this.warehouseNgFormRef && this.warehouseNgFormRef.invalid) {
      this.showError('Por favor, corrige los errores en el formulario antes de guardar.', 'form');
      return;
    }

    // Asegura que el slug se genere a partir del nombre
    this.onNombreChange();

    // Validaciones de campos obligatorios
    if (!this.newWarehouse.nombre || !this.newWarehouse.slug || !this.newWarehouse.descripcion ||
        !this.newWarehouse.sector || !this.newWarehouse.direccion_bodega) {
      this.showError('Los campos Nombre, Descripción, Sector y Dirección de Bodega son requeridos.', 'form');
      return;
    }

    this.isLoading = true;
    this.formErrorMessage = null;

    let finalLogoUrl = this.newWarehouse.logotipo_url; // Usa la URL existente por defecto o vacía

    // --- Lógica de subida de logotipo ---
    if (this.selectedFile) { // Si hay un archivo de logotipo seleccionado, intenta subirlo
      try {
        const uploadResponse = await this.warehouseService.uploadImage(this.selectedFile).toPromise(); // Convierte Observable a Promise
        if (uploadResponse && uploadResponse.imageUrl) {
          finalLogoUrl = uploadResponse.imageUrl; // Obtiene la URL del logotipo subido
          this.showSuccess('Logotipo subido exitosamente.');
        } else {
          throw new Error('La respuesta de subida de logotipo no contiene una URL válida.');
        }
      } catch (uploadError: any) {
        this.showError(`Error al subir el logotipo: ${uploadError.error?.message || uploadError.message || 'Error desconocido'}`, 'form');
        this.isLoading = false;
        console.error('Error al subir el logotipo:', uploadError);
        return; // Detiene la ejecución si falla la subida
      }
    } else if (!finalLogoUrl && !this.isEditing) {
      // Si no se seleccionó un archivo Y no hay URL existente, y estamos CREANDO una bodega
      this.showError('Debes seleccionar un logotipo o proporcionar una URL.', 'form');
      this.isLoading = false;
      return;
    }
    // Si estamos editando y el usuario borra la URL y no sube nada, simplemente se guarda sin logo.

    // Prepara los datos a enviar al backend
    const warehouseData: CreateWarehouseDto | UpdateWarehouseDto = {
        nombre: this.newWarehouse.nombre,
        slug: this.newWarehouse.slug,
        descripcion: this.newWarehouse.descripcion,
        sector: this.newWarehouse.sector,
        logotipo_url: finalLogoUrl, // Usa la URL final (existente o recién subida)
        sitio_web: this.newWarehouse.sitio_web,
        contacto_email: this.newWarehouse.contacto_email,
        contacto_telefono: this.newWarehouse.contacto_telefono,
        direccion_bodega: this.newWarehouse.direccion_bodega,
        estado: this.newWarehouse.estado
    };

    // Decide si crear o actualizar la bodega
    if (this.isEditing && this.selectedWarehouse) {
      this.warehouseService.updateWarehouse(this.selectedWarehouse.id, warehouseData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedWarehouse) => {
            this.showSuccess(`Bodega "${updatedWarehouse.nombre}" actualizada exitosamente.`);
            this.loadWarehouses(); // Recarga la lista
            this.closeWarehouseForm(); // Cierra el formulario
            this.isLoading = false;
          },
          error: (error: HttpErrorResponse) => {
            this.showError(`Error al actualizar bodega: ${error.error?.message || error.message || error.statusText}`, 'form');
            this.isLoading = false;
            console.error('Error al actualizar bodega:', error);
          }
        });
    } else {
      // Al crear, `newWarehouse` ya contiene el slug generado y el `logotipo_url`
      this.warehouseService.createWarehouse(warehouseData as CreateWarehouseDto) // Aseguramos el tipo para `createWarehouse`
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (createdWarehouse) => {
            this.showSuccess(`Bodega "${createdWarehouse.nombre}" creada exitosamente.`);
            this.loadWarehouses();
            this.closeWarehouseForm();
            this.isLoading = false;
          },
          error: (error: HttpErrorResponse) => {
            this.showError(`Error al crear bodega: ${error.error?.message || error.message || error.statusText}`, 'form');
            this.isLoading = false;
            console.error('Error al crear bodega:', error);
          }
        });
    }
  }

  /**
   * Muestra el diálogo de confirmación para eliminar una bodega.
   * @param id El ID de la bodega a eliminar.
   * @param nombre El nombre de la bodega para mostrar en el mensaje.
   */
  confirmDeleteWarehouse(id: number, nombre: string): void {
    this.confirmDialogTitle = 'Confirmar Eliminación';
    this.confirmDialogMessage = `¿Estás seguro de que quieres eliminar la bodega "${nombre}"? Esta acción no se puede deshacer.`;
    this.confirmActionCallback = () => this.executeDeleteWarehouse(id); // Asigna la función a ejecutar

    // Animaciones GSAP para el diálogo de confirmación
    this.showConfirmationDialog = true; // Primero muestra el elemento (hidden=false)
    this.toggleBodyScroll(true); // Oculta el scroll del body
    gsap.fromTo(this.confirmationDialogOverlayRef.nativeElement,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.3 }
    );
    gsap.fromTo(this.confirmationDialogCardRef.nativeElement,
      { opacity: 0, scale: 0.8, y: 50 }, // Añadimos un ligero movimiento en Y para la entrada
      { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }
    );
  }

  /**
   * Cierra el diálogo de confirmación y ejecuta la acción si se confirmó.
   * @param confirmed Booleano que indica si el usuario confirmó la acción.
   */
  closeConfirmationDialog(confirmed: boolean): void {
    gsap.to(this.confirmationDialogOverlayRef.nativeElement, {
        autoAlpha: 0, duration: 0.3, onComplete: () => {
            this.showConfirmationDialog = false; // Oculta el elemento al finalizar la animación
            if (confirmed && this.confirmActionCallback) {
                this.confirmActionCallback(); // Ejecuta la acción confirmada
            }
            this.confirmActionCallback = null; // Limpia el callback
            this.toggleBodyScroll(false); // Restaura el scroll del body
        }
    });
    gsap.to(this.confirmationDialogCardRef.nativeElement, {
      opacity: 0, scale: 0.8, y: -50, duration: 0.3, ease: 'power2.in' // Añadimos un ligero movimiento en Y para la salida
    });
  }

  /**
   * Ejecuta la eliminación de una bodega después de la confirmación.
   * @param id El ID de la bodega a eliminar.
   */
  executeDeleteWarehouse(id: number): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.warehouseService.deleteWarehouse(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess('Bodega eliminada exitosamente.');
          this.loadWarehouses(); // Recarga la lista de bodegas
          this.isLoading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.showError(`Error al eliminar bodega: ${error.error?.message || error.message || error.statusText}`, 'general');
          this.isLoading = false;
          console.error('Error al eliminar bodega:', error);
        }
      });
  }

  // --- Utilidades para el Template ---
  /**
   * Función `trackBy` para el `*ngFor` de `warehouses`.
   * Mejora el rendimiento al renderizar listas dinámicas en Angular.
   * @param index El índice del elemento.
   * @param warehouse El objeto de la bodega.
   * @returns El ID único de la bodega.
   */
  trackById(index: number, warehouse: Warehouse): number {
    return warehouse.id;
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
}
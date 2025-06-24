// src/app/web/pages/dashboard-news/dashboard-news.component.ts
import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { gsap } from 'gsap';

// Tus servicios y modelos de noticias
import { NewsService } from '../../services/news.service';
import { News, CreateNewsDto, UpdateNewsDto, NewsPaginatedResponse } from '../../models/news.model';
import { ThemeService } from '../../../core/theme/theme.service';


@Component({
  selector: 'app-dashboard-news',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DatePipe
  ],
  templateUrl: './dashboard-news.component.html',
  styleUrls: ['./dashboard-news.component.css']
})
export class DashboardNewsComponent implements OnInit, OnDestroy, AfterViewInit {
  // --- Propiedades del Componente ---
  news: News[] = [];
  isLoading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  formErrorMessage: string | null = null;

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;

  private destroy$ = new Subject<void>();

  showNewsForm: boolean = false;
  isEditing: boolean = false;
  selectedNews: News | null = null;

  newUser: CreateNewsDto = {
    titulo: '',
    slug: '',
    resumen: '',
    contenido: '',
    imagen_destacada: '', // Esto seguirá siendo la URL final de la imagen
    categoria: '',
    autor: '',
    fecha_publicacion: this.getCurrentDateForInput(),
    estado: 'borrador'
  };

  // --- NUEVAS PROPIEDADES PARA GESTIÓN DE IMAGENES ---
  selectedFile: File | null = null; // Almacena el archivo seleccionado por el usuario
  imagePreviewUrl: string | ArrayBuffer | null = null; // Para mostrar una previsualización de la imagen

  showConfirmationDialog: boolean = false;
  confirmDialogTitle: string = '';
  confirmDialogMessage: string = '';
  confirmActionCallback: (() => void) | null = null;

  darkMode$: Observable<boolean>;

  @ViewChild('newsForm') newsFormRef!: NgForm;
  @ViewChild('successMessageDiv') successMessageDiv!: ElementRef;
  @ViewChild('errorMessageDiv') errorMessageDiv!: ElementRef;
  @ViewChild('formErrorMessageDiv') formErrorMessageDiv!: ElementRef;


  constructor(
    private newsService: NewsService,
    public themeService: ThemeService
  ) {
    this.darkMode$ = this.themeService.darkMode$;
  }

  ngOnInit(): void {
    this.loadNews();
  }

  ngAfterViewInit(): void {
    gsap.from('.dashboard-container h1', { duration: 0.8, y: -20, opacity: 0, ease: 'power3.out', delay: 0.2 });
    gsap.fromTo('.add-news-button',
      { x: 20, autoAlpha: 0 },
      { duration: 0.8, x: 0, autoAlpha: 1, ease: 'power3.out', delay: 0.3 }
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

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
      }, 3000);
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

  private getCurrentDateForInput(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onTituloChange(): void {
    if (this.newUser.titulo) {
      this.newUser.slug = this.generateSlug(this.newUser.titulo);
    } else {
      this.newUser.slug = '';
    }
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // --- NUEVO: Manejo de selección de archivo ---
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile = file; // Guarda el archivo seleccionado

      // Previsualiza la imagen
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

  // --- CORRECCIÓN 1: Método trackById para *ngFor ---
  trackById(index: number, item: News): number {
    return item.id;
  }

    // En dashboard-news.component.ts
  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'https://placehold.co/100x100/94a3b8/ffffff?text=Error'; // O tu imagen de placeholder preferida
  }

  loadNews(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.newsService.getNews(this.currentPage, this.itemsPerPage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: NewsPaginatedResponse) => {
          this.news = response.data;
          this.totalItems = response.totalItems;
          this.currentPage = response.currentPage;
          this.totalPages = response.totalPages;
          this.itemsPerPage = response.itemsPerPage;
          this.isLoading = false;

          if (this.news.length > 0) {
            gsap.from('.news-table-wrapper', { duration: 0.8, y: 50, opacity: 0, ease: 'power3.out', delay: 0.1 });
            gsap.from('.news-row', { duration: 0.5, opacity: 0, x: -20, stagger: 0.05, ease: 'power2.out', delay: 0.2 });
          }
        },
        error: (error: HttpErrorResponse) => {
          this.showError(`Error al cargar noticias: ${error.message || error.statusText}`, 'general');
          this.isLoading = false;
          console.error('Error al cargar noticias:', error);
        }
      });
  }

  onPageChange(page: number): void {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadNews();
    }
  }

  openCreateNewsForm(): void {
    this.isEditing = false;
    this.selectedNews = null;

    this.newUser = {
      titulo: '',
      slug: '',
      resumen: '',
      contenido: '',
      imagen_destacada: '', // Asegura que la URL de la imagen se resetee
      categoria: '',
      autor: '',
      fecha_publicacion: this.getCurrentDateForInput(),
      estado: 'borrador'
    };
    this.selectedFile = null; // <-- IMPORTANTE: Resetea el archivo seleccionado
    this.imagePreviewUrl = null; // <-- IMPORTANTE: Resetea la previsualización
    this.showNewsForm = true;
    this.formErrorMessage = null;

    if (this.newsFormRef) {
      setTimeout(() => {
        this.newsFormRef.resetForm(this.newUser);
      }, 0);
    }

    gsap.fromTo('.news-form-overlay', { opacity: 0 }, { opacity: 1, duration: 0.3 });
    gsap.fromTo('.news-form-card',
      { opacity: 0, y: 50, scale: 0.8 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.7)' }
    );
  }

  editNews(item: News): void {
    this.isEditing = true;
    this.selectedNews = { ...item };

    this.newUser = {
      titulo: item.titulo,
      slug: item.slug || this.generateSlug(item.titulo),
      resumen: item.resumen,
      contenido: item.contenido,
      imagen_destacada: item.imagen_destacada || '',
      categoria: item.categoria,
      autor: item.autor,
      fecha_publicacion: item.fecha_publicacion ? new Date(item.fecha_publicacion).toISOString().split('T')[0] : this.getCurrentDateForInput(),
      estado: item.estado
    };
    this.selectedFile = null; // No hay archivo seleccionado al editar inicialmente
    this.imagePreviewUrl = item.imagen_destacada || null; // Muestra la URL existente como previsualización
    this.showNewsForm = true;
    this.formErrorMessage = null;

    if (this.newsFormRef) {
      setTimeout(() => {
        this.newsFormRef.resetForm(this.newUser);
      }, 0);
    }

    gsap.fromTo('.news-form-overlay', { opacity: 0 }, { opacity: 1, duration: 0.3 });
    gsap.fromTo('.news-form-card',
      { opacity: 0, y: 50, scale: 0.8 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.7)' }
    );
  }

  closeNewsForm(): void {
    gsap.to('.news-form-overlay', {
      opacity: 0, duration: 0.3, onComplete: () => {
        this.showNewsForm = false;
        this.selectedNews = null;
        this.formErrorMessage = null;
        this.selectedFile = null; // También limpia el archivo seleccionado al cerrar el formulario
        this.imagePreviewUrl = null; // Y la previsualización
      }
    });
    gsap.to('.news-form-card', { opacity: 0, y: -50, scale: 0.8, duration: 0.3, ease: 'power2.in' });
  }

  async saveNews(): Promise<void> { // Ahora es una función asíncrona
    if (this.newsFormRef) {
      Object.keys(this.newsFormRef.controls).forEach(key => {
        this.newsFormRef.controls[key].markAsTouched();
        this.newsFormRef.controls[key].updateValueAndValidity();
      });
    }

    if (this.newsFormRef && this.newsFormRef.invalid) {
      this.showError('Por favor, corrige los errores en el formulario antes de guardar.', 'form');
      return;
    }

    this.onTituloChange(); // Asegura que el slug se genera

    // Validaciones básicas de campos de texto
    if (!this.newUser.titulo || !this.newUser.slug || !this.newUser.contenido ||
        !this.newUser.autor || !this.newUser.fecha_publicacion || !this.newUser.categoria) {
      this.showError('Todos los campos obligatorios (Título, Slug, Contenido, Autor, Fecha de Publicación, Categoría) deben ser llenados.', 'form');
      return;
    }

    this.isLoading = true;
    this.formErrorMessage = null;

    let finalImageUrl = this.newUser.imagen_destacada; // Usa la URL existente por defecto o vacía

    // ---  Lógica de subida de imagen ---
    if (this.selectedFile) { // Si hay un archivo seleccionado, intenta subirlo
      try {
        // Llama al servicio para subir la imagen.
        // Convertimos el Observable a Promise para usar await.
        const uploadResponse = await this.newsService.uploadImage(this.selectedFile).toPromise();
        if (uploadResponse && uploadResponse.imageUrl) {
          finalImageUrl = uploadResponse.imageUrl; // Obtiene la URL de la imagen subida
          this.showSuccess('Imagen subida exitosamente.');
        } else {
          throw new Error('La respuesta de subida de imagen no contiene una URL válida.');
        }
      } catch (uploadError: any) {
        this.showError(`Error al subir la imagen: ${uploadError.error?.message || uploadError.message || 'Error desconocido'}`, 'form');
        this.isLoading = false;
        console.error('Error al subir la imagen:', uploadError);
        return; // Detiene la ejecución si falla la subida de imagen
      }
    } else if (!finalImageUrl && !this.isEditing) {
        // Si no se seleccionó un archivo Y no hay URL existente, y estamos CREANDO una noticia
        this.showError('Debes seleccionar una imagen destacada o proporcionar una URL.', 'form');
        this.isLoading = false;
        return;
    } else if (this.isEditing && !finalImageUrl && !this.selectedFile && this.selectedNews?.imagen_destacada) {
      // Si estamos EDITANDO y el usuario borró la URL existente y no subió un archivo, mantener la URL existente.
      // Si el usuario borró la URL existente Y no subió un archivo Y la noticia original NO tenía imagen, entonces se queda sin imagen.
      // Aquí puedes decidir si quieres que sea obligatorio tener una imagen en edición o no.
      // Por ahora, si se elimina la URL y no se sube un archivo, se queda sin imagen.
      // Si quieres que siempre tenga una imagen, podrías poner una validación aquí.
    }


    const newsData: CreateNewsDto | UpdateNewsDto = {
        titulo: this.newUser.titulo,
        slug: this.newUser.slug,
        resumen: this.newUser.resumen,
        contenido: this.newUser.contenido,
        imagen_destacada: finalImageUrl, // Usa la URL final (existente o recién subida)
        categoria: this.newUser.categoria,
        autor: this.newUser.autor,
        fecha_publicacion: this.newUser.fecha_publicacion,
        estado: this.newUser.estado
    };


    if (this.isEditing && this.selectedNews) {
      this.newsService.updateNews(this.selectedNews.id, newsData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedNews) => {
            this.showSuccess(`Noticia "${updatedNews.titulo}" actualizada exitosamente.`);
            this.loadNews();
            this.closeNewsForm();
            this.isLoading = false;
          },
          error: (error: HttpErrorResponse) => {
            this.showError(`Error al actualizar noticia: ${error.error?.message || error.message || error.statusText}`, 'form');
            this.isLoading = false;
            console.error('Error al actualizar noticia:', error);
          }
        });
    } else {
      this.newsService.createNews(newsData as CreateNewsDto) // Aseguramos el tipo para `createNews`
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (createdNews) => {
            this.showSuccess(`Noticia "${createdNews.titulo}" creada exitosamente.`);
            this.loadNews();
            this.closeNewsForm();
            this.isLoading = false;
          },
          error: (error: HttpErrorResponse) => {
            this.showError(`Error al crear noticia: ${error.error?.message || error.message || error.statusText}`, 'form');
            this.isLoading = false;
            console.error('Error al crear noticia:', error);
          }
        });
    }
  }

  confirmDeleteNews(id: number, title: string): void {
    this.confirmDialogTitle = 'Confirmar Eliminación';
    this.confirmDialogMessage = `¿Estás seguro de que quieres eliminar la noticia "${title}"? Esta acción no se puede deshacer.`;
    this.confirmActionCallback = () => this.executeDeleteNews(id);
    this.showConfirmationDialog = true;

    gsap.fromTo('.confirmation-dialog-overlay', { opacity: 0 }, { opacity: 1, duration: 0.3 });
    gsap.fromTo('.confirmation-dialog-card',
      { opacity: 0, y: -50, scale: 0.8 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.7)' }
    );
  }

  closeConfirmationDialog(confirmed: boolean): void {
    gsap.to('.confirmation-dialog-overlay', {
        opacity: 0, duration: 0.3, onComplete: () => {
            this.showConfirmationDialog = false;
            if (confirmed && this.confirmActionCallback) {
                this.confirmActionCallback();
            }
            this.confirmActionCallback = null;
        }
    });
    gsap.to('.confirmation-dialog-card', { opacity: 0, y: 50, scale: 0.8, duration: 0.3, ease: 'power2.in' });
  }

  executeDeleteNews(id: number): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.newsService.deleteNews(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess('Noticia eliminada exitosamente.');
          this.loadNews();
          this.isLoading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.showError(`Error al eliminar noticia: ${error.error?.message || error.message || error.statusText}`, 'general');
          this.isLoading = false;
          console.error('Error al eliminar noticia:', error);
        }
      });
  }
}

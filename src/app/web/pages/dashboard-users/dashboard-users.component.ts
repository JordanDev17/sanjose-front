// src/app/web/pages/dashboard-users/dashboard-users.component.ts
import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { gsap } from 'gsap'; // Importar GSAP

// Tus servicios y modelos (rutas relativas a este archivo)
import { UserService } from '../../services/user.service';
import { User, CreateUserDto, UpdateUserDto, UserPaginatedResponse } from '../../models/user.model';
import { ThemeService } from '../../../core/theme/theme.service'; // Asegúrate de la ruta correcta para ThemeService


@Component({
  selector: 'app-dashboard-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './dashboard-users.component.html',
  styleUrls: ['./dashboard-users.component.css']
})
export class DashboardUsersComponent implements OnInit, OnDestroy, AfterViewInit {
  // --- Propiedades del Componente ---
  users: User[] = [];
  isLoading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  formErrorMessage: string | null = null;

  // Propiedades para la paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;

  private destroy$ = new Subject<void>();

  // Propiedades para el formulario de creación/edición de usuarios (modal)
  showUserForm: boolean = false;
  isEditing: boolean = false;
  selectedUser: User | null = null;
  newUser: CreateUserDto = {
    nombre_usuario: '',
    email: '',
    contrasena: '',
    rol: 'visualizador',
    activo: 1, // Por defecto: activo (representado como 1 para el modelo interno)
    two_factor_enabled: 0 // Por defecto: 2FA deshabilitado (representado como 0 para el modelo interno)
  };

  // Propiedades para el diálogo de confirmación (modal)
  showConfirmationDialog: boolean = false;
  confirmDialogTitle: string = '';
  confirmDialogMessage: string = '';
  confirmActionCallback: (() => void) | null = null;

  darkMode$: Observable<boolean>;

  @ViewChild('userForm') userFormRef!: NgForm;
  @ViewChild('successMessageDiv') successMessageDiv!: ElementRef;
  @ViewChild('errorMessageDiv') errorMessageDiv!: ElementRef;
  @ViewChild('formErrorMessageDiv') formErrorMessageDiv!: ElementRef;


  constructor(
    private userService: UserService,
    public themeService: ThemeService
  ) {
    this.darkMode$ = this.themeService.darkMode$;
  }

  // --- Ciclo de Vida del Componente ---

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    // Animaciones iniciales para elementos que siempre están presentes en el DOM al cargar la vista.
    gsap.from('.dashboard-users-container h1', { duration: 0.8, y: -20, opacity: 0, ease: 'power3.out', delay: 0.2 });

    // CORRECCIÓN CLAVE para el botón 'Añadir Usuario':
    // Usar gsap.fromTo con 'autoAlpha' para asegurar que el botón termine y se mantenga visible.
    // 'autoAlpha: 0' como estado inicial asegura que el botón no sea visible antes de la animación.
    // 'autoAlpha: 1' como estado final asegura que el botón sea completamente visible y permanezca así.
    gsap.fromTo('.add-user-button', // Elemento a animar
      { x: 20, autoAlpha: 0 }, // Estado inicial: ligeramente a la derecha, invisible
      { duration: 0.8, x: 0, autoAlpha: 1, ease: 'power3.out', delay: 0.3 } // Estado final: posición original, visible
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // --- Métodos de Ayuda para Mensajes ---

  /**
   * Muestra mensajes de éxito temporalmente con animación de entrada y salida.
   * @param message El mensaje de éxito a mostrar.
   */
  private showSuccess(message: string): void {
    this.successMessage = message;
    if (this.successMessageDiv?.nativeElement) {
      // Usar autoAlpha para visibilidad robusta
      gsap.fromTo(this.successMessageDiv.nativeElement, { autoAlpha: 0, y: -20 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' });
      setTimeout(() => {
        gsap.to(this.successMessageDiv.nativeElement, { autoAlpha: 0, y: -20, duration: 0.5, ease: 'power3.in', onComplete: () => this.successMessage = null });
      }, 3000);
    }
  }

  /**
   * Muestra mensajes de error.
   * @param message El mensaje de error a mostrar.
   * @param type Define dónde se mostrará el mensaje: 'general' (dashboard principal) o 'form' (dentro del modal del formulario).
   */
  private showError(message: string, type: 'general' | 'form' = 'general'): void {
    if (type === 'general') {
      this.errorMessage = message;
      if (this.errorMessageDiv?.nativeElement) {
        // Usar autoAlpha para visibilidad robusta
        gsap.fromTo(this.errorMessageDiv.nativeElement, { autoAlpha: 0, y: -20 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' });
      }
    } else {
      this.formErrorMessage = message;
      if (this.formErrorMessageDiv?.nativeElement) {
        // Usar autoAlpha para visibilidad robusta
        gsap.fromTo(this.formErrorMessageDiv.nativeElement, { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' });
      }
    }
  }

  // --- Métodos de Gestión de Usuarios (CRUD) ---

  /**
   * Carga la lista de usuarios desde el servicio.
   */
  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.userService.getUsers(this.currentPage, this.itemsPerPage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: UserPaginatedResponse) => {
          this.users = response.data;
          this.totalItems = response.totalItems;
          this.currentPage = response.currentPage;
          this.totalPages = response.totalPages;
          this.itemsPerPage = response.itemsPerPage;
          this.isLoading = false;
          // Animar la tabla y las filas solo si hay usuarios
          if (this.users.length > 0) {
            gsap.from('.users-table-wrapper', { duration: 0.8, y: 50, opacity: 0, ease: 'power3.out', delay: 0.1 });
            gsap.from('.user-row', { duration: 0.5, opacity: 0, x: -20, stagger: 0.05, ease: 'power2.out', delay: 0.2 });
          }
        },
        error: (error: Error) => {
          this.showError(`Error al cargar usuarios: ${error.message}`, 'general');
          this.isLoading = false;
          console.error('Error al cargar usuarios:', error);
        }
      });
  }

  onPageChange(page: number): void {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadUsers();
    }
  }

  /**
   * Abre el formulario modal para crear un nuevo usuario.
   * Reinicia el modelo `newUser` y el estado del formulario.
   */
  openCreateUserForm(): void {
    this.isEditing = false;
    this.selectedUser = null;
    this.newUser = {
      nombre_usuario: '',
      email: '',
      contrasena: '',
      rol: 'visualizador',
      activo: 1,
      two_factor_enabled: 0
    };
    this.showUserForm = true;
    this.formErrorMessage = null;

    if (this.userFormRef) {
      setTimeout(() => {
        this.userFormRef.resetForm(this.newUser);
      }, 0);
    }

    gsap.fromTo('.user-form-overlay', { opacity: 0 }, { opacity: 1, duration: 0.3 });
    gsap.fromTo('.user-form-card', { opacity: 0, y: 50, scale: 0.8 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.7)' });
  }

  /**
   * Abre el formulario modal para editar un usuario existente.
   * Pre-llena el formulario con los datos del usuario seleccionado.
   * @param user El objeto User a editar.
   */
  editUser(user: User): void {
    this.isEditing = true;
    this.selectedUser = { ...user };
    this.newUser = {
      nombre_usuario: user.nombre_usuario,
      email: user.email,
      contrasena: '',
      rol: user.rol,
      activo: user.activo,
      two_factor_enabled: user.two_factor_enabled
    };
    this.showUserForm = true;
    this.formErrorMessage = null;

    if (this.userFormRef) {
      setTimeout(() => {
        this.userFormRef.resetForm(this.newUser);
      }, 0);
    }
    
    gsap.fromTo('.user-form-overlay', { opacity: 0 }, { opacity: 1, duration: 0.3 });
    gsap.fromTo('.user-form-card', { opacity: 0, y: 50, scale: 0.8 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.7)' });
  }

  /**
   * Cierra el formulario de creación/edición con una animación de salida.
   */
  closeUserForm(): void {
    gsap.to('.user-form-overlay', {
      opacity: 0, duration: 0.3, onComplete: () => {
        this.showUserForm = false;
        this.selectedUser = null;
        this.formErrorMessage = null;
      }
    });
    gsap.to('.user-form-card', { opacity: 0, y: -50, scale: 0.8, duration: 0.3, ease: 'power2.in' });
  }

  /**
   * Guarda un nuevo usuario o actualiza uno existente.
   * Incluye validaciones del formulario y manejo de errores de la API.
   */
  saveUser(): void {
    if (this.userFormRef) {
        Object.keys(this.userFormRef.controls).forEach(key => {
            this.userFormRef.controls[key].markAsTouched();
            this.userFormRef.controls[key].updateValueAndValidity();
        });
    }

    if (this.userFormRef && this.userFormRef.invalid) {
      this.showError('Por favor, corrige los errores en el formulario antes de guardar.', 'form');
      return;
    }

    if (!this.newUser.nombre_usuario || !this.newUser.email || !this.newUser.rol) {
      this.showError('Todos los campos obligatorios (Nombre, Email, Rol) deben ser llenados.', 'form');
      return;
    }
    if (!this.isEditing && (!this.newUser.contrasena || this.newUser.contrasena.length < 6)) {
      this.showError('La contraseña es requerida y debe tener al menos 6 caracteres para nuevos usuarios.', 'form');
      return;
    }
    if (this.newUser.email && !this.isValidEmail(this.newUser.email)) {
      this.showError('El formato del email es inválido.', 'form');
      return;
    }

    this.isLoading = true;
    this.formErrorMessage = null;

    if (this.isEditing && this.selectedUser) {
      const userToUpdate: UpdateUserDto = {
        nombre_usuario: this.newUser.nombre_usuario,
        email: this.newUser.email,
        rol: this.newUser.rol,
        activo: this.newUser.activo,
        two_factor_enabled: this.newUser.two_factor_enabled
      };

      this.userService.updateUser(this.selectedUser.id, userToUpdate)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedUser) => {
            this.showSuccess(`Usuario "${updatedUser.nombre_usuario}" actualizado exitosamente.`);
            this.loadUsers();
            this.closeUserForm();
            this.isLoading = false;
          },
          error: (error: Error) => {
            this.showError(`Error al actualizar usuario: ${error.message}`, 'form');
            this.isLoading = false;
            console.error('Error al actualizar usuario:', error);
          }
        });
    } else {
      this.userService.createUser(this.newUser)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (createdUser) => {
            this.showSuccess(`Usuario "${createdUser.nombre_usuario}" creado exitosamente.`);
            this.loadUsers();
            this.closeUserForm();
            this.isLoading = false;
          },
          error: (error: Error) => {
            this.showError(`Error al crear usuario: ${error.message}`, 'form');
            this.isLoading = false;
            console.error('Error al crear usuario:', error);
          }
        });
    }
  }

  /**
   * Muestra el diálogo de confirmación para eliminar un usuario.
   */
  confirmDeleteUser(id: number, username: string): void {
    this.confirmDialogTitle = 'Confirmar Eliminación';
    this.confirmDialogMessage = `¿Estás seguro de que quieres eliminar al usuario "${username}"? Esta acción no se puede deshacer.`;
    this.confirmActionCallback = () => this.executeDeleteUser(id);
    this.showConfirmationDialog = true;
    gsap.fromTo('.confirmation-dialog-overlay', { opacity: 0 }, { opacity: 1, duration: 0.3 });
    gsap.fromTo('.confirmation-dialog-card', { opacity: 0, y: -50, scale: 0.8 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.7)' });
  }

  /**
   * Ejecuta la eliminación del usuario después de la confirmación.
   */
  executeDeleteUser(id: number): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.userService.deleteUser(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess('Usuario eliminado exitosamente.');
          this.loadUsers();
          this.isLoading = false;
        },
        error: (error: Error) => {
          this.showError(`Error al eliminar usuario: ${error.message}`, 'general');
          this.isLoading = false;
          console.error('Error al eliminar usuario:', error);
        }
      });
  }

  /**
   * Cierra el diálogo de confirmación (con o sin confirmación).
   */
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

  /**
   * Valida un formato de email simple.
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Alterna el modo oscuro/claro usando el ThemeService.
   */
  toggleDarkMode(): void {
    this.themeService.toggleDarkMode();
  }
}
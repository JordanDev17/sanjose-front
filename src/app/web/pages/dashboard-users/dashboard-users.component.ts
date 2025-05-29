// src/app/web/pages/dashboard-users/dashboard-users.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { UserService } from '../../services/user.service';
import { AuthService } from 'src/app/core/auth/auth.service';
import { User, UserPaginatedResponse } from '../../models/user.model';

@Component({
  selector: 'app-dashboard-users',
  standalone: true,
  templateUrl: './dashboard-users.component.html',
  styleUrls: ['./dashboard-users.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
  ]
})
export class DashboardUsersComponent implements OnInit {
  Math = Math;

  users: User[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;
  totalUsers: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 10;

  userForm: FormGroup;
  isEditing: boolean = false;
  selectedUserId: number | null = null;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      nombre_usuario: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      rol: ['visualizador', Validators.required],
      activo: [true, Validators.required]
    });
  }

  ngOnInit(): void {
    if (!this.authService.hasRole(['admin'])) {
      alert('Acceso denegado. Solo administradores pueden gestionar usuarios.');
      this.router.navigate(['/dashboard-home']);
      return;
    }
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.userService.getUsers(this.currentPage, this.itemsPerPage).subscribe({
      next: (response: UserPaginatedResponse) => {
        this.users = response.data;
        this.totalUsers = response.totalItems;
        this.currentPage = response.currentPage;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Error al cargar usuarios.';
        this.isLoading = false;
      }
    });
  }

  goToPage(page: number): void {
    const totalPages = Math.ceil(this.totalUsers / this.itemsPerPage);
    if (page >= 1 && page <= totalPages) {
      this.currentPage = page;
      this.loadUsers();
    }
  }

  openCreateForm(): void {
    this.isEditing = false;
    this.selectedUserId = null;
    this.userForm.reset({ rol: 'visualizador', activo: true });
    this.userForm.get('contrasena')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('contrasena')?.updateValueAndValidity();
  }

  openEditForm(user: User): void {
    this.isEditing = true;
    this.selectedUserId = user.id;
    this.userForm.patchValue({
      nombre_usuario: user.nombre_usuario,
      email: user.email,
      rol: user.rol,
      activo: user.activo
    });
    this.userForm.get('contrasena')?.clearValidators();
    this.userForm.get('contrasena')?.updateValueAndValidity();
  }

  onSubmit(): void {
    this.errorMessage = null;
    if (this.userForm.invalid) {
      this.errorMessage = 'Corrige los errores del formulario.';
      this.userForm.markAllAsTouched();
      return;
    }

    const formData = { ...this.userForm.value };

    if (this.isEditing && !formData.contrasena) {
      delete formData.contrasena;
    }

    if (this.isEditing && this.selectedUserId) {
      this.userService.updateUser(this.selectedUserId, formData).subscribe({
        next: () => {
          this.loadUsers();
          this.resetForm();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || err.message || 'Error al actualizar.';
        }
      });
    } else {
      this.userService.createUser(formData).subscribe({
        next: () => {
          this.loadUsers();
          this.resetForm();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || err.message || 'Error al crear.';
        }
      });
    }
  }

  deleteUser(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || err.message || 'Error al eliminar.';
        }
      });
    }
  }

  resetForm(): void {
    this.userForm.reset({ rol: 'visualizador', activo: true });
    this.isEditing = false;
    this.selectedUserId = null;
    this.userForm.get('contrasena')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('contrasena')?.updateValueAndValidity();
  }
}

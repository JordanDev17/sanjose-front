// src/app/web/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import {
  User,
  CreateUserDto,
  UpdateUserDto,
  UserPaginatedResponse
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}api/users-admin`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene una lista paginada de usuarios.
   * Asume que el backend devuelve un array simple de `User[]` y simula la paginación.
   */
  getUsers(page: number = 1, limit: number = 10): Observable<UserPaginatedResponse> {
    return this.http.get<User[]>(`${this.apiUrl}`).pipe(
      map(usersArray => {
        const validUsers = usersArray || []; // Asegura que sea un array vacío si la respuesta es null/undefined

        // Lógica de paginación simulada en el frontend
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedUsers = validUsers.slice(startIndex, endIndex);

        return {
          data: paginatedUsers,
          totalItems: validUsers.length,
          currentPage: page,
          totalPages: Math.ceil(validUsers.length / limit),
          itemsPerPage: limit
        };
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene un usuario por su ID.
   */
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Crea un nuevo usuario.
   * Transforma `activo` y `two_factor_enabled` de `number` a `boolean` antes de enviar.
   */
  createUser(user: CreateUserDto): Observable<User> {
    const userToSend = {
      ...user,
      // Convertir numbers (0 o 1) a booleanos (false o true) para el backend
      activo: user.activo === 1,
      two_factor_enabled: user.two_factor_enabled === 1
    };
    return this.http.post<User>(this.apiUrl, userToSend).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Actualiza un usuario existente por su ID.
   * Transforma `activo` y `two_factor_enabled` de `number` a `boolean` antes de enviar.
   */
  updateUser(id: number, user: UpdateUserDto): Observable<User> {
    const userToSend: any = { ...user }; // Usamos 'any' para la flexibilidad en la transformación
    
    // Convertir numbers (0 o 1) a booleanos para el backend si los campos están presentes
    if (userToSend.activo !== undefined && userToSend.activo !== null) {
      userToSend.activo = userToSend.activo === 1;
    }
    if (userToSend.two_factor_enabled !== undefined && userToSend.two_factor_enabled !== null) {
      userToSend.two_factor_enabled = userToSend.two_factor_enabled === 1;
    }

    return this.http.patch<User>(`${this.apiUrl}/${id}`, userToSend).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Elimina un usuario por su ID.
   */
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Maneja errores HTTP.
   * Extrae el mensaje de error del backend para mostrarlo al usuario.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error desconocido.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      // El backend retornó un código de respuesta de error.
      // Intenta extraer un mensaje de error más específico del cuerpo de la respuesta (ej. de { message: "..." })
      const backendError = error.error as { message?: string };
      errorMessage = `Error del servidor (Código: ${error.status}): ${backendError.message || error.message || JSON.stringify(error.error)}`;
    }
    console.error('Error en UserService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
// src/app/web/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import {
  User,
  CreateUserDto,
  UpdateUserDto,
  UserPaginatedResponse
} from '../models/user.model'; // Ajusta la ruta a tus modelos
import { ApiResponse } from '../models/api-response.model'; // Ajusta la ruta a tu modelo de respuesta
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users-admin`; 

  constructor(private http: HttpClient) { }

  /**
   * Obtiene una lista paginada de usuarios.
   * Requiere rol 'admin'.
   */
  getUsers(page: number = 1, limit: number = 10): Observable<UserPaginatedResponse> {
    return this.http.get<UserPaginatedResponse>(`${this.apiUrl}?page=${page}&limit=${limit}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene un usuario por su ID.
   * Requiere rol 'admin'.
   */
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Crea un nuevo usuario.
   * Requiere rol 'admin'.
   */
  createUser(user: CreateUserDto): Observable<User> {
    return this.http.post<User>(this.apiUrl, user).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Actualiza un usuario existente por su ID.
   * Requiere rol 'admin'.
   */
  updateUser(id: number, user: UpdateUserDto): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Elimina un usuario por su ID.
   * Requiere rol 'admin'.
   */
  deleteUser(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error desconocido.';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente o de red.
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      // El backend retornó un código de respuesta de error.
      // El cuerpo de la respuesta puede contener información adicional.
      errorMessage = `Error del servidor (Código: ${error.status}): ${error.error?.message || error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
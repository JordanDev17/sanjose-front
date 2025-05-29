// src/app/core/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

// Importa las interfaces actualizadas
import { LoginCredentials, User, LoginResponsePhase1, AuthResponsePhase2, VerificationData, JwtPayload } from './auth.models';
import { environment } from 'src/environments/environment'; // Asegúrate de que la ruta sea correcta


import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  // URL base de tu backend (desde environment.ts)
  private readonly AUTH_API_URL = environment.apiUrl + '/auth'; // Tu backend usa '/api/auth/login'

  constructor(private http: HttpClient, private router: Router) {
    // Intentar cargar el usuario y el estado de autenticación al iniciar el servicio
    this.loadUserFromLocalStorage();
  }

  // --- Métodos de Gestión de Sesión ---

  private loadUserFromLocalStorage(): void {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      try {
        const decodedToken: JwtPayload = jwtDecode(token);
        // Verificar si el token no ha expirado
        const currentTime = Date.now() / 1000; // Tiempo actual en segundos
        if (decodedToken.exp > currentTime) {
          // Si el token es válido y no expirado, reconstruye el objeto User
          const user: User = {
            id: decodedToken.id,
            nombre_usuario: decodedToken.nombre_usuario,
            email: this.getStoredUserEmail() || '', // Recupera el email si lo guardaste, o maneja según tu necesidad
            rol: decodedToken.rol // El rol está directamente en el payload
          };
          this.setSession(token, user);
        } else {
          // Token expirado
          console.warn('Token JWT expirado.');
          this.logout(); // Limpia la sesión si el token expiró
        }
      } catch (error) {
        console.error('Error al decodificar o verificar el token:', error);
        this.logout(); // En caso de token inválido o corrupto
      }
    } else {
      this.isAuthenticatedSubject.next(false);
      this.currentUserSubject.next(null);
    }
  }

  private setSession(token: string, user: User): void {
    localStorage.setItem('jwt_token', token);
    // Guarda el email del usuario para recuperarlo al recargar la página, si no viene en el token
    localStorage.setItem('user_email', user.email);
    this.isAuthenticatedSubject.next(true);
    this.currentUserSubject.next(user);
    console.log('Sesión establecida. Usuario:', user);
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_email'); // Limpiar también el email guardado
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
    console.log('Sesión cerrada. Redirigiendo a /login-web.');
    this.router.navigate(['/login-web']);
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  // Helper para obtener el email si no se reconstruye directamente del token decodificado en loadUserFromLocalStorage
  private getStoredUserEmail(): string | null {
    return localStorage.getItem('user_email');
  }

  // Verifica si el usuario está autenticado y si el token no ha expirado
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    try {
      const decodedToken: JwtPayload = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decodedToken.exp > currentTime;
    } catch (error) {
      console.error('Error al verificar token:', error);
      return false;
    }
  }

  getUserRole(): string | null {
    const user = this.currentUserSubject.getValue();
    return user ? user.rol : null;
  }

  // Modificado para que tome el rol singular que devuelve tu backend
  hasRole(allowedRoles: string[]): boolean {
    const userRole = this.getUserRole();
    if (!userRole) {
      return false;
    }
    // Verifica si el rol del usuario está en la lista de roles permitidos
    return allowedRoles.includes(userRole);
  }

  // --- Métodos de Interacción con el Backend (Login y Verificación Integrada) ---

  // Fase 1: Envía credenciales. Backend responde si requiere 2FA y envía código.
  // El retorno es la respuesta de la fase 1, no el token.
  loginPhase1(credentials: LoginCredentials): Observable<LoginResponsePhase1> {
    // Tu endpoint es /api/auth/login
    return this.http.post<LoginResponsePhase1>(`${this.AUTH_API_URL}/login`, credentials).pipe(
      tap(response => {
        console.log('Backend response (Login Phase 1):', response);
        // Aquí no hacemos setSession porque aún no hay token
        // Podemos guardar las credenciales temporalmente para la fase 2 si es necesario
        // localStorage.setItem('temp_login_credentials', JSON.stringify(credentials));
      }),
      catchError(this.handleError)
    );
  }

  // Fase 2: Envía credenciales + código 2FA. Backend responde con token si es exitoso.
  loginPhase2(verificationData: VerificationData): Observable<AuthResponsePhase2> {
    // Tu endpoint es el mismo: /api/auth/login
    return this.http.post<AuthResponsePhase2>(`${this.AUTH_API_URL}/login`, verificationData).pipe(
      tap(response => {
        console.log('Backend response (Login Phase 2):', response);
        if (response.token && response.user) {
          // El backend devuelve 'rol' singular, lo mapeamos a la propiedad 'rol' de nuestra interfaz User
          const user: User = {
            id: response.user.id,
            nombre_usuario: response.user.nombre_usuario,
            email: response.user.email,
            rol: response.user.rol // Directamente el campo 'rol'
          };
          this.setSession(response.token, user);
          // localStorage.removeItem('temp_login_credentials'); // Limpiar credenciales temporales
        } else {
          throw new Error('Token or user data missing from verification response');
        }
      }),
      catchError(this.handleError)
    );
  }

  // --- Manejo de Errores ---
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.status === 401) {
        errorMessage = 'Credenciales incorrectas o código de verificación inválido/expirado.';
      } else if (error.status === 403) {
        errorMessage = 'Acceso denegado. No tienes permiso para realizar esta acción.';
      } else if (error.error && error.error.message) {
        errorMessage = `Error: ${error.error.message}`; // Mensaje específico del backend
      } else {
        errorMessage = `Server Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
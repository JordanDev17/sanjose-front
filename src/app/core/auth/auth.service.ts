// src/app/core/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

// *** CAMBIO: Importamos 'User' directamente de su ubicación central. ***
import { User } from '../../web/models/user.model';
// Las demás interfaces SÍ vienen de './auth.models'
import { LoginCredentials, LoginResponsePhase1, AuthResponsePhase2, VerificationData, JwtPayload } from './auth.models';
import { environment } from 'src/environments/environment';

import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

  // Ahora currentUserSubject se adhiere a la User de user.model.ts
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  private readonly AUTH_API_URL = environment.apiUrl + 'api/auth';

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromLocalStorage();
  }

  private loadUserFromLocalStorage(): void {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      try {
        const decodedToken: JwtPayload = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp > currentTime) {
          // *** CAMBIO CRÍTICO AQUÍ: Construimos el objeto User completo ***
          const user: User = {
            id: decodedToken.id,
            nombre_usuario: decodedToken.nombre_usuario,
            email: decodedToken.email || this.getStoredUserEmail() || '', // Usar email del token, luego almacenado, sino vacío
            rol: decodedToken.rol,
            activo: decodedToken.activo ?? 1, // Si no viene en JWT, asumimos 1 (activo)
            two_factor_enabled: decodedToken.two_factor_enabled ?? 0 // Si no viene en JWT, asumimos 0 (2FA deshabilitado)
          };
          this.setSession(token, user);
        } else {
          console.warn('Token JWT expirado.');
          this.logout();
        }
      } catch (error) {
        console.error('Error al decodificar o verificar el token:', error);
        this.logout();
      }
    } else {
      this.isAuthenticatedSubject.next(false);
      this.currentUserSubject.next(null);
    }
  }

  private setSession(token: string, user: User): void {
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('user_email', user.email);
    this.isAuthenticatedSubject.next(true);
    this.currentUserSubject.next(user);
    console.log('Sesión establecida. Usuario:', user);
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_email');
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
    console.log('Sesión cerrada. Redirigiendo a /login-web.');
    this.router.navigate(['/login-web']);
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  private getStoredUserEmail(): string | null {
    return localStorage.getItem('user_email');
  }

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

  hasRole(allowedRoles: string[]): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => {
        if (!user || !user.rol) {
          return false;
        }
        return allowedRoles.includes(user.rol);
      })
    );
  }

  loginPhase1(credentials: LoginCredentials): Observable<LoginResponsePhase1> {
    // Aquí 'credentials' ya usará 'email_or_username' por el cambio en auth.models.ts
    return this.http.post<LoginResponsePhase1>(`${this.AUTH_API_URL}/login`, credentials).pipe(
      tap(response => {
        console.log('Backend response (Login Phase 1):', response);
      }),
      catchError(this.handleError)
    );
  }

  loginPhase2(verificationData: VerificationData): Observable<AuthResponsePhase2> {
    // Aquí 'verificationData' ya usará 'email_or_username' y 'verification_code'
    return this.http.post<AuthResponsePhase2>(`${this.AUTH_API_URL}/login`, verificationData).pipe(
      tap(response => {
        console.log('Backend response (Login Phase 2):', response);
        if (response.token && response.user) {
          // Si tu backend envía 'activo' y 'two_factor_enabled' en 'response.user',
          // y response.user es del tipo User, esto debería funcionar directamente.
          // Si no, asignamos valores por defecto como en loadUserFromLocalStorage.
          const user: User = {
            id: response.user.id,
            nombre_usuario: response.user.nombre_usuario,
            email: response.user.email,
            rol: response.user.rol,
            activo: response.user.activo ?? 1,
            two_factor_enabled: response.user.two_factor_enabled ?? 0
          };
          this.setSession(response.token, user);
        } else {
          throw new Error('Token or user data missing from verification response');
        }
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.status === 401) {
        errorMessage = 'Credenciales incorrectas o código de verificación inválido/expirado.';
      } else if (error.status === 403) {
        errorMessage = 'Acceso denegado. No tienes permiso para realizar esta acción.';
      } else if (error.error && error.error.message) {
        errorMessage = `Error: ${error.error.message}`;
      } else {
        errorMessage = `Server Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
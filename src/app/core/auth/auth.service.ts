// src/app/core/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs'; // IMPORTANTE: Agrega 'of'
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

import { LoginCredentials, User, LoginResponsePhase1, AuthResponsePhase2, VerificationData, JwtPayload } from './auth.models';
import { environment } from 'src/environments/environment';

import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  private readonly AUTH_API_URL = environment.apiUrl + '/api/auth';

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
          const user: User = {
            id: decodedToken.id,
            nombre_usuario: decodedToken.nombre_usuario,
            email: this.getStoredUserEmail() || '',
            rol: decodedToken.rol
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

  // CAMBIO CRÍTICO: Modificado para devolver Observable<boolean>
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
    return this.http.post<LoginResponsePhase1>(`${this.AUTH_API_URL}/login`, credentials).pipe(
      tap(response => {
        console.log('Backend response (Login Phase 1):', response);
      }),
      catchError(this.handleError)
    );
  }

  loginPhase2(verificationData: VerificationData): Observable<AuthResponsePhase2> {
    return this.http.post<AuthResponsePhase2>(`${this.AUTH_API_URL}/login`, verificationData).pipe(
      tap(response => {
        console.log('Backend response (Login Phase 2):', response);
        if (response.token && response.user) {
          const user: User = {
            id: response.user.id,
            nombre_usuario: response.user.nombre_usuario,
            email: response.user.email,
            rol: response.user.rol
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
// src/app/core/auth/jwt.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service'; // Importa tu AuthService
import { Router } from '@angular/router';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Obtener el token de autenticación del AuthService
    const token = this.authService.getToken();

    // Clona la petición y añade el encabezado de autorización si el token existe
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}` // Formato estándar: Bearer <token>
        }
      });
    }

    // Pasa la petición al siguiente manejador y captura errores
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si el error es 401 (Unauthorized) o 403 (Forbidden)
        if (error.status === 401 || error.status === 403) {
          // Si no es la ruta de login o verificación (para evitar bucles infinitos)
          if (!request.url.includes('/auth/login')) {
            console.warn('JwtInterceptor: Token inválido/expirado o acceso denegado (401/403). Redirigiendo a /login-web.');
            this.authService.logout(); // Limpiar la sesión y redirigir
          }
        }
        return throwError(() => error); // Propaga el error para que otros manejadores lo capturen
      })
    );
  }
}
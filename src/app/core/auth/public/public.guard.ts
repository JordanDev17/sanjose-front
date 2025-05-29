// src/app/core/auth/public.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../auth.service'; // Importa tu AuthService

@Injectable({
  providedIn: 'root'
})
export class PublicGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.authService.isAuthenticated$.pipe(
      take(1), // Toma el valor actual y completa
      map(isAuthenticated => {
        if (isAuthenticated) {
          // Si el usuario está autenticado, redirigir al dashboard
          console.log('PublicGuard: Usuario autenticado. Redirigiendo a /dashboard-home.');
          return this.router.createUrlTree(['/dashboard-home']);
        }
        // Si no está autenticado, permitir el acceso a la ruta pública
        return true;
      })
    );
  }
}
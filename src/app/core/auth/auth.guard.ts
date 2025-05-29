// src/app/core/auth/auth.guard.ts
import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return this.authService.isAuthenticated$.pipe(
      take(1), // Tomar solo el primer valor y luego completar
      map(isAuthenticated => {
        if (!isAuthenticated) {
          // Si no está autenticado, redirigir al login
          console.warn('AuthGuard: Usuario no autenticado. Redirigiendo a /login-web.');
          return this.router.createUrlTree(['/login-web']);
        }

        // Si está autenticado, verificar roles
        const requiredRoles = route.data['roles'] as string[]; // Roles permitidos para esta ruta

        if (requiredRoles && requiredRoles.length > 0) {
          // Si la ruta requiere roles específicos
          const hasRequiredRole = this.authService.hasRole(requiredRoles);

          if (!hasRequiredRole) {
            // Si no tiene los roles necesarios, redirigir a una página de acceso denegado o al dashboard
            console.warn(`AuthGuard: Acceso denegado. Rol(es) requerido(s): ${requiredRoles.join(', ')}. Rol del usuario: ${this.authService.getUserRole()}`);
            // Redirige al dashboard principal o a una página de error de acceso
            return this.router.createUrlTree(['/dashboard-home']);
          }
        }
        // Si está autenticado y tiene los roles correctos (o no se requieren roles específicos), permitir el acceso
        return true;
      })
    );
  }
}
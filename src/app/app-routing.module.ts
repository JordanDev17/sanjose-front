// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// --- Importaciones de Componentes Existentes (mantienen sus rutas actuales si no las cambias) ---
import { HomeComponent } from './components/home/home.component'; // ¿Todavía se usa?
import { LoginComponent } from './components/login/login.component'; // ¿Todavía se usa?
import { AdminPerfilComponent } from './components/admin-perfil/admin-perfil.component';
import { AdminLoginComponent } from './components/admin-login/admin-login.component'; // ¿Se fusionará con WebLoginComponent?

// Componentes sitio web público
import { WebHomeComponent } from './web/pages/web-home/web-home.component';
import { WarehousesComponent} from './web/pages/warehouses/warehouses.component';
import { WarehouseDetailComponent } from './web/pages/warehouse-detail/warehouse-detail.component';
import { NewsDetailComponent } from './web/pages/news-detail/news-detail.component';
import { AboutComponent } from './web/pages/about/about.component';
import { ContactComponent } from './web/pages/contact/contact.component';

// Componentes del Dashboard (Protegidos)
import { DashboardHomeComponent} from './web/pages/dashboard-home/dashboard-home.component';
import { DashboardNewsComponent } from './web/pages/dashboard-news/dashboard-news.component';
import { DashboardWarehousesComponent } from './web/pages/dashboard-warehouses/dashboard-warehouses.component';
import { DashboardUsersComponent } from './web/pages/dashboard-users/dashboard-users.component';

// Componente de Login (punto de entrada principal para la autenticación)
import { WebLoginComponent } from './web/pages/web-login/web-login.component';

// Componente 404
import { NotFoundComponent } from './web/components/not-found/not-found.component';


// --- Importar los nuevos Guards ---
import { AuthGuard } from './core/auth/auth.guard'; // <-- Nueva ubicación de tu AuthGuard
import { PublicGuard } from './core/auth/public/public.guard'; // <-- Nueva guardia para rutas públicas
import { NewsCardComponent } from './web/components/news-card/news-card.component';


const routes: Routes = [

  // === Rutas del sitio web público ===
  { path: '', component: WebHomeComponent }, // Home page
  { path: 'news/:id', component: NewsDetailComponent }, // Noticia detallada
  { path: 'warehouses', component: WarehousesComponent }, // Listado de bodegas
  { path: 'warehouses/:id', component: WarehouseDetailComponent }, // Detalle de bodega
  { path: 'about', component: AboutComponent }, // Página "Acerca de"
  { path: 'contact', component: ContactComponent }, // Página de contacto
  { path: 'prueba', component: NewsCardComponent }, // Página de contacto


  // === Página de Login ===
  // Esta ruta usará PublicGuard para redirigir si el usuario ya está logueado.
  {
    path: 'login-web',
    component: WebLoginComponent,
    canActivate: [PublicGuard] // <-- Usa PublicGuard aquí
  },

  // === Rutas del Dashboard (PROTEGIDAS por AuthGuard y Roles) ===
  // Estas rutas requieren que el usuario esté logueado Y tenga el rol 'admin' o 'editor'.
  {
    path: 'dashboard-home',
    component: DashboardHomeComponent,
    canActivate: [AuthGuard], // Aplica el Guard
    data: { roles: ['admin', 'editor'] } // Roles permitidos para esta ruta
  },
  {
    path: 'dashboard-news',
    component: DashboardNewsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin', 'editor'] } // Roles permitidos para esta ruta
  },
  {
    path: 'dashboard-warehouses',
    component: DashboardWarehousesComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin', 'editor'] } // Roles permitidos para esta ruta
  },
    {
    path: 'dashboard-users',
    component: DashboardUsersComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin'] } // Roles permitidos para esta ruta
  },

  // === Rutas de módulos raíz / admin ===
  // Evalúa si estos componentes siguen siendo necesarios o si se fusionan.
  // Si 'AdminLoginComponent' se fusiona con 'WebLoginComponent', elimina esta ruta.
  // Si 'LoginComponent' es redundante, elimínalo.
  { path: 'home-cesar', component: HomeComponent },
  { path: 'login', component: LoginComponent }, // Considera si esta ruta es necesaria o si WebLoginComponent la reemplaza
  { path: 'perfil-login', component: AdminLoginComponent }, // Considera si esta ruta es necesaria o si WebLoginComponent la reemplaza

  {
    path: 'perfil-admin',
    component: AdminPerfilComponent,
    // canActivate: [AuthGuard],
    // data: { roles: ['admin'] } // Esta ruta podría ser solo para el rol 'admin'
  },


  // === Ruta comodín para manejar cualquier ruta no definida (404) ===
  // Siempre debe ser la ÚLTIMA ruta en la configuración.
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
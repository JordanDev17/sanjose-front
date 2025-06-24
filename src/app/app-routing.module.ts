// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


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
import { ChatbotComponent } from './web/components/chatbot/chatbot.component';


const routes: Routes = [

  // === Rutas del sitio web público ===
  { path: '', component: WebHomeComponent }, // Home page
  { path: 'news/:id', component: NewsDetailComponent }, // Noticia detallada
  { path: 'warehouses', component: WarehousesComponent }, // Listado de bodegas
  { path: 'warehouses/:id', component: WarehouseDetailComponent }, // Detalle de bodega
  { path: 'about', component: AboutComponent }, // Página "Acerca de"
  { path: 'contact', component: ContactComponent }, // Página de contacto
  { path: 'prueba', component: ChatbotComponent}, // Página de contacto


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
  // === Ruta comodín para manejar cualquier ruta no definida (404) ===
  // Siempre debe ser la ÚLTIMA ruta en la configuración.
  { path: '**', component: NotFoundComponent }
];

@NgModule({
    imports: [
    RouterModule.forRoot(routes, {
      // Configuración añadida:
      scrollPositionRestoration: 'top' // Desplaza la ventana al inicio al navegar a una nueva ruta
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
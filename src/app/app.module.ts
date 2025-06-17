// src/app/app.module.ts
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router'; // Asegúrate de que esté aquí

// COMPONENTES TRADICIONALES (standalone: false) - Van en declarations
import { HomeComponent } from './components/home/home.component';
import { BookFormComponent } from './components/book-form/book-form.component';
import { TermsComponent } from './components/terms/terms.component';
import { LoginComponent } from './components/login/login.component'; // Si este es el login antiguo que no es standalone
import { AdminPerfilComponent } from './components/admin-perfil/admin-perfil.component';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { AdministradoresComponent } from './components/admin-perfil/lista-pages/administradores/administradores.component';
import { DatosAdminsComponent } from './components/admin-perfil/lista-pages/datos-admins/datos-admins.component';
import { BodegasComponent } from './components/admin-perfil/lista-pages/bodegas/bodegas.component';
import { PersonasComponent } from './components/admin-perfil/lista-pages/personas/personas.component';

// PAGINAS WEB (Asumo que son standalone: false, si no, irían en imports)
import { WebHomeComponent } from './web/pages/web-home/web-home.component';
import { WarehousesComponent } from './web/pages/warehouses/warehouses.component';
import { WarehouseDetailComponent } from './web/pages/warehouse-detail/warehouse-detail.component';
import { NewsDetailComponent } from './web/pages/news-detail/news-detail.component';
import { AboutComponent } from './web/pages/about/about.component';
import { ContactComponent } from './web/pages/contact/contact.component';
import { DashboardHomeComponent } from './web/pages/dashboard-home/dashboard-home.component';
import { DashboardNewsComponent } from './web/pages/dashboard-news/dashboard-news.component';
import { DashboardWarehousesComponent } from './web/pages/dashboard-warehouses/dashboard-warehouses.component';
import { DashboardUsersComponent } from './web/pages/dashboard-users/dashboard-users.component';

// COMPONENTES WEB 
import { NewsCardComponent } from './web/components/news-card/news-card.component';
import { WarehouseCardComponent } from './web/components/warehouse-card/warehouse-card.component';
import { NotFoundComponent } from './web/components/not-found/not-found.component';
import { WebHeaderComponent } from './web/components/web-header/web-header.component'; // <-- Standalone, va en imports
import { FooterComponent } from './web/components/footer/footer.component'; // <-- Standalone, va en imports (asumiendo que es tu nuevo FooterComponent)
import { WebLoginComponent } from './web/pages/web-login/web-login.component'; // <-- Standalone, va en imports
import { ParticlesBackgroundComponent } from './web/components/particles-background/particles-background.component'; // Importa el componente de fondo


import { JwtInterceptor } from './core/auth/jwt.interceptor';
import { LocationMapComponent } from './web/components/location-map/location-map.component';
import { AnimatedLinesBackgroundService } from './core/background/animated-lines-background.service';
import { ChatbotComponent } from './web/components/chatbot/chatbot.component';
import { VirtualTourComponent } from './web/components/virtual-tour/virtual-tour.component';

@NgModule({
  declarations: [
    AppComponent,
    BookFormComponent,
    HomeComponent,
    TermsComponent,
    LoginComponent, // Si es standalone: false
    AdminPerfilComponent,
    AdminLoginComponent,
    AdministradoresComponent,
    DatosAdminsComponent,
    BodegasComponent,
    PersonasComponent,

    // Pages web (si son standalone: false)
    WebHomeComponent,
    WarehousesComponent,
    WarehouseDetailComponent,
    NewsDetailComponent,
    AboutComponent,
    ContactComponent,
    DashboardNewsComponent,
    DashboardWarehousesComponent,
    // DashboardHomeComponent, // <--- Descomenta si es standalone: false y lo necesitas
    //DashboardUsersComponent, // <--- Descomenta si es standalone: false y lo necesitas

    // Componentes web (si son standalone: false)
    NewsCardComponent,
    WarehouseCardComponent,
    NotFoundComponent,
    LocationMapComponent,
    ChatbotComponent,
    VirtualTourComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule,
    BrowserAnimationsModule,
    RouterModule, // <-- Necesario para el enrutamiento
    WebHeaderComponent, // <-- Componente STANDALONE IMPORTADO AQUÍ
    FooterComponent, // <-- Componente STANDALONE IMPORTADO AQUÍ (si es standalone)
    WebLoginComponent,
    ParticlesBackgroundComponent,
],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    },
    provideClientHydration(withEventReplay())
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
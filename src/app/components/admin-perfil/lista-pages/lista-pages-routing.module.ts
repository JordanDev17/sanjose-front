// src/app/pages/lista/lista-pages/lista-pages-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdministradoresComponent } from './administradores/administradores.component';
import { DescargasComponent } from './descargas/descargas.component';
import { DatosComponent } from './datos/datos.component';
import { AjustesComponent } from './ajustes/ajustes.component';
import { AdminPerfilComponent } from '../admin-perfil.component';
import { BodegasComponent } from './bodegas/bodegas.component';
import { HomeComponent } from '../../home/home.component';
import { DatosAdminsComponent } from './datos-admins/datos-admins.component';
import { PersonasComponent } from './personas/personas.component';

const routes: Routes = [
    {
      path: '',
      component: AdminPerfilComponent, // Este es el componente con tu l1 y l2
      children: [ // <<<<<<--- hijos
        
        {
          path: 'bodegas',
          component: BodegasComponent
        },
        {
          path: 'bodegas/:id/personas', 
          component: PersonasComponent
        },
        {
          path: 'administradores',
          component: AdministradoresComponent
        },
        {
          path: 'admins-datos/:id',
          component: DatosAdminsComponent
        },
        
        {
          path: 'descargar-pdf',
          component: DescargasComponent
        },
        {
          path: 'datos-personales',
          component: DatosComponent
        },
        {
          path: 'ajustes',
          component: AjustesComponent
        },
        
      ]
    },
    { path: '**', redirectTo: 'Home' }
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ListaPagesRoutingModule { }

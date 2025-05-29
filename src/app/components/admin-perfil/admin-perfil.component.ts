import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-perfil',
  standalone: false,
  templateUrl: './admin-perfil.component.html',
  styleUrl: './admin-perfil.component.css'
})
export class AdminPerfilComponent {
  admin: any = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const datos = localStorage.getItem('adminLogueado');

    if (datos) {
      this.admin = JSON.parse(datos);
    }else {
      this.router.navigate(['/']);
    }
  }
  cerrarSesion() {
    localStorage.removeItem('adminLogueado');
    this.router.navigate(['/']);
  }
  
  

}

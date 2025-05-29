import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-login',
  standalone: false,
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css'
})
export class AdminLoginComponent {
  nombre: string = '';
  identificacion: string = '';

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  iniciarSesion() {
    if (!this.nombre || !this.identificacion) {
      alert('Por favor llena todos los campos');
      return;
    }

    this.adminService.loginAdmin({ nombre: this.nombre, identificacion: this.identificacion }).subscribe({
      next: (res) => {
        localStorage.setItem('adminLogueado', JSON.stringify(res.admin));
        this.router.navigate(['/perfil-admin']);
      },
      error: () => {
        alert('Nombre o identificación incorrectos');
      }
    });
  }
}

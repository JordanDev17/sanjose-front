import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdminService, Administrador } from '../../../../services/admin.service';

@Component({
  selector: 'app-datos-admins',
  standalone: false,
  templateUrl: './datos-admins.component.html',
  styleUrl: './datos-admins.component.css'
})
export class DatosAdminsComponent implements OnInit {
  admin?: Administrador;
  error: string = '';

  constructor(
    private route: ActivatedRoute, 
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.adminService.obtenerAdministradores().subscribe({
        next: (admins) => {
          this.admin = admins.find(a => a.identificacion === id);
          if (!this.admin) this.error = 'Administrado no encontrador'
        },
        error: () => this.error = 'Error al obtener administrador'
      });
    }
  }
}

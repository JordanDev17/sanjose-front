import { Component, OnInit } from '@angular/core';
import { AdminService, Administrador } from '../../../../services/admin.service';

@Component({
  selector: 'app-administradores',
  standalone: false,
  templateUrl: './administradores.component.html',
  styleUrls: ['./administradores.component.css']
})
export class AdministradoresComponent implements OnInit {
  administradores: Administrador[] = [];
  cargando: boolean = true;
  error: string = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.obtenerAdministradores();
  }

  obtenerAdministradores() {
    this.cargando = true;
    this.adminService.obtenerAdministradores()
      .subscribe({
        next: (data) => {
          this.administradores = data;
          this.cargando = false;
        },
        error: (err) => {
          this.error = 'Error al cargar los administradores';
          this.cargando = false;
        }
      });
  }
}

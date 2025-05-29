import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BodegaService, Bodega } from '../../../../services/bodega.service';

@Component({
  selector: 'app-bodegas',
  standalone: false,
  templateUrl: './bodegas.component.html',
  styleUrls: ['./bodegas.component.css']
})
export class BodegasComponent {
  bodegas: Bodega[] = [];

  constructor(
    private bodegaService: BodegaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.bodegaService.obtenerBodegas().subscribe({
      next: (data) => this.bodegas = data,
      error: (err) => console.error('Error al Obtener bodegas', err)
    });
  }

  verPersonas(id: number) {
    this.router.navigate(['/bodegas', id, 'personas'])
  }
}

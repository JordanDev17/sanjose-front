import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RegistrosPersonasService, RegistroPersona } from '../../../../services/registros-personas.service';


@Component({
  selector: 'app-personas',
  standalone: false,
  templateUrl: './personas.component.html',
  styleUrl: './personas.component.css'
})
export class PersonasComponent {
  bodegaId!: number;
  personas: RegistroPersona[] = [];

  constructor(
    private registropersonasService: RegistrosPersonasService,
    private route: ActivatedRoute) {}

  ngOnInit() {
    this.bodegaId = Number(this.route.snapshot.paramMap.get('id'));

    this.registropersonasService.obtenerRegistrosPorBodega(this.bodegaId)
      .subscribe(
        data => {
          this.personas = data;
        },
        error => {
          console.error('Error al obtener personas:', error);
        }
      );
  }
}

// src/app/app.component.ts
import { Component, OnInit } from '@angular/core'; // OnInit lo necesitas para initFlowbite()
import { initFlowbite } from 'flowbite';
// La importación de WebHeaderComponent aquí ya no es necesaria si AppModule lo importa.
// Si tu AppComponent fuera standalone, SÍ la necesitarías aquí en los 'imports'.

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false, // <-- Esto es clave: NO standalone
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit { // Implementa OnInit
  title = 'frontend';

  ngOnInit(): void {
    initFlowbite();
  }
}
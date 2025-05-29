import { Component } from '@angular/core';

@Component({
  selector: 'app-ajustes',
  standalone: false,
  templateUrl: './ajustes.component.html',
  styleUrls: ['./ajustes.component.css']
})
export class AjustesComponent {


  toggleDarkMode() {
    // Comprobamos si el <html> tiene la clase 'dark'
    const currentMode = document.documentElement.classList.contains('dark');
    
    // Si ya está en modo oscuro, lo cambiamos a modo claro, y viceversa
    if (currentMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }
}

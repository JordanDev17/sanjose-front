import { Component, OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { ParticlesBackgroundService } from './core/background/particles-background.service';
import { AnimatedLinesBackgroundService } from './core/background/animated-lines-background.service';
import { ThemeService } from './core/theme/theme.service'; // Asegúrate de que la ruta a tu ThemeService sea correcta
import { Observable } from 'rxjs'; // Importa Observable

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false, // Confirma que este componente NO es standalone
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'frontend';
  showParticles: boolean = true;

  isDarkMode$: Observable<boolean>; // Propiedad para observar el estado del modo oscuro

  constructor(private themeService: ThemeService, private particlesBackgroundService: ParticlesBackgroundService,  private animatedLinesBackgroundService: AnimatedLinesBackgroundService) {
    
    this.isDarkMode$ = this.themeService.darkMode$; // Asigna el observable del ThemeService
  }

  ngOnInit(): void {
    this.particlesBackgroundService.initializeParticles();
    this.animatedLinesBackgroundService.initializeLines(); 
    
    initFlowbite();
    // Suscríbete a los cambios del modo oscuro para aplicar una clase al body globalmente
    // Esto es útil si tus estilos CSS globales dependen de una clase en el <body>
  //   this.isDarkMode$.subscribe(isDark => {
  //     document.body.classList.toggle('dark-mode', isDark);
  //     // Opcional: si tienes una clase para el modo claro, puedes togglarla también
  //     document.body.classList.toggle('light-mode', !isDark);
  //   });
  }

    ngOnDestroy(): void {
    // Limpia ambos servicios cuando el componente principal se destruye
    this.particlesBackgroundService.destroyParticles(); 
    this.animatedLinesBackgroundService.destroyLines();
  }
}
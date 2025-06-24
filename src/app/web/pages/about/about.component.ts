import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  inject,
  NgZone,
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

// Servicio de tema
import { ThemeService } from '../../../core/theme/theme.service';

// Importaciones de librerías de terceros
import { CountUp } from 'countup.js';
import AOS from 'aos'; // Importa AOS
import { initFlowbite } from 'flowbite';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as L from 'leaflet';

// Registrar plugins de GSAP
gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-about',
  standalone: false,
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
})
export class AboutComponent implements OnInit, AfterViewInit, OnDestroy {
  private themeService = inject(ThemeService);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  isDarkMode$ = this.themeService.darkMode$;

  @ViewChild('empresasCount', { static: true })
  empresasCountRef!: ElementRef;
  @ViewChild('hectareasCount', { static: true })
  hectareasCountRef!: ElementRef;
  @ViewChild('empleosCount', { static: true })
  empleosCountRef!: ElementRef;
  @ViewChild('mapElement', { static: false })
  mapElementRef!: ElementRef;

  private countUpEmpresas: CountUp | undefined;
  private countUpHectareas: CountUp | undefined;
  private countUpEmpleos: CountUp | undefined;

  private map: L.Map | undefined;
  private marker: L.Marker | undefined;

  private readonly MAP_CENTER: L.LatLngExpression = [4.7078, -74.2085];
  private readonly MAP_ZOOM: number = 14;

  readonly imagePaths = {
    hero: 'assets/web/media/img/carousel_hero_1.jpg',
    carousel1: 'assets/web/media/img/parque_sanjose_1.png.jpg',
    carousel2: 'assets/web/media/img/parque_sanjose_3.jpg',
    carousel3: 'assets/web/media/img/parque_sanjose_2.jpg',
    history: 'assets/web/media/img/fachada_parque.jpg',
  };

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.ngZone.runOutsideAngular(() => {
          console.log('DEBUG: Navegación finalizada detectada. Programando reinicialización...');
          // Un pequeño retraso para asegurar que Angular ha terminado de transicionar las vistas
          setTimeout(() => {
            this.reinitializeThirdPartyLibraries();
          }, 300); // Ajustado a 300ms para mayor seguridad
        });
      });
  }

  ngOnInit(): void {
    // --- IMPORTANTE: Inicializa AOS AQUÍ Y SOLO AQUÍ si lo necesitas para esta página.
    // Si AOS se usa globalmente, inicialízalo una sola vez en el componente raíz (AppComponent).
    // Si solo lo usas aquí, asegúrate de refrescarlo o re-inicializarlo.
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
      mirror: false,
    });
    console.log('DEBUG: AOS inicializado en ngOnInit de AboutComponent.');
  }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      console.log('DEBUG: ngAfterViewInit: Inicializando librerías de terceros...');
      // Aseguramos que GSAP establezca el estado inicial antes de cualquier renderizado
      // para evitar destellos o estados intermedios.
      setTimeout(() => {
        // La sección CTA sí requiere un estado inicial oculto.
        const ctaSection = document.querySelector(".cta-section");
        if (ctaSection) {
            gsap.set(ctaSection, { opacity: 0, y: 50 });
            console.log("DEBUG: GSAP .set() inicial aplicado para .cta-section en ngAfterViewInit.");
        } else {
            console.warn("ADVERTENCIA: No se encontró el elemento .cta-section para el GSAP .set() inicial.");
        }

        this.reinitializeThirdPartyLibraries();
      }, 100); // Pequeño retraso para dar tiempo al DOM a cargarse
    });
  }

  ngOnDestroy(): void {
    console.log('DEBUG: ngOnDestroy: Limpiando recursos...');
    this.destroyMap();
    
    // --- LIMPIEZA CRÍTICA DE GSAP Y SCROLLTRIGGER ---
    // Mata todos los ScrollTriggers creados para evitar que sigan ejecutándose en otras páginas.
    ScrollTrigger.getAll().forEach((st) => st.kill());
    console.log('DEBUG: Todos los ScrollTriggers de GSAP eliminados.');
    
    // Si estás usando GSAP para otras animaciones que no son ScrollTrigger,
    // considera también un gsap.killTweensOf() si es necesario, aunque `ScrollTrigger.getAll().forEach((st) => st.kill())`
    // suele ser suficiente para problemas de scroll.

    // --- LIMPIEZA CRÍTICA DE AOS ---
    // AOS no tiene un método `destroy` directo, pero `refresh` con un retraso
    // a veces ayuda, o puedes intentar un `AOS.refresh(true)` si eso ayuda a reevaluar.
    // Sin embargo, si AOS se inicializa globalmente (ej: en AppComponent), no lo inicialices aquí.
    // Si solo lo usas aquí, un `AOS.refresh()` al salir puede ser útil para que recalcule
    // si otros elementos aparecen en otras páginas, aunque el problema puede ser el estilo inicial.
    // Si el problema persiste, considera mover AOS.init() a tu AppComponent y solo usar data-aos en el HTML.
    AOS.refresh(); 
    console.log('DEBUG: AOS actualizado en ngOnDestroy.');
  }

  private reinitializeThirdPartyLibraries(): void {
    console.log('DEBUG: Ejecutando reinitializeThirdPartyLibraries...');

    initFlowbite();
    console.log('DEBUG: Flowbite inicializado.');

    this.destroyMap(); // Asegúrate de destruir el mapa antes de re-inicializarlo
    this.initMap();

    // No matamos los ScrollTriggers aquí porque ya se deben haber matado en ngOnDestroy
    // OJO: Si estás navegando entre este componente y otras rutas y volviendo a este,
    // y quieres que las animaciones se repitan, podrías necesitar un `ScrollTrigger.refresh()`
    // después de inicializar las animaciones.
    this.initGSAPAnimations();

    this.initCountUps();

    // Este refresh es para asegurar que ScrollTrigger recalcula las posiciones
    // después de que todos los elementos y estilos se han cargado y las animaciones
    // iniciales se han aplicado. Es crucial para el comportamiento correcto del scroll.
    setTimeout(() => {
      ScrollTrigger.refresh(true); // Fuerza un refresh completo y recalcula todas las posiciones
      AOS.refresh(); // Refresca AOS también
      console.log('DEBUG: ScrollTrigger y AOS actualizados después de que el DOM se asentó (retraso de 500ms).');
    }, 500); // Un delay generoso para que el DOM se asiente
  }

  private initCountUps(): void {
    const countUpOptions = {
      separator: '.',
      decimal: ',',
      suffix: '+',
      duration: 2.5,
      enableScrollSpy: false, // Desactiva ScrollSpy nativo de CountUp si usas GSAP ScrollTrigger
    };

    if (this.empresasCountRef?.nativeElement && this.hectareasCountRef?.nativeElement && this.empleosCountRef?.nativeElement) {
      // Solo crea nuevas instancias si no existen para evitar duplicados en re-inicializaciones
      this.countUpEmpresas = this.countUpEmpresas || new CountUp(this.empresasCountRef.nativeElement, 50, countUpOptions);
      this.countUpHectareas = this.countUpHectareas || new CountUp(this.hectareasCountRef.nativeElement, 250, countUpOptions);
      this.countUpEmpleos = this.countUpEmpleos || new CountUp(this.empleosCountRef.nativeElement, 500, countUpOptions);

      // Crea el ScrollTrigger para los CountUps. 
      // Si ya existía uno (por una navegación previa sin limpieza), `ScrollTrigger.getAll().forEach((st) => st.kill())`
      // se encargará de él.
      ScrollTrigger.create({
        trigger: '.stats-section',
        start: 'top 80%',
        once: true,
        onEnter: () => {
          console.log('DEBUG: Sección de estadísticas en vista. Iniciando CountUps...');
          if (this.countUpEmpresas && !this.countUpEmpresas.error) this.countUpEmpresas.start();
          if (this.countUpHectareas && !this.countUpHectareas.error) this.countUpHectareas.start();
          if (this.countUpEmpleos && !this.countUpEmpleos.error) this.countUpEmpleos.start();
        },
        // markers: true // Descomentar para depuración
      });
      console.log('DEBUG: ScrollTrigger de CountUp creado.');
    } else {
      console.warn("ADVERTENCIA: initCountUps: Referencias de ElementRef para CountUp no encontradas. Revisa tu HTML.");
    }
  }

  private initMap(): void {
    const mapElement = document.getElementById('map');

    if (mapElement && !this.map) { // Asegúrate de que el mapa no se haya inicializado ya
      console.log('DEBUG: Inicializando mapa Leaflet...');
      this.map = L.map(mapElement, {
        center: this.MAP_CENTER,
        zoom: this.MAP_ZOOM,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.map);

      this.marker = L.marker(this.MAP_CENTER)
        .addTo(this.map)
        .bindPopup('<b>Parque Industrial San José</b><br>Funza, Cundinamarca - Vía Siberia')
        .openPopup();

      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
          console.log('DEBUG: Mapa Leaflet invalidó el tamaño después de la inicialización (retraso de 50ms).');
        }
      }, 50);

      const mapSection = document.querySelector("#map-section");
      if (mapSection) {
          gsap.from(mapSection, {
            opacity: 0,
            y: 50,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: mapSection,
              start: 'top 70%',
              toggleActions: 'play none none reverse',
              // markers: true
            },
          });
          console.log('DEBUG: Animación GSAP creada para #map-section.');
      } else {
          console.warn("ADVERTENCIA: No se encontró el objetivo GSAP #map-section.");
      }

    } else if (!mapElement) {
      console.warn("ADVERTENCIA: initMap: Elemento de mapa con ID 'map' no encontrado en el DOM.");
    } else if (this.map) {
      console.log("DEBUG: Mapa ya inicializado. Invalidando tamaño.");
      this.map.invalidateSize();
    }
  }

  private destroyMap(): void {
    if (this.map) {
      this.map.remove();
      this.map = undefined;
      console.log('DEBUG: Mapa Leaflet destruido.');
    }
  }
  
  private initGSAPAnimations(): void {
    console.log('DEBUG: Inicializando animaciones GSAP...');


   


    const ctaSection = document.querySelector(".cta-section");
    if (ctaSection) {
        gsap.from(ctaSection, {
            opacity: 0,
            y: 50,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: ctaSection,
                start: "top 85%",
                toggleActions: "play none none reverse",
            }
        });
        console.log('DEBUG: Animación GSAP creada para .cta-section.');
    } else {
        console.warn("ADVERTENCIA: No se encontró el objetivo GSAP .cta-section.");
    }
  }
}
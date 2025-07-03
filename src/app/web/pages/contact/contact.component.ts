// src/app/web/pages/contact/contact.component.ts
import { Component, OnInit, OnDestroy, AfterViewInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactService, ContactFormData, ApiResponse } from '../../services/contact.service';
import { catchError, finalize } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';

// Importamos GSAP y AOS
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
gsap.registerPlugin(ScrollToPlugin);
import AOS from 'aos';

// Importamos Leaflet
import * as L from 'leaflet';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
  standalone: false
})
export class ContactComponent implements OnInit, OnDestroy, AfterViewInit {

  contactForm!: FormGroup;
  isLoading: boolean = false;
  responseMessage: string = '';
  isSuccess: boolean | null = null;

  private map: L.Map | undefined;
  private subscriptions: Subscription[] = [];
  private gsapCtx: gsap.Context | undefined; // Para el contexto de GSAP

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
    console.log('Página de contacto inicializada (ngOnInit).');

    window.scrollTo(0, 0);
  }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        // 1. Inicialización y Refresh de AOS
        AOS.init({
          duration: 1000,
          once: true,
          offset: 50,
          delay: 0
        });
        AOS.refresh();
        console.log('AOS inicializado y refrescado en ngAfterViewInit (con delay).');

        // 2. Animaciones GSAP con Contexto
        if (this.gsapCtx) {
            this.gsapCtx.revert();
            this.gsapCtx = undefined;
        }

        this.gsapCtx = gsap.context(() => {
          const titleElement = document.querySelector('.main-title');
          if (titleElement) {
            const text = titleElement.textContent;
            if (text) {
              const tempDiv = document.createElement('div');
              tempDiv.className = 'text-blue-600 dark:text-blue-400';
              document.body.appendChild(tempDiv);
              const accentColor = getComputedStyle(tempDiv).color;
              document.body.removeChild(tempDiv);

              const words = text.split(' ').map(word => `<span class="word-split inline-block relative overflow-hidden">${word}</span>`).join(' ');
              titleElement.innerHTML = words;

              const tl = gsap.timeline({ delay: 0.2 });

              // **** CAMBIO AQUÍ: Usar autoAlpha en lugar de opacity ****
              tl.fromTo(".main-title .word-split",
                { y: 100, autoAlpha: 0, rotationX: -90, transformOrigin: "bottom center" }, // autoAlpha: 0 para que empiece invisible
                {
                  y: 0,
                  autoAlpha: 1, // autoAlpha: 1 para que se haga visible
                  rotationX: 0,
                  stagger: 0.1,
                  duration: 1.2,
                  ease: "back.out(1.7)"
                }
              )
              .to(".main-title .word-split", {
                textShadow: `0 0 10px ${accentColor}`,
                repeat: -1,
                yoyo: true,
                duration: 1.5,
                ease: "power1.inOut",
                stagger: {
                  each: 0.1,
                  from: "random"
                }
              }, ">-0.5");
            }
          }

          // **** CAMBIO AQUÍ: Usar autoAlpha en lugar de opacity ****
          gsap.from(".hero-paragraph", {
            autoAlpha: 0, // autoAlpha: 0 para que empiece invisible
            y: 30,
            duration: 1,
            ease: "power3.out",
            stagger: 0.2,
            delay: 1.5
          });
          console.log('Animaciones GSAP inicializadas en ngAfterViewInit (con delay).');
        });

        // 3. Inicialización del Mapa de Leaflet
        this.initMap();

      }, 100); // Pequeño retraso de 100ms
    });
  }

  get f() { return this.contactForm.controls; }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      this.ngZone.run(() => {
        this.responseMessage = 'Por favor, corrige los errores en el formulario antes de enviar.';
        this.isSuccess = false;
      });
      console.warn('Intento de envío de formulario inválido.');
      return;
    }

    this.isLoading = true;
    this.responseMessage = '';
    this.isSuccess = null;

    const formData: ContactFormData = this.contactForm.value;

    const submissionSubscription = this.contactService.sendEmail(formData).pipe(
      catchError(error => {
        console.error('Error al enviar el mensaje:', error);
        return this.ngZone.run(() => {
            this.responseMessage = error.error?.message || 'Hubo un error al enviar el mensaje. Inténtalo de nuevo más tarde.';
            this.isSuccess = false;
            return of(null);
        });
      }),
      finalize(() => {
        this.ngZone.run(() => {
            this.isLoading = false;
        });
      })
    ).subscribe(response => {
      this.ngZone.run(() => {
          if (response && response.success) {
            this.responseMessage = response.message;
            this.isSuccess = true;
            this.contactForm.reset();
            Object.keys(this.contactForm.controls).forEach(key => {
              this.contactForm.get(key)?.setErrors(null);
            });
            console.log('Mensaje enviado con éxito:', response.message);
          } else if (response === null) {
            console.warn('La suscripción terminó con un error (manejado).');
          } else {
            this.responseMessage = response?.message || 'Hubo un error desconocido al enviar el mensaje.';
            this.isSuccess = false;
            console.error('Respuesta de envío no exitosa:', response);
          }
      });
    });

    this.subscriptions.push(submissionSubscription);
  }

  private initMap(): void {
    const mapElement = document.getElementById('map');

    if (!mapElement) {
        console.error('Error: El elemento HTML con ID "map" no fue encontrado. Asegúrate de que existe en el template del componente.');
        return;
    }

    const checkMapDimensionsAndInit = () => {
        if (mapElement.offsetWidth === 0 || mapElement.offsetHeight === 0) {
            console.warn('El contenedor del mapa (#map) tiene dimensiones cero. Reintentando en 50ms...');
            setTimeout(checkMapDimensionsAndInit, 50);
            return;
        }

        try {
            if (this.map) {
                this.map.remove();
                console.log('Mapa existente removido antes de la inicialización.');
            }

            this.map = L.map('map').setView([4.739972393154803, -74.17856127701168], 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19,
            }).addTo(this.map);

            const customIcon = L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });

            L.marker([4.739972393154803, -74.17856127701168], {icon: customIcon})
                .addTo(this.map)
                .bindPopup('<b>¡Te esperamos en nuestro Parque Industrial!</b><br><span style="color: #333; background-color: #fff; padding: 2px 5px; border-radius: 3px;">Mosquera, Cundinamarca.</span>')
                .openPopup();

            // **** CAMBIO AQUÍ: Usar autoAlpha en lugar de opacity ****
            gsap.fromTo("#map",
                { autoAlpha: 0, scale: 0.9, y: 50 }, // autoAlpha: 0 para que empiece invisible
                { autoAlpha: 1, scale: 1, y: 0, duration: 1.5, ease: "power3.out", delay: 0.2 } // autoAlpha: 1 para que se haga visible
            );

            console.log('Mapa de Leaflet inicializado correctamente.');

        } catch (error) {
            console.error('Error al inicializar el mapa de Leaflet:', error);
            this.ngZone.run(() => {
                this.responseMessage = 'No se pudo cargar el mapa. Por favor, intenta recargar la página.';
                this.isSuccess = false;
            });
        }
    };

    checkMapDimensionsAndInit();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    console.log('Todas las suscripciones del ContactComponent han sido desuscriptas.');

    if (this.gsapCtx) {
      this.gsapCtx.revert();
      console.log('Animaciones GSAP revertidas y limpiadas.');
    }

    if (this.map) {
      this.map.remove();
      this.map = undefined;
      console.log('Mapa de Leaflet destruido y recursos liberados.');
    }

    console.log('ContactComponent destruido y recursos limpiados.');
  }
}
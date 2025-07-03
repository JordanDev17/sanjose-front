// src/app/web/pages/not-found/not-found.component.ts
import { Component, OnInit, OnDestroy, AfterViewInit, NgZone, ViewChild, ElementRef } from '@angular/core';
import { gsap } from 'gsap';

@Component({
  selector: 'app-not-found',
  standalone: false,
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css'
})
export class NotFoundComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('errorCode') errorCodeElementRef!: ElementRef<HTMLElement>;
  @ViewChild('mainMessage') mainMessageElementRef!: ElementRef<HTMLElement>;
  @ViewChild('subMessage') subMessageElementRef!: ElementRef<HTMLElement>;

  private gsapCtx: gsap.Context | undefined;

  constructor(private ngZone: NgZone) { }

  ngOnInit(): void {
    // Aseguramos que la página inicie en la parte superior.
    // Esto es útil, pero no afecta directamente el FOUC o las animaciones.
    window.scrollTo(0, 0);
  }

  ngAfterViewInit(): void {
    // Es crucial que las animaciones de entrada se inicien aquí
    // ya que en este punto los elementos del DOM están completamente disponibles.
    this.ngZone.runOutsideAngular(() => {
      this.gsapCtx = gsap.context(() => {

        const tl = gsap.timeline({ delay: 0.5 }); // Pequeño delay inicial para toda la secuencia

        // Animación de entrada para el número 404
        tl.fromTo(this.errorCodeElementRef.nativeElement,
          { autoAlpha: 0, y: 50, scale: 0.8, rotationX: -90, transformOrigin: "center center" },
          { autoAlpha: 1, y: 0, scale: 1, rotationX: 0, duration: 1.2, ease: "back.out(1.7)" }
        )
        // Animación de entrada para el mensaje principal
        .fromTo(this.mainMessageElementRef.nativeElement,
          { autoAlpha: 0, y: 30 },
          { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out" },
          ">-0.5" // Inicia 0.5 segundos antes de que termine la animación anterior
        )
        // Animación de entrada para el mensaje secundario
        .fromTo(this.subMessageElementRef.nativeElement,
          { autoAlpha: 0, y: 30 },
          { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out" },
          ">-0.4" // Inicia 0.4 segundos antes de que termine la animación anterior
        )
        // Animación de entrada para el botón
        .fromTo('.home-button',
          { autoAlpha: 0, scale: 0.8 },
          { autoAlpha: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" },
          ">-0.3" // Inicia 0.3 segundos antes de que termine la animación anterior
        );

        // Eliminamos la animación de GSAP para las líneas de fondo aquí
        // y la dejamos completamente en CSS para mayor eficiencia.

      }, this.errorCodeElementRef); // Contexto para el componente. Es buena práctica apuntar a un elemento raíz.
    });
  }

  ngOnDestroy(): void {
    if (this.gsapCtx) {
      this.gsapCtx.revert();
      this.gsapCtx = undefined;
      console.log('Animaciones de NotFoundComponent revertidas y limpiadas.');
    }
  }
}
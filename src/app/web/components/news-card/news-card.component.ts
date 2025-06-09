// src/app/web/components/news-card/news-card.component.ts
import { Component, OnInit, Input, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { News } from '../../models/news.model'; // Asegúrate que la ruta a tu modelo News sea correcta
import { gsap } from 'gsap'; // Importa la librería GSAP
import { ScrollTrigger } from 'gsap/ScrollTrigger'; // Importa el plugin ScrollTrigger para animaciones al hacer scroll

// Importación dinámica de initFlowbite. Esto es clave para que Flowbite funcione.
// TypeScript podría quejarse si no hay un archivo de declaración de tipos para Flowbite directamente en 'flowbite',
// pero debería funcionar en tiempo de ejecución si la librería está instalada.
// Si sigues teniendo un error de 'no tiene un default export', intenta:
// import * as Flowbite from 'flowbite'; o import { initFlowbite } from 'flowbite';
// La forma más robusta es con import() como se muestra.
declare const initFlowbite: any; // Declara la función global de Flowbite si se carga vía script en index.html

gsap.registerPlugin(ScrollTrigger); // Registra el plugin ScrollTrigger

@Component({
  selector: 'app-news-card',
  standalone: false,
  templateUrl: './news-card.component.html',
  styleUrls: ['./news-card.component.css']
})
export class NewsCardComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() news!: News; // Propiedad de entrada para recibir los datos de la noticia

  @ViewChild('card') cardElement!: ElementRef; // Referencia al elemento DIV de la tarjeta para animaciones GSAP

  constructor() { }

  ngOnInit(): void {
    // Aquí puedes realizar cualquier lógica de inicialización o pre-procesamiento de datos.
  }

  ngAfterViewInit(): void {
        // Llama a initFlowbite después de que la vista se haya inicializado
    // para que Flowbite pueda escanear el DOM y activar sus componentes.
    // Usamos un pequeño timeout para asegurarnos de que el DOM esté completamente listo.
    setTimeout(() => {
      // Verifica si initFlowbite está disponible globalmente (si lo cargaste via script en index.html)
      if (typeof initFlowbite !== 'undefined') {
        initFlowbite();
      } else {
        // Alternativa: Si cargaste Flowbite como módulo y lo importaste en tu ts,
        // podrías necesitar algo como Flowbite.initFlowbite();
        // Depende de cómo esté configurado tu Flowbite.
        // Si tienes el import 'flowbite' en tu main.ts o app.module.ts, o si usas el script en index.html.
        // Lo más común es el script en index.html, que expone initFlowbite globalmente.
      }
    }, 0);

    // Animación de entrada de la tarjeta con GSAP al hacer scroll
    gsap.from(this.cardElement.nativeElement, {
      opacity: 0,         // La animación comienza con la tarjeta completamente transparente
      y: 50,              // La tarjeta comienza 50 píxeles más abajo de su posición final
      duration: 0.8,      // La duración de la animación es de 0.8 segundos
      ease: 'power3.out', // Un tipo de easing que hace que la animación sea suave y natural al final
      delay: 0.1,         // Un pequeño retraso para que las tarjetas no aparezcan todas al mismo tiempo
      scrollTrigger: {    // Configuración para que la animación se active al hacer scroll
        trigger: this.cardElement.nativeElement, // El elemento que "observa" el ScrollTrigger
        start: 'top 85%', // La animación se dispara cuando la parte superior de la tarjeta alcanza el 85% del viewport
        toggleActions: 'play none none none' // Define cuándo se reproduce la animación: 'play' al entrar, y luego no se revierte ni se repite
      }
    });
  }

  ngOnDestroy(): void {
    // Este hook se ejecuta justo antes de que Angular destruya el componente.
    // Es el lugar para limpiar recursos, como desuscribirse de observables o
    // "matar" animaciones GSAP si fueran persistentes o complejas.
  }

  /**
   * Formatea una cadena de fecha ISO 8601 a un formato legible en español.
   * @param dateString La cadena de fecha a formatear (ej. "2023-10-27T10:00:00Z").
   * @returns La fecha formateada (ej. "27 de octubre de 2023").
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  /**
   * Maneja el evento de error cuando la imagen destacada no se carga correctamente.
   * Reemplaza la URL de la imagen por una de placeholder para evitar imágenes rotas.
   * @param event El evento de error del elemento <img>.
   */
  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/web/media/img/logo-screen.png';
  }
}
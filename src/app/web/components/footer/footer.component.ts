// src/app/web/components/footercomponent/footercomponent.ts
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// Importaciones para las animaciones con GSAP
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger'; // Para animaciones al hacer scroll
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'; // Para el scroll suave
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin); // Registra ambos plugins

@Component({
  selector: 'app-footer', // Asegúrate que el selector sea 'app-footercomponent'
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit, AfterViewInit {

  currentYear: number = new Date().getFullYear();

  footerLinkSections = [
    {
      title: 'Compañía',
      links: [
        { name: 'Acerca de Nosotros', url: '/about' },
        { name: 'Nuestros Servicios', url: '/services' },
        { name: 'Contacto', url: '/contact' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Política de Privacidad', url: '/privacy-policy' },
        { name: 'Términos y Condiciones', url: '/terms' },
        { name: 'Política de Cookies', url: '/cookies' }
      ]
    },
    {
      title: 'Recursos',
      links: [
        { name: 'Blog', url: '/blog' },
        { name: 'Soporte', url: '/support' },
        { name: 'Preguntas Frecuentes', url: '/faq' }
      ]
    }
  ];

  constructor() { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    // Animación de entrada principal del footer con GSAP
    gsap.from("#main-footer", {
      opacity: 0,
      y: 80, // Más desplazamiento para un efecto más dramático
      duration: 1.2, // Mayor duración
      ease: "power4.out", // Easing más pronunciado
      delay: 0.3,
      // Usaremos ScrollTrigger para que el footer aparezca cuando sea visible
      scrollTrigger: {
        trigger: "#main-footer",
        start: "top bottom-=100px", // Cuando el top del footer entra a 100px del fondo del viewport
        toggleActions: "play none none none", // Solo reproduce la animación una vez
        // markers: true, // Descomenta para depuración visual
      }
    });

    // Animación para el botón de 'Volver arriba' (aparece cuando se hace scroll)
    gsap.from("#back-to-top-btn", {
      opacity: 0,
      scale: 0.5,
      y: 50,
      duration: 0.6,
      ease: "back.out(1.7)",
      scrollTrigger: {
        trigger: "body", // El trigger es el cuerpo de la página
        start: "top top-=200px", // Cuando el usuario ha hecho scroll 200px hacia abajo desde el top
        end: "bottom top+=200px", // Se mantiene visible hasta el final, y se esconde si el scroll sube mucho
        toggleActions: "play none reverse none", // Reproduce, no hace nada, revierte, no hace nada
        // markers: true // Solo para depuración
      }
    });
  }

  /**
   * Desplaza la ventana al principio de la página con una animación suave.
   * Utiliza GSAP con el plugin ScrollToPlugin.
   */
  scrollToTop(): void {
    gsap.to(window, {
      duration: 1.2, // Duración del scroll
      scrollTo: {
        y: 0, // Posición Y a la que scrollear (0 es el top)
        autoKill: false // No mata la animación si el usuario scrollea manualmente
      },
      ease: "power2.inOut" // Easing para un scroll suave
    });
  }
}
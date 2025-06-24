// src/app/web/components/news-card/news-card.component.ts
import { Component, OnInit, Input, OnDestroy, AfterViewInit, ElementRef, ViewChild, HostListener, Output, EventEmitter } from '@angular/core';
import { News } from '../../models/news.model';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

declare const initFlowbite: any;

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-news-card',
  standalone: false,
  templateUrl: './news-card.component.html',
  styleUrls: ['./news-card.component.css']
})
export class NewsCardComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() news!: News;
  @Output() cardClicked = new EventEmitter<News>();

  @ViewChild('card') cardElement!: ElementRef;

  private hoverTween: gsap.core.Tween | null = null; // Para controlar la animación de hover

  constructor() { }

  ngOnInit(): void {
    // console.log('News Card Init:', this.news.titulo);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (typeof initFlowbite !== 'undefined') {
        initFlowbite();
      } else {
        console.warn('Flowbite global initFlowbite not found. Ensure Flowbite script is loaded.');
      }
    }, 0);

    gsap.from(this.cardElement.nativeElement, {
      opacity: 0,
      y: 50,
      duration: 0.8,
      ease: 'power3.out',
      delay: 0.1,
      scrollTrigger: {
        trigger: this.cardElement.nativeElement,
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });

    // Definir la animación de hover pero sin ejecutarla inmediatamente.
    // Usamos el 'boxShadow' para la sombra dinámica que querías con GSAP.
    this.hoverTween = gsap.to(this.cardElement.nativeElement, {
      boxShadow: '0px 15px 30px rgba(0,0,0,0.25)', // Sombra más pronunciada en hover
      duration: 0.3,
      ease: 'power2.out',
      paused: true // La animación está pausada por defecto
    });
  }

  ngOnDestroy(): void {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    // Asegurarse de limpiar la animación de hover si existe
    if (this.hoverTween) {
      this.hoverTween.kill();
    }
  }

  // Animación al pasar el ratón sobre la tarjeta
  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (this.hoverTween) {
      this.hoverTween.play(); // Reproduce la animación de sombra al entrar
    }
  }

  // Animación al quitar el ratón de la tarjeta
  @HostListener('mouseleave')
  onMouseLeave(): void {
    if (this.hoverTween) {
      this.hoverTween.reverse(); // Revierte la animación de sombra al salir
    }
  }

  onCardClick(): void {
    this.cardClicked.emit(this.news);
  }

  formatDate(isoDate: string): string {
    if (!isoDate) {
      return '';
    }
    const date = new Date(isoDate);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/web/media/img/logo-screen.png';
  }
}
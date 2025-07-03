import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service'; // AuthService
import { ThemeService } from '../../../core/theme/theme.service'; // AuthService
import { User } from '../../models/user.model'; // Model user
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import AOS from 'aos'; // Importa AOS
import { gsap } from 'gsap'; // Importa GSAP
import { CountUp } from 'countup.js'; // Importa CountUp

@Component({
  selector: 'app-dashboard-home',
  standalone: false, // Este componente no es standalone
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit, AfterViewInit, OnDestroy {
  currentUser: User | null = null;
  darkMode$: Observable<boolean>;
  private userSubscription: Subscription | undefined;

  currentYear: number = new Date().getFullYear();

  // Aquí podrías obtener estos datos de tu backend
  newsCount: number = 7;
  warehousesCount: number =7;
  usersCount: number = 2;

  // ¡CAMBIO EN EL CONSTRUCTOR!
  constructor(
    private authService: AuthService,
    private themeService: ThemeService // Inyecta el ThemeService
  ) {
    this.darkMode$ = this.themeService.darkMode$; // Usa el observable del ThemeService
  }

  ngOnInit(): void {
    // Suscribirse al usuario actual para mostrar su nombre y rol
    this.userSubscription = this.authService.currentUser$.subscribe(
      user => {
        this.currentUser = user;
      }
    );

    // Inicializar AOS
    AOS.init({
      duration: 800,
      easing: 'ease-out-quad',
      once: true,
      mirror: false
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.animateHeader();
      this.animateCounters();
    }, 0);
  }

  animateHeader(): void {
    if (this.currentUser) {
      gsap.from(".welcome-title", {
        opacity: 0,
        y: -50,
        duration: 1,
        ease: "power3.out",
        delay: 0.5
      });
      gsap.from(".role-text", {
        opacity: 0,
        y: -30,
        duration: 1,
        ease: "power3.out",
        delay: 0.7
      });
      gsap.from(".tagline", {
        opacity: 0,
        y: -20,
        duration: 1,
        ease: "power3.out",
        delay: 0.9
      });
      gsap.from(".icon-dashboard", {
        opacity: 0,
        scale: 0.5,
        duration: 1.2,
        ease: "back.out(1.7)",
        delay: 1.2
      });
      gsap.fromTo(".pattern-dots",
        { opacity: 0, scale: 0.8 },
        { opacity: 0.2, scale: 1, duration: 1.5, ease: "power2.out", delay: 1 }
      );
    }
  }

  animateCounters(): void {
    const newsCountEl = document.getElementById('newsCount');
    if (newsCountEl) {
      const newsCountUp = new CountUp('newsCount', this.newsCount, {
        duration: 6.5,
      });
      if (!newsCountUp.error) {
        newsCountUp.start();
      } else {
        console.error(newsCountUp.error);
      }
    }

    const warehousesCountEl = document.getElementById('warehousesCount');
    if (warehousesCountEl) {
      const warehousesCountUp = new CountUp('warehousesCount', this.warehousesCount, {
        duration: 6.5
      });
      if (!warehousesCountUp.error) {
        warehousesCountUp.start();
      } else {
        console.error(warehousesCountUp.error);
      }
    }

    const usersCountEl = document.getElementById('usersCount');
    if (usersCountEl) {
      const usersCountUp = new CountUp('usersCount', this.usersCount, {
        duration: 2.5
      });
      if (!usersCountUp.error) {
        usersCountUp.start();
      } else {
        console.error(usersCountUp.error);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
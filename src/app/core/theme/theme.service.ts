// src/app/core/theme/theme.service.ts
import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkModeSubject = new BehaviorSubject<boolean>(false);
  darkMode$: Observable<boolean> = this.darkModeSubject.asObservable();

  private renderer: Renderer2;

  constructor(private rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.darkModeSubject.next(savedTheme === 'dark');
      this.applyTheme(savedTheme === 'dark');
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.darkModeSubject.next(true);
      this.applyTheme(true);
    }
  }

  toggleDarkMode(): void {
    const isDark = !this.darkModeSubject.getValue();
    this.darkModeSubject.next(isDark);
    this.applyTheme(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  private applyTheme(isDark: boolean): void {
    if (isDark) {
      this.renderer.addClass(document.documentElement, 'dark');
    } else {
      this.renderer.removeClass(document.documentElement, 'dark');
    }
  }

  // --- ¡AÑADE ESTE NUEVO MÉTODO! ---
  isDarkMode(): boolean {
    return this.darkModeSubject.getValue();
  }
}
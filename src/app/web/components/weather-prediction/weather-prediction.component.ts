// src/app/components/weather-prediction/weather-prediction.component.ts
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, NgZone, AfterViewInit, QueryList, ViewChildren } from '@angular/core';
import { FormControl } from '@angular/forms';
import { WeatherService } from '../../services/weather.service';
import { CitySuggestion, WeatherData, DailyForecastItem } from '../../models/weather.model';
import { debounceTime, distinctUntilChanged, switchMap, catchError, takeUntil, finalize } from 'rxjs/operators';
import { Subject, of, BehaviorSubject } from 'rxjs';
import { gsap } from 'gsap';

@Component({
  selector: 'app-weather-prediction',
  standalone: false, 
  templateUrl: './weather-prediction.component.html',
  styleUrls: ['./weather-prediction.component.css']
})
export class WeatherPredictionComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('containerRef') containerRef!: ElementRef;
  @ViewChild('titleRef') titleRef!: ElementRef;
  @ViewChild('suggestionsRef') suggestionsRef!: ElementRef;
  @ViewChild('errorRef') errorRef!: ElementRef;
  @ViewChild('currentWeatherRef') currentWeatherRef!: ElementRef;
  @ViewChild('weatherIconRef') weatherIconRef!: ElementRef;
  @ViewChild('forecastContainer') forecastContainer!: ElementRef;
  @ViewChildren('forecastCardRef') forecastCardRefs!: QueryList<ElementRef>;

  searchControl = new FormControl('');
  citySuggestions: CitySuggestion[] = [];
  showSuggestions = false;
  loading = false;
  error: string | null = null;
  localTime: string = '';

  // Usamos BehaviorSubject para `weatherData` para que el `async` pipe pueda suscribirse
  // y para que podamos controlar cuándo emitimos nuevos valores.
  private weatherDataSubject = new BehaviorSubject<WeatherData | null>(null);
  weatherData$ = this.weatherDataSubject.asObservable(); // Observable público para el template

  hasCurrentWeather: boolean = false; // Flag para *ngIf
  hasForecast: boolean = false; // Flag para *ngIf

  private destroy$ = new Subject<void>(); // Subject para gestionar la desuscripción
  private dailyForecasts: DailyForecastItem[] = []; // Cache for aggregated daily forecasts

  constructor(private weatherService: WeatherService, private ngZone: NgZone) {}

  ngOnInit(): void {
    // Suscripción al `searchControl` para las sugerencias
    this.searchControl.valueChanges.pipe(
      debounceTime(300), // Espera 300ms después de la última pulsación
      distinctUntilChanged(), // Solo emite si el valor actual es diferente al anterior
      switchMap(query => {
        if (query) {
          this.showSuggestions = true;
          this.loading = true;
          this.error = null;
          return this.weatherService.searchCities(query).pipe(
            catchError(err => {
              this.error = 'Error al buscar ciudades.';
              this.loading = false;
              return of([]); // Devuelve un observable vacío en caso de error
            }),
            finalize(() => this.loading = false) // Asegura que `loading` se ponga a false
          );
        } else {
          this.showSuggestions = false;
          return of([]);
        }
      }),
      takeUntil(this.destroy$) // Desuscribe al destruir el componente
    ).subscribe(suggestions => {
      this.citySuggestions = suggestions;
    });

    // Iniciar la carga del clima por defecto (Bogotá)
    this.loadWeatherForCoordinates(4.739972393154803, -74.17856127701168, 'Funza, Colombia'); // Bogotá por defecto
  }

  ngAfterViewInit(): void {
    // Las animaciones de GSAP se pueden inicializar aquí si los elementos ya están presentes.
    // Para elementos condicionales, se deben llamar después de que el *ngIf los haya renderizado.
    this.animateContainerEntrance();
    this.animateTitleShadow();

    // Suscribirse a cambios en weatherData$ para activar animaciones
    this.weatherData$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(data => {
      if (data) {
        // Ejecutar animaciones dentro de ngZone para asegurar que GSAP se ejecuta fuera del ciclo de detección de cambios
        this.ngZone.runOutsideAngular(() => {
          // Usamos setTimeout(0) para asegurarnos de que Angular haya renderizado los *ngIf
          // antes de intentar animar los elementos del DOM.
          setTimeout(() => {
            if (this.currentWeatherRef?.nativeElement) {
              this.animateCurrentWeather(this.currentWeatherRef.nativeElement);
            }
            if (this.weatherIconRef?.nativeElement) {
              this.animateWeatherIcon(this.weatherIconRef.nativeElement);
            }
            if (this.forecastContainer?.nativeElement && this.forecastCardRefs.length > 0) {
              this.animateForecastCards(this.forecastCardRefs.toArray());
            }
          }, 0);
        });
      }
    });

    // Manejo de la desaparición del error
    this.weatherData$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(data => {
      if (data && this.errorRef?.nativeElement) {
        this.ngZone.runOutsideAngular(() => {
          gsap.to(this.errorRef.nativeElement, {
            opacity: 0,
            height: 0,
            duration: 0.5,
            onComplete: () => {
              this.ngZone.run(() => { // Vuelve a la zona de Angular para actualizar `error`
                this.error = null;
              });
            }
          });
        });
      }
    });
  }

  ngOnDestroy(): void {
    // Desuscribir todos los observables para prevenir fugas de memoria
    this.destroy$.next();
    this.destroy$.complete();

    // Limpiar todas las animaciones de GSAP asociadas a los elementos del DOM
    this.ngZone.runOutsideAngular(() => {
      gsap.killTweensOf(this.containerRef?.nativeElement);
      gsap.killTweensOf(this.titleRef?.nativeElement);
      gsap.killTweensOf(this.suggestionsRef?.nativeElement);
      gsap.killTweensOf(this.errorRef?.nativeElement);
      gsap.killTweensOf(this.currentWeatherRef?.nativeElement);
      gsap.killTweensOf(this.weatherIconRef?.nativeElement);
      if (this.forecastCardRefs) {
        this.forecastCardRefs.forEach(cardRef => {
          gsap.killTweensOf(cardRef.nativeElement);
        });
      }
    });
  }

  // --- Lógica de Búsqueda y Sugerencias ---
  onSearchFocus(): void {
    // Muestra sugerencias solo si hay una consulta y resultados
    if (this.searchControl.value && this.citySuggestions.length > 0) {
      this.showSuggestions = true;
    }
  }

  onSearchBlur(): void {
    // Retrasa el ocultamiento para permitir clic en sugerencia
    setTimeout(() => {
      this.hideSuggestionsWithAnimation();
    }, 150);
  }

  selectCitySuggestion(suggestion: CitySuggestion): void {
    this.searchControl.setValue(suggestion.name, { emitEvent: false }); // No emitir evento para evitar re-trigger de la búsqueda
    this.hideSuggestionsWithAnimation();
    this.loadWeatherForCoordinates(suggestion.lat, suggestion.lon, `${suggestion.name}${suggestion.state ? ', ' + suggestion.state : ''}, ${suggestion.country}`);
  }

  // --- Carga de Datos del Clima ---
  loadWeatherForCoordinates(lat: number, lon: number, locationName: string): void {
    this.loading = true;
    this.error = null;
    this.weatherDataSubject.next(null); // Limpiar datos previos
    this.hasCurrentWeather = false;
    this.hasForecast = false;

    this.weatherService.getWeatherAndForecast(lat, lon).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.loading = false),
      catchError(err => {
        this.error = err.message || 'No se pudo obtener el clima para la ubicación seleccionada.';
        return of(null);
      })
    ).subscribe(data => {
      if (data) {
        const fullWeatherData: WeatherData = {
          currentWeather: data.current,
          fiveDayForecast: data.forecast,
          locationName: data.locationName, // Usar el nombre de ubicación resuelto
          lat: lat,
          lon: lon
        };
        this.weatherDataSubject.next(fullWeatherData);
        this.hasCurrentWeather = true;
        this.hasForecast = true;
        this.updateLocalTime(data.current.timezone); // Actualizar hora local

        // Pre-calcular el pronóstico diario para evitar llamadas repetidas en el template
        this.dailyForecasts = this.aggregateDailyForecasts(data.forecast.list);
      } else {
        this.weatherDataSubject.next(null);
        this.hasCurrentWeather = false;
        this.hasForecast = false;
      }
    });
  }

  // --- Funciones Auxiliares ---
  getWeatherIconUrl(iconCode: string | undefined): string {
    return iconCode ? `https://openweathermap.org/img/wn/${iconCode}@2x.png` : 'assets/default-weather.png'; // Proporcionar un icono por defecto
  }

  getCurrentLocationName(): string {
    const data = this.weatherDataSubject.getValue();
    return data?.locationName || 'Cargando...';
  }

  private updateLocalTime(timezoneOffsetSeconds: number): void {
    const now = new Date();
    // Obtener la hora UTC
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    // Calcular la hora local ajustada por el offset de la zona horaria de la ciudad
    const localCityTime = new Date(utcTime + (timezoneOffsetSeconds * 1000));
    this.localTime = localCityTime.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h12' // 'h23' para 24h
    });
  }

  // Optimización: Agregación de pronósticos diarios para evitar lógica compleja en el template
  private aggregateDailyForecasts(forecastList: any[]): DailyForecastItem[] {
    const dailyDataMap: { [key: string]: DailyForecastItem } = {};

    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

      if (!dailyDataMap[dateKey]) {
        dailyDataMap[dateKey] = {
          dt: item.dt,
          main: { ...item.main }, // Copy main data
          weather: [{ ...item.weather[0] }], // Copy first weather item
          wind: { ...item.wind },
          temp: { min: item.main.temp, max: item.main.temp } // Initialize min/max
        };
      } else {
        // Update min/max temps for the day
        dailyDataMap[dateKey].temp.min = Math.min(dailyDataMap[dateKey].temp.min, item.main.temp_min);
        dailyDataMap[dateKey].temp.max = Math.max(dailyDataMap[dateKey].temp.max, item.main.temp_max);
        // Update main temperature with an average or the closest to midday.
        // For simplicity, we can just take the last one or average,
        // but for a true 5-day forecast, you'd pick a specific time of day (e.g., midday reading).
        // For now, let's just keep the initial `main.temp` from the first entry of the day for simplicity.
        // Or, to be more accurate, find the entry closest to noon for `main.temp`
        const existingEntryDate = new Date(dailyDataMap[dateKey].dt * 1000);
        const currentItemDate = new Date(item.dt * 1000);
        // A simple heuristic: if this item is closer to noon, update the main temp and weather
        if (Math.abs(currentItemDate.getHours() - 12) < Math.abs(existingEntryDate.getHours() - 12)) {
            dailyDataMap[dateKey].main.temp = item.main.temp;
            dailyDataMap[dateKey].weather = [{ ...item.weather[0] }];
            dailyDataMap[dateKey].wind = { ...item.wind };
        }
      }
    });

    // Convert map to array and sort by date
    const sortedForecasts = Object.values(dailyDataMap).sort((a, b) => a.dt - b.dt);

    // Limit to the next 5 days (excluding today's full forecast if it's already past a certain time)
    // A better approach would be to ensure it starts from the *next* full day.
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date

    // Filter to get unique days, starting from tomorrow
    const uniqueDays: DailyForecastItem[] = [];
    const seenDays = new Set<string>();

    for (const item of sortedForecasts) {
        const itemDate = new Date(item.dt * 1000);
        itemDate.setHours(0, 0, 0, 0);

        // Only include if it's a future day or if it's today and we don't have enough future days yet
        const dayString = itemDate.toISOString().split('T')[0];
        if (!seenDays.has(dayString) && itemDate.getTime() >= today.getTime()) {
            uniqueDays.push(item);
            seenDays.add(dayString);
        }
        if (uniqueDays.length >= 5) { // Get 5 distinct days
            break;
        }
    }

    return uniqueDays;
  }

  // Método público para que el HTML acceda a los pronósticos diarios agregados
  getDailyForecasts(forecastList: any[] | undefined): DailyForecastItem[] {
      // Si forecastList es undefined (ej. aún no hay datos), retorna el array vacío cacheado
      // O si weatherDataSubject.getValue() es null, también retorna el cacheado.
      // Esto evita llamar a aggregateDailyForecasts repetidamente si los datos no han cambiado.
      const data = this.weatherDataSubject.getValue();
      if (!data || !data.fiveDayForecast?.list || forecastList === undefined) {
          return []; // O this.dailyForecasts si prefieres mostrar el último cacheado
      }
      // Solo recalcular si los datos de pronóstico son diferentes (comparación superficial,
      // un hash más complejo sería ideal para datos grandes)
      // Para este caso, como this.dailyForecasts se actualiza en loadWeatherForCoordinates,
      // simplemente lo devolvemos aquí.
      return this.dailyForecasts;
  }


  formatForecastDate(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  // --- Animaciones GSAP ---
  private animateContainerEntrance(): void {
    if (this.containerRef?.nativeElement) {
      this.ngZone.runOutsideAngular(() => {
        gsap.from(this.containerRef.nativeElement, {
          opacity: 0,
          y: 50,
          duration: 1,
          ease: 'power3.out'
        });
      });
    }
  }

  private animateTitleShadow(): void {
    if (this.titleRef?.nativeElement) {
      this.ngZone.runOutsideAngular(() => {
        gsap.to(this.titleRef.nativeElement, {
          filter: 'drop-shadow(0px 0px 8px rgba(var(--wp-accent-rgb), 0.7))',
          repeat: -1,
          yoyo: true,
          duration: 2,
          ease: 'power1.inOut'
        });
      });
    }
  }

  private animateCurrentWeather(element: HTMLElement): void {
    this.ngZone.runOutsideAngular(() => {
      gsap.fromTo(element,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.7)' }
      );
    });
  }

  private animateWeatherIcon(element: HTMLElement): void {
    this.ngZone.runOutsideAngular(() => {
      gsap.fromTo(element,
        { rotation: 0, scale: 0.5 },
        { rotation: 360, scale: 1, duration: 1, ease: 'elastic.out(1, 0.3)' }
      );
    });
  }

  private animateForecastCards(elements: ElementRef[]): void {
    if (elements.length === 0) return;
    this.ngZone.runOutsideAngular(() => {
      gsap.from(elements.map(e => e.nativeElement), {
        opacity: 0,
        y: 20,
        stagger: 0.1, // Retraso entre la animación de cada tarjeta
        duration: 0.5,
        ease: 'power2.out'
      });
    });
  }

  private hideSuggestionsWithAnimation(): void {
    if (this.suggestionsRef?.nativeElement) {
      this.ngZone.runOutsideAngular(() => {
        gsap.to(this.suggestionsRef.nativeElement, {
          opacity: 0,
          height: 0,
          duration: 0.3,
          ease: 'power2.in',
          onComplete: () => {
            this.ngZone.run(() => { // Vuelve a la zona de Angular para actualizar showSuggestions
              this.showSuggestions = false;
              this.citySuggestions = []; // Limpia las sugerencias después de ocultar
            });
          }
        });
      });
    } else {
      // Si la referencia no existe (ej. ya estaba oculto o no renderizado), simplemente oculta
      this.showSuggestions = false;
      this.citySuggestions = [];
    }
  }
}
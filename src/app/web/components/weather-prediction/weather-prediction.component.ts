import { Component, OnInit, OnDestroy, ViewChild, ElementRef, NgZone, AfterViewInit, QueryList, ViewChildren } from '@angular/core';
import { FormControl } from '@angular/forms';
import { WeatherService } from '../../services/weather.service';
import { CitySuggestion, WeatherData, DailyForecastItem } from '../../models/weather.model';
import { debounceTime, distinctUntilChanged, switchMap, catchError, takeUntil, finalize, filter, tap } from 'rxjs/operators';
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

  private weatherDataSubject = new BehaviorSubject<WeatherData | null>(null);
  weatherData$ = this.weatherDataSubject.asObservable();

  // No necesitamos 'hasCurrentWeather' y 'hasForecast' como flags separados
  // ya que el *ngIf puede depender directamente de weatherData$
  // Sin embargo, si los mantienes para un control más granular, está bien.
  // Los dejaré para no romper tu lógica si los usas en otros lugares.
  hasCurrentWeather: boolean = false;
  hasForecast: boolean = false;

  private destroy$ = new Subject<void>();
  private dailyForecasts: DailyForecastItem[] = [];

  // Nuevo flag para controlar si se está cargando por una búsqueda.
  // Esto puede ayudar a diferenciar la carga inicial de una búsqueda para animaciones.
  private isSearching: boolean = false;

  constructor(private weatherService: WeatherService, private ngZone: NgZone) {}

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(query => { // Usamos tap para poner isSearching a true ANTES de switchMap
        if (query) {
          this.isSearching = true; // Indica que se inició una búsqueda
          this.showSuggestions = true;
          this.loading = true;
          this.error = null;
        } else {
          this.isSearching = false; // Se limpia el query, ya no está buscando
          this.showSuggestions = false;
        }
      }),
      switchMap(query => {
        if (query) {
          return this.weatherService.searchCities(query).pipe(
            catchError(err => {
              this.error = 'Error al buscar ciudades.';
              this.loading = false;
              this.isSearching = false; // Termina la búsqueda en caso de error
              return of([]);
            }),
            finalize(() => {
                this.loading = false;
                // this.isSearching se maneja en tap para evitar reset prematuro.
                // Podríamos resetear aquí también si la búsqueda falla o termina.
            })
          );
        } else {
          return of([]);
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe(suggestions => {
      this.citySuggestions = suggestions;
      // Reset isSearching aquí si la búsqueda de sugerencias ha terminado (no la principal)
      // O si la búsqueda de sugerencias es exitosa y no hay más query.
    });

    // Carga inicial al iniciar el componente
    // Aquí no se debería considerar como una "búsqueda" que resetea el estado visual agresivamente.
    this.loadWeatherForCoordinates(4.739972393154803, -74.17856127701168, 'Funza, Colombia', false); // Pasa `false` para no considerar como búsqueda

    // Suscribirse a cambios en weatherData$ para activar animaciones cuando los datos están listos
    this.weatherData$.pipe(
      filter(data => data !== null), // Solo ejecuta animaciones cuando hay datos
      takeUntil(this.destroy$)
    ).subscribe(data => {
      this.ngZone.runOutsideAngular(() => {
        // Asegurarse de que el DOM se haya actualizado.
        // `requestAnimationFrame` es a menudo mejor que `setTimeout(0)` para asegurar que el navegador ha pintado.
        requestAnimationFrame(() => {
          if (this.currentWeatherRef?.nativeElement) {
            this.animateCurrentWeather(this.currentWeatherRef.nativeElement);
          }
          if (this.weatherIconRef?.nativeElement) {
            this.animateWeatherIcon(this.weatherIconRef.nativeElement);
          }
          // Para las tarjetas de pronóstico, usamos QueryList.changes para reaccionar cuando se renderizan
          // Esto es más robusto para elementos dentro de *ngFor
          this.forecastCardRefs.changes.pipe(
              takeUntil(this.destroy$), // Asegura que esta suscripción interna se limpia
              takeUntil(this.weatherData$) // También se limpia si weatherData$ emite un nuevo valor (nueva búsqueda)
          ).subscribe((queryList: QueryList<ElementRef>) => {
              if (queryList.length > 0) {
                  this.animateForecastCards(queryList.toArray());
              }
          });

          // Animación de aparición para el contenedor principal de pronóstico si no se ha animado antes
          if (this.forecastContainer?.nativeElement) {
            gsap.fromTo(this.forecastContainer.nativeElement,
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
            );
          }
        });
      });

      // Resetear el flag de búsqueda una vez que los datos y las animaciones principales se han activado
      // Esto es importante para el siguiente ciclo de búsqueda.
      this.isSearching = false;
    });

    // Manejo de la desaparición del error
    this.weatherData$.pipe(
      filter(data => data !== null && this.errorRef?.nativeElement), // Solo cuando hay datos y un error visible
      takeUntil(this.destroy$)
    ).subscribe(data => {
      this.ngZone.runOutsideAngular(() => {
        gsap.to(this.errorRef.nativeElement, {
          opacity: 0,
          height: 0,
          duration: 0.5,
          onComplete: () => {
            this.ngZone.run(() => {
              this.error = null;
            });
          }
        });
      });
    });
  }

  ngAfterViewInit(): void {
    this.animateContainerEntrance();
    this.animateTitleShadow();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    // Asegúrate de matar todas las tweens de GSAP
    this.ngZone.runOutsideAngular(() => {
      gsap.killTweensOf('*'); // Mata todas las tweens activas. Cuidado con esto, podría afectar otras animaciones.
      // Una alternativa más segura es matar solo las de los elementos específicos:
      gsap.killTweensOf(this.containerRef?.nativeElement);
      gsap.killTweensOf(this.titleRef?.nativeElement);
      gsap.killTweensOf(this.suggestionsRef?.nativeElement);
      gsap.killTweensOf(this.errorRef?.nativeElement);
      gsap.killTweensOf(this.currentWeatherRef?.nativeElement);
      gsap.killTweensOf(this.weatherIconRef?.nativeElement);
      if (this.forecastContainer) { // Kill tweens on the parent forecast container
        gsap.killTweensOf(this.forecastContainer.nativeElement);
      }
      if (this.forecastCardRefs) {
        this.forecastCardRefs.forEach(cardRef => {
          gsap.killTweensOf(cardRef.nativeElement);
        });
      }
    });
  }

  // --- Lógica de Búsqueda y Sugerencias ---
  onSearchFocus(): void {
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
    this.searchControl.setValue(suggestion.name, { emitEvent: false });
    this.hideSuggestionsWithAnimation();
    // Pasa `true` para indicar que esta carga es resultado de una búsqueda.
    this.loadWeatherForCoordinates(suggestion.lat, suggestion.lon, `${suggestion.name}${suggestion.state ? ', ' + suggestion.state : ''}, ${suggestion.country}`, true);
  }

  // --- Carga de Datos del Clima ---
  loadWeatherForCoordinates(lat: number, lon: number, locationName: string, isSearch: boolean = false): void {
    this.loading = true;
    this.error = null;

    // *** CAMBIO CLAVE AQUÍ: Evitar limpiar los datos si es una búsqueda,
    // y en su lugar, atenuar los datos existentes. ***
    // Esto previene el "parpadeo" de eliminación/re-creación del DOM.
    if (isSearch && this.weatherDataSubject.getValue()) {
      // Si ya hay datos y es una búsqueda, atenúa el contenedor existente
      this.ngZone.runOutsideAngular(() => {
        gsap.to(this.containerRef.nativeElement, { opacity: 0.5, duration: 0.3 });
      });
    } else {
        // Para la carga inicial o si no hay datos previos, limpia completamente
        this.weatherDataSubject.next(null);
        this.hasCurrentWeather = false;
        this.hasForecast = false;
    }

    this.weatherService.getWeatherAndForecast(lat, lon).pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.loading = false;
        // Restaurar opacidad si se había atenuado
        if (isSearch && this.containerRef?.nativeElement) {
          this.ngZone.runOutsideAngular(() => {
            gsap.to(this.containerRef.nativeElement, { opacity: 1, duration: 0.3 });
          });
        }
      }),
      catchError(err => {
        this.error = err.message || 'No se pudo obtener el clima para la ubicación seleccionada.';
        this.weatherDataSubject.next(null); // Asegura que los datos se limpian en error
        this.hasCurrentWeather = false;
        this.hasForecast = false;
        return of(null);
      })
    ).subscribe(data => {
      if (data) {
        const fullWeatherData: WeatherData = {
          currentWeather: data.current,
          fiveDayForecast: data.forecast,
          locationName: data.locationName,
          lat: lat,
          lon: lon
        };
        this.weatherDataSubject.next(fullWeatherData);
        this.hasCurrentWeather = true;
        this.hasForecast = true;
        this.updateLocalTime(data.current.timezone);

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
    return iconCode ? `https://openweathermap.org/img/wn/${iconCode}@2x.png` : 'assets/default-weather.png';
  }

  getCurrentLocationName(): string {
    const data = this.weatherDataSubject.getValue();
    return data?.locationName || 'Cargando...';
  }

  private updateLocalTime(timezoneOffsetSeconds: number): void {
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    const localCityTime = new Date(utcTime + (timezoneOffsetSeconds * 1000));
    this.localTime = localCityTime.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h12'
    });
  }

  private aggregateDailyForecasts(forecastList: any[]): DailyForecastItem[] {
    const dailyDataMap: { [key: string]: DailyForecastItem } = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toISOString().split('T')[0];

      if (!dailyDataMap[dateKey]) {
        dailyDataMap[dateKey] = {
          dt: item.dt,
          main: { ...item.main },
          weather: [{ ...item.weather[0] }],
          wind: { ...item.wind },
          temp: { min: item.main.temp_min, max: item.main.temp_max } // Asegúrate de usar temp_min/max inicial
        };
      } else {
        dailyDataMap[dateKey].temp.min = Math.min(dailyDataMap[dateKey].temp.min, item.main.temp_min);
        dailyDataMap[dateKey].temp.max = Math.max(dailyDataMap[dateKey].temp.max, item.main.temp_max);

        // Actualizar el "main" weather para el día si el item actual está más cerca del mediodía
        const existingEntryHourDiff = Math.abs(new Date(dailyDataMap[dateKey].dt * 1000).getHours() - 12);
        const currentItemHourDiff = Math.abs(date.getHours() - 12);

        if (currentItemHourDiff < existingEntryHourDiff) {
            dailyDataMap[dateKey].main.temp = item.main.temp;
            dailyDataMap[dateKey].weather = [{ ...item.weather[0] }];
            dailyDataMap[dateKey].wind = { ...item.wind };
        }
      }
    });

    const sortedForecasts = Object.values(dailyDataMap).sort((a, b) => a.dt - b.dt);

    const uniqueDays: DailyForecastItem[] = [];
    const seenDays = new Set<string>();

    for (const item of sortedForecasts) {
      const itemDate = new Date(item.dt * 1000);
      itemDate.setHours(0, 0, 0, 0);

      // Solo incluir si es un día futuro O es hoy Y aún no tenemos 5 días (para asegurar que siempre haya 5).
      const dayString = itemDate.toISOString().split('T')[0];
      if (!seenDays.has(dayString) && (itemDate.getTime() > today.getTime() || (itemDate.getTime() === today.getTime() && uniqueDays.length < 5))) {
        uniqueDays.push(item);
        seenDays.add(dayString);
      }
      if (uniqueDays.length >= 5) {
        break;
      }
    }
    return uniqueDays;
  }

  getDailyForecasts(forecastList: any[] | undefined): DailyForecastItem[] {
      // Devuelve los pronósticos diarios pre-calculados.
      // Ya se calculan una vez en loadWeatherForCoordinates.
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
          filter: 'drop-shadow(0px 0px 8px rgba(var(--wp-accent-rgb), 0.7))', // Asegúrate que --wp-accent-rgb está definido
          repeat: -1,
          yoyo: true,
          duration: 2,
          ease: 'power1.inOut'
        });
      });
    }
  }

  // Estas animaciones se activarán cuando los datos del clima estén disponibles
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
        stagger: 0.1,
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
            this.ngZone.run(() => {
              this.showSuggestions = false;
              this.citySuggestions = [];
            });
          }
        });
      });
    } else {
      this.showSuggestions = false;
      this.citySuggestions = [];
    }
  }
}
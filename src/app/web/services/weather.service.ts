// src/app/services/weather.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, forkJoin, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { CurrentWeatherData, FiveDayForecastData, CitySuggestion } from '../models/weather.model';
import { environment } from 'src/environments/environment'; 

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiUrl = 'https://api.openweathermap.org/data/2.5';
  private geoApiUrl = 'https://api.openweathermap.org/geo/1.0';
  private apiKey = environment.openWeatherApiKey; // Ensure you have this in environments/environment.ts

  constructor(private http: HttpClient) {
    if (!this.apiKey) {
      console.error('OpenWeatherMap API Key is not configured in environment.ts');
    }
  }

  private get baseParams(): HttpParams {
    if (!this.apiKey) {
      throw new Error('API Key is missing. Please configure environment.ts');
    }
    return new HttpParams()
      .set('appid', this.apiKey)
      .set('lang', 'es') // Set language to Spanish
      .set('units', 'metric'); // Set units to metric (Celsius)
  }

  // --- Geocoding (City Search) ---
  searchCities(query: string): Observable<CitySuggestion[]> {
    if (!query || query.length < 2) { // Require at least 2 characters for search
      return of([]);
    }
    const params = this.baseParams
      .set('q', query)
      .set('limit', '5'); // Limit to 5 suggestions

    return this.http.get<any[]>(`${this.geoApiUrl}/direct`, { params }).pipe(
      map(response => response.map(item => ({
        name: item.name,
        lat: item.lat,
        lon: item.lon,
        country: item.country,
        state: item.state // State might be undefined for some cities
      }))),
      catchError(this.handleError)
    );
  }

  // --- Reverse Geocoding (Get City Name from Coordinates) ---
  getCityNameByCoordinates(lat: number, lon: number): Observable<string> {
    const params = this.baseParams
      .set('lat', lat.toString())
      .set('lon', lon.toString())
      .set('limit', '1');

    return this.http.get<any[]>(`${this.geoApiUrl}/reverse`, { params }).pipe(
      map(response => {
        if (response && response.length > 0) {
          const city = response[0];
          return `${city.name}${city.state ? ', ' + city.state : ''}, ${city.country}`;
        }
        return 'Ubicación Desconocida';
      }),
      catchError(this.handleError)
    );
  }

  // --- Weather Data ---
  getCurrentWeather(lat: number, lon: number): Observable<CurrentWeatherData> {
    const params = this.baseParams
      .set('lat', lat.toString())
      .set('lon', lon.toString());

    return this.http.get<CurrentWeatherData>(`${this.apiUrl}/weather`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getFiveDayForecast(lat: number, lon: number): Observable<FiveDayForecastData> {
    const params = this.baseParams
      .set('lat', lat.toString())
      .set('lon', lon.toString());

    return this.http.get<FiveDayForecastData>(`${this.apiUrl}/forecast`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  // Combina ambas llamadas para obtener todos los datos de clima
  getWeatherAndForecast(lat: number, lon: number): Observable<{ current: CurrentWeatherData, forecast: FiveDayForecastData, locationName: string }> {
    if (!this.apiKey) {
      return throwError(() => new Error('API Key is missing. Cannot fetch weather data.'));
    }

    return forkJoin({
      current: this.getCurrentWeather(lat, lon),
      forecast: this.getFiveDayForecast(lat, lon),
      locationName: this.getCityNameByCoordinates(lat, lon)
    }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      if (error.status === 401) {
        errorMessage = 'Acceso no autorizado. Por favor, verifica tu clave API.';
      } else if (error.status === 404) {
        errorMessage = 'Ciudad no encontrada. Por favor, intenta con otro nombre.';
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    console.error('Weather Service Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
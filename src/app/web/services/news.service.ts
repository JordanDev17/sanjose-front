// src/app/web/services/news.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import {
  News,
  CreateNewsDto,
  UpdateNewsDto,
  NewsPaginatedResponse
} from '../models/news.model'; // Ajusta la ruta a tus modelos
import { ApiResponse } from '../models/api-response.model'; // Ajusta la ruta a tu modelo de respuesta


@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private apiUrl = `${environment.apiUrl}/news`; // Asume que tu backend tiene rutas como /api/news

  constructor(private http: HttpClient) { }

  /**
   * Obtiene una lista paginada de noticias.
   * Puede filtrar por estado.
   * Accesible por 'admin', 'editor', 'visualizador' (para las publicadas).
   */
  getNews(page: number = 1, limit: number = 10, status?: 'borrador' | 'publicado' | 'archivado'): Observable<NewsPaginatedResponse> {
    let params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) {
      params.append('estado', status); // Asegúrate de que el parámetro de backend sea 'estado'
    }
    return this.http.get<NewsPaginatedResponse>(`${this.apiUrl}?${params.toString()}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene una noticia por su ID.
   * Accesible por 'admin', 'editor', 'visualizador' (dependiendo del estado de la noticia).
   */
  getNewsById(id: number): Observable<News> {
    return this.http.get<News>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Crea una nueva noticia.
   * Requiere rol 'admin' o 'editor'.
   */
  createNews(news: CreateNewsDto): Observable<News> {
    return this.http.post<News>(this.apiUrl, news).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Actualiza una noticia existente por su ID.
   * Requiere rol 'admin' o 'editor'.
   */
  updateNews(id: number, news: UpdateNewsDto): Observable<News> {
    return this.http.put<News>(`${this.apiUrl}/${id}`, news).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Elimina una noticia por su ID.
   * Requiere rol 'admin' o 'editor'.
   */
  deleteNews(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error desconocido.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      errorMessage = `Error del servidor (Código: ${error.status}): ${error.error?.message || error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
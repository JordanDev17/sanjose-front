// src/app/web/services/news.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { News, CreateNewsDto, UpdateNewsDto, NewsPaginatedResponse } from '../models/news.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private apiUrl = `${environment.apiUrl}api/dashboard-news`;
  // Asume que la URL de subida de imágenes es un endpoint separado.
  // AJUSTA ESTA URL para que apunte a tu endpoint de subida de imágenes en el backend.
  // Por ejemplo: si tu backend corre en http://localhost:3000 y el endpoint es /api/upload,
  // entonces uploadUrl sería: `${environment.apiUrl}api/upload`.
  // Si es un servicio de Cloud (Cloudinary, AWS S3, etc.), la URL será diferente.
  private uploadUrl = `${environment.apiUrl}api/upload`; // <<<--- ¡AJUSTA ESTA URL!

  constructor(private http: HttpClient) { }

  /**
   * Obtiene una lista paginada de noticias.
   */
  getNews(page: number = 1, limit: number = 10, estado?: string): Observable<NewsPaginatedResponse> {
    let params = new HttpParams();
    if (estado) {
      params = params.set('estado', estado);
    }

    return this.http.get<News[]>(this.apiUrl, { params: params }).pipe(
      map(newsArray => {
        const validNews = newsArray || [];
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = validNews.slice(startIndex, endIndex);

        return {
          data: paginatedData,
          totalItems: validNews.length,
          currentPage: page,
          itemsPerPage: limit,
          totalPages: Math.ceil(validNews.length / limit)
        };
      }),
      catchError(this.handleError)
    );
  }

  getNewsById(id: number): Observable<News> {
    return this.http.get<News>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createNews(news: CreateNewsDto): Observable<News> {
    return this.http.post<News>(this.apiUrl, news).pipe(
      catchError(this.handleError)
    );
  }

  updateNews(id: number, news: UpdateNewsDto): Observable<News> {
    return this.http.patch<News>(`${this.apiUrl}/${id}`, news).pipe(
      catchError(this.handleError)
    );
  }

  deleteNews(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * NUEVO MÉTODO: Sube un archivo de imagen al servidor.
   * @param file El archivo de imagen a subir (tipo File).
   * @returns Un Observable con la URL de la imagen subida (asumiendo que el backend devuelve { imageUrl: string }).
   */
  uploadImage(file: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', file); // 'image' debe coincidir con el nombre de campo que espera tu backend

    // HttpClient configurará automáticamente el 'Content-Type' a 'multipart/form-data'
    // y el 'boundary' adecuado cuando se le pasa un objeto FormData.
    // NO LO ESTABLEZCAS MANUALMENTE aquí.
    return this.http.post<{ imageUrl: string }>(this.uploadUrl, formData).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error desconocido en NewsService.';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error del cliente (NewsService): ${error.error.message}`;
    } else {
      // Error del lado del servidor
      const backendError = error.error as { message?: string };
      errorMessage = `Error del servidor (NewsService - Código: ${error.status}): ${backendError.message || error.message || JSON.stringify(error.error)}`;
    }
    console.error('Error en NewsService:', errorMessage);
    // Devuelve un observable con un error para que el componente pueda manejarlo
    return throwError(() => new Error(errorMessage));
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { News, NewsPaginatedResponse, CreateNewsDto, UpdateNewsDto } from '../models/news.model';
import { ApiResponse } from '../models/api-response.model';
import { AuthService } from '../../core/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private apiUrl = `${environment.apiUrl}/api/dashboard-news`;

  constructor(private http: HttpClient, private authService: AuthService) {}

getNews(page: number = 1, limit: number = 10, status: 'publicado' = 'publicado'): Observable<News[]> {
  return this.http.get<News[]>(`${this.apiUrl}?page=${page}&limit=${limit}&estado=${status}`).pipe(
    catchError(this.handleError)
  );
}


  createNews(news: CreateNewsDto): Observable<News> {
    if (!this.userHasPermission()) return throwError(() => new Error('Acceso denegado.'));
    return this.http.post<News>(this.apiUrl, news).pipe(catchError(this.handleError));
  }

  updateNews(id: number, news: UpdateNewsDto): Observable<News> {
    if (!this.userHasPermission()) return throwError(() => new Error('Acceso denegado.'));
    return this.http.put<News>(`${this.apiUrl}/${id}`, news).pipe(catchError(this.handleError));
  }

  deleteNews(id: number): Observable<ApiResponse> {
    if (!this.userHasPermission()) return throwError(() => new Error('Acceso denegado.'));
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }

  private userHasPermission(): boolean {
    return ['admin', 'editor'].includes(this.authService.getUserRole()!);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    return throwError(() => new Error('Error al obtener noticias.'));
  }
}

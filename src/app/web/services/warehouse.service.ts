// src/app/web/services/warehouse.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import {
  Warehouse,
  CreateWarehouseDto,
  UpdateWarehouseDto,
  WarehousePaginatedResponse
} from '../models/warehouse.model'; // Ajusta la ruta a tus modelos
import { ApiResponse } from '../models/api-response.model'; // Ajusta la ruta a tu modelo de respuesta

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {
  // Ajustamos la URL para usar la ruta pública de visualización
  private apiUrl = `${environment.apiUrl}/api/dashboard-warehouse`;

  constructor(private http: HttpClient) { }


  /**
   * Obtiene una lista paginada de almacenes/empresas.
   * AHORA ESPERA UN ARRAY DE WAREHOUSE DIRECTAMENTE
   */
  getWarehouses(page: number = 1, limit: number = 10, status?: 'activa' | 'inactiva'): Observable<Warehouse[]> { // <-- ¡CAMBIO AQUÍ!
    let params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) {
      params.append('estado', status);
    }
    return this.http.get<Warehouse[]>(`${this.apiUrl}?${params.toString()}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene un almacén/empresa por su ID.
   * Accesible públicamente.
   */
  getWarehouseById(id: number): Observable<Warehouse> {
    // Usamos el `apiUrl` que ya apunta a /dashboard-warehouse
    return this.http.get<Warehouse>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Crea un nuevo almacén.
   * Requiere rol 'admin' o 'editor'. (Estas rutas son para el panel de administración, no la web pública)
   */
  createWarehouse(warehouse: CreateWarehouseDto): Observable<Warehouse> {
    // La ruta para crear sigue siendo `dashboard-warehouse` pero con POST
    return this.http.post<Warehouse>(this.apiUrl, warehouse).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Actualiza un almacén existente por su ID.
   * Requiere rol 'admin' o 'editor'.
   */
  updateWarehouse(id: number, warehouse: UpdateWarehouseDto): Observable<Warehouse> {
    return this.http.put<Warehouse>(`${this.apiUrl}/${id}`, warehouse).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Elimina un almacén por su ID.
   * Requiere rol 'admin' o 'editor'.
   */
  deleteWarehouse(id: number): Observable<ApiResponse> {
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
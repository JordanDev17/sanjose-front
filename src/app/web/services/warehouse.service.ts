// src/app/web/services/warehouse.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
// Importa los modelos de bodega que acabamos de definir
import { Warehouse, CreateWarehouseDto, UpdateWarehouseDto, WarehousePaginatedResponse } from '../models/warehouse.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {
  // Ajusta esta URL para que apunte a la base de tu API de bodegas en el backend
  private apiUrl = `${environment.apiUrl}api/warehouses`;
  // La URL de subida de imágenes debe ser la misma que usas para las noticias
  // Asegúrate de que esta URL coincida con el endpoint de tu backend (ej. http://localhost:3000/api/upload)
  private uploadUrl = `${environment.apiUrl}api/upload`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene una lista paginada de bodegas.
   * IMPORTANTE: Esta implementación simula la paginación en el frontend,
   * ya que el backend devuelve un array plano completo.
   * Si tu backend ya maneja paginación, puedes pasar `page` y `limit` como `HttpParams`
   * y adaptar el 'map' para procesar la respuesta paginada directamente.
   * @param page Número de página a solicitar (por defecto 1).
   * @param limit Cantidad de elementos por página (por defecto 10).
   * @param estado Opcional: filtra las bodegas por estado (ej. 'activa', 'inactiva').
   * @returns Un Observable de WarehousePaginatedResponse.
   */
  getWarehouses(page: number = 1, limit: number = 10, estado?: string): Observable<WarehousePaginatedResponse> {
    let params = new HttpParams();
    if (estado) {
      params = params.set('estado', estado);
    }

    // El backend devuelve un array de Warehouse[], no un objeto paginado.
    // Usamos 'map' para transformar la respuesta a WarehousePaginatedResponse,
    // simulando la paginación en el lado del cliente.
    return this.http.get<Warehouse[]>(this.apiUrl, { params: params }).pipe(
      map(warehouseArray => {
        const validWarehouses = warehouseArray || []; // Asegura que sea un array vacío si la respuesta es null/undefined

        // === Lógica de paginación simulada en el frontend ===
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        // CORRECCIÓN: Declaración de 'paginatedData' con 'const'
        const paginatedData = validWarehouses.slice(startIndex, endIndex);

        return {
          data: paginatedData,
          totalItems: validWarehouses.length,
          currentPage: page,
          itemsPerPage: limit,
          totalPages: Math.ceil(validWarehouses.length / limit)
        };
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene una bodega por su ID.
   * @param id El ID de la bodega.
   * @returns Un Observable de Warehouse.
   */
  getWarehouseById(id: number): Observable<Warehouse> {
    return this.http.get<Warehouse>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Crea una nueva bodega.
   * @param warehouse El DTO con los datos de la nueva bodega.
   * @returns Un Observable de la bodega creada.
   */
  createWarehouse(warehouse: CreateWarehouseDto): Observable<Warehouse> {
    return this.http.post<Warehouse>(this.apiUrl, warehouse).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Actualiza una bodega existente.
   * @param id El ID de la bodega a actualizar.
   * @param warehouse El DTO con los datos a actualizar.
   * @returns Un Observable de la bodega actualizada.
   */
  updateWarehouse(id: number, warehouse: UpdateWarehouseDto): Observable<Warehouse> {
    // Usamos PATCH para actualizaciones parciales, PUT para reemplazo completo.
    // Tu backend usa PATCH para noticias, así que mantenemos consistencia.
    return this.http.patch<Warehouse>(`${this.apiUrl}/${id}`, warehouse).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Elimina una bodega por su ID.
   * @param id El ID de la bodega a eliminar.
   * @returns Un Observable vacío (void) si la eliminación fue exitosa.
   */
  deleteWarehouse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Sube un archivo de imagen al servidor.
   * Esta es la misma lógica que usaste para las noticias.
   * @param file El archivo de imagen a subir (tipo File).
   * @returns Un Observable con la URL de la imagen subida (asumiendo que el backend devuelve { imageUrl: string }).
   */
  uploadImage(file: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', file); // 'image' debe coincidir con el nombre de campo que espera tu backend

    return this.http.post<{ imageUrl: string }>(this.uploadUrl, formData).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Manejador de errores HTTP.
   * Centraliza el manejo de errores para todas las peticiones del servicio.
   * @param error El HttpErrorResponse.
   * @returns Un Observable que lanza un error.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error desconocido en WarehouseService.';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente o de red
      errorMessage = `Error del cliente (WarehouseService): ${error.error.message}`;
    } else {
      // Error del lado del servidor
      const backendError = error.error as { message?: string };
      errorMessage = `Error del servidor (WarehouseService - Código: ${error.status}): ${backendError.message || error.message || JSON.stringify(error.error)}`;
    }
    console.error('Error en WarehouseService:', errorMessage);
    // Devuelve un observable con un error que será manejado por el componente que se suscribe
    return throwError(() => new Error(errorMessage));
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Bodega {
  id: number;
  nombre: string;
  ubicacion: string;
  descripcion: string;
}

@Injectable({
  providedIn: 'root'
})
export class BodegaService {
  private bodegaUrl = 'http://localhost:3000/api/bodegas';

  constructor(private http: HttpClient) { }

  obtenerBodegas(): Observable<Bodega[]> {
    return this.http.get<Bodega[]>(this.bodegaUrl);
  }

  crearBodega(data: Omit<Bodega, 'id'>): Observable<Bodega> {
    return this.http.post<Bodega>(this.bodegaUrl, data);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegistroPersona {
  id: number;
  nombre: string;
  identificacion: string;
  motivo_visita: string;
  fecha_entrada: string;
  fecha_salida: string;
  bodega_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class RegistrosPersonasService { 
  private registroUrl = 'http://localhost:3000/api/registros';

  constructor(private http: HttpClient) { }

  obtenerRegistros(): Observable<RegistroPersona[]> {
    return this.http.get<RegistroPersona[]>(this.registroUrl);
  }
  obtenerRegistrosPorBodega(id: number): Observable<RegistroPersona[]> {
    return this.http.get<RegistroPersona[]>(`http://localhost:3000/api/registros/personas?bodega_id=${id}`);
  }

  crearRegistro(data: Omit<RegistroPersona, 'id'>): Observable<RegistroPersona> {
    return this.http.post<RegistroPersona>(this.registroUrl, data);
  }
}

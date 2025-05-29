import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Administrador {
  id: number;
  nombre: string;
  identificacion: string;
  correo: string;
  bodega_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private adminUrl = 'http://localhost:3000/api/admins';

  constructor(private http: HttpClient) { }

  crearAdministrador(data: { nombre: string; identificacion:string; correo:string; bodega_id: number}): Observable<any> {
    return this.http.post(this.adminUrl, data);
  }

  loginAdmin(data: { nombre: string; identificacion: string }): Observable<any> {
    return this.http.post(`${this.adminUrl}/login`, data);
  }

  obtenerAdministradores(): Observable<Administrador[]> {
    return this.http.get<Administrador[]>(this.adminUrl);
  }
}

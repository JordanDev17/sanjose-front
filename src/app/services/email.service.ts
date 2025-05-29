import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private emailUrl = 'http://localhost:3000/enviar-correo';

  constructor( private http: HttpClient) { }

  // Para envair Coreo
  enviarCorreo(codigo: number): Observable<any> {
    return this.http.post('http://localhost:3000/api/enviar-correo', { codigo });
  }
}

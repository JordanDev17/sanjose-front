// src/app/web/services/contact.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment'; // ¡Importa tu archivo de entorno!

/**
 * Interface para tipar los datos del formulario de contacto.
 */
export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

/**
 * Interface para tipar la respuesta esperada del backend.
 */
export interface ApiResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  // Ahora construimos la URL completa usando la apiUrl de tu entorno
  private contactApiUrl = `${environment.apiUrl}api/contact`; // <--- ¡CAMBIO CLAVE AQUÍ!

  constructor(private http: HttpClient) { }

  /**
   * Método para enviar los datos del formulario al backend.
   * @param formData Los datos del formulario (nombre, email, mensaje).
   * @returns Un Observable que emite la respuesta del servidor.
   */
  sendEmail(formData: ContactFormData): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.contactApiUrl, formData); // Usamos la nueva variable
  }
}
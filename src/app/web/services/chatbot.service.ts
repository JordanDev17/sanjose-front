// src/app/web/services/chatbot.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


// --- Interfaces para la respuesta del Backend ---
export interface ChatbotOption {
  text: string;
  value: string;
}

export interface ChatbotResponse {
  message: string;
  options: ChatbotOption[];
}
// -------------------------------------------------

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  // URL del backend del chatbot
  private apiUrl = `${environment.apiUrl}/api/chatbot`;

  constructor(private http: HttpClient) { }

  /**
   * Envía la opción seleccionada por el usuario al backend del chatbot.
   * Si 'optionValue' es null o undefined, el backend debería devolver el menú principal.
   * @param optionValue El 'value' de la opción seleccionada por el usuario, o null para iniciar/resetear.
   * @returns Un Observable con la respuesta del chatbot (mensaje y nuevas opciones).
   */
  selectOption(optionValue: string | null = null): Observable<ChatbotResponse> {
    // El backend espera un objeto JSON con la propiedad 'option'
    return this.http.post<ChatbotResponse>(this.apiUrl, { option: optionValue });
  }
}
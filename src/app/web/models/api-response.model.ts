// src/app/web/models/api-response.model.ts

/**
 * Interface genérica para respuestas de la API que devuelven un mensaje y opcionalmente datos.
 */
export interface ApiResponse<T = any> {
  message: string;
  data?: T; // El tipo de datos específico que se devuelve con la respuesta
}
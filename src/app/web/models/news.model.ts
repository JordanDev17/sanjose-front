// src/app/web/models/news.model.ts

export interface News {
  id: number;
  titulo: string;
  slug: string; // YA ESTABA AQUÍ, ES CORRECTO
  resumen: string;
  contenido: string;
  imagen_destacada: string; // URL de la imagen destacada
  categoria: string;
  autor: string;
  fecha_publicacion: string; // Formato ISO 8601 (ej. "2025-05-21T06:01:42.000Z")
  fecha_actualizacion: string; // Formato ISO 8601
  estado: 'publicado' | 'borrador' | 'archivado' | string; // Asegúrate de cubrir los posibles estados
}

// DTO para crear una noticia
export interface CreateNewsDto {
  titulo: string;
  slug: string; // AÑADIDO: El slug es obligatorio al crear
  resumen: string;
  contenido: string;
  imagen_destacada?: string; // Opcional al crear
  categoria: string;
  autor: string;
  fecha_publicacion: string; 
  estado: 'publicado' | 'borrador' | string;
}

// DTO para actualizar una noticia (todos los campos son opcionales, excepto el ID implícito en la URL)
export interface UpdateNewsDto {
  titulo?: string;
  slug?: string; // AÑADIDO: El slug es opcional al actualizar, pero se puede enviar
  resumen?: string;
  contenido?: string;
  imagen_destacada?: string;
  categoria?: string;
  autor?: string;
  fecha_publicacion?: string;
  estado?: 'publicado' | 'borrador' | 'archivado' | string;
}

export interface NewsPaginatedResponse {
  data: News[];
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
}
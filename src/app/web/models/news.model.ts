// src/app/web/models/news.model.ts

/**
 * Interface para representar los datos de una Noticia tal como son devueltos por el backend.
 */
export interface News {
  id: number;
  titulo: string;
  slug: string;
  resumen: string | null; // TEXT puede ser nulo
  contenido: string;
  imagen_destacada: string | null; // VARCHAR puede ser nulo
  categoria: string;
  autor: string | null; // VARCHAR puede ser nulo
  fecha_publicacion: string; // DATETIME se representará como string ISO 8601
  fecha_actualizacion: string; // DATETIME se representará como string ISO 8601
  estado: 'borrador' | 'publicado' | 'archivado'; // Tipos literales para el ENUM
}

/**
 * Interface para la creación de una nueva noticia (sin ID, y con campos opcionales)
 */
export type CreateNewsDto = Omit<News, 'id' | 'fecha_publicacion' | 'fecha_actualizacion'>;

/**
 * Interface para la actualización parcial de una noticia (todos los campos son opcionales)
 */
export type UpdateNewsDto = Partial<Omit<News, 'id' | 'fecha_publicacion' | 'fecha_actualizacion' | 'slug'>>; // No se suele actualizar el slug directamente en el frontend

// Interfaz para la respuesta paginada de noticias
export interface NewsPaginatedResponse {
  data: News[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
}
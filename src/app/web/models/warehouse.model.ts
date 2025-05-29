// src/app/web/models/warehouse.model.ts

/**
 * Interface para representar los datos de un Almacén tal como son devueltos por el backend.
 */
export interface Warehouse {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string;
  sector: string | null; // VARCHAR puede ser nulo
  logotipo_url: string | null; // VARCHAR puede ser nulo
  sitio_web: string | null; // VARCHAR puede ser nulo
  contacto_email: string | null; // VARCHAR puede ser nulo
  contacto_telefono: string | null; // VARCHAR puede ser nulo
  direccion_bodega: string | null; // VARCHAR puede ser nulo
  fecha_registro: string; // DATETIME se representará como string ISO 8601
  fecha_actualizacion: string; // DATETIME se representará como string ISO 8601
  estado: 'activa' | 'inactiva'; // Tipos literales para el ENUM
}

/**
 * Interface para la creación de un nuevo almacén (sin ID, y con campos opcionales)
 */
export type CreateWarehouseDto = Omit<Warehouse, 'id' | 'fecha_registro' | 'fecha_actualizacion'>;

/**
 * Interface para la actualización parcial de un almacén (todos los campos son opcionales)
 */
export type UpdateWarehouseDto = Partial<Omit<Warehouse, 'id' | 'fecha_registro' | 'fecha_actualizacion' | 'slug'>>; // No se suele actualizar el slug directamente en el frontend

// Interfaz para la respuesta paginada de almacenes
export interface WarehousePaginatedResponse {
  data: Warehouse[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
}
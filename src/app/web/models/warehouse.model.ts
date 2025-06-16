// src/app/web/models/warehouse.model.ts

export interface Warehouse {
  id: number;
  nombre: string; // Cambiado de 'name' a 'nombre'
  slug: string;
  descripcion: string; // Cambiado de 'description' a 'descripcion'
  sector: string;
  logotipo_url: string; // URL del logo
  sitio_web: string; // URL del sitio web de la empresa
  contacto_email: string;
  contacto_telefono: string;
  direccion_bodega: string; // La ubicación específica de la bodega
  fecha_registro: string; // Usar string para fechas y luego formatear si es necesario
  fecha_actualizacion: string;
  estado: 'activa' | 'inactiva'; // Mantenemos el estado
  // Si tu backend enviara 'images', podrías añadirlo aquí:
  // images?: string[];
}

// DTOs para la creación y actualización, si las usas
export type CreateWarehouseDto = Omit<Warehouse, 'id' | 'fecha_registro' | 'fecha_actualizacion'>;
export type UpdateWarehouseDto = Partial<CreateWarehouseDto>;

export interface WarehousePaginatedResponse {
  data: Warehouse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse {
  message: string;
  status: number;
}
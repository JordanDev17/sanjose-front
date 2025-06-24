// src/app/web/models/warehouse.model.ts

/**
 * Interfaz para representar una bodega tal como se recibe del backend y se usa en el frontend.
 */
export interface Warehouse {
  id: number;
  nombre: string;
  slug: string; // Para URLs amigables (ej: "mi-empresa-sa")
  descripcion: string; // Breve descripción de la empresa para publicidad
  sector: string; // Ej: 'Logística', 'Manufactura', 'Tecnología'
  logotipo_url: string; // URL del logo de la empresa
  sitio_web: string; // URL del sitio web de la empresa
  contacto_email: string;
  contacto_telefono: string;
  direccion_bodega: string; // Ubicación de la bodega dentro del parque
  fecha_registro: string; // Formato ISO 8601 (ej. "2025-05-21T06:01:57.000Z")
  fecha_actualizacion: string; // Formato ISO 8601
  estado: 'activa' | 'inactiva' | string; // 'activa', 'inactiva' o cualquier otro estado definido
}

/**
 * DTO (Data Transfer Object) para crear una nueva bodega.
 * Los campos que pueden ser opcionales en el backend o generados automáticamente no se incluyen aquí si no se envían.
 */
export interface CreateWarehouseDto {
  nombre: string;
  slug: string;
  descripcion: string;
  sector?: string; // Opcional al crear si el backend tiene un valor por defecto o si es un campo flexible
  logotipo_url?: string; // Opcional, ya que se manejará la subida de archivos
  sitio_web?: string;
  contacto_email?: string;
  contacto_telefono?: string;
  direccion_bodega?: string;
  estado?: 'activa' | 'inactiva' | string; // Valor por defecto 'activa' en BD, pero se puede enviar
}

/**
 * DTO para actualizar una bodega existente.
 * Todos los campos son opcionales, ya que solo se envían los que se modifican.
 */
export interface UpdateWarehouseDto {
  nombre?: string;
  slug?: string;
  descripcion?: string;
  sector?: string;
  logotipo_url?: string;
  sitio_web?: string;
  contacto_email?: string;
  contacto_telefono?: string;
  direccion_bodega?: string;
  estado?: 'activa' | 'inactiva' | string;
}

/**
 * Interfaz para la respuesta paginada de bodegas desde el backend.
 * Asume que tu backend puede devolver un objeto de paginación o que harás la simulación en el servicio.
 */
export interface WarehousePaginatedResponse {
  data: Warehouse[];
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
}
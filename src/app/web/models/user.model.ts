// src/app/web/models/user.model.ts

/**
 * Interface para representar los datos de un Usuario tal como son devueltos por el backend
 * para la gestión (ej. por un Admin).
 * 'activo' y 'two_factor_enabled' se reciben como numbers (1 o 0) del backend.
 * 'created_at' y 'updated_at' NO se incluyen ya que el backend GET no los devuelve.
 */
export interface User {
  id: number;
  nombre_usuario: string;
  email: string;
  rol: 'admin' | 'editor' | 'visualizador'; // Tipos literales para los roles del ENUM
  activo: number; // CAMBIO: de boolean a number (0 o 1)
  two_factor_enabled: number; // CAMBIO: de boolean a number (0 o 1)
  // created_at: string; // Eliminado, ya que el backend no lo devuelve en el GET actual
  // updated_at: string; // Eliminado, ya que el backend no lo devuelve en el GET actual
}

/**
 * Interface para la creación de un nuevo usuario.
 * 'activo' y 'two_factor_enabled' pueden ser opcionales y el backend puede esperar 0/1.
 * La contraseña es necesaria para la creación.
 */
export type CreateUserDto = Omit<User, 'id'> & {
  contrasena: string;
  activo?: number; // Opcional para creación, el backend puede tener un default
  two_factor_enabled?: number; // Opcional para creación
};

/**
 * Interface para la actualización parcial de un usuario (todos los campos son opcionales)
 * Se usan 'number' para activo y two_factor_enabled.
 */
export type UpdateUserDto = Partial<Omit<User, 'id' | 'contrasena'>>; // No se envía la contraseña en update por defecto

// Interfaz para la respuesta paginada de usuarios (simulada en el frontend)
export interface UserPaginatedResponse {
  data: User[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
}
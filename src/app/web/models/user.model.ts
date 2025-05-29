// src/app/web/models/user.model.ts

/**
 * Interface para representar los datos de un Usuario tal como son devueltos por el backend
 * para la gestión (ej. por un Admin).
 */
export interface User {
  id: number;
  nombre_usuario: string;
  email: string;
  rol: 'admin' | 'editor' | 'visualizador'; // Tipos literales para los roles del ENUM
  activo: boolean;
  two_factor_enabled: boolean; // Si la verificación de 2FA está habilitada para el usuario
  // two_factor_code NO se incluye porque es sensible y no debe ir al frontend
  created_at: string; // DATETIME se representará como string ISO 8601
  updated_at: string; // DATETIME se representará como string ISO 8601
}

/**
 * Interface para la creación de un nuevo usuario (sin ID, created_at, updated_at, contrasena y two_factor_code)
 */
export type CreateUserDto = Omit<User, 'id' | 'created_at' | 'updated_at'> & {
  contrasena: string;
  two_factor_enabled?: boolean; // La contraseña es necesaria para la creación
};

/**
 * Interface para la actualización parcial de un usuario (todos los campos son opcionales)
 */
export type UpdateUserDto = Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;

// Interfaz para la respuesta paginada de usuarios (si aplica)
export interface UserPaginatedResponse {
  data: User[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
}
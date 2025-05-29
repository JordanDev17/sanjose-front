// src/app/core/auth/auth.models.ts

// Para las credenciales de login (fase 1)
export interface LoginCredentials {
  nombre_usuario: string; // Coincide con el campo del backend
  contrasena: string;     // Coincide con el campo del backend
}

// Para la información del usuario que se almacena y maneja en el frontend
export interface User {
  id: number;
  nombre_usuario: string; // Coincide con el campo del backend
  email: string;
  rol: string;            // Tu backend usa 'rol' (singular), no 'roles' (plural)
  // Puedes añadir más campos si tu backend los devuelve y los necesitas
}

// Para la data que se envía al endpoint de verificación de código (fase 2)
// Combina LoginCredentials con el twoFactorCode
export interface VerificationData extends LoginCredentials {
  twoFactorCode: string;
}

// Para la respuesta del backend en la FASE 1 (después de enviar credenciales)
export interface LoginResponsePhase1 {
  message: string;
  twoFactorRequired: boolean;
}

// Para la respuesta exitosa del backend en la FASE 2 (después de verificar el código)
export interface AuthResponsePhase2 {
  message: string;
  token: string;
  user: User; // Usa la interfaz User definida arriba
  twoFactorRequired: boolean;
}

// Para el payload decodificado del JWT (si usas jwt-decode)
export interface JwtPayload {
  id: number;
  nombre_usuario: string;
  rol: string; // El rol directamente en el payload
  iat: number; // Issued at (timestamp)
  exp: number; // Expiration time (timestamp)
}
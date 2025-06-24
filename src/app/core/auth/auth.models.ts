// src/app/core/auth/auth.models.ts

import { User } from '../../web/models/user.model';

export interface LoginCredentials {
  nombre_usuario: string;
  contrasena: string;
}

export interface VerificationData {
  nombre_usuario: string;
  contrasena: string; // <-- ¡ESTE ES EL CAMBIO CLAVE PARA RESOLVER TU ERROR!
  twoFactorCode: string;
  temp_token?: string;
}

export interface LoginResponsePhase1 {
  message: string;
  twoFactorRequired: boolean;
  temp_token?: string;
}

export interface AuthResponsePhase2 {
  message: string;
  token: string;
  user: User;
}

export interface JwtPayload {
  id: number;
  nombre_usuario: string;
  email: string;
  rol: 'admin' | 'editor' | 'visualizador';
  iat: number;
  exp: number;
  activo?: number;
  two_factor_enabled?: number;
}
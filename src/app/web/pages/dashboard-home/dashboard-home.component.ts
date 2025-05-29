// src/app/web/pages/dashboard-home/dashboard-home.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importa CommonModule para *ngIf
import { AuthService } from 'src/app/core/auth/auth.service'; // Asegúrate de la ruta correcta

// --- ¡CORRECCIÓN CLAVE AQUÍ! ---
// Importamos la interfaz 'User' de donde realmente la proporciona el AuthService.
// Asumo que tu archivo 'auth.models.ts' tiene una interfaz 'User' (o similar) para el usuario logueado.
import { User } from 'src/app/core/auth/auth.models'; // <-- ¡CORREGIDO!
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class DashboardHomeComponent implements OnInit {
  currentUser: User | null = null; // <-- Usamos la interfaz 'User' del módulo 'auth'

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    // Suscríbete al BehaviorSubject para obtener el usuario actual
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  // Método para obtener el rol del usuario (opcional, si no lo tienes ya en currentUser)
  // Asegúrate de que 'rol' exista en la interfaz User de auth.models.ts
  getUserRole(): string {
    return this.currentUser ? this.currentUser.rol : 'invitado';
  }
}
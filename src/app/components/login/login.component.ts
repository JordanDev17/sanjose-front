import { Component } from '@angular/core';
import { EmailService } from '../../services/email.service';
import { AdminService } from '../../services/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  alertas: { id: number, mensaje: string; tipo: string }[] = [];

  mostrarFormulario: boolean = false;
  nombre = '';
  identificacion = '';
  correo = '';
  bodega_id: number | null = null;
  adminCreado = false;

  numeroRamdon: number | null = null;
  emailDestino: string = '';

  compararCodigo: number | null = null;

  botonesEstado: { [key: string]: boolean} = {
    boton1: false,
    boton2: false
  };

  constructor(
    private emailService : EmailService,
    private adminService: AdminService,
    private router: Router
  ) {}

  toggleClass(boton: string): void {
    if (boton === 'boton1') {
      this.botonesEstado['boton2'] = false;
    } else if (boton === 'boton2') {
      this.botonesEstado['boton1'] = false;
      this.numeroRamdon = null;
      this.agregarAlerta("Codigo eliminado", "warning");
      console.log("Codigo eliminado");

    }

    this.botonesEstado[boton]= !this.botonesEstado[boton];

    if (this.botonesEstado['boton1']){
      this.generarCodigo();
    } else {
      this.numeroRamdon = null;
    }
  }

  generarCodigo(): void{
    this.numeroRamdon = Math.floor(Math.random() *300) +1;
    this.agregarAlerta("!Codigo Generado con Exito¡", "success");

    this.emailService.enviarCorreo(this.numeroRamdon).subscribe({
      next: (response) => console.log('Correo enviado con exito', response),
      error: (error) => console.log('Error al enviar el correo', error)
    });
  }

  verificarCodigo(): void {
    if (this.numeroRamdon === null || this.compararCodigo === null) {
      this.agregarAlerta("El codigo es incorrecto","error");
      console.log("El codigo es incorrecto");
      return;
    }

    if (this.compararCodigo === this.numeroRamdon) {
      this.agregarAlerta("¡Cuenta creada exitosamente!","success");
      this.mostrarFormulario = true;
      console.log("¡Cuenta creada exitosamente!");
    } else {
      this.agregarAlerta("Tu Codigo no coincide","error");
      console.log("Tu Codigo no coincide");
    }
  }

  agregarAlerta(mensaje: string, tipo: string) {
    const nuevaAlerta = {
      id: Date.now(),
      mensaje: mensaje,
      tipo: tipo
    };

    this.alertas.push(nuevaAlerta);

    setTimeout (()=> {
      this.cerrarAlerta(nuevaAlerta.id);
    }, 3000);
  }

  cerrarAlerta(id: number): void {
    this.alertas = this.alertas.filter(alerta => alerta.id !== id);
  }

  //
  registrarAdministrador(): void {
    const datos = {
      nombre: this.nombre,
      identificacion: this.identificacion,
      correo: this.correo,
      bodega_id: this.bodega_id!
    };

    this.adminService.crearAdministrador(datos).subscribe({
      next: (res) => {
        this.agregarAlerta('Administrador creado' ,'sucess');
        this.mostrarFormulario = false;
        this.adminCreado = true;
      },
      error: (err) => {
        this.agregarAlerta('Error al registrar Administrador', 'error');
      }
    });
  }

  irAlInicio(): void{
    this.router.navigate(['']);
  }

  iniciarSesion(): void {
    const datos = { nombre: this.nombre, identificacion: this.identificacion };

    this.adminService.loginAdmin(datos).subscribe({
      next: (res) => {
        localStorage.setItem('adminLogueado', JSON.stringify(res.admin));
        this.router.navigate(['/perfil-admin']);
      },
      error: () => {
        alert('Credenciales invalidas');
      }
    });
  }
}

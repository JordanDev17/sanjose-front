// src/app/web/pages/contact/contact.component.ts
import { Component, OnInit } from '@angular/core';
import { ChatbotComponent } from '../../components/chatbot/chatbot.component'; // Asegúrate de que la ruta sea correcta

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
  standalone: false
})
export class ContactComponent implements OnInit {

  constructor() {}

  ngOnInit(): void {
    // Aquí podrías cargar información dinámica si lo necesitas
    console.log('Página de contacto inicializada correctamente');
  }


}

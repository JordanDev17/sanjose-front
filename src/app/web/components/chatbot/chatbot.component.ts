// src/app/web/components/chatbot/chatbot.component.ts
import { Component, OnInit, OnDestroy, HostBinding, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ChatbotService, ChatbotResponse, ChatbotOption } from '../../services/chatbot.service';
import { ThemeService } from '../../../core/theme/theme.service';

import {
  trigger,
  transition,
  style,
  animate,
} from '@angular/animations';

import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

// Interfaz para el tipo de mensaje en la conversación
interface Message {
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
  options?: ChatbotOption[];
}

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css'],
  standalone: false,
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(30px)' }))
      ])
    ])
  ]
})
export class ChatbotComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('chatMessages', { static: false }) chatMessagesElement!: ElementRef;
  
  messages: Message[] = [];
  isChatOpen: boolean = false;
  isLoading: boolean = false;
  currentOptions: ChatbotOption[] = [];
  private isInitialized: boolean = false;
  private shouldScrollToBottom: boolean = false;

  private themeSubscription!: Subscription;

  @HostBinding('class.dark-mode') isDarkModeActive: boolean = false;

  constructor(
    private chatbotService: ChatbotService,
    private themeService: ThemeService
  ) { }

  ngOnInit(): void {
    this.themeSubscription = this.themeService.darkMode$.subscribe(isDark => {
      this.isDarkModeActive = isDark;
    });

    // 💡 Abrir e inicializar automáticamente el chat
    this.isChatOpen = true;
    this.initChat();
    console.log("Chatbot initialized and opened automatically.");
  }


  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  /**
   * Inicializa el chat solicitando el menú principal
   */
  private initChat(): void {
    if (this.isInitialized) {
      return; // Ya está inicializado
    }

    this.isLoading = true;
    this.chatbotService.selectOption(null)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response: ChatbotResponse) => {
          this.addBotMessage(response.message, response.options);
          this.isInitialized = true;
        },
        error: (error) => {
          console.error('Error al iniciar el chatbot:', error);
          this.addBotMessage('Lo siento, hubo un problema al iniciar el chat. Por favor, inténtalo de nuevo más tarde.');
          this.isInitialized = true; // Marcar como inicializado aunque haya error
        }
      });
  }

  /**
   * Alterna la visibilidad del chatbot
   */
  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
    
    if (this.isChatOpen) {
      // Inicializar solo si no está inicializado
      if (!this.isInitialized) {
        this.initChat();
      } else {
        // Si ya está inicializado, solo hacer scroll al final
        this.shouldScrollToBottom = true;
      }
    }

    console.log("Chatbot toggled. Now visible:", this.isChatOpen);
  }

  /**
   * Maneja la selección de una opción por parte del usuario
   */
  selectOption(option: ChatbotOption): void {
    if (this.isLoading) {
      return; // Prevenir múltiples clicks
    }

    // Añadir el mensaje del usuario
    this.addUserMessage(option.text);
    
    // Limpiar opciones actuales inmediatamente
    this.currentOptions = [];
    this.isLoading = true;

    // Manejar la opción de salida
    if (option.value === 'exit') {
      this.handleExitOption(option);
      return;
    }

    // Procesar la opción seleccionada
    this.chatbotService.selectOption(option.value)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response: ChatbotResponse) => {
          this.addBotMessage(response.message, response.options);
        },
        error: (error) => {
          console.error('Error al seleccionar opción:', error);
          this.addBotMessage('Lo siento, hubo un error al procesar tu selección. Por favor, inténtalo de nuevo.');
          // En caso de error, restaurar opciones previas si es necesario
          this.restorePreviousOptions();
        }
      });
  }

  /**
   * Maneja específicamente la opción de salida
   */
  private handleExitOption(option: ChatbotOption): void {
    this.chatbotService.selectOption(option.value)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response: ChatbotResponse) => {
          this.addBotMessage(response.message, response.options);
          
          // Cerrar el chat después de un breve delay
          setTimeout(() => {
            this.closeChatAndReset();
          }, 2000);
        },
        error: (error) => {
          console.error('Error al salir del chatbot:', error);
          this.addBotMessage('Ocurrió un error al intentar salir. Puedes cerrar la ventana manualmente.');
          
          // Permitir cierre manual en caso de error
          setTimeout(() => {
            this.closeChatAndReset();
          }, 3000);
        }
      });
  }

  /**
   * Cierra el chat y resetea el estado
   */
  private closeChatAndReset(): void {
    this.isChatOpen = false;
    this.resetChatState();
  }

  /**
   * Resetea completamente el estado del chat
   */
  resetChatState(): void {
    this.messages = [];
    this.currentOptions = [];
    this.isInitialized = false;
    this.isLoading = false;
  }

  /**
   * Añade un mensaje del usuario al historial
   */
  private addUserMessage(text: string): void {
    const message: Message = {
      type: 'user',
      text: text,
      timestamp: new Date()
    };
    
    this.messages.push(message);
    this.shouldScrollToBottom = true;
  }

  /**
   * Añade un mensaje del bot al historial
   */
  private addBotMessage(text: string, options: ChatbotOption[] = []): void {
    const message: Message = {
      type: 'bot',
      text: text,
      timestamp: new Date(),
      options: options
    };
    
    this.messages.push(message);
    this.currentOptions = [...options]; // Crear una copia para evitar referencias
    this.shouldScrollToBottom = true;
  }

  /**
   * Restaura las opciones previas en caso de error
   */
  private restorePreviousOptions(): void {
    // Buscar el último mensaje del bot que tenga opciones
    for (let i = this.messages.length - 1; i >= 0; i--) {
      const message = this.messages[i];
      if (message.type === 'bot' && message.options && message.options.length > 0) {
        this.currentOptions = [...message.options];
        break;
      }
    }
  }

  /**
   * Desplaza el área de mensajes hasta el final
   */
  private scrollToBottom(): void {
    if (this.chatMessagesElement && this.chatMessagesElement.nativeElement) {
      const element = this.chatMessagesElement.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  /**
   * Método público para forzar el reinicio del chat (útil para testing o casos especiales)
   */
  public forceReset(): void {
    this.resetChatState();
    if (this.isChatOpen) {
      this.initChat();
    }
  }

 
trackByMessage(index: number, message: Message): string {
  return `${message.type}-${message.timestamp.getTime()}`;
}


trackByOption(index: number, option: ChatbotOption): string {
  return option.value;
}
}
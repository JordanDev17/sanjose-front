// home.component.ts

import { Component, OnInit, AfterViewInit, OnDestroy, ViewChildren, ViewChild, QueryList, ElementRef,  HostListener } from '@angular/core';
import { gsap } from 'gsap'; // Importa la librería principal de GSAP
import { TextPlugin } from 'gsap/TextPlugin'; // Importa el plugin TextPlugin para el efecto typewriter
import { ScrollTrigger } from 'gsap/ScrollTrigger'; // Importa ScrollTrigger para animaciones basadas en el scroll
import { Subscription } from 'rxjs'; // Importa Subscription para manejar las suscripciones de forma segura

// IMPORTANTE: Registra los plugins de GSAP AQUÍ, FUERA DE LA CLASE DEL COMPONENTE.
// Esto asegura que los plugins estén disponibles globalmente para todas las animaciones de GSAP
// antes de que cualquier instancia de componente intente usar sus propiedades.
gsap.registerPlugin(TextPlugin, ScrollTrigger);

// Define la interfaz Servicio para tipar los servicios que se mostrarán en la sección de servicios
// --- NUEVA INTERFAZ PARA DEFINIR LA ESTRUCTURA DE UN SERVICIO ---
interface ServiceItem {
  iconPath: string; // El atributo 'd' del SVG
  iconColor: string; // Color para el ícono y la lista (ej. 'blue', 'green', 'yellow', 'red', 'teal', 'purple')
  gradientFrom: string; // Clase de Tailwind para el inicio del degradado (ej. 'from-blue-500')
  gradientTo: string; // Clase de Tailwind para el final del degradado (ej. 'to-blue-700')
  // Clases de fondo para modo claro y oscuro
  bgColorLight: string;      // Ej: 'bg-white'
  bgColorDark: string;       // Ej: 'dark:bg-gray-800'
  hoverBgColorLight: string; // Ej: 'bg-blue-100'
  hoverBgColorDark: string;  // Ej: 'dark:bg-blue-900'
  title: string;
  description: string;
  features: string[]; // Un array de cadenas para los ítems de la lista
}


// Importaciones para las secciones de noticias y modelos
import { NewsService } from '../../services/news.service'; // Asegúrate de que esta ruta sea correcta
import { News } from '../../models/news.model'; // Asegúrate de que esta ruta y el modelo sean correctos

// Importa el componente del chatbot
import { ChatbotComponent } from '../../components/chatbot/chatbot.component';

@Component({
  selector: 'app-web-home', // Selector del componente, usado en el HTML de la aplicación
  templateUrl: './web-home.component.html', // Ruta al archivo HTML de la plantilla
  styleUrls: ['./web-home.component.css'], // Rutas a los archivos CSS/SCSS de estilos
  standalone: false // Indica si el componente es standalone o parte de un NgModule
})


export class WebHomeComponent implements OnInit, AfterViewInit, OnDestroy {

  // Define un array de servicios que se mostrarán en la sección de servicios
   // --- ARRAY DE SERVICIOS - ¡AHORA PUEDES MANEJARLOS AQUÍ! ---
  services: ServiceItem[] = [
    {
      iconPath: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 16h6m-6 0h-6m-9 0H3m2 0h5M7 8h10V5H7v3z",
      iconColor: "blue",
      gradientFrom: "from-blue-500",
      gradientTo: "to-blue-700",
      bgColorLight: "bg-white",
      bgColorDark: "dark:bg-gray-800",
      hoverBgColorLight: "bg-blue-100", // Fondo al pasar el mouse (claro)
      hoverBgColorDark: "dark:bg-blue-900", // Fondo al pasar el mouse (oscuro) - puedes ajustar la tonalidad de gris o usar dark:bg-blue-900
      title: "Infraestructura de Vanguar",
      description: "Lotes urbanizados, energía confiable, telecomunicaciones de alta velocidad y amplias vías de acceso para tu operación.",
      features: [
        "Suministro energético robusto y escalable",
        "Red de fibra óptica de última generación",
        "Sistemas de seguridad y vigilancia 24/7"
      ]
    },
    {
      iconPath: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.592 1M12 8V7m0 12v-1m-4-6H9m6 0h1m-6.852 6.852A2.493 2.493 0 0112 18a2.493 2.493 0 01-1.464-.54l-.454-.364-1.636-1.636a2.493 2.493 0 01-.54-.364-.454-.364-1.636-1.636-1.464-.54a2.493 2.493 0 01-.54-.364L7 9.493A2.493 2.493 0 016.493 8M12 21a9 9 0 110-18 9 9 0 010 18z",
      iconColor: "green",
      gradientFrom: "from-green-500",
      gradientTo: "to-green-700",
      bgColorLight: "bg-white",
      bgColorDark: "dark:bg-gray-800",
      hoverBgColorLight: "bg-green-100",
      hoverBgColorDark: "dark:bg-green-900", // Ajusta el tono de gris para dark mode o usa dark:bg-green-900
      title: "Soluciones Logísticas Eficientes",
      description: "Ubicación estratégica con acceso privilegiado a principales rutas, centros de distribución y transporte multimodal.",
      features: [
        "Conectividad terrestre y aérea optimizada",
        "Amplios espacios de almacenamiento y distribución",
        "Asesoría en gestión de cadena de suministro"
      ]
    },
    {
      iconPath: "M21 13.255A23.593 23.593 0 0112 15c-3.183 0-6.22-1.127-8.455-3.245m16.91 0A23.593 23.593 0 0112 9c-3.183 0-6.22 1.127-8.455 3.245m16.91 0C18.777 15.541 15.114 18 12 18s-6.777-2.459-8.455-4.755M21 13.255V5a2 2 0 00-2-2H5a2 2 0 00-2 2v8.255m18 0a8.555 8.555 0 01-2 1.745l-.463.315C17.398 15.751 14.862 16.5 12 16.5s-5.398-.749-6.537-1.44C4.855 14.995 3 14.255 3 13.255m18 0c0-1.099-1.855-1.844-3.463-2.605C15.138 9.255 12.602 8.5 12 8.5s-3.138.755-4.537 1.15C6.855 11.411 3 12.156 3 13.255",
      iconColor: "yellow",
      gradientFrom: "from-yellow-500",
      gradientTo: "to-yellow-700",
      bgColorLight: "bg-white",
      bgColorDark: "dark:bg-gray-800",
      hoverBgColorLight: "bg-yellow-100",
      hoverBgColorDark: "dark:bg-yellow-900", // Ajusta el tono de gris para dark mode o usa dark:bg-yellow-900
      title: "Servicios Empresariales Integrados",
      description: "Asesoría legal, apoyo en gestión de talento, servicios financieros y soluciones tecnológicas para optimizar tu operación.",
      features: [
        "Consultoría especializada y apoyo regulatorio",
        "Networking empresarial y sinergias comerciales",
        "Soporte técnico y tecnológico avanzado"
      ]
    },
    {
      iconPath: "M9 12l2 2 4-4m5.618-4.382a12.007 12.007 0 011.066 0c.45-.008.902.072 1.332.222a2.49 2.49 0 011.455 1.455c.15.43.23.882.222 1.332a12.007 12.007 0 010 1.066c-.008.45-.072.902-.222 1.332a2.49 2.49 0 01-1.455 1.455c-.43.15-.882.23-1.332.222a12.007 12.007 0 01-1.066 0c-.45.008-.902-.072-1.332-.222a2.49 2.49 0 01-1.455-1.455c-.15-.43-.23-.882-.222-1.332a12.007 12.007 0 010-1.066c.008-.45.072-.902.222-1.332a2.49 2.49 0 011.455-1.455c.43-.15.882-.23 1.332-.222z",
      iconColor: "red",
      gradientFrom: "from-red-500",
      gradientTo: "to-red-700",
      bgColorLight: "bg-white",
      bgColorDark: "dark:bg-gray-800",
      hoverBgColorLight: "bg-red-100",
      hoverBgColorDark: "dark:bg-red-900", // Ajusta el tono de gris para dark mode o usa dark:bg-red-900
      title: "Seguridad y Vigilancia 24/7",
      description: "Un entorno seguro con vigilancia constante, control de acceso y protocolos de emergencia eficientes para tu tranquilidad.",
      features: [
        "Cámaras de seguridad de última generación",
        "Personal de vigilancia altamente capacitado",
        "Sistemas de control de acceso avanzados"
      ]
    },
    {
      iconPath: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5A2.5 2.5 0 005 7.5c0 1.314.9 2.382 2.164 2.871m10.336-2.871C13.168 5.477 14.754 5 16.5 5A2.5 2.5 0 0119 7.5c0 1.314-.9 2.382-2.164 2.871m-4.992 0H12H8.913m0 0C7.683 17.151 7.23 20 7.5 20c.328 0 .56-.633.72-1.334M12 21.253v-3m0 3H12h4.992m0 0c1.317-2.151 1.77-5 1.5-5.5.328 0 .56.633.72 1.334M12 21.253a9.004 9.004 0 00-7.5-4.253c-1.252 0-2.253.998-2.253 2.253s.998 2.253 2.253 2.253h15c1.252 0 2.253-.998 2.253-2.253S20.252 17 19 17a9.004 9.004 0 00-7.5-4.253",
      iconColor: "teal",
      gradientFrom: "from-teal-500",
      gradientTo: "to-teal-700",
      bgColorLight: "bg-white",
      bgColorDark: "dark:bg-gray-800",
      hoverBgColorLight: "bg-teal-100",
      hoverBgColorDark: "dark:bg-teal-900", // Ajusta el tono de gris para dark mode o usa dark:bg-teal-900
      title: "Compromiso con la Sostenibilidad",
      description: "Prácticas ecológicas, gestión de residuos y fomento de energías renovables para un futuro más verde y responsable.",
      features: [
        "Amplios espacios verdes y paisajismo sostenible",
        "Programas de reciclaje y manejo de residuos",
        "Fomento de energías renovables y eficiencia energética"
      ]
    },
    {
      iconPath: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101M12 12c-1.016 0-2.032.321-2.902.969-.747.545-1.464 1.34-2.181 2.4-1.025 1.556-1.571 3.522-1.571 5.631a.5.5 0 00.5.5h15a.5.5 0 00.5-.5c0-2.109-.546-4.075-1.571-5.631-.717-1.06-1.434-1.855-2.181-2.4-.87-.648-1.886-.969-2.902-.969zm0 0V3m0 0H7m5 0h5",
      iconColor: "purple",
      gradientFrom: "from-purple-500",
      gradientTo: "to-purple-700",
      bgColorLight: "bg-white",
      bgColorDark: "dark:bg-gray-800",
      hoverBgColorLight: "bg-purple-100",
      hoverBgColorDark: "dark:bg-purple-900", // Ajusta el tono de gris para dark mode o usa 
      title: "Conectividad Estratégica",
      description: "Ubicación privilegiada cerca de vías principales, aeropuertos y centros logísticos clave para una distribución eficiente.",
      features: [
        "Acceso rápido a mercados nacionales e internacionales",
        "Infraestructura vial optimizada para el transporte pesado",
        "Proximidad a puertos y aduanas para comercio exterior"
      ]
    }
  ];


  // @ViewChildren es un decorador que permite obtener referencias a los elementos del DOM
  // que tienen la referencia local 'serviceCard' en el template.
  // QueryList es una lista de elementos que se actualiza si el DOM cambia.
  // ElementRef es una envoltura nativa de Angular para acceder directamente al elemento del DOM.
  @ViewChildren('serviceCard') serviceCards!: QueryList<ElementRef>;

   // Decorador para obtener una referencia al componente hijo del chatbot
  // 'chatbotComponentRef' debe coincidir con el #nombre en tu HTML.
  // La exclamación (!) le dice a TypeScript que esta propiedad se inicializará
  // antes de ser usada (durante el ciclo de vida de Angular).
  @ViewChild('chatbotComponentRef') chatbotComponentRef!: ChatbotComponent;

  // Referencias a los elementos del DOM para animar
  // Las cadenas en @ViewChild deben coincidir con las variables de referencia de plantilla (#nombreVariable) en el HTML.
  @ViewChild('tourTitle') tourTitle!: ElementRef;
  @ViewChild('tourSubtitle') tourSubtitle!: ElementRef;
  @ViewChild('tourCta') tourCta!: ElementRef;
  @ViewChild('tourContainer') tourContainer!: ElementRef;

  newsList: News[] = []; // Array para almacenar las noticias
  loading: boolean = true; // Indicador de carga de noticias
  errorMessage: string | null = null; // Mensaje de error si falla la carga de noticias

  private typewriterTimeline!: gsap.core.Timeline; // Declara una línea de tiempo para controlar el efecto typewriter
  private subscriptions: Subscription[] = []; // Array para almacenar todas las suscripciones y desuscribirse en OnDestroy

  // Inyecta el servicio NewsService en el constructor de la clase.
  constructor(private newsService: NewsService) {}

  /**
   * Hook del ciclo de vida de Angular que se ejecuta una vez que el componente ha sido inicializado.
   * Es un buen lugar para iniciar la carga de datos que no dependen de la vista.
   */
  ngOnInit(): void {
    this.loadNews();
  }

  /**
   * Hook del ciclo de vida de Angular que se ejecuta después de que la vista del componente
   * y sus vistas secundarias han sido completamente inicializadas.
   * Es el lugar ideal para iniciar animaciones que interactúan con los elementos del DOM.
   */
  ngAfterViewInit(): void {
    this.animateHeroSection(); // Inicia las animaciones de la sección principal.
    this.setupServiceCardAnimations(); // Configura las animaciones de las tarjetas de servicios.
    this.setupServiceCardAnimationsTwo(); // Configura hovers y animaciones sutiles
    this.setupHorizontalScrollCarousel(); // Configura el carrusel horizontal

     // Ahora, el check de ViewChild será más fiable.
    // Aunque el setTimeout es una buena medida de seguridad, con las referencias correctas,
    // deberían estar disponibles en ngAfterViewInit casi siempre.
    if (this.tourTitle && this.tourSubtitle && this.tourCta && this.tourContainer) {
      this.animateTourSection();
    } else {
      console.warn('Elementos del tour virtual no encontrados directamente en ngAfterViewInit. Reintentando en 500ms.');
      setTimeout(() => {
        if (this.tourTitle && this.tourSubtitle && this.tourCta && this.tourContainer) {
          this.animateTourSection();
        } else {
          console.error('Elementos del tour virtual no encontrados para animar después del reintento. Por favor, verifica el HTML y los nombres de las variables de referencia de plantilla (#nombreVariable).');
        }
      }, 500);
    }
  }

  private animateTourSection(): void {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // Animación para el título
    tl.to("#tour-title", {
      opacity: 1,
      y: 0,
      duration: 1.2,
      delay: 0.2 // Pequeño retraso para que no sea instantáneo
    });

    // Animación para el subtítulo
    tl.to("#tour-subtitle", {
      opacity: 1,
      y: 0,
      duration: 1,
    }, "-=0.8"); // Empieza 0.8s antes de que termine la animación anterior (superposición)

    // Animación para el botón CTA
    tl.to("#tour-cta", {
      opacity: 1,
      scale: 1,
      duration: 0.8,
    }, "-=0.6"); // Empieza 0.6s antes de que termine la animación anterior

    // Animación para el contenedor del tour virtual (aparece sutilmente detrás)
    tl.to("#tour-container", {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)", // Elimina el desenfoque
      duration: 1.5,
    }, "-=1.2"); // Empieza 1.2s antes de que termine la animación anterior

    // Opcional: Animar algo más cuando el tour ya esté visible, por ejemplo,
    // que la autorotación comience después de un tiempo si quieres que se vea el texto principal primero.
    // Esto ya lo tienes controlado en virtual-tour.component.ts si APP_DATA.settings.autorotateEnabled es true.
  }


    // --- Nueva función para animar la salida del texto ---
  // @HostListener para capturar el click en el botón CTA
  // Esto es más robusto que agregar un listener directamente en el HTML
  @HostListener('click', ['$event.target'])
  onClick(targetElement: HTMLElement): void {
    if (targetElement.id === 'tour-cta') {
      this.hideTourOverlayText();
    }
  }

  private hideTourOverlayText(): void {
    const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });

    // Animar el contenedor principal del texto para que se deslice hacia abajo y se desvanezca
    tl.to(this.tourTitle.nativeElement.parentElement?.parentElement, { // Accede al div que contiene el texto y el botón
      y: '100%', // Mueve hacia abajo por el 100% de su propia altura
      opacity: 0,
      duration: 1.0,
      onComplete: () => {
        // Opcional: remover el elemento del DOM o esconderlo con display: none después de la animación
        // para asegurar que no interfiera si hay alguna situación rara con pointer-events
        if (this.tourTitle.nativeElement.parentElement?.parentElement) {
          this.tourTitle.nativeElement.parentElement.parentElement.style.display = 'none';
        }
      }
    });

    // Opcional: Podrías querer que el tour haga un zoom in o alguna otra animación
    // si el tour no está ya en su estado final de animación de entrada.
    // En este caso, ya está en opacity: 1, scale: 1, blur: 0, así que no es estrictamente necesario,
    // pero si lo haces visible solo con el botón, aquí iría.
  }

   /**
   * loadNews: Función para cargar las noticias usando el NewsService.
   * Se suscribe al observable para manejar la respuesta exitosa o los errores.
   */
  private loadNews(): void {
    this.loading = true;     // Activa el indicador de carga
    this.errorMessage = '';  // Limpia cualquier mensaje de error anterior

    const newsSub = this.newsService.getNews(1, 5, 'publicado').subscribe({
      next: (response: News[]) => {
        console.log('Noticias recibidas:', response);
        this.newsList = response;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar noticias:', error);
        this.errorMessage = 'No se pudieron cargar las noticias. Inténtalo más tarde.';
        this.loading = false;
      }
    });
    this.subscriptions.push(newsSub); // Añade la suscripción al array para limpiarla
  }

  /**
   * Función `trackBy` para el `*ngFor` de `newsList`.
   * Es crucial para el rendimiento en Angular al re-renderizar listas.
   * @param index El índice del elemento.
   * @param news El objeto de la noticia.
   * @returns El ID único de la noticia.
   */
  trackById(index: number, news: News): number {
    return news.id; // Asume que cada noticia tiene una propiedad `id` única.
  }

  /**
   * animateHeroSection: Función para orquestar todas las animaciones de la sección hero.
   * Se llama en ngAfterViewInit para asegurar que el DOM esté listo.
   */
  private animateHeroSection(): void {
    // Animación de aparición para el título principal
    gsap.from("#main-heading", {
      duration: 1.5, // Duración de la animación en segundos
      y: 50, // Mueve el elemento 50px hacia arriba desde su posición final (efecto de subir)
      opacity: 0, // Inicia con opacidad 0 (invisible)
      ease: "power3.out", // Tipo de easing para un movimiento suave y con un ligero "rebote" al final
      delay: 0.5 // Retraso de 0.5 segundos antes de que comience la animación del título
    });

    // Texto para el efecto Typewriter
    const descriptionText = "Ofrecemos instalaciones de vanguardia, logística eficiente y un entorno seguro para su negocio. Descubra un espacio donde la innovación y el crecimiento se encuentran, diseñado para impulsar su éxito.";
    const typewriterElement = document.getElementById('typewriter-text'); // Obtiene la referencia al elemento <p> por su ID

    if (typewriterElement) {
      // Crea una línea de tiempo GSAP para el efecto typewriter.
      // Las líneas de tiempo son útiles para encadenar y controlar múltiples animaciones secuencialmente.
      this.typewriterTimeline = gsap.timeline({
        delay: 2, // Retraso de 2 segundos antes de que inicie el efecto typewriter (después de la animación del título)
        onComplete: () => {
          // Callback que se ejecuta cuando el efecto typewriter ha terminado.
          console.log('Efecto typewriter completado.');
          // Aquí podrías añadir una animación de cursor parpadeante (ver CSS)
        }
      });

      // Añade la animación del efecto typewriter a la línea de tiempo.
      // La propiedad 'text' es proporcionada por el TextPlugin.
      this.typewriterTimeline.to(typewriterElement, {
        duration: descriptionText.length * 0.04, // Duración calculada: 0.04 segundos por caracter para velocidad constante
        text: {
          value: descriptionText, // El texto que se va a 'escribir'
          // Para un cursor parpadeante, puedes añadir un span aquí:
          // value: descriptionText + '<span class="cursor">|</span>'
        },
        ease: "none", // Easing 'none' para que la escritura sea a velocidad constante (sin aceleración/desaceleración)
        onUpdate: () => {
          // Callback que se ejecuta en cada frame de la animación del typewriter.
          // Asegura que el elemento <p> se haga visible a medida que se escribe el texto.
          if (typewriterElement.classList.contains('opacity-0')) {
            typewriterElement.classList.remove('opacity-0');
          }
        }
      });
    }

    // Animación escalonada (staggered) para los botones de navegación (si existen, con clase .btn-hero)
// Animación escalonada (staggered) para los botones de navegación (si existen, con clase .btn-hero)
    // Se tipa explícitamente el array a HTMLElement[] para que TypeScript no infiera 'unknown'.
    (gsap.utils.toArray('.btn-hero') as HTMLElement[]).forEach((button: HTMLElement, index: number) => {
      gsap.to(button, {
        duration: 0.8, // Duración de la animación de cada botón
        y: 0, // Mueve el botón a su posición final (0px de desplazamiento vertical)
        opacity: 1, // Cambia la opacidad a 1 (visible)
        ease: "back.out(1.7)", // Easing con un ligero 'retroceso' para un efecto más dinámico y juguetón
        delay: 3.5 + (index * 0.2) // Retraso: comienza después del typewriter (3.5s) y añade un retraso escalonado de 0.2s para cada botón
      });
    });
  }

  /**
   * setupServiceCardAnimations: Configura las animaciones de las tarjetas de servicios.
   * Utiliza la suscripción a 'serviceCards.changes' para asegurar que las animaciones se apliquen
   * una vez que todos los elementos estén disponibles en el DOM.
   */
  
  private setupServiceCardAnimations(): void {
    // Suscribirse a los cambios en QueryList. Esto es crucial cuando los elementos pueden
    // ser renderizados dinámicamente (ej. *ngFor) o no estar disponibles inmediatamente
    // en ngAfterViewInit.
    const serviceCardSub = this.serviceCards.changes.subscribe(() => {
      if (this.serviceCards.length > 0) {
        this.animateServiceCards();
        // Una vez que las animaciones se han configurado, podemos desuscribirnos
        // si no esperamos más cambios dinámicos en las tarjetas.
        // Si las tarjetas pueden agregarse/eliminarse dinámicamente después de la carga inicial,
        // podrías querer mantener la suscripción y ajustar la lógica.
        serviceCardSub.unsubscribe();
      }
    });
    this.subscriptions.push(serviceCardSub); // Añade la suscripción para limpiarla

    // Si las tarjetas ya están disponibles en la primera comprobación (sin cambios iniciales),
    // también debemos animarlas.
    if (this.serviceCards.length > 0) {
      this.animateServiceCards();
    }

    // Animación de los títulos y descripciones de la sección de servicios
    gsap.from("#services-title", {
      opacity: 0,
      y: 50,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: "#services-title",
        start: "top 85%", // Cuando el título entra en la vista
        toggleActions: "play none none reverse",
      }
    });

    gsap.from("#services-description", {
      opacity: 0,
      y: 50,
      duration: 1,
      ease: "power3.out",
      delay: 0.2, // Ligero retraso después del título
      scrollTrigger: {
        trigger: "#services-description",
        start: "top 85%", // Cuando la descripción entra en la vista
        toggleActions: "play none none reverse",
      }
    });


  }

  /**
   * animateServiceCards: Función que aplica las animaciones de GSAP a las tarjetas de servicios.
   * Esta función se llama solo cuando se sabe que las tarjetas están presentes en el DOM.
   */


  private animateServiceCards(): void {
    gsap.from("#serviceCard", {
      opacity: 1, // Asegura que las tarjetas comiencen invisibles
      y: 50,
      duration: 0.5,
      ease: "power3.out",
      scrollTrigger: {
        trigger: "#serviceCard",
        start: "top 100%", 
        toggleActions: "play none none reverse",
        
      }
    });

    // Animaciones individuales para cada tarjeta al pasar el mouse (hover) y al hacer scroll
    this.serviceCards.forEach((card: ElementRef, i: number) => {
      const element = card.nativeElement;
      const service = this.services[i]; // Obtiene el objeto de servicio correspondiente

      if (!service) return; // Seguridad en caso de que el índice no coincida

      // Almacenar las clases de fondo iniciales y de hover para fácil manipulación
      const initialBgClasses = `${service.bgColorLight} ${service.bgColorDark}`;
      const hoverBgClasses = `${service.hoverBgColorLight} ${service.hoverBgColorDark}`;

      // Efecto de escala y sombra al pasar el mouse, Y MANIPULACIÓN DE CLASES DE FONDO
      element.addEventListener('mouseenter', () => {
        // Remueve las clases de fondo iniciales y añade las de hover
        element.classList.remove(...initialBgClasses.split(' '));
        element.classList.add(...hoverBgClasses.split(' '));

        gsap.to(element, {
          scale: 1.05,
          boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.2)', // Sombra más pronunciada
          duration: 0.3,
          ease: 'power2.out',
          overwrite: true // Evita conflictos con otras animaciones en el mismo elemento
        });
      });

      element.addEventListener('mouseleave', () => {
        // Remueve las clases de fondo de hover y añade las iniciales
        element.classList.remove(...hoverBgClasses.split(' '));
        element.classList.add(...initialBgClasses.split(' '));

        gsap.to(element, {
          scale: 1,
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // Sombra original (establecida en CSS)
          duration: 0.3,
          ease: 'power2.out',
          overwrite: true
        });
      });

      // Animación de rotación y desplazamiento sutil al hacer scroll para cada tarjeta
      // Crea una línea de tiempo para controlar la animación al hacer scroll.
      // Esta animación es sutil y da una sensación de "vida" a las tarjetas.
      gsap.to(element, {
        rotationX: () => Math.random() * 2 - 1, // Pequeña rotación X aleatoria (muy sutil)
        rotationY: () => Math.random() * 2 - 1, // Pequeña rotación Y aleatoria (muy sutil)
        x: () => { // Desplaza ligeramente las tarjetas a la izquierda o derecha
          const viewportWidth = window.innerWidth;
          // Ajusta el factor para controlar la magnitud del desplazamiento
          return (element.getBoundingClientRect().left - viewportWidth / 2) * 0.03;
        },
        ease: 'none', // Sin easing para un movimiento directo con el scroll
        scrollTrigger: {
          trigger: element,
          start: 'top bottom', // Cuando la parte superior del elemento entra en la vista desde abajo
          end: 'bottom top', // Cuando la parte inferior del elemento sale de la vista por arriba
          scrub: 1, // Vincula la animación directamente al scroll (1 = suavizado)
          // markers: true, // Para depuración
        },
      });
    });
  }


   /**
   * setupServiceCardAnimations: Ahora se encarga de configurar los eventos de hover
   * y las animaciones sutiles de rotación/desplazamiento para cada tarjeta.
   * La animación inicial de entrada de las tarjetas es manejada por el ScrollTrigger del carrusel.
   */
  private setupServiceCardAnimationsTwo(): void {
    const initialSetup = () => {
      if (this.serviceCards.length > 0) {
        this.serviceCards.forEach((card: ElementRef, i: number) => {
          const element = card.nativeElement;
          const service = this.services[i];
          const iconElement = element.querySelector('.service-icon'); // Selecciona el icono dentro de la tarjeta

          if (!service) return;

          const initialBgClasses = `${service.bgColorLight} ${service.bgColorDark}`;
          const hoverBgClasses = `${service.hoverBgColorLight} ${service.hoverBgColorDark}`;

          // Asegurarse de que la tarjeta empiece con las clases de fondo iniciales
          element.classList.remove(...hoverBgClasses.split(' '));
          element.classList.add(...initialBgClasses.split(' '));

          // Efecto de escala y sombra al pasar el mouse, Y MANIPULACIÓN DE CLASES DE FONDO
          element.addEventListener('mouseenter', () => {
            element.classList.remove(...initialBgClasses.split(' '));
            element.classList.add(...hoverBgClasses.split(' '));

            gsap.to(element, {
              scale: 1.05,
              boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.2)',
              duration: 0.3,
              ease: 'power2.out',
              overwrite: true
            });

            // Animación del icono al hacer hover
            if (iconElement) {
              gsap.to(iconElement, {
                rotation: 360,
                scale: 1.2,
                duration: 0.5,
                ease: 'back.out(1.7)',
                overwrite: true
              });
            }
          });

          element.addEventListener('mouseleave', () => {
            element.classList.remove(...hoverBgClasses.split(' '));
            element.classList.add(...initialBgClasses.split(' '));

            gsap.to(element, {
              scale: 1,
              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
              duration: 0.3,
              ease: 'power2.out',
              overwrite: true
            });

            // Revierte la animación del icono al salir del hover
            if (iconElement) {
              gsap.to(iconElement, {
                rotation: 0,
                scale: 1,
                duration: 0.3,
                ease: 'power2.out',
                overwrite: true
              });
            }
          });

          // Animación de rotación y desplazamiento sutil al hacer scroll para cada tarjeta
          // Esta animación se aplicará junto con el scroll horizontal del carrusel.
          // El trigger ahora es la sección del carrusel.
          gsap.to(element, {
            rotationX: () => Math.random() * 2 - 1,
            rotationY: () => Math.random() * 2 - 1,
            ease: 'none',
            scrollTrigger: {
              trigger: '#horizontal-scroll-section',
              start: 'top top',
              end: 'bottom bottom',
              scrub: 1,
            },
          });
        });
      }
    };

    // Comprobar si las tarjetas ya están disponibles en la carga inicial
    initialSetup();

    // Suscribirse a cambios si las tarjetas se renderizan dinámicamente después
    const serviceCardChangesSub = this.serviceCards.changes.subscribe(() => {
      initialSetup();
      // Una vez que las animaciones se han configurado para todas las tarjetas (asumiendo que no cambian más),
      // podemos desuscribirnos para evitar ejecuciones repetidas innecesarias.
      serviceCardChangesSub.unsubscribe();
    });
    this.subscriptions.push(serviceCardChangesSub);
  }

  /**
   * setupHorizontalScrollCarousel: Configura el carrusel horizontal con ScrollTrigger.
   * Fija la sección y desplaza el contenido horizontalmente al hacer scroll vertical.
   */
  private setupHorizontalScrollCarousel(): void {
    const carouselContainer = document.getElementById('service-carousel-container');
    const scrollSection = document.getElementById('horizontal-scroll-section');

    if (carouselContainer && scrollSection && this.serviceCards.length > 0) {
      const cards = this.serviceCards.toArray().map(card => card.nativeElement);

      // Calcula cuánto necesitamos desplazar el contenedor.
      // `scrollWidth` es el ancho total del contenido.
      // `offsetWidth` es el ancho visible del contenedor que se va a fijar.
      const scrollAmount = carouselContainer.scrollWidth - scrollSection.offsetWidth;

      // Asegurarse de que las tarjetas comiencen ocultas para la animación de entrada controlada por el carrusel
      gsap.set(cards, { opacity: 0, y: 80 });

      gsap.to(carouselContainer, {
        x: -scrollAmount, // Desplaza el contenedor hacia la izquierda
        ease: "none",
        scrollTrigger: {
          trigger: scrollSection,
          pin: true, // "Fija" la sección mientras se desplaza el carrusel
          start: "top top", // Empieza a fijarse cuando la parte superior de la sección toca la parte superior del viewport
          end: () => "+=" + scrollAmount, // Termina de fijarse después de desplazar el ancho total del carrusel
          scrub: 1, // Vincula el movimiento directamente al scroll
          // markers: true, // Para depuración - ¡descomenta para ver los marcadores de ScrollTrigger!
          onUpdate: (self) => {
            // Animación de entrada inicial de las tarjetas basada en el progreso del scroll.
            // Cada tarjeta aparecerá a medida que el carrusel se desplaza por ella.
            cards.forEach((card, index) => {
              const cardPosition = card.offsetLeft; // Posición de la tarjeta dentro del carrusel
              const sectionWidth = scrollSection.offsetWidth;
              const scrollX = -gsap.getProperty(carouselContainer, "x"); // Posición actual del scroll horizontal del carrusel

              // Define un rango de aparición para cada tarjeta cuando entra en la vista del carrusel
              const startThreshold = cardPosition - sectionWidth * 0.7; // Empieza a aparecer cuando la tarjeta está 70% del ancho de la sección a la izquierda
              const endThreshold = cardPosition - sectionWidth * 0.3; // Completamente visible cuando la tarjeta está 30% del ancho de la sección a la izquierda

              // Normaliza el progreso de visibilidad de la tarjeta (0 a 1)
              const cardVisibilityProgress = gsap.utils.normalize(startThreshold, endThreshold, scrollX);

              if (cardVisibilityProgress > 0 && cardVisibilityProgress < 1) {
                // Anima la tarjeta si está dentro del rango de visibilidad
                gsap.to(card, {
                  opacity: 1,
                  y: 0,
                  duration: 0.5,
                  ease: "power3.out",
                  overwrite: true, // Importante para que las animaciones no se pisen
                });
              } else if (cardVisibilityProgress <= 0) {
                  // Si el scroll está antes de la tarjeta, asegúrate de que esté invisible y en su posición inicial
                  gsap.set(card, { opacity: 0, y: 80 });
              }
              // Si cardVisibilityProgress >= 1, la tarjeta ya ha pasado y está completamente visible (o fuera de vista a la izquierda).
              // No es necesario resetearla a invisible en este caso, ya que el ScrollTrigger principal las mantiene en su estado final.
            });
          }
        },
      });
    } else {
      // Fallback si no se encuentran los elementos para el carrusel
      console.warn("No se encontraron los elementos necesarios para el carrusel horizontal. Se intentará una animación de grid tradicional.");
      // Aquí, si el carrusel no se puede configurar, puedes volver a la animación de grid inicial
      const cards = this.serviceCards.toArray().map(card => card.nativeElement);
      gsap.from(cards, {
        scrollTrigger: {
          trigger: '.container.mx-auto.mt-16', // Usa el contenedor original de las tarjetas como trigger
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
        opacity: 1,
        y: 0,
        stagger: 0.18,
        duration: 0.9,
        ease: 'power3.out',
      });
    }
  }




  /**
   * ngOnDestroy: Hook del ciclo de vida que se ejecuta justo antes de que Angular destruya el componente.
   * Es CRUCIAL para limpiar animaciones, suscripciones y evitar fugas de memoria,
   * especialmente con GSAP y ScrollTrigger.
   */
    ngOnDestroy(): void {
    if (this.typewriterTimeline) {
      this.typewriterTimeline.kill();
    }

    // Mata todos los ScrollTriggers asociados al componente.
    // Esto es CRUCIAL para liberar recursos y evitar comportamientos inesperados,
    // especialmente con `pin: true`.
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());

    // Limpia las animaciones de GSAP de cada tarjeta al destruir el componente
    this.serviceCards.forEach(card => {
      gsap.killTweensOf(card.nativeElement);
      // Asegúrate de que las clases de fondo se restauren al estado original al destruir
      const element = card.nativeElement;
      const index = this.serviceCards.toArray().indexOf(card);
      const service = this.services[index];
      if (service) {
        const initialBgClasses = `${service.bgColorLight} ${service.bgColorDark}`;
        const hoverBgClasses = `${service.hoverBgColorLight} ${service.bgColorDark}`; // Bug fix: Usar bgColorDark aquí
        element.classList.remove(...hoverBgClasses.split(' '));
        element.classList.add(...initialBgClasses.split(' '));
      }
      // Considera remover los event listeners si el componente se va a crear y destruir con frecuencia
      // Para un componente de página principal, es menos crítico, pero buena práctica.
    });

    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
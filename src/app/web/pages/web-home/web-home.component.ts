// src/app/web/pages/web-home/web-home.component.ts

import { Component, OnInit, AfterViewInit, OnDestroy, ViewChildren, ViewChild, QueryList, ElementRef, HostListener } from '@angular/core';
import { gsap } from 'gsap'; // Importa la librería principal de GSAP
import { TextPlugin } from 'gsap/TextPlugin'; // Importa el plugin TextPlugin para el efecto typewriter
import { ScrollTrigger } from 'gsap/ScrollTrigger'; // Importa ScrollTrigger para animaciones basadas en el scroll
import { Subscription, interval } from 'rxjs'; // Importa Subscription para manejar las suscripciones de forma segura
import { Renderer2 } from '@angular/core'; // Importa Renderer2 para manipulación segura del DOM

// IMPORTANTE: Registra los plugins de GSAP AQUÍ, FUERA DE LA CLASE DEL COMPONENTE.
// Esto asegura que los plugins estén disponibles globalmente para todas las animaciones de GSAP
// antes de que cualquier instancia de componente intente usar sus propiedades.
gsap.registerPlugin(TextPlugin, ScrollTrigger);

// Define la interfaz Servicio para tipar los servicios que se mostrarán en la sección de servicios
interface ServiceItem {
  iconPath: string; // El atributo 'd' del SVG
  iconColor: string; // Color para el ícono y la lista (ej. 'blue', 'green', 'yellow', 'red', 'teal', 'purple')
  gradientFrom: string; // Clase de Tailwind para el inicio del degradado (ej. 'from-blue-500')
  gradientTo: string; // Clase de Tailwind para el final del degradado (ej. 'to-blue-700')
  // Clases de fondo para modo claro y oscuro
  bgColorLight: string;       // Ej: 'bg-white'
  bgColorDark: string;      // Ej: 'dark:bg-gray-800'
  hoverBgColorLight: string; // Ej: 'bg-blue-100'
  hoverBgColorDark: string;  // Ej: 'dark:bg-blue-900'
  title: string;
  description: string;
  features: string[]; // Un array de cadenas para los ítems de la lista
}


// Importaciones para las secciones de noticias y modelos
import { NewsService } from '../../services/news.service'; // Asegúrate de que esta ruta sea correcta
import { News, NewsPaginatedResponse } from '../../models/news.model'; // Asegúrate de que esta ruta y el modelo sean correctos

// Importa el componente del chatbot (si es necesario y está en uso)
// import { ChatbotComponent } from '../../components/chatbot/chatbot.component';

@Component({
  selector: 'app-web-home', // Selector del componente, usado en el HTML de la aplicación
  templateUrl: './web-home.component.html', // Ruta al archivo HTML de la plantilla
  styleUrls: ['./web-home.component.css'], // Rutas a los archivos CSS/SCSS de estilos
  standalone: false // Indica si el componente es standalone o parte de un NgModule
})


export class WebHomeComponent implements OnInit, AfterViewInit, OnDestroy {

  // Define un array de servicios que se mostrarán en la sección de servicios
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
      hoverBgColorDark: "dark:bg-yellow-900",
      title: "Servicios Empresariales Integrados",
      description: "Asesoría legal, apoyo en gestión de talento, servicios financieros y soluciones tecnológicas para optimizar tu operación.",
      features: [
        "Consultoría especializada y apoyo regulatorio",
        "Networking empresarial y sinergias comerciales",
        "Soporte técnico y tecnológico avanzado"
      ]
    },
    {
      iconPath: "M9 12l2 2 4-4m5.618-4.382a12.007 12.007 0 011.066 0c.45-.008.902.072 1.332.222a2.49 2.49 0 011.455 1.455c.15.43.23.882.222 1.332a12.007 12.007 0 010 1.066c-.008.45-.072.902-.222 1.332a2.49 2.49 0 01-1.455-1.455c-.15-.43-.23-.882-.222-1.332a12.007 12.007 0 010-1.066c.008-.45.072-.902.222-1.332a2.49 2.49 0 011.455-1.455c.43-.15.882-.23 1.332-.222z",
      iconColor: "red",
      gradientFrom: "from-red-500",
      gradientTo: "to-red-700",
      bgColorLight: "bg-white",
      bgColorDark: "dark:bg-gray-800",
      hoverBgColorLight: "bg-red-100",
      hoverBgColorDark: "dark:bg-red-900",
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
      hoverBgColorDark: "dark:bg-teal-900",
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
      hoverBgColorDark: "dark:bg-purple-900",
      title: "Conectividad Estratégica",
      description: "Ubicación privilegiada cerca de vías principales, aeropuertos y centros logísticos clave para una distribución eficiente.",
      features: [
        "Acceso rápido a mercados nacionales e internacionales",
        "Infraestructura vial optimizada para el transporte pesado",
        "Proximidad a puertos y aduanas para comercio exterior"
      ]
    }
  ];

  @ViewChildren('serviceCard') serviceCards!: QueryList<ElementRef>;

  // Referencias a los elementos del DOM para animar
  @ViewChild('tourTitle') tourTitle!: ElementRef<HTMLHeadingElement>;
  @ViewChild('tourSubtitle') tourSubtitle!: ElementRef<HTMLParagraphElement>;
  @ViewChild('tourCta') tourCta!: ElementRef<HTMLButtonElement>;
  @ViewChild('tourContainer') tourContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('tourOverlayText') tourOverlayText!: ElementRef<HTMLDivElement>;
  @ViewChild('tourSection') tourSection!: ElementRef<HTMLElement>;

  newsList: News[] = [];
  loading: boolean = true;
  errorMessage: string | null = null;

  selectedNews: News | null = null;
  isModalOpen: boolean = false;
  currentIndex: number = 0;
  isTourActive: boolean = false; // Controla si el tour está en modo pantalla completa

  private typewriterTimeline!: gsap.core.Timeline;
  private subscriptions: Subscription[] = [];
  private serviceCarouselMainScrollTrigger: ScrollTrigger | null = null;
  private masterTimeline?: gsap.core.Timeline;
  private intervalSubscription!: Subscription;
  private readonly INTERVAL_TIME = 5000;

  constructor(private newsService: NewsService, private renderer: Renderer2) { }

  ngOnInit(): void {
    this.loadNews();
  }

  ngAfterViewInit(): void {
    this.initHeroAnimation();

    // **OPTIMIZACIÓN Y CORRECCIÓN PARA EL CARRUSEL DE SERVICIOS**
    // Se usa `QueryList.changes` para asegurar que las animaciones del carrusel
    // se configuren solo cuando las tarjetas están presentes en el DOM,
    // y se re-configuren si la lista de tarjetas cambia dinámicamente.
    this.subscriptions.push(
      this.serviceCards.changes.subscribe(() => {
        // Limpiar animaciones de carrusel anteriores antes de configurar las nuevas
        this.clearServiceCarouselAnimations();
        this.setupHorizontalScrollCarousel();
        this.setupServiceCardAnimationsTwo(); // Para los hovers
      })
    );

    // Llamada inicial para el carrusel de servicios si las tarjetas ya están disponibles
    if (this.serviceCards.length > 0) {
      this.setupHorizontalScrollCarousel();
      this.setupServiceCardAnimationsTwo(); // Para los hovers
    }

    // Inicializar la animación de la sección del tour cuando sea visible en el viewport
    // Verificamos que todas las referencias existan antes de crear el ScrollTrigger
    if (this.tourSection && this.tourTitle && this.tourSubtitle && this.tourCta && this.tourContainer && this.tourOverlayText) {
      ScrollTrigger.create({
        trigger: this.tourSection.nativeElement,
        start: "top center", // Cuando la parte superior de la sección entra en el centro de la ventana
        onEnter: () => this.animateTourSection(),
        once: true // Para que la animación solo se ejecute una vez
      });
    } else {
      console.warn('Algunos elementos de la sección del tour no están disponibles en ngAfterViewInit para ScrollTrigger. Asegúrate de que las referencias # están en el HTML.');
    }
  }

  ngOnDestroy(): void {
    this.masterTimeline?.kill();
    // Mata el timeline del efecto typewriter si existe
    if (this.typewriterTimeline) {
      this.typewriterTimeline.kill();
    }

    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }

    // Mata explícitamente el ScrollTrigger principal del carrusel de servicios
    if (this.serviceCarouselMainScrollTrigger) {
      this.serviceCarouselMainScrollTrigger.kill();
      this.serviceCarouselMainScrollTrigger = null; // Liberar la referencia
    }

    // Mata todos los ScrollTriggers anidados de las tarjetas de servicio
    this.serviceCards.forEach((card, index) => {
      const specificTrigger = ScrollTrigger.getById(`serviceCard-${index}`);
      if (specificTrigger) {
        specificTrigger.kill();
      }
      // Mata cualquier otra animación GSAP directamente aplicada a la tarjeta
      gsap.killTweensOf(card.nativeElement);
    });

    // Restaurar clases de fondo de las tarjetas de servicio a su estado inicial
    this.serviceCards.forEach((card, index) => {
      const element = card.nativeElement;
      const service = this.services[index];

      if (service) {
        const initialBgClasses = `${service.bgColorLight} ${service.bgColorDark}`;
        const hoverBgClasses = `${service.hoverBgColorLight} ${service.hoverBgColorDark}`;

        // Remover las clases de hover y añadir las iniciales
        element.classList.remove(...hoverBgClasses.split(' '));
        element.classList.add(...initialBgClasses.split(' '));
      }

    });

    // Desuscribe de todas las suscripciones de RxJS para evitar fugas de memoria
    this.subscriptions.forEach(sub => sub.unsubscribe());

    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }

  /**
   * Anima la entrada del texto de la sección del tour y del contenedor del tour.
   * Se ejecuta una vez cuando la sección entra en el viewport.
   */
  private animateTourSection(): void {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // Animación para el título
    tl.to(this.tourTitle.nativeElement, {
      opacity: 1,
      y: 0,
      duration: 1.2,
      delay: 0.2
    });

    // Animación para el subtítulo
    tl.to(this.tourSubtitle.nativeElement, {
      opacity: 1,
      y: 0,
      duration: 1,
    }, "-=0.8");

    // Animación para el botón CTA
    tl.to(this.tourCta.nativeElement, {
      opacity: 1,
      scale: 1,
      duration: 0.8,
    }, "-=0.6");

    // Animación para el contenedor del tour virtual (aparece sutilmente detrás)
    tl.to(this.tourContainer.nativeElement, {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)", // Elimina el desenfoque
      duration: 1.5,
    }, "-=1.2");
  }

  /**
   * Inicia el tour virtual.
   * Oculta el texto de superposición y activa el modo de pantalla completa para el tour.
   */
  startVirtualTour(): void {
    if (this.isTourActive) {
      return; // Ya está activo, no hagas nada
    }

    const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });

    // 1. Animar la salida del texto de superposición
    tl.to(this.tourOverlayText.nativeElement, {
      y: '100%', // Desliza hacia abajo
      opacity: 0,
      duration: 0.8,
      onComplete: () => {
        // Asegúrate de que el texto no interfiera con los clics del tour
        gsap.set(this.tourOverlayText.nativeElement, { display: 'none', pointerEvents: 'none' });
      }
    });

    // 2. Transicionar la sección completa del tour a modo de "pantalla completa"
    // Esto es si quieres que el tour ocupe toda la ventana del navegador.
    // Cambia la posición a 'fixed' y ajusta el tamaño y z-index.
    tl.to(this.tourContainer.nativeElement, {
      position: 'fixed', // Cambiar a posición fija
      top: 0,
      left: 0,
      width: '100vw',    // Ancho total del viewport
      height: '100vh',   // Altura total del viewport
      zIndex: 40,        // Asegúrate de que esto sea más alto que cualquier otro elemento que quieras que esté debajo
      duration: 0.01     // Prácticamente instantáneo para el cambio de posición
    }, "<"); // Empieza al mismo tiempo que la animación anterior.

    // Deshabilita el scroll del cuerpo para la experiencia inmersiva
    document.body.style.overflow = 'hidden';
    this.isTourActive = true; // Activa el estado del tour
  }

  /**
   * Cierra el tour virtual y restaura la visualización normal de la página.
   */
  closeVirtualTour(): void {
    if (!this.isTourActive) {
      return; // No hay tour activo para cerrar
    }

    const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });

    // 1. Restaurar la posición y tamaño del tour a su estado en el flujo normal de la página
    // Asegúrate de que estos valores coincidan con los estilos CSS iniciales en el HTML
    tl.to(this.tourContainer.nativeElement, {
      position: 'relative', // Vuelve a posición relativa
      top: 'auto',          // Elimina top/left/bottom/right para que vuelva al flujo normal
      left: 'auto',
      width: '100%',        // Ancho normal de la sección
      height: '700px',      // Altura normal de la sección (ajusta si es necesario)
      zIndex: 0,            // Vuelve a su z-index original
      duration: 0.01        // Prácticamente instantáneo
    });


    // 2. Animar la entrada del texto de superposición (restaurarlo)
    tl.to(this.tourOverlayText.nativeElement, {
      y: '0%', // Vuelve a su posición original
      opacity: 1,
      duration: 0.8,
      onStart: () => {
        // Haz que sea visible y recupere los eventos de puntero antes de que la animación empiece
        gsap.set(this.tourOverlayText.nativeElement, { display: 'flex', pointerEvents: 'auto' });
      }
    }, ">-0.5"); // Empieza un poco antes de que termine la anterior para superponer

    // Habilita el scroll del cuerpo nuevamente
    document.body.style.overflow = '';
    this.isTourActive = false; // Desactiva el estado del tour
  }

   /**
   * loadNews: Función para cargar las noticias usando el NewsService.
   * Se suscribe al observable para manejar la respuesta exitosa o los errores.
   */
  private loadNews(): void {
    this.loading = true; // Activa el indicador de carga
    this.errorMessage = ''; // Limpia cualquier mensaje de error anterior

    const newsSub = this.newsService.getNews(1, 6, 'publicado').subscribe({ // Ajusta el límite de noticias si lo deseas
      next: (response: NewsPaginatedResponse) => {
        console.log('Noticias recibidas:', response.data);
        this.newsList = response.data;
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
   * onCardClick: Maneja el evento cuando una tarjeta de noticia es clicada.
   * Abre el modal y establece la noticia seleccionada.
   * @param news La noticia que fue clicada.
   */
  onCardClick(news: News): void {
    this.selectedNews = news; // Establece la noticia seleccionada
    this.isModalOpen = true; // Abre el modal
    // Deshabilita el scroll del cuerpo de la página cuando el modal está abierto
    document.body.style.overflow = 'hidden';
  }

  /**
   * onCloseModal: Maneja el evento cuando el modal de detalle de noticias solicita ser cerrado.
   * Limpia la noticia seleccionada y cierra el modal.
   */
  onCloseModal(): void {
    this.selectedNews = null; // Limpia la noticia seleccionada
    this.isModalOpen = false; // Cierra el modal
    // Restaura el scroll del cuerpo de la página
    document.body.style.overflow = 'auto';
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
   * Inicializa la nueva secuencia de animación con foco en el título y el blur de la imagen.
   */
  private initHeroAnimation(): void {
    // Referencias a los elementos que animaremos
    const image = '#hero-background-image';
    const heading = '#main-heading';
    const subtitle = '#subtitle-text';
    const buttons = '.btn-hero';

    const titleText = "¡Bienvenido al Parque Industrial San José!";

    this.masterTimeline = gsap.timeline();

    this.masterTimeline
      // 1. Animación de la imagen de fondo (Efecto Ken Burns sutil)
      // Empieza ligeramente ampliada y se ajusta, creando movimiento.
      .fromTo(image, 
        { scale: 1.1, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 2.5, ease: 'power2.inOut' }
      )
      
      // 2. Animación Typewriter para el TÍTULO. Comienza casi al mismo tiempo.
      .to(heading, {
        duration: titleText.length * 0.07, // Un poco más lento para darle peso al título
        text: titleText,
        ease: 'none',
        onComplete: () => {
          document.querySelector(heading)?.classList.add('has-cursor');
        }
      }, '>-2.0') // Inicia 2s antes de que la animación de la imagen termine.

      // 3. Animación de DESENFOQUE (blur) de la imagen.
      // Ocurre justo después de que el título termina de escribirse para centrar la atención.
      .to(image, {
        filter: 'blur(8px)', // Ajusta el valor del blur a tu gusto
        duration: 1.5,
        ease: 'power2.out'
      }, '>-0.5') // Inicia un poco antes de que termine la animación anterior.

      // 4. Animación del SUBTÍTULO. Aparece después del título.
      .to(subtitle, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out'
      }, '<') // '<' hace que inicie al mismo tiempo que la animación anterior (el blur)

      // 5. Animación escalonada (stagger) para los BOTONES.
      .to(buttons, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'back.out(1.7)',
        stagger: 0.2
      }, '>-0.5'); // Inicia de forma fluida después de que el subtítulo aparece.
  }










   /**
   * setupServiceCardAnimations: Ahora se encarga de configurar los eventos de hover
   * y las animaciones sutiles de rotación/desplazamiento para cada tarjeta.
   * La animación inicial de entrada de las tarjetas es manejada por el ScrollTrigger del carrusel.
   */
 private setupServiceCardAnimationsTwo(): void {
    if (this.serviceCards.length === 0) {
      console.warn("GSAP: No se encontraron elementos '.service-card' para las animaciones de hover.");
      return;
    }

    this.serviceCards.forEach((card: ElementRef, i: number) => {
      const element = card.nativeElement;
      const service = this.services[i];

      if (!service) return;

      const initialBgClasses = `${service.bgColorLight} ${service.bgColorDark}`;
      const hoverBgClasses = `${service.hoverBgColorLight} ${service.hoverBgColorDark}`;
      const iconElement = element.querySelector('.service-icon'); // Asegúrate de que tu SVG tenga esta clase

      // Asegurar que la tarjeta empiece con las clases de fondo iniciales
      element.classList.remove(...hoverBgClasses.split(' '));
      element.classList.add(...initialBgClasses.split(' '));

      element.addEventListener('mouseenter', () => {
        element.classList.remove(...initialBgClasses.split(' '));
        element.classList.add(...hoverBgClasses.split(' '));

        gsap.to(element, {
          scale: 1.05,
          boxShadow: '0px 15px 30px rgba(0, 0, 0, 0.25)',
          duration: 0.3,
          ease: 'power2.out',
          overwrite: true
        });

        if (iconElement) {
          gsap.to(iconElement, {
            rotation: 360,
            scale: 1.1,
            duration: 0.5,
            ease: 'back.out(1.9)',
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
    });
  }


/*
 * setupHorizontalScrollCarousel: Configura el carrusel horizontal con ScrollTrigger.
 * Ajustada para una aparición más natural y un mejor control del pin.
 */
/*
 * setupHorizontalScrollCarousel: Configura el carrusel horizontal con ScrollTrigger.
 * Mejorada para una aparición más natural de las tarjetas al inicio,
 * un control más preciso del pin, y previene problemas de hover iniciales.
 */
private setupHorizontalScrollCarousel(): void {
    const carouselContainer = document.getElementById('service-carousel-container');
    const scrollSection = document.getElementById('horizontal-scroll-section');

    if (!carouselContainer || !scrollSection || this.serviceCards.length === 0) {
      console.warn("GSAP: No se encontraron todos los elementos necesarios para el carrusel horizontal o no hay tarjetas de servicio. Se intentará una animación de grid tradicional.");
      this.fallbackGridAnimation();
      return;
    }

    const cards = this.serviceCards.toArray().map(card => card.nativeElement);

    // Calcular cuánto necesitamos desplazar el contenedor.
    const scrollAmount = carouselContainer.scrollWidth - scrollSection.clientWidth;

    // Si el contenido del carrusel no es lo suficientemente ancho, no necesitamos desplazamiento horizontal.
    if (scrollAmount <= 0) {
        console.warn("GSAP: El contenido del carrusel no es lo suficientemente ancho para el desplazamiento horizontal. No se aplicará el ScrollTrigger del carrusel.");
        this.fallbackGridAnimation();
        return;
    }

    // --- MEJORA CLAVE 1: Inicialización de las tarjetas para una entrada suave y sin interacción no deseada ---
    // Usamos autoAlpha: 0 para asegurar que las tarjetas estén completamente invisibles
    // y no reciban eventos de mouse antes de que su animación comience.
    gsap.set(cards, { opacity: 0, y: 50, autoAlpha: 0 }); // autoAlpha gestiona visibility y opacity

    // Animación principal del carrusel horizontal
    const mainTween = gsap.to(carouselContainer, {
      x: -scrollAmount,
      ease: "none",
      scrollTrigger: {
        trigger: scrollSection,
        pin: true,
        // Tu 'start' original está bien, permite ver el título y la sección antes de fijar.
        start: "5% 30%",
        end: () => `+=${scrollAmount}`, // El pin dura lo mismo que el desplazamiento horizontal.
        scrub: 1, // Desplazamiento suave con el scroll del usuario.
        // markers: true, // ¡Útil para depurar! Descomenta para visualizar los puntos del ScrollTrigger.
        invalidateOnRefresh: true, // Recalcula los valores al redimensionar la ventana.
      },
    });

    this.serviceCarouselMainScrollTrigger = mainTween.scrollTrigger!;

    // --- MEJORA CLAVE 2: Animación de entrada de las tarjetas controlada y escalonada ---
    // Creamos un nuevo timeline específicamente para la animación de entrada de las tarjetas.
    // Esto es crucial para que aparezcan fluidamente ANTES o al inicio del scroll horizontal.
    const cardEntryTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: scrollSection,
            // Las tarjetas empiezan a aparecer cuando la parte superior de la sección está al 80% del viewport.
            // Esto es ANTES de que el carrusel principal comience a fijarse y desplazarse horizontalmente,
            // dando tiempo para que la animación de entrada se complete.
            start: "top 80%",
            // La animación de entrada de las tarjetas terminará cuando la sección esté en un 10% de su altura y el 30% del viewport.
            end: "10% 30%",
            scrub: true, // Permite que la animación sea fluida con el scroll inicial del usuario.
            // markers: true, // Descomenta para depurar este timeline de entrada.
            toggleActions: "play none none reverse", // Asegura que la animación se reproduzca y se revierta al salir/entrar.
        }
    });

    // Añade la animación de todas las tarjetas al timeline de entrada.
    // Usamos 'stagger' para que aparezcan una tras otra, creando un efecto más dinámico.
    cardEntryTimeline.to(cards, {
        opacity: 1,
        y: 0,
        duration: 0.8, // Duración individual de la animación de cada tarjeta.
        ease: "power2.out",
        stagger: 0.15, // Retraso entre el inicio de la animación de cada tarjeta.
        autoAlpha: 1 // Asegura que las tarjetas sean completamente visibles y reciban eventos de mouse.
    }, 0); // El '0' aquí indica que esta animación comienza al principio del 'cardEntryTimeline'.

    // Nota: Eliminamos los ScrollTriggers individuales para cada tarjeta que estaban
    // vinculados a 'containerAnimation: mainTween'. Esos son útiles si quieres que las
    // tarjetas aparezcan *mientras se desplaza el carrusel*, pero para tu caso de
    // "carga inicial fluida", el `cardEntryTimeline` es la solución más directa y efectiva.
}




  
   /**
   * fallbackGridAnimation: Función de respaldo para animar las tarjetas en un diseño de rejilla
   * si el carrusel horizontal no puede ser inicializado.
   * **Nueva función: agregar si no la tienes.**
   */
  private fallbackGridAnimation(): void {
    const cards = this.serviceCards.toArray().map(card => card.nativeElement);
    gsap.from(cards, {
      opacity: 0,
      y: 50,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.15,
      scrollTrigger: {
        trigger: ".container.mx-auto.px-4", // Asegúrate de que este selector apunte al contenedor de tus tarjetas
        start: "top 80%",
        toggleActions: "play none none reverse",
        // once: true, // Descomenta si solo quieres que se anime una vez
        // markers: true, // Descomenta para depuración
      },
    });
  }

  /**
   * clearServiceCarouselAnimations: Limpia y mata todos los ScrollTriggers relacionados con
   * el carrusel de servicios. Esto es vital para evitar duplicados y fugas de memoria,
   * especialmente cuando las `QueryList` detectan cambios.
   */
  private clearServiceCarouselAnimations(): void {
    if (this.serviceCarouselMainScrollTrigger) {
      this.serviceCarouselMainScrollTrigger.kill();
      this.serviceCarouselMainScrollTrigger = null;
    }
    this.serviceCards.forEach((card, index) => {
      const specificTrigger = ScrollTrigger.getById(`serviceCard-${index}`);
      if (specificTrigger) {
        specificTrigger.kill();
      }
    });
  }




  
}
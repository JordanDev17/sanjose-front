// src/app/components/virtual-tour/virtual-tour.component.ts
import { Component, OnInit, AfterViewInit, OnDestroy, NgZone, Inject, Renderer2, ElementRef } from '@angular/core';
import { DOCUMENT } from '@angular/common'; // Importar DOCUMENT para acceder al document global

declare const Marzipano: any;
declare const APP_DATA: any; // APP_DATA es generado por Marzipano Tool en data.js

@Component({
  selector: 'app-virtual-tour',
  standalone: false,
  templateUrl: './virtual-tour.component.html',
  styleUrls: ['./virtual-tour.component.css']
})
export class VirtualTourComponent implements OnInit, AfterViewInit, OnDestroy {

  private viewer: any;
  private scenes: any[] = [];
  private scriptElements: HTMLScriptElement[] = [];
  private styleElement: HTMLLinkElement | null = null;

  constructor(
    private ngZone: NgZone,
    private renderer: Renderer2,
    private el: ElementRef,
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit(): void {
    // Inicializaciones que no dependen del DOM
  }

  ngAfterViewInit(): void {
    // Después de que la vista se haya inicializado, cargamos los scripts y estilos
    this.loadMarzipanoScriptsAndStyles();
  }

  ngOnDestroy(): void {
    if (this.viewer) {
      this.viewer.destroy();
      console.log('Marzipano viewer destruido y recursos liberados.');
    }
    this.removeMarzipanoScriptsAndStyles();
    // Asegurarse de restaurar el overflow del body si este componente fue el último en cambiarlo
    this.renderer.removeStyle(this.document.body, 'overflow');
  }

  /**
   * Carga dinámicamente los scripts y estilos de Marzipano.
   * Se usa Renderer2 para manipular el DOM de forma segura en Angular.
   */
  private loadMarzipanoScriptsAndStyles(): void {
    const scriptUrls = [
      'assets/marzipano-generated-tour/vendor/marzipano.js',
      'assets/marzipano-generated-tour/data.js'
    ];
    const styleUrl = 'assets/marzipano-generated-tour/style.css'; // Ruta al CSS de Marzipano

    const loadScript = (url: string): Promise<void> => {
      return new Promise<void>((resolve, reject) => {
        const script = this.renderer.createElement('script');
        this.renderer.setAttribute(script, 'src', url);
        this.renderer.listen(script, 'load', () => {
          this.scriptElements.push(script);
          resolve();
        });
        this.renderer.listen(script, 'error', (error) => {
          console.error(`Error al cargar el script: ${url}`, error);
          reject(error);
        });
        this.renderer.appendChild(this.document.body, script);
      });
    };

    const loadStyle = (url: string): Promise<void> => {
      return new Promise<void>((resolve, reject) => {
        const link = this.renderer.createElement('link');
        this.renderer.setAttribute(link, 'rel', 'stylesheet');
        this.renderer.setAttribute(link, 'href', url);
        this.renderer.listen(link, 'load', () => {
          this.styleElement = link;
          resolve();
        });
        this.renderer.listen(link, 'error', (error) => {
          console.error(`Error al cargar el estilo: ${url}`, error);
          reject(error);
        });
        this.renderer.appendChild(this.document.head, link);
      });
    };

    Promise.all([
      loadScript(scriptUrls[0]),
      loadScript(scriptUrls[1]),
      loadStyle(styleUrl)
    ])
      .then(() => {
        this.ngZone.runOutsideAngular(() => {
          this.initializeMarzipanoTour();
        });
      })
      .catch(error => {
        console.error('La carga de los recursos de Marzipano falló. El tour no se podrá inicializar.', error);
      });
  }

  /**
   * Elimina los scripts y estilos inyectados dinámicamente del DOM.
   * Esto es importante para limpiar recursos cuando el componente se destruye.
   */
  private removeMarzipanoScriptsAndStyles(): void {
    this.scriptElements.forEach(script => {
      if (script && script.parentNode) {
        this.renderer.removeChild(script.parentNode, script);
      }
    });
    this.scriptElements = [];

    if (this.styleElement && this.styleElement.parentNode) {
      this.renderer.removeChild(this.styleElement.parentNode, this.styleElement);
      this.styleElement = null;
    }
  }

  /**
   * Inicializa el tour virtual de Marzipano usando los datos de APP_DATA.
   */
  private initializeMarzipanoTour(): void {
    if (typeof Marzipano === 'undefined' || typeof APP_DATA === 'undefined') {
      console.error('Marzipano o APP_DATA no están definidos. No se puede inicializar el tour.');
      return;
    }

    const panoElement = this.el.nativeElement.querySelector('#pano');
    if (!panoElement) {
      console.error('El elemento del DOM con ID "pano" no se encontró. Asegúrate de que existe en el HTML.');
      return;
    }

    const viewerOpts = {
      controls: {
        mouseViewMode: APP_DATA.settings.mouseViewMode || 'drag'
      }
    };
    this.viewer = new Marzipano.Viewer(panoElement, viewerOpts);

    // CRÍTICO: Restablecer el overflow del body AQUI para permitir el scroll de la página principal.
    // Esto anula cualquier 'overflow: hidden' que Marzipano.js o style.css puedan aplicar por defecto.
    this.renderer.setStyle(this.document.body, 'overflow', ''); // 'auto' o '' para restablecer
    this.renderer.setStyle(this.document.documentElement, 'overflow', ''); // También para html si es necesario

    this.scenes = APP_DATA.scenes.map((data: any) => {
      const urlPrefix = "assets/marzipano-generated-tour/tiles";

      const source = Marzipano.ImageUrlSource.fromString(
        urlPrefix + "/" + data.id + "/{z}/{f}/{y}/{x}.jpg",
        { cubeMapPreviewUrl: urlPrefix + "/" + data.id + "/preview.jpg" }
      );

      const geometry = new Marzipano.CubeGeometry(data.levels);

      const limiter = Marzipano.RectilinearView.limit.traditional(
        data.faceSize,
        100 * Math.PI / 180,
        120 * Math.PI / 180
      );
      const view = new Marzipano.RectilinearView(data.initialViewParameters, limiter);

      const scene = this.viewer.createScene({
        source: source,
        geometry: geometry,
        view: view,
        pinFirstLevel: true
      });

      data.linkHotspots.forEach((hotspot: any) => {
        const element = this.createLinkHotspotElement(hotspot);
        scene.hotspotContainer().createHotspot(element, { yaw: hotspot.yaw, pitch: hotspot.pitch });
      });

      data.infoHotspots.forEach((hotspot: any) => {
        const element = this.createInfoHotspotElement(hotspot);
        scene.hotspotContainer().createHotspot(element, { yaw: hotspot.yaw, pitch: hotspot.pitch });
      });

      return {
        data: data,
        scene: scene,
        view: view
      };
    });

    let initialSceneData;
    if (APP_DATA.initialScene && APP_DATA.scenes && APP_DATA.scenes.length > 0) {
        initialSceneData = APP_DATA.scenes.find((s: any) => s.id === APP_DATA.initialScene);
    }

    if (!initialSceneData && APP_DATA.scenes && APP_DATA.scenes.length > 0) {
      initialSceneData = APP_DATA.scenes[0];
      console.warn('APP_DATA.initialScene no definido o escena no encontrada. Usando la primera escena por defecto:', initialSceneData.id);
    }

    if (!initialSceneData) {
      console.error('No se encontró ninguna escena inicial válida para cargar. Verifica tu data.js.');
      return;
    }

    const initialScene = this.scenes.find((s: any) => s.data.id === initialSceneData.id);

    if (initialScene && initialScene.scene) {
      if (APP_DATA.settings.autorotateEnabled) {
        this.startAutorotate(this.viewer);
      }
      initialScene.scene.switchTo({ transitionDuration: 1000 });
      console.log('Marzipano tour inicializado y escena inicial cargada:', initialSceneData.id);
    } else {
      console.error('Escena inicial (obtenida de APP_DATA.initialScene o por defecto) no se pudo encontrar en las escenas creadas.');
    }

    console.log('Marzipano tour inicializado manualmente.');
  }

  /**
   * Inicia la autorrotación del visor.
   * @param viewer La instancia del visor de Marzipano.
   */
  private startAutorotate(viewer: any): void {
    const autorotate = Marzipano.autorotate({
      yawSpeed: 0.03,
      targetPitch: 0,
      targetFov: Math.PI / 2
    });
    viewer.startMovement(autorotate);
    viewer.setIdleMovement(3000, autorotate);
  }

  /**
   * Busca una escena en el array `this.scenes` por su ID.
   * @param id El ID de la escena a buscar.
   * @returns El objeto de escena de Marzipano si se encuentra, de lo contrario undefined.
   */
  private findSceneById(id: string): any {
    return this.scenes.find(s => s.data.id === id);
  }

  /**
   * Busca los datos de una escena en APP_DATA.scenes por su ID.
   * @param id El ID de la escena a buscar en APP_DATA.
   * @returns Los datos de la escena si se encuentran, de lo contrario undefined.
   */
  private findSceneDataById(id: string): any {
    return APP_DATA.scenes.find((s: any) => s.id === id);
  }

  /**
   * Cambia a una escena específica.
   * @param scene El objeto de escena de Marzipano al que cambiar.
   */
  private switchScene(scene: any): void {
    scene.view.setParameters(scene.data.initialViewParameters);
    scene.scene.switchTo();
  }

  /**
   * Crea un elemento DOM para un hotspot de enlace.
   * @param hotspot Los datos del hotspot de enlace (del APP_DATA).
   * @returns El elemento HTML creado.
   */
  private createLinkHotspotElement(hotspot: any): HTMLElement {
    const wrapper = this.renderer.createElement('div');
    this.renderer.addClass(wrapper, 'hotspot');
    this.renderer.addClass(wrapper, 'link-hotspot');

    const icon = this.renderer.createElement('img');
    this.renderer.setAttribute(icon, 'src', 'assets/marzipano-generated-tour/img/link.png');
    this.renderer.addClass(icon, 'link-hotspot-icon');
    this.renderer.setStyle(icon, 'transform', `rotate(${hotspot.rotation}rad)`);

    this.renderer.listen(wrapper, 'click', () => {
      const targetScene = this.findSceneById(hotspot.target);
      if (targetScene) {
        this.switchScene(targetScene);
      }
    });

    const tooltip = this.renderer.createElement('div');
    this.renderer.addClass(tooltip, 'hotspot-tooltip');
    this.renderer.addClass(tooltip, 'link-hotspot-tooltip');
    const targetSceneData = this.findSceneDataById(hotspot.target);
    if (targetSceneData && targetSceneData.name) {
      this.renderer.setProperty(tooltip, 'innerHTML', targetSceneData.name);
    } else {
      this.renderer.setProperty(tooltip, 'innerHTML', 'Escena Desconocida');
    }

    this.renderer.appendChild(wrapper, icon);
    this.renderer.appendChild(wrapper, tooltip);

    return wrapper;
  }

  /**
   * Crea un elemento DOM para un hotspot de información.
   * @param hotspot Los datos del hotspot de información (del APP_DATA).
   * @returns El elemento HTML creado.
   */
  private createInfoHotspotElement(hotspot: any): HTMLElement {
    const wrapper = this.renderer.createElement('div');
    this.renderer.addClass(wrapper, 'hotspot');
    this.renderer.addClass(wrapper, 'info-hotspot');

    const header = this.renderer.createElement('div');
    this.renderer.addClass(header, 'info-hotspot-header');

    const iconWrapper = this.renderer.createElement('div');
    this.renderer.addClass(iconWrapper, 'info-hotspot-icon-wrapper');
    const icon = this.renderer.createElement('img');
    this.renderer.setAttribute(icon, 'src', 'assets/marzipano-generated-tour/img/info.png');
    this.renderer.addClass(icon, 'info-hotspot-icon');
    this.renderer.appendChild(iconWrapper, icon);

    const titleWrapper = this.renderer.createElement('div');
    this.renderer.addClass(titleWrapper, 'info-hotspot-title-wrapper');
    const title = this.renderer.createElement('div');
    this.renderer.addClass(title, 'info-hotspot-title');
    this.renderer.setProperty(title, 'innerHTML', hotspot.title);
    this.renderer.appendChild(titleWrapper, title);

    const closeWrapper = this.renderer.createElement('div');
    this.renderer.addClass(closeWrapper, 'info-hotspot-close-wrapper');
    const closeIcon = this.renderer.createElement('img');
    this.renderer.setAttribute(closeIcon, 'src', 'assets/marzipano-generated-tour/img/close.png');
    this.renderer.addClass(closeIcon, 'info-hotspot-close-icon');
    this.renderer.appendChild(closeWrapper, closeIcon);

    this.renderer.appendChild(header, iconWrapper);
    this.renderer.appendChild(header, titleWrapper);
    this.renderer.appendChild(header, closeWrapper);

    const text = this.renderer.createElement('div');
    this.renderer.addClass(text, 'info-hotspot-text');
    this.renderer.setProperty(text, 'innerHTML', hotspot.text);

    this.renderer.appendChild(wrapper, header);
    this.renderer.appendChild(wrapper, text);

    const toggle = () => {
      if (wrapper.classList.contains('visible')) {
        this.renderer.removeClass(wrapper, 'visible');
      } else {
        this.renderer.addClass(wrapper, 'visible');
      }
    };

     // Listener para abrir/cerrar al hacer clic en cualquier parte del header
    this.renderer.listen(header, 'click', toggle); // Usamos 'header' directamente, no 'wrapper.querySelector(...)'

    // Listener para el botón de cerrar: **detenemos la propagación del evento**
    this.renderer.listen(closeWrapper, 'click', (event) => { // Usamos 'closeWrapper' directamente
      event.stopPropagation(); 
      toggle();
    });

    return wrapper;
  }
}

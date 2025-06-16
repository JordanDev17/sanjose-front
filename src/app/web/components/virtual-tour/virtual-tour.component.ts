// src/app/components/virtual-tour/virtual-tour.component.ts
import { Component, OnInit, AfterViewInit, OnDestroy, NgZone } from '@angular/core';

declare const Marzipano: any;
declare const APP_DATA: any;

@Component({
  selector: 'app-virtual-tour',
  standalone: false,
  templateUrl: './virtual-tour.component.html',
  styleUrls: ['./virtual-tour.component.css']
})
export class VirtualTourComponent implements OnInit, AfterViewInit, OnDestroy {

  private viewer: any;
  private scenes: any[] = []; // Para almacenar las escenas creadas

  constructor(private ngZone: NgZone) { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.loadMarzipanoScripts();
  }

  ngOnDestroy(): void {
    if (this.viewer) {
      this.viewer.destroy();
      console.log('Marzipano viewer destruido y recursos liberados.');
    }
  }

  private loadMarzipanoScripts(): void {
    const scriptUrls = [
      'assets/marzipiano-generated-tour/vendor/marzipano.js',
      'assets/marzipiano-generated-tour/data.js'
    ];

    const loadScript = (url: string) => {
      return new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => resolve();
        script.onerror = (error) => {
          console.error(`Error al cargar el script: ${url}`, error);
          reject(error);
        };
        document.body.appendChild(script);
      });
    };

    loadScript(scriptUrls[0])
      .then(() => loadScript(scriptUrls[1]))
      .then(() => {
        this.ngZone.runOutsideAngular(() => {
          this.initializeMarzipanoTour();
        });
      })
      .catch(error => {
        console.error('La carga de uno o más scripts de Marzipano falló. El tour no se podrá inicializar.', error);
      });
  }

  private initializeMarzipanoTour(): void {
    if (typeof Marzipano === 'undefined' || typeof APP_DATA === 'undefined') {
      console.error('Marzipano o APP_DATA no están definidos. No se puede inicializar el tour.');
      return;
    }

    const panoElement = document.getElementById('pano');
    if (!panoElement) {
      console.error('El elemento del DOM con ID "pano" no se encontró. Asegúrate de que existe en el HTML.');
      return;
    }

    // Paso 1: Crear la instancia del visor de Marzipano.
    const viewerOpts = {
      controls: {
        mouseViewMode: APP_DATA.settings.mouseViewMode || 'drag'
      }
    };
    this.viewer = new Marzipano.Viewer(panoElement, viewerOpts);

    // Paso 2: Crear las escenas.
    this.scenes = APP_DATA.scenes.map((data: any) => {
      // urlPrefix y la estructura de la URL DEBE coincidir exactamente con tu index.js
      // En tu index.js, urlPrefix es "tiles" y luego se le concatena el resto de la ruta.
      // La ruta completa sería 'assets/marzipiano-generated-tour/tiles/ID_ESCENA/{z}/{f}/{y}/{x}.jpg'
      const urlPrefix = "assets/marzipiano-generated-tour/tiles"; 
      
      const source = Marzipano.ImageUrlSource.fromString(
        urlPrefix + "/" + data.id + "/{z}/{f}/{y}/{x}.jpg",
        { cubeMapPreviewUrl: urlPrefix + "/" + data.id + "/preview.jpg" }
      );
      
      // La GEOMETRÍA DEBE ser CubeGeometry según tu data.js y index.js
      const geometry = new Marzipano.CubeGeometry(data.levels);

      const limiter = Marzipano.RectilinearView.limit.traditional(
        data.faceSize,
        100 * Math.PI / 180, // Limite superior FOV
        120 * Math.PI / 180  // Limite inferior FOV
      );
      const view = new Marzipano.RectilinearView(data.initialViewParameters, limiter);

      const scene = this.viewer.createScene({
        source: source,
        geometry: geometry,
        view: view,
        pinFirstLevel: true
      });

      // Crear Hotspots (Enlaces e Información)
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

    // Paso 3: Cargar la escena inicial.
    // Lógica robusta para encontrar la escena inicial
    let initialSceneData;
    if (APP_DATA.initialScene && APP_DATA.scenes && APP_DATA.scenes.length > 0) {
        initialSceneData = APP_DATA.scenes.find((s: any) => s.id === APP_DATA.initialScene);
    }

    // Fallback: Si initialSceneData no se encontró o no existe initialScene, usa la primera escena del array
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

  // --- Funciones auxiliares copiadas y adaptadas de tu index.js ---

  private startAutorotate(viewer: any): void {
    const autorotate = Marzipano.autorotate({
      yawSpeed: 0.03,
      targetPitch: 0,
      targetFov: Math.PI / 2
    });
    viewer.startMovement(autorotate);
    viewer.setIdleMovement(3000, autorotate);
  }

  private findSceneById(id: string): any {
    return this.scenes.find(s => s.data.id === id);
  }

  private findSceneDataById(id: string): any {
    return APP_DATA.scenes.find((s: any) => s.id === id);
  }

  private switchScene(scene: any): void {
    // Aquí puedes detener/reiniciar la autorotación si tienes los toggles de UI
    scene.view.setParameters(scene.data.initialViewParameters);
    scene.scene.switchTo();
  }

  private createLinkHotspotElement(hotspot: any): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.classList.add('hotspot');
    wrapper.classList.add('link-hotspot');

    const icon = document.createElement('img');
    icon.src = 'assets/marzipiano-generated-tour/img/link.png'; // Ajusta la ruta si es necesario
    icon.classList.add('link-hotspot-icon');
    icon.style.transform = `rotate(${hotspot.rotation}rad)`;

    wrapper.addEventListener('click', () => {
      const targetScene = this.findSceneById(hotspot.target);
      if (targetScene) {
        this.switchScene(targetScene);
      }
    });

    const tooltip = document.createElement('div');
    tooltip.classList.add('hotspot-tooltip');
    tooltip.classList.add('link-hotspot-tooltip');
    // Asegurarse de que findSceneDataById devuelva un objeto con 'name'
    const targetSceneData = this.findSceneDataById(hotspot.target);
    if (targetSceneData && targetSceneData.name) {
      tooltip.innerHTML = targetSceneData.name;
    } else {
      tooltip.innerHTML = 'Escena Desconocida';
    }


    wrapper.appendChild(icon);
    wrapper.appendChild(tooltip);

    return wrapper;
  }

 private createInfoHotspotElement(hotspot: any): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.classList.add('hotspot');
    wrapper.classList.add('info-hotspot');

    const header = document.createElement('div');
    header.classList.add('info-hotspot-header');

    const iconWrapper = document.createElement('div');
    iconWrapper.classList.add('info-hotspot-icon-wrapper');
    const icon = document.createElement('img');
    icon.src = 'assets/marzipiano-generated-tour/img/info.png';
    icon.classList.add('info-hotspot-icon');
    iconWrapper.appendChild(icon);

    const titleWrapper = document.createElement('div');
    titleWrapper.classList.add('info-hotspot-title-wrapper');
    const title = document.createElement('div');
    title.classList.add('info-hotspot-title');
    title.innerHTML = hotspot.title;
    titleWrapper.appendChild(title);

    const closeWrapper = document.createElement('div');
    closeWrapper.classList.add('info-hotspot-close-wrapper');
    const closeIcon = document.createElement('img');
    closeIcon.src = 'assets/marzipiano-generated-tour/img/close.png';
    closeIcon.classList.add('info-hotspot-close-icon');
    closeWrapper.appendChild(closeIcon);

    header.appendChild(iconWrapper);
    header.appendChild(titleWrapper);
    header.appendChild(closeWrapper);

    const text = document.createElement('div');
    text.classList.add('info-hotspot-text');
    text.innerHTML = hotspot.text;

    wrapper.appendChild(header);
    wrapper.appendChild(text);

    // --- ELIMINA ESTAS LÍNEAS DE CÓDIGO ---
    // const modal = document.createElement('div');
    // modal.innerHTML = wrapper.innerHTML;
    // modal.classList.add('info-hotspot-modal');
    // document.body.appendChild(modal); 
    // --- FIN DE LAS LÍNEAS A ELIMINAR ---

    // La lógica para alternar la visibilidad debe estar centrada en el `wrapper`
    // Si quieres un modal, este modal debería ser parte de la estructura del hotspot
    // o manejado de otra forma para evitar la inyección global.

    // Si tu CSS original de Marzipano Tool espera que el `wrapper` tenga la clase `visible`
    // para mostrar/ocultar el contenido del hotspot (no un modal aparte), entonces la lógica
    // de `toggle` debería afectar solo al `wrapper` y sus hijos.
    
    // Si la intención es que al hacer clic en el hotspot, se abra un modal *aparte* // que cubra la pantalla, entonces ese modal debe estar declarado en tu HTML 
    // principal (virtual-tour.component.html) o ser un componente Angular gestionado, 
    // y no inyectado directamente en el body aquí.

    // Por ahora, solo te dejo la lógica de toggle que afecta al wrapper.
    // Si necesitas un modal superpuesto, esa lógica debe ser revisada para Angular.
    const toggle = () => {
      wrapper.classList.toggle('visible');
      // Si el modal existía y querías que su visibilidad se manejara aquí, 
      // necesitarías una referencia al modal que no fuera inyectado en el body.
      // modal.classList.toggle('visible'); // Esto ya no es necesario ni posible
    };

    wrapper.querySelector('.info-hotspot-header')?.addEventListener('click', toggle);
    // Si el modal con close-wrapper era una copia del contenido, ya no existe.
    // Si necesitas un botón de cierre para el contenido del hotspot, 
    // asegúrate de que esté dentro del 'wrapper'.
    wrapper.querySelector('.info-hotspot-close-wrapper')?.addEventListener('click', toggle);

    return wrapper;
  }
}
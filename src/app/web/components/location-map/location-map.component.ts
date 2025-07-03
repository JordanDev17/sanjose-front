// src/app/web/components/location-map/location-map.component.ts

import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import { gsap } from 'gsap';

interface PointOfInterest {
  name: string;
  coords: [number, number];
  description: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'teal' | 'purple';
  faIcon: string;
}

@Component({
  selector: 'app-location-map',
  standalone: false,
  templateUrl: './location-map.component.html',
  styleUrls: ['./location-map.component.css']
})
export class LocationMapComponent implements AfterViewInit, OnDestroy {
  private map!: L.Map;
  private markers: L.Marker[] = [];
  private parkMarker!: L.Marker;

  private parkLocation: [number, number] = [4.7397474, -74.1811192];

  public pointsOfInterest: PointOfInterest[] = [
    { name: 'Aeropuerto Internacional El Dorado', coords: [4.7015, -74.1469], description: 'Principal aeropuerto de Colombia.', color: 'purple', faIcon: 'fa-plane' },
    { name: 'Terminal de Carga #1 (Opaín)', coords: [4.7070, -74.1500], description: 'Centro logístico de importación/exportación.', color: 'teal', faIcon: 'fa-box' },
    { name: 'Restaurante El Sabor Local', coords: [4.7420, -74.1800], description: 'Cocina colombiana auténtica.', color: 'blue', faIcon: 'fa-utensils' },
    { name: 'Estación de Servicio Biomax', coords: [4.7380, -74.1790], description: 'Gasolina y tienda de conveniencia.', color: 'green', faIcon: 'fa-gas-pump' },
    { name: 'Centro Comercial Sabana', coords: [4.7450, -74.1820], description: 'Compras, ocio y servicios.', color: 'yellow', faIcon: 'fa-shopping-cart' },
    { name: 'Parque Central Mosquera', coords: [4.7350, -74.1850], description: 'Espacio verde para relajarse.', color: 'red', faIcon: 'fa-tree' },
  ];

  constructor() { }

  ngAfterViewInit(): void {
    this.initMap();
    this.addParkMarker();
    this.addPointsOfInterestMarkers();

    gsap.from('#map-container', {
      opacity: 0,
      y: 50,
      duration: 1,
      ease: 'power3.out',
      delay: 0.2
    });
    gsap.from('#poi-list-container', {
      opacity: 0,
      x: 50,
      duration: 1,
      ease: 'power3.out',
      delay: 0.4
    });
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
    gsap.killTweensOf('#map-container');
    gsap.killTweensOf('#poi-list-container');

    // **CAMBIO AQUÍ: Añadir verificación de `element` antes de llamar a `gsap.killTweensOf()`**
    this.markers.forEach(marker => {
      const element = marker.getElement();
      if (element) { // Si el elemento existe, entonces matar sus tweens
        gsap.killTweensOf(element);
      }
    });

    if (this.parkMarker) {
      const parkElement = this.parkMarker.getElement();
      if (parkElement) { // Si el elemento existe, entonces matar sus tweens
        gsap.killTweensOf(parkElement);
      }
    }
  }

  private initMap(): void {
    const mapElement = document.getElementById('map-container');

    if (mapElement) {
      L.Icon.Default.imagePath = 'assets/leaflet/';

      this.map = L.map(mapElement, {
        zoomControl: false
      }).setView(this.parkLocation, 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(this.map);

      L.control.zoom({
        position: 'topright'
      }).addTo(this.map);

    } else {
      console.error('El elemento "map-container" no se encontró en el DOM.');
    }

    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 100);
  }

  private addParkMarker(): void {
    const parkIcon = L.icon({
      iconUrl: 'assets/web/media/img/logo-screen.png', // Asegúrate de que esta ruta sea correcta
      iconSize: [45, 45],
      iconAnchor: [22, 45],
      popupAnchor: [0, -40]
    });

    this.parkMarker = L.marker(this.parkLocation, { icon: parkIcon }).addTo(this.map)
      .bindPopup(`
        <div class="font-bold text-lg mb-1 text-blue-700 dark:text-blue-300">Parque Industrial San José</div>
        <div class="text-gray-700 dark:text-gray-300">Mosquera, Cundinamarca, Colombia</div>
        <div class="text-600 dark:text-gray-400 mt-1">Tu destino de negocios e innovación.</div>
      `);
  }

  private addPointsOfInterestMarkers(): void {
    this.pointsOfInterest.forEach(poi => {
      const poiIcon = L.divIcon({
        className: `custom-marker custom-marker-${poi.color}`,
        html: `
          <div class="custom-marker-circle">
            <i class="fas ${poi.faIcon} text-indigo-500 text-lg"></i>
          </div>
        `,
        iconSize: [30, 40],
        iconAnchor: [15, 40],
        popupAnchor: [0, -35]
      });

      const poiMarker = L.marker(poi.coords, { icon: poiIcon }).addTo(this.map)
        .bindPopup(`
          <div class="font-bold text-md mb-1">${poi.name}</div>
          <div class="text-gray-600">${poi.description}</div>
        `);
      this.markers.push(poiMarker);
    });
  }

  zoomToPoi(coords: [number, number]): void {
    if (this.map) {
      this.map.flyTo(coords, 16, {
        duration: 1.5,
        easeLinearity: 0.5
      });

      const targetMarker = this.markers.find(marker =>
        marker.getLatLng().lat === coords[0] && marker.getLatLng().lng === coords[1]
      );
      if (targetMarker) {
        targetMarker.openPopup();

        const iconElement = targetMarker.getElement();
        if (iconElement) {
          gsap.fromTo(iconElement,
            { y: 0, scale: 1 },
            {
              y: -15,
              scale: 1.2,
              duration: 0.3,
              ease: 'power1.out',
              yoyo: true,
              repeat: 1,
              onComplete: () => {
                gsap.set(iconElement, { y: 0, scale: 1 });
              }
            }
          );
        }
      }
    }
  }

  zoomToParkLocation(): void {
    if (this.map) {
      this.map.flyTo(this.parkLocation, 14, {
        duration: 1.5,
        easeLinearity: 0.5
      });

      if (this.parkMarker) {
        this.parkMarker.openPopup();
        const iconElement = this.parkMarker.getElement();
        if (iconElement) {
          gsap.fromTo(iconElement,
            { scale: 1 },
            { scale: 1.2, yoyo: true, repeat: 1, duration: 0.5, ease: 'back.out(2)' }
          );
        }
      }
    }
  }

  getMarkerColorClass(color: string): string {
    return `bg-${color}-500`;
  }

  getMarkerColorCss(color: string): string {
    switch (color) {
      case 'blue': return '#3B82F6';
      case 'green': return '#22C55E';
      case 'yellow': return '#F59E0B';
      case 'red': return '#EF4444';
      case 'teal': return '#14B8A6';
      case 'purple': return '#A855F7';
      default: return '#6B7280';
    }
  }

  getPoiClass(color: string): string {
    const baseClasses = 'bg-white dark:bg-gray-700';
    const hoverClasses = `hover:bg-${color}-100 dark:hover:bg-${color}-800`;
    const borderClasses = `border-l-4 border-${color}-500`;
    return `${baseClasses} ${hoverClasses} ${borderClasses}`;
  }
}
import { Component, AfterViewInit, Inject, PLATFORM_ID, EventEmitter, Output } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-vietnam-map',
  standalone: true,
  templateUrl: './vietnam-map.component.html',
  styleUrls: ['./vietnam-map.component.css']
})
export class VietnamMapComponent implements AfterViewInit {
  @Output() locationSelected = new EventEmitter<{ name: string, latitude: number, longitude: number }>();
  map: any;
  markersLayer: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      Promise.all([
        import('leaflet'),
        import('leaflet-search')
      ]).then(([L]) => {
        this.map = L.map('map').setView([14.0583, 108.2772], 6);

        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap'
        }).addTo(this.map);

        this.markersLayer = L.layerGroup().addTo(this.map);

        const searchControl = new L.Control.Search({
          layer: this.markersLayer,
          initial: false,
          zoom: 12,
          marker: false
        });
        searchControl.addTo(this.map);

        const searchBox = document.getElementById('searchBox') as HTMLInputElement;
        searchBox.addEventListener('keypress', (event: KeyboardEvent) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            const searchText = searchBox.value;
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}`;

            fetch(url)
              .then(response => response.json())
              .then(locations => {
                if (locations.length > 0) {
                  const location = locations[0];
                  const lat = parseFloat(location.lat);
                  const lon = parseFloat(location.lon);

                  this.markersLayer.clearLayers();

                  const marker = L.marker([lat, lon], { title: searchText });
                  marker.bindPopup(`<b>${searchText}</b><br>Lat: ${lat}<br>Lng: ${lon}`).openPopup();
                  this.markersLayer.addLayer(marker);

                  this.map.setView([lat, lon], 12);

                  this.locationSelected.emit({
                    name: searchText,
                    latitude: lat,
                    longitude: lon
                  });
                } else {
                  alert('No location found.');
                }
              })
              .catch(error => console.error('Error during geocoding:', error));
          }
        });

        // Sự kiện khi người dùng click trên bản đồ
        this.map.on('click', (e: any) => {
          const lat = e.latlng.lat;
          const lng = e.latlng.lng;

          const popup = L.popup()
            .setLatLng([lat, lng])
            .setContent(`Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`)
            .openOn(this.map);

          // Reverse Geocoding để lấy tên địa điểm
          const reverseGeocodeUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
          fetch(reverseGeocodeUrl)
            .then(response => response.json())
            .then(data => {
              const locationName = data.display_name || "No location found";
              this.locationSelected.emit({
                name: locationName,
                latitude: lat,
                longitude: lng
              });

              popup.setContent(`<b>${locationName}</b><br>Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`)
                .openOn(this.map);
            })
            .catch(error => console.error('Error during reverse geocoding:', error));
        });
      }).catch(error => {
        console.error('Error loading Leaflet modules:', error);
      });
    }
  }
}

// Khai báo module để TypeScript nhận diện Control Search
declare module 'leaflet' {
  namespace Control {
    class Search extends Control {
      constructor(options?: any);
    }
  }
}

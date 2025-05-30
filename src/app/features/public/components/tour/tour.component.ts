import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, computed, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyVndPipe } from "../../../../shared/pipes/currency-vnd.pipe";
import { SsrService } from '../../../../core/services/ssr.service';
import { TourService } from '../../services/tour.service/tour.service';
import { Tour } from '../../../../core/models/public-tour.model';
import { FooterComponent } from "../../../../shared/components/footer/footer.component";
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { Locations } from '../../../../core/models/location.model';
import { HomepageService } from '../../services/homepage.service';
import { WishlistService } from '../../../customer/components/wishlist/wishlist.service';
import { WishlistComponent } from '../../../customer/components/wishlist/wishlist.component';
import { TruncatePipe } from "../../../../shared/pipes/truncate.pipe";

@Component({
  selector: 'app-tour',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyVndPipe, FooterComponent, NgSelectModule, WishlistComponent, TruncatePipe],
  templateUrl: './tour.component.html',
  styleUrl: './tour.component.css'
})
export class TourComponent implements OnInit {
  @ViewChild('wishlistModal') wishlistModal!: WishlistComponent;
  tours = signal<Tour[]>([]);
  locations = signal<Locations[]>([]);
  totalItems = 0;
  size = 10;
  keyword: any = null;
  currentPage: number = 0;
  totalPages: number = 0;
  private map: any;

  // Filters
  minPrice = 0;
  maxPrice = 200000000;
  minPercent = 0;
  maxPercent = 100;
  duration = 0;
  departLocationId: any = null;
  sortBy = '';
  fromDate = new Date('2021-01-01');

  private defaultLat = 16.1667;
  private defaultLng = 107.8333;

  constructor(
    private tourService: TourService,
    private ssrService: SsrService,
    private router: Router,
    private homepageService: HomepageService,
    private wishlistService: WishlistService,
  ) { }

  ngOnInit(): void {
    this.getTours();
    this.getLocations();
  }

  getDestinationName(): string {
    const selectedLocation = this.locations().find(loc => loc.id === Number(this.keyword));
    return selectedLocation?.name || '';
  }

  getDestinationDescription(): string {
    const selectedLocation = this.locations().find(loc => loc.id === Number(this.keyword));
    return selectedLocation?.description || '';
  }

  getDepartLocationName(): string {
    const firstTour = this.tours()[this.tours().length - 1];
    return firstTour?.departLocation?.name || 'Không xác định';
  }

  addToWishlist(tour: any) {
    this.homepageService.addWishlist(tour).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.wishlistService.triggerWishlistUpdate();
        }
      },
      error: (err) => {
        console.error('Error adding to wishlist:', err);
      },
    });
  }

  getLocations(): void {
    this.tourService.getLocations().subscribe({
      next: (response) => {
        this.locations.set(response.data);
      },
      error: (err) => {
        console.error('Failed to load locations:', err);
      },
    });
  }

  currentDate = new Date();

   getUpcomingSchedules(tourdate : any) {
    return tourdate.tourSchedules
      .filter((schedule : any) => new Date(schedule.startDate) >= this.currentDate)
      .slice(0, 4);
  }

  getTours(): void {
    // Lấy name từ keyword (ID của điểm đến)
    const destination = this.locations().find(loc => loc.id === Number(this.keyword));
    const keywordToSend = destination ? destination.name : '';

    this.tourService
      .getTours(
        this.currentPage,
        this.size,
        keywordToSend,
        this.minPrice,
        this.maxPrice,
        this.duration,
        this.fromDate,
        this.departLocationId,
        // this.sortBy
      )
      .subscribe({
        next: (response) => {
          this.tours.set(response.data.items);
          this.totalItems = response.data.total;
          this.currentPage = response.data.page;
          this.size = response.data.size;
          this.totalPages = Math.ceil(this.totalItems / this.size);
          if (this.ssrService.isBrowser) {
            this.updateMap();
          }
        },
        error: (err) => {
          console.error('Lỗi: ', err);
        },
      });
  }

  filteredTours = computed(() => {
    return this.tours();
  });

  clearFilters(): void {
    this.minPrice = 0;
    this.maxPrice = 200000000;
    this.duration = 0;
    this.fromDate = new Date();
    this.departLocationId = 0;
    this.keyword = '';
    this.sortBy = '';
    this.currentPage = 0;
    this.applyFilters();
    this.updateSlider();
  }

  changeTourDuration(durationInput: number): void {
    this.duration = durationInput;
    this.applyFilters();
  }

  changeTourDate(date: Date): void {
    this.fromDate = date;
    this.applyFilters();
  }

  onDurationChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.valueAsNumber;
    if (!isNaN(value)) {
      this.changeTourDuration(value);
    }
  }

  viewDetails(tourId: number): void {
    this.router.navigate(['/tour-details', tourId]);
  }

  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.valueAsDate;
    if (value) {
      this.changeTourDate(value);
    }
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.getTours();
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.getTours();
    }
  }

  onSort(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.sortBy = select.value;
    this.applyFilters();
  }

  updateSlider(): void {
    // Ensure min and max have a gap of at least $10
    const minGap = 10;
    if (this.maxPrice - this.minPrice < minGap) {
      if (this.minPrice + minGap <= 100000) {
        this.minPrice = this.maxPrice - minGap;
      } else {
        this.maxPrice = this.minPrice + minGap;
      }
    }

    // Update percentage positions for track styling
    this.minPercent = (this.minPrice / 200000000) * 100;
    this.maxPercent = (this.maxPrice / 200000000) * 100;

    this.applyFilters();
  }

  updateSliderUI(): void {
    const minGap = 10;
    if (this.maxPrice - this.minPrice < minGap) {
      if (this.minPrice + minGap <= 100000) {
        this.minPrice = this.maxPrice - minGap;
      } else {
        this.maxPrice = this.minPrice + minGap;
      }
    }
  
    this.minPercent = (this.minPrice / 200000000) * 100;
    this.maxPercent = (this.maxPrice / 200000000) * 100;
  }

  ngAfterViewInit(): void {
    if (this.ssrService.isBrowser) {
      this.initMap();
    }
  }

  async initMap(): Promise<void> {
    if (!this.ssrService.isBrowser) return;

    const mapElement = document.getElementById('map');
    if (!mapElement) {
      console.warn('Map element not found');
      return;
    }

    const L = await import('leaflet');
    this.map = L.map('map').setView([this.defaultLat, this.defaultLng], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    L.marker([this.defaultLat, this.defaultLng]).addTo(this.map);
  }

  async updateMap(): Promise<void> {
    if (!this.ssrService.isBrowser || !this.map) return;

    const L = await import('leaflet');
    if (this.tours().length > 0 && this.keyword) {
      const firstTour = this.tours()[0];
      const lat = firstTour.departLocation.geoPosition.latitude;
      const lng = firstTour.departLocation.geoPosition.longitude;

      this.map.setView([lat, lng], 13);
      this.map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) {
          this.map.removeLayer(layer);
        }
      });
      L.marker([lat, lng]).addTo(this.map);
    } else {
      this.map.setView([this.defaultLat, this.defaultLng], 5);
      this.map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) {
          this.map.removeLayer(layer);
        }
      });
      L.marker([this.defaultLat, this.defaultLng]).addTo(this.map);
    }
  }

  openMap(): void {
    if (!this.ssrService.isBrowser) return;

    const firstTour = this.tours()[0];
    const latitude = firstTour?.departLocation?.geoPosition?.latitude || this.defaultLat;
    const longitude = firstTour?.departLocation?.geoPosition?.longitude || this.defaultLng;
    const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(googleMapsUrl, '_blank');
  }
}
import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../services/hotel.service';
import { Hotel } from '../../../../core/models/hotel.model';
import { CurrencyVndPipe } from "../../../../shared/pipes/currency-vnd.pipe";
import { SsrService } from '../../../../core/services/ssr.service';
import { Router } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Locations } from '../../../../core/models/location.model';
import { HomepageService } from '../../services/homepage.service';
import { WishlistService } from '../../../customer/components/wishlist/wishlist.service';
@Component({
  selector: 'app-restaurant',
   imports: [CommonModule, FormsModule, CurrencyVndPipe, NgSelectComponent],
  templateUrl: './restaurant.component.html',
  styleUrl: './restaurant.component.css'
})
export class RestaurantComponent {
  hotels = signal<Hotel[]>([]);
  locations = signal<Locations[]>([]);

  // Pagination
  totalItems = 0;
  size = 10;
  keyword = '';
  currentPage: number = 0;
  totalPages: number = 0;
  private map!: L.Map;

  // Filters
  minPrice = 0;
  maxPrice = 200000000;
  sortBy = '';
  ratingFilter = 0;
  minPercent = 0;
  maxPercent = 100;
  hotelClassFilter = 0;

  constructor(
    private hotelService: HotelService,
    private ssrService: SsrService,
    private router: Router,
    private homepageService: HomepageService,
        private wishlistService: WishlistService
  ) {
  }

  addToWishlist(provider: any) {
    this.homepageService.addWishlist(provider).subscribe({
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

  ngOnInit(): void {
    this.getHotels();
    this.getLocations();
  }

  goToDetail(id: number): void {
    this.router.navigate(['/restaurant-details', id]);
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
    const firstTour = this.hotels()[this.hotels().length - 1];
    return firstTour?.location?.name || 'Không xác định';
  }

  getLocations(): void {
    this.hotelService.getLocations().subscribe({
      next: (response) => {
        this.locations.set(response.data);
      },
      error: (err) => {
        console.error('Lỗi: ', err);
      }
    });
  }

  getHotels(): void {
    this.hotelService.getRestaurants(
      this.currentPage,
      this.size,
      this.keyword,
      this.hotelClassFilter,
      this.maxPrice,
      this.minPrice,
      //sortBy ?: string
    ).subscribe({
      next: (response) => {
        this.hotels.set(response.data.items);
        console.log('Hotels: ', this.hotels());
        this.totalItems = response.data.total;
        this.currentPage = response.data.page;
        this.size = response.data.size;
        this.totalPages = (Math.ceil(this.totalItems / this.size));
      },
      error: (err) => {
        console.error('Lỗi: ', err);
      }
    });
  }

  filteredHotels = computed(() => {
    return this.hotels();
  });

  clearFilters(): void {
    this.minPrice = 0;
    this.maxPrice = 200000000;
    this.hotelClassFilter = 0;
    // this.sortBy = '';
    this.ratingFilter = 0;
    this.currentPage = 1;
    this.applyFilters();
    this.updateSlider();
  }

  onLocationInput(): void {
    this.applyFilters();
  }


  changeHotelClassFilter(selectedClass: number): void {
    this.hotelClassFilter = selectedClass;
    this.applyFilters();
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.getHotels();
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.getHotels();
    }
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

  onSort(): void {
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

  ngAfterViewInit(): void {
    if (this.ssrService.isBrowser) {
      setTimeout(() => this.initMap(), 100);
    }
  }


  getStars(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i);
  }

  initMap(): void {
    setTimeout(async () => {
      const mapElement = document.getElementById('map');
      if (!mapElement) {
        console.warn('Không tìm thấy bản đồ');
        return;
      }

      const L = await import('leaflet');

      this.map = L.map('map').setView([21.0285, 105.8542], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map);

      L.marker([21.0285, 105.8542]).addTo(this.map);
    }, 200);
  }

  openMap(): void {
    const latitude = 21.0285;
    const longitude = 105.8542;
    const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

    window.open(googleMapsUrl, '_blank'); // Mở trong tab mới
  }
}

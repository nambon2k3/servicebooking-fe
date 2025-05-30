import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FooterComponent } from "../../../../../shared/components/footer/footer.component";
import { ActivatedRoute } from '@angular/router';
import { HotelService } from '../../../services/hotel.service';
import { CurrencyVndPipe } from "../../../../../shared/pipes/currency-vnd.pipe";
import { SsrService } from '../../../../../core/services/ssr.service';

@Component({
  selector: 'app-hotel-detail',
  standalone: true,
  imports: [
    CommonModule,
    FooterComponent,
    CurrencyVndPipe
  ],
  templateUrl: './hotel-detail.component.html',
  styleUrls: [],
})
export class HotelDetailComponent implements OnInit {
  isShow: boolean = false;
  hotelDetails: any;
  rooms: any[] = [];
  allRooms: any[] = [];
  selectedRoom: any = null;
  otherServices: any[] = [];
  price: number = 0;
  isLoading: boolean = false;
  private map!: L.Map;

  constructor(
    private route: ActivatedRoute,
    private hotelService: HotelService,
    private ssrService: SsrService,
  ) { }

  ngOnInit(): void {
    const hotelId = this.route.snapshot.paramMap.get('id');
    if (hotelId) {
      this.loadHotelDetail(hotelId);
    } else {
      console.error('Hotel ID not found in route parameters');
    }
  }

  loadHotelDetail(id: string) {
    this.isLoading = true;
    this.hotelService.getHotelDetail(id).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.code === 200 && response.data) {
          this.hotelDetails = response.data.serviceProvider;
          this.allRooms = response.data.rooms;
          this.rooms = [...this.allRooms]; // Use all rooms as is
          this.price = this.rooms.length > 0 ? this.rooms[0].sellingPrice : (this.hotelDetails.minRoomPrice || 0);
          this.otherServices = response.data.otherHotels;

          if (this.ssrService.isBrowser) {
            this.initMap();
          }
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error fetching hotel details', err);
      },
    });
  }

  selectRoom(room: any) {
    if (this.selectedRoom === room) {
      this.selectedRoom = null;
      this.rooms = [...this.allRooms];
      this.price = 0;
    } else {
      this.selectedRoom = room;
      this.rooms = [room];
      this.price = room.sellingPrice;
    }
  }

   private async initMap() {
      const L = await import('leaflet');
      console.log('geo', this.hotelDetails);
      console.log('geo', this.hotelDetails.geoPosition.latitude, this.hotelDetails.geoPosition.longitude);

      this.map = L.map('map').setView(
        [this.hotelDetails.geoPosition.latitude, this.hotelDetails.geoPosition.longitude],
        13
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);

      L.marker([this.hotelDetails.geoPosition.latitude, this.hotelDetails.geoPosition.longitude])
        .addTo(this.map);

      
  }

  getStarsArray(star: number | undefined): any[] {
    if (!star) return [];
    return Array(Math.round(star)).fill(0);
  }
  

  showOrHide() {
    this.isShow = !this.isShow;
  }
}
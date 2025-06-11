import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FooterComponent } from "../../../../../shared/components/footer/footer.component";
import { ActivatedRoute } from '@angular/router';
import { HotelService } from '../../../services/hotel.service';
import { CurrencyVndPipe } from "../../../../../shared/pipes/currency-vnd.pipe";
import { SsrService } from '../../../../../core/services/ssr.service';
import { UserStorageService } from '../../../../../core/services/user-storage/user-storage.service';

@Component({
  selector: 'app-restaurant-detail',
  imports: [
    CommonModule,
    FooterComponent,
    CurrencyVndPipe
  ],
  templateUrl: './restaurant-detail.component.html',
  styleUrl: './restaurant-detail.component.css'
})
export class RestaurantDetailComponent {
  isShow: boolean = false;
    hotelDetails: any;
    rooms: any[] = [];
    allRooms: any[] = [];
    otherServices: any[] = [];
    price: number = 0;
    isLoading: boolean = false;
    private map!: L.Map;
  
  
    description = 'Chúng tôi luôn chú trọng đảm bảo quý khách có trải nghiệm thoải mái qua các dịch vụ và tiện nghi hàng đầu. Chia sẻ ảnh và trả lời email nhanh chóng với Internet và Wi-Fi miễn phí tại cơ sở lưu trú.Cơ sở lưu trú có thể sắp xếp dịch vụ đón tiễn sân bay trước ngày quý khách đến. Cơ sở lưu trú cung cấp dịch vụ đưa đón để quý khách dễ dàng di chuyển xung quanh Hà Nội.Cơ sở lưu trú có chỗ đỗ xe cho khách đến bằng ô tô. Dễ dàng lên kế hoạch cho các hoạt động hằng ngày và yêu cầu đi lại của quý khách với dịch vụ trợ giúp đặc biệt được cung cấp tại quầy lễ tân.Cơ sở lưu trú cũng cung cấp dịch vụ bán vé để hỗ trợ đặt vé và đảm bảo đặt chỗ cho các hoạt động giải trí và phiêu lưu. Cho dù là lưu trú dài ngày hay cần quần áo giặt mới, dịch vụ giặt là tại cơ sở lưu trú sẽ giúp quần áo của quý khách lúc nào cũng sạch sẽ và phẳng phiu.Các tiện nghi trong phòng như dịch vụ phòng góp phần tạo nên một kỳ lưu trú đáng nhớ. Cơ sở lưu trú cấm hút thuốc để mang lại bầu không khí thoải mái cho mọi khách lưu trú.Chỉ được phép hút thuốc tại các khu vực hút thuốc được cơ sở lưu trú chỉ định.Cơ sở lưu trú được trang bị mọi tiện nghi cần thiết để mang đến một giấc ngủ ngon cho khách. Các phòng được trang bị điều hòa không khí hoặc dịch vụ cung cấp và làm sạch đồ vải để đảm bảo sự thoải mái và thuận tiện cho quý khách.Một số phòng tại Hanoi Memory Premier Hotel & Spa còn có thiết kế độc đáo như phòng khách riêng biệt hoặc thậm chí có ban công hoặc sân hiên. Một số phòng có các tiện ích giải trí trong phòng như truyền phát video trong phòng, báo hằng ngày hoặc TV, mang đến cho khách một kỳ nghỉ thoải mái.Các phòng tại cơ sở lưu trú có cung cấp nước uống. Một số phòng có máy pha trà và cà phê. Hanoi Memory Premier Hotel & Spa cung cấp áo choàng tắm, khăn tắm hoặc máy sấy tóc trong phòng vệ sinh ở một số phòng. Bữa sáng hấp dẫn là cách hoàn hảo để bắt đầu ngày mới và tại Hanoi Memory Premier Hotel & Spa, quý khách luôn có thể thưởng thức bữa ăn ngon miệng ngay trong khuôn viên. Chỗ nghỉ cung cấp nhiều bữa ăn ngon với nhiều lựa chọn hấp dẫn.Khi đến nơi, hãy nhớ khám phá các lựa chọn giải trí để trải nghiệm một buổi tối thú vị trong khuôn viên. Hanoi Memory Premier Hotel & Spa cung cấp nhiều tiện ích giải trí tuyệt vời cho khách.Dễ dàng thư giãn mỗi ngày bằng cách sử dụng dịch vụ spa ngay trong khuôn viên.';
  
  
    constructor(
      private route: ActivatedRoute,
      private hotelService: HotelService,
      private ssrService: SsrService,
      private userStorageService: UserStorageService
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
  
  
    showSuccess: boolean = false;
    showError: boolean = false;
  
    triggerSuccess() {
      this.showSuccess = true;
      // Hide warning after 3 seconds
      setTimeout(() => {
        this.showSuccess = false;
      }, 4000);
    }
  
    triggerError() {
      this.showError = true;
  
  
      // Hide warning after 3 seconds
      setTimeout(() => {
        this.showError = false;
      }, 4000);
    }
  
    selectRoom(room: any) {
  
      const userId = this.userStorageService.getUserId() || 1;
  
      this.hotelService.addRoom(room.serviceId, userId, 1).subscribe({
        next: (response: any) => {
          this.triggerSuccess();
        },
        error: (err: any) => {
          this.triggerError();
          console.error('Error fetching hotel details', err);
        },
      });
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

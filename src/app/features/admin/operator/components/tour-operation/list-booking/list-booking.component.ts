import { Component } from '@angular/core';
import { CurrencyVndPipe } from "../../../../../../shared/pipes/currency-vnd.pipe";
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TourService } from '../../../services/tour.service';
import { SpinnerComponent } from "../../../../../../shared/components/spinner/spinner.component";

@Component({
  selector: 'app-list-booking',
  imports: [
    CurrencyVndPipe,
    CommonModule,
    SpinnerComponent
  ],
  templateUrl: './list-booking.component.html',
  styleUrl: './list-booking.component.css'
})
export class ListBookingComponent {
  listBookings: any | null = null;
  isLoading: boolean = false;

  constructor(private route: ActivatedRoute, private tourService: TourService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadBookings(id);
      }
    });
  }

  loadBookings(id: number): void {
    this.isLoading = true;
    this.tourService.getTourBookings(id).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.code === 200) {
          this.listBookings = response.data;
        } else {
          console.error('Lỗi:', response.message);
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Lỗi khi tải danh sách khách hàng:', error);
      }
    });
  }

  getBookingStatusLabel(status: string): { label: string, class: string } {
    switch (status) {
      case 'PENDING':
        return { label: 'Đang chờ xử lý', class: 'bg-yellow-100 text-yellow-800' };
      case 'REQUEST_CANCELLED_WITH_REFUND':
        return { label: 'Yêu cầu hủy & hoàn tiền', class: 'bg-orange-100 text-orange-800' };
      case 'CANCELLED_WITH_REFUND':
        return { label: 'Đã hủy & hoàn tiền', class: 'bg-red-100 text-red-800' };
      case 'CANCELLED_WITHOUT_REFUND':
        return { label: 'Đã hủy - không hoàn tiền', class: 'bg-red-200 text-red-900' };
      case 'CANCELLED':
        return { label: 'Đã hủy', class: 'bg-gray-200 text-gray-700' };
      case 'COMPLETED':
        return { label: 'Đã hoàn tất', class: 'bg-blue-100 text-blue-800' };
      case 'SUCCESS':
        return { label: 'Thành công', class: 'bg-green-100 text-green-800' };
      default:
        return { label: 'Không xác định', class: 'bg-gray-100 text-gray-600' };
    }
  }
}

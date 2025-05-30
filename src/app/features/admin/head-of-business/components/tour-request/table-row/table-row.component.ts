import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserStorageService } from '../../../../../../core/services/user-storage/user-storage.service';
import { Router } from '@angular/router';

@Component({
  selector: '[app-table-row]',
  imports: [CommonModule],
  templateUrl: './table-row.component.html',
  styleUrls: ['./table-row.component.css'],
  standalone: true,
})
export class TableRowComponent {
  @Input() tourBookingDetail: any = <any>{};
  @Input() index: any = <any>{};
  @Output() bookingTaken = new EventEmitter<number>();

  ngOnInit(): void {
    console.log(this.tourBookingDetail)
  }

  userId: number = 0;

  constructor(
    private userStorageService: UserStorageService,
    private router : Router,

  ) {
    this.userId = this.userStorageService.getUserId()!;
  }

  showError: boolean = false;

  openDetail(bookingId: number): void {
    if (bookingId) {
      this.router.navigate(['/head-business/tour-request-detail'], {
        queryParams: { id: bookingId },
      });
    } else {
      console.error('Tour booking không tồn tại');
    }
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

  triggerError() {
    this.showError = true;


    // Hide warning after 3 seconds
    setTimeout(() => {
      this.showError = false;
    }, 4000);
  }
}
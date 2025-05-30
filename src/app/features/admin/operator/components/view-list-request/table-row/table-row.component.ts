import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TruncatePipe } from '../../../../../../shared/pipes/truncate.pipe';
import { RequestService } from '../../../services/request.service';
import { FormatDatePipe } from "../../../../../../shared/pipes/format-date.pipe";
@Component({
  selector: '[app-table-row]',
  imports: [FormsModule, AngularSvgIconModule, CommonModule, TruncatePipe, FormatDatePipe],
  templateUrl: './table-row.component.html',
  styleUrl: './table-row.component.css',
})
export class TableRowComponent {

  @Input() request: any = <any>{};
  tags: string[] = [];

  constructor(private requestService: RequestService,
    private router: Router
  ) { }

  openDetail(request: any): void {
    this.router.navigate(['/operator/request-details'], {
      queryParams: { id: request.tourBookingServiceId }
    });
  }
  
  getStatusInVietnamese(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Đang chờ',
      'CHECKING': 'Đang kiểm tra',
      'REJECTED': 'Bị từ chối',
      'CANCELLED': 'Đã hủy',
      'CANCEL_REQUEST': 'Yêu cầu hủy',
      'APPROVED': 'Đã phê duyệt'
    };
    return statusMap[status] || status;
  }

  // Phương thức trả về class CSS dựa trên trạng thái
  getStatusClass(status: string): string {
    const baseClass = 'rounded-[30px] px-2 py-0.5 text-xs font-medium inline-block mt-1';
    const statusColors: { [key: string]: string } = {
      'PENDING': 'bg-yellow-500/10 text-yellow-800',
      'CHECKING': 'bg-blue-500/10 text-blue-800',
      'REJECTED': 'bg-red-500/10 text-red-800',
      'CANCELLED': 'bg-gray-500/10 text-gray-800',
      'CANCEL_REQUEST': 'bg-red-700/10 text-red-800',
      'APPROVED': 'bg-green-500/10 text-green-800'
    };
    return `${baseClass} ${statusColors[status] || 'bg-gray-500/10 text-gray-800'}`;
  }
}

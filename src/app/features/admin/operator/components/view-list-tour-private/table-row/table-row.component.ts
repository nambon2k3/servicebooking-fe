import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormatDatePipe } from "../../../../../../shared/pipes/format-date.pipe";
import { TourSchedule } from '../../../../../../core/models/tour-operator.model';
import { TourService } from '../../../services/tour.service';

@Component({
  selector: '[app-table-row]',
  imports: [FormsModule, AngularSvgIconModule, CommonModule, FormatDatePipe],
  templateUrl: './table-row.component.html',
  styleUrl: './table-row.component.css',
})
export class TableRowComponent {

  @Input() tour: TourSchedule = <TourSchedule>{};

  authorName: string = 'Loading...';
  tags: string[] = [];

  constructor(
    private router: Router,
    private tourService: TourService
  ) { }

  openDetail(tour: TourSchedule): void {
    this.router.navigate(['/operator/tour-operation'],  {
      queryParams: { id: tour.scheduleId }
    });
  }

  operateTour(tourId: number | null) {
    this.tourService.operateTour(tourId).subscribe({
      next: (response) => {
        this.router.navigate(['/operator/tour-operation'], { queryParams: { id: tourId } });
      },
      error: (error) => {
        console.error('Failed to operate tour:', error);
      }
    });
  }

  getVietnameseStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      DRAFT: 'Bản nháp',
      ONGOING: 'Đang diễn ra',
      COMPLETED: 'Hoàn thành',
      OPEN: 'Đang mở bán',
      CANCELLED: 'Đã hủy',
      FULLY_BOOKED: 'Đã đầy chỗ',
      SETTLEMENT: 'Đã quyết toán',
    };
    return statusMap[status] || 'Chưa cập nhật';
  }  

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      DRAFT: 'text-yellow-700 bg-yellow-100',
      ONGOING: 'text-blue-700 bg-blue-100',
      COMPLETED: 'text-emerald-700 bg-emerald-100',
      OPEN: 'text-green-700 bg-green-100',
      CANCELLED: 'text-red-700 bg-red-100',
      FULLY_BOOKED: 'text-purple-700 bg-purple-100',
      SETTLEMENT: 'text-cyan-700 bg-cyan-100',
    };
    return statusClasses[status] || 'text-gray-500 bg-gray-100';
  }  
}

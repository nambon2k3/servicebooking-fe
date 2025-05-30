import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Tour, TourStatus, TourStatusDisplay } from '../../../../../core/models/tour-request.model';
import { TourRequestService } from '../../services/tour-request.service';

@Component({
  selector: '[app-table-row]',
  imports: [CommonModule],
  templateUrl: './table-row.component.html',
  styleUrls: ['./table-row.component.css'],
  standalone: true,
})
export class TableRowComponent {
  @Input() tour: Tour = <Tour>{};

  constructor(
    private router: Router,
    private tourRequestService: TourRequestService
  ) {}

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  getStatusDisplay(status: string): string {
    return TourStatusDisplay[status as keyof typeof TourStatusDisplay] || status;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  openDetail(): void {
    if (this.tour.id !== undefined) {
      this.router.navigate(['/ceo/tour-request-detail'], {
        queryParams: { id: this.tour.id },
      });
    } else {
      console.error('Tour ID is undefined');
    }
  }
}
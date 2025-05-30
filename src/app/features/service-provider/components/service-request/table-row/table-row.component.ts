import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ServiceRequestService } from '../../../services/service-request.service';
import { ServiceProviderBookingServiceDTO, TourBookingServiceStatusDisplay } from '../../../../../core/models/service-request.model';

@Component({
  selector: '[app-table-row]',
  imports: [CommonModule],
  templateUrl: './table-row.component.html',
  styleUrls: ['./table-row.component.css'],
  standalone: true,
})
export class TableRowComponent {
  @Input() serviceRequest: ServiceProviderBookingServiceDTO = <ServiceProviderBookingServiceDTO>{};

  constructor(
    private router: Router,
    private serviceRequestService: ServiceRequestService
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
    return TourBookingServiceStatusDisplay[status as keyof typeof TourBookingServiceStatusDisplay] || status;
  }

  openDetail(): void {
    if (this.serviceRequest.id !== undefined) {
      this.router.navigate(['/service-provider/request-detail'], {
        queryParams: { id: this.serviceRequest.id },
      });
    } else {
      console.error('Service Request ID is undefined');
    }
  }
}
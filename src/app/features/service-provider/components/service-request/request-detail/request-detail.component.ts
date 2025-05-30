import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceRequestService } from '../../../services/service-request.service';
import { ServiceRequestDetail, TourBookingServiceStatusDisplay } from '../../../../../core/models/service-request.model';

@Component({
  selector: 'app-request-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './request-detail.component.html',
  styleUrls: ['./request-detail.component.css'],
})
export class RequestDetailComponent implements OnInit {
  requestDetail: ServiceRequestDetail | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private serviceRequestService: ServiceRequestService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      this.loadRequestDetail(+id);
    } else {
      console.error('No request ID provided');
      this.router.navigate(['/service-provider/service-request']);
    }
  }

  loadRequestDetail(tourBookingServiceId: number): void {
    this.serviceRequestService.getServiceRequestDetail(tourBookingServiceId).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.requestDetail = response.data;
          console.log('Request Detail:', this.requestDetail); // Thêm log để kiểm tra dữ liệu
        } else {
          console.error('Failed to load request detail:', response.message);
          this.router.navigate(['/service-provider/service-request']);
        }
      },
      error: (err) => {
        console.error('Error loading request detail:', err);
        this.router.navigate(['/service-provider/service-request']);
      },
    });
  }

  formatDate(dateString: string): string {
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

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  }

  getInitials(name: string): string {
    if (!name) return '';
    const words = name.split(' ');
    return words
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getStatusDisplay(status: string): string {
    return TourBookingServiceStatusDisplay[status as keyof typeof TourBookingServiceStatusDisplay] || status;
  }

  onCancel(): void {
    this.router.navigate(['/service-provider/service-request']);
  }

  onApprove(): void {
    if (this.requestDetail) {
      console.log('Approving request with ID:', this.requestDetail);
      this.serviceRequestService.approveServiceRequest(this.requestDetail.tourBookingServiceId).subscribe({
        next: (response) => {
          if (response.code === 200) {
            console.log('Request approved successfully');
            this.router.navigate(['/service-provider/service-request']);
          } else {
            console.error('Failed to approve request:', response.message);
          }
        },
        error: (err) => {
          console.error('Error approving request:', err);
        },
      });
    }
  }

  onReject(): void {
    if (this.requestDetail) {
      this.serviceRequestService.rejectServiceRequest(this.requestDetail.tourBookingServiceId).subscribe({
        next: (response) => {
          if (response.code === 200) {
            console.log('Request rejected successfully');
            this.router.navigate(['/service-provider/service-request']);
          } else {
            console.error('Failed to reject request:', response.message);
          }
        },
        error: (err) => {
          console.error('Error rejecting request:', err);
        },
      });
    }
  }
}
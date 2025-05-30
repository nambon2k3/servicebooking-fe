import { Component } from '@angular/core';
import { TourService } from '../../../services/tour.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { TourStatusDisplay } from '../../../../../../core/models/tour-request.model';
import { CommonModule } from '@angular/common';
import { CurrencyVndPipe } from "../../../../../../shared/pipes/currency-vnd.pipe";

@Component({
  selector: 'app-request-detail',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyVndPipe
  ],
  templateUrl: './request-detail.component.html',
  styleUrls: ['./request-detail.component.css']
})
export class RequestDetailComponent {
  tourDetail: any | null = null;
  showPopup: boolean = false;
  transactions: any[] = [];
  message: string = ''; // New variable for displaying messages

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tourService: TourService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      this.loadTourDetail(+id);
    } else {
      console.error('No tour ID provided');
      this.message = 'No tour ID provided';
      setTimeout(() => {
        this.message = '';
        this.router.navigate(['/ceo/tour-request']);
      }, 3000);
    }
  }

  loadTourDetail(tourId: number): void {
    this.tourService.getTourBookingDetail(tourId).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.transactions = response.data;
          this.tourDetail = response.data[0]; // Assuming the first item is the tour detail
          console.log('Tour Detail:', this.tourDetail);
        } else {
          console.error('Failed to load tour detail:', response.message);
          this.message = 'Failed to load tour details';
          setTimeout(() => {
            this.message = '';
            this.router.navigate(['/head-business/tour-request']);
          }, 3000);
        }
      },
      error: (err) => {
        console.error('Error loading tour detail:', err);
        this.message = 'Error loading tour details';
        setTimeout(() => {
          this.message = '';
          this.router.navigate(['/head-business/tour-request']);
        }, 3000);
      },
    });
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
    return TourStatusDisplay[status as keyof typeof TourStatusDisplay] || status;
  }

  onCancel(): void {
    this.message = 'Returning to tour request list';
    setTimeout(() => {
      this.message = '';
      this.router.navigate(['/head-business/tour-request']);
    }, 3000);
  }

  onApprove(): void {
    if (this.tourDetail) {
      this.tourService.approveRequest(this.tourDetail.id).subscribe({
        next: (response) => {
          if (response.code === 200) {
            this.message = 'Phê duyệt yêu cầu thành công!';
            setTimeout(() => {
              this.message = '';
              this.router.navigate(['/head-business/tour-request']);
            }, 3000);
          } else {
            this.message = 'Lỗi khi phê duyệt: ' + response.message;
            setTimeout(() => {
              this.message = '';
            }, 3000);
          }
        },
        error: (err) => {
          console.error('Lỗi khi phê duyệt:', err);
          this.message = err;
          setTimeout(() => {
            this.message = '';
          }, 3000);
        },
      });
    }
  }

  onReject(): void {
    if (this.tourDetail) {
      this.tourService.rejectRequest(this.tourDetail.id).subscribe({
        next: (response) => {
          if (response.code === 200) {
            this.message = 'Từ chối yêu cầu thành công';
            setTimeout(() => {
              this.message = '';
              this.router.navigate(['/head-business/tour-request']);
            }, 3000);
          } else {
            this.message = 'Lỗi khi từ chối: ' + response.message;
            setTimeout(() => {
              this.message = '';
            }, 3000);
          }
        },
        error: (err) => {
          console.error('Lỗi khi từ chối:', err);
          this.message = err;
          setTimeout(() => {
            this.message = '';
          }, 3000);
        },
      });
    }
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TourRequestService } from '../../services/tour-request.service';
import { TourDetail, TourStatusDisplay, TourDayDetail } from '../../../../../core/models/tour-request.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-tour-request-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tour-request-detail.component.html',
  styleUrls: ['./tour-request-detail.component.css'],
})
export class TourRequestDetailComponent implements OnInit {
  tourDetail: TourDetail | null = null;
  selectedTourDay: TourDayDetail | null = null; 
  showPopup: boolean = false; 

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tourRequestService: TourRequestService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      this.loadTourDetail(+id);
    } else {
      console.error('No tour ID provided');
      this.router.navigate(['/ceo/tour-request']);
    }
  }

  loadTourDetail(tourId: number): void {
    this.tourRequestService.getDetailTourNeedToProcess(tourId).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.tourDetail = response.data;
          console.log('Tour Detail:', this.tourDetail);
        } else {
          console.error('Failed to load tour detail:', response.message);
          this.router.navigate(['/ceo/tour-request']);
        }
      },
      error: (err) => {
        console.error('Error loading tour detail:', err);
        this.router.navigate(['/ceo/tour-request']);
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

  unescapeHtml(html: string): string {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = html;
    return textarea.value;
  }

  getSanitizedHighlights(): SafeHtml {
    const unescaped = this.unescapeHtml(this.tourDetail?.highlights || '');
    return this.sanitizer.bypassSecurityTrustHtml(unescaped);
  }

  getStatusDisplay(status: string): string {
    return TourStatusDisplay[status as keyof typeof TourStatusDisplay] || status;
  }

  viewTourDayDetail(tourDayId: number): void {
    if (this.tourDetail) {
      this.tourRequestService.getDetailTourDay(this.tourDetail.id, tourDayId).subscribe({
        next: (response) => {
          if (response.code === 200) {
            this.selectedTourDay = response.data;
            console.log('Tour Day Detail:', this.selectedTourDay);
            this.showPopup = true; // Hiển thị pop-up
          } else {
            console.error('Failed to load tour day detail:', response.message);
          }
        },
        error: (err) => {
          console.error('Error loading tour day detail:', err);
        },
      });
    }
  }

  closePopup(): void {
    this.showPopup = false;
    this.selectedTourDay = null;
  }

  onCancel(): void {
    this.router.navigate(['/ceo/tour-request']);
  }

  onApprove(): void {
    if (this.tourDetail) {
      this.tourRequestService.approveTourProcess(this.tourDetail.id).subscribe({
        next: (response) => {
          if (response.code === 200) {
            console.log('Tour approved successfully');
            this.router.navigate(['/ceo/tour-request']);
          } else {
            console.error('Failed to approve tour:', response.message);
          }
        },
        error: (err) => {
          console.error('Error approving tour:', err);
        },
      });
    }
  }

  onReject(): void {
    if (this.tourDetail) {
      this.tourRequestService.rejectTourProcess(this.tourDetail.id).subscribe({
        next: (response) => {
          if (response.code === 200) {
            console.log('Tour rejected successfully');
            this.router.navigate(['/ceo/tour-request']);
          } else {
            console.error('Failed to reject tour:', response.message);
          }
        },
        error: (err) => {
          console.error('Error rejecting tour:', err);
        },
      });
    }
  }
}
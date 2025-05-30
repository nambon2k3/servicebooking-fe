import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RequestService } from '../../services/request.service';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from "../../../../../shared/components/spinner/spinner.component";
import { CurrencyVndPipe } from "../../../../../shared/pipes/currency-vnd.pipe";
import { FormatDatePipe } from "../../../../../shared/pipes/format-date.pipe";

interface RequestDetail {
  tourBookingServiceId: number;
  tourName: string;
  tourType: string;
  startDate: string;
  endDate: string;
  dayNumber: number | null;
  bookingCode: string;
  status: string;
  reason: string;
  proposer: string;
  updatedAt: string;
  serviceName: string;
  nettPrice: number;
  currentQuantity: number;
  requestQuantity: number;
  totalPrice: number;
}

@Component({
  selector: 'app-view-request-detail',
  standalone: true,
  imports: [
    CommonModule,
    SpinnerComponent,
    CurrencyVndPipe,
    FormatDatePipe
  ],
  templateUrl: './view-request-detail.component.html',
  styleUrls: ['./view-request-detail.component.css']
})
export class ViewRequestDetailComponent implements OnInit {
  requestDetail: RequestDetail | null = null;
  isLoading: boolean = false;

  // New properties for popup
  showPopup: boolean = false;
  popupMessage: string = '';
  isSuccess: boolean = false;

  constructor(
    private router: Router,
    private requestService: RequestService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const tourBookingServiceId = params['id'];
      if (tourBookingServiceId) {
        this.loadRequestDetail(tourBookingServiceId);
      }
    });
  }

  loadRequestDetail(tourBookingServiceId: any): void {
    this.isLoading = true;
    this.requestService.getRequestDetail(tourBookingServiceId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.code === 200) {
          this.requestDetail = response.data;
        } else {
          this.showPopupMessage(response.message || 'Lỗi khi tải chi tiết yêu cầu.', false);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showPopupMessage(err.message || 'Đã xảy ra lỗi khi tải chi tiết yêu cầu.', false);
      }
    });
  }

  onCanceled(): void {
    this.router.navigate(['/operator/view-list-request']);
  }

  onApproved(): void {
    this.isLoading = true;
    this.requestService.updateRequestStatus(this.requestDetail?.tourBookingServiceId!).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.code === 200) {
          this.showPopupMessage(response.message || 'Phê duyệt yêu cầu thành công!', true);
        } else {
          this.showPopupMessage(response.message || 'Lỗi khi phê duyệt yêu cầu.', false);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showPopupMessage(err.message || 'Đã xảy ra lỗi khi phê duyệt yêu cầu.', false);
      }
    });
  }

  onRejected(): void {
    this.isLoading = true;
    this.requestService.rejectRequest(this.requestDetail?.tourBookingServiceId!).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.code === 200) {
          this.showPopupMessage(response.message || 'Từ chối yêu cầu thành công!', true);
        } else {
          this.showPopupMessage(response.message || 'Lỗi khi từ chối yêu cầu.', false);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showPopupMessage(err.message || 'Đã xảy ra lỗi khi từ chối yêu cầu.', false);
      }
    });
  }

  // New method to show popup message
  showPopupMessage(message: string, isSuccess: boolean) {
    this.popupMessage = message;
    this.isSuccess = isSuccess;
    this.showPopup = true;

    setTimeout(() => {
      this.showPopup = false;
      this.router.navigate(['/operator/view-list-request']);
    }, 3000);
  }
}
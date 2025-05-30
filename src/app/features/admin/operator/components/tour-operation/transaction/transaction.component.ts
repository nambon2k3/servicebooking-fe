import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TourService } from '../../../services/tour.service';
import { TruncatePipe } from "../../../../../../shared/pipes/truncate.pipe";
import { FormatDatePipe } from "../../../../../../shared/pipes/format-date.pipe";
import { SpinnerComponent } from "../../../../../../shared/components/spinner/spinner.component";
import { CurrencyVndPipe } from "../../../../../../shared/pipes/currency-vnd.pipe";

@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [
    CommonModule,
    TruncatePipe,
    FormatDatePipe,
    SpinnerComponent,
    CurrencyVndPipe
],
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.css']
})
export class TransactionComponent {
  listTransactions: any[] = [];
  id: number = 0;
  status: string = '';
  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tourService: TourService,
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.id = params['id'];
      if (this.id) {
        this.loadTransactions(this.id);
      }
    });
  }

  loadTransactions(id: number): void {
    this.isLoading = true;
    this.tourService.getTransactions(id).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.code === 200) {
          this.listTransactions = response.data;
        } else {
          console.error('Lỗi:', response.message);
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Lỗi khi tải danh sách transaction:', error.message);
      }
    });
  }

  mapPaymentStatus(status: string): string {
    const paymentStatusMap: { [key: string]: string } = {
      'UNPAID': 'Chưa thanh toán',
      'PAID': 'Đã thanh toán',
      'PARTIALLY_PAID': 'Thanh toán một phần',
      'PENDING': 'Đang chờ xử lý',       
      'APPROVED': 'Được chấp nhận',
      'REJECTED': 'Bị từ chối',
      'CANCELLED': 'Đã hủy',             
      'REFUNDED': 'Đã hoàn tiền'       
    };
    return paymentStatusMap[status?.toUpperCase()] || 'Không xác định';
  }

  getPaymentStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      UNPAID: 'text-red-700 bg-red-100',
      PAID: 'text-green-700 bg-green-100',
      PARTIALLY_PAID: 'text-yellow-700 bg-yellow-100',
      PENDING: 'text-blue-700 bg-blue-100',
      APPROVED: 'text-emerald-700 bg-emerald-100',
      REJECTED: 'text-red-700 bg-red-100',
      CANCELLED: 'text-gray-600 bg-gray-200',
      REFUNDED: 'text-purple-700 bg-purple-100'
    };
    return statusClasses[status?.toUpperCase()] || 'text-gray-500 bg-gray-100';
  }  

  openPostReceipt(): void {
    this.router.navigate(['/operator/tour-operation/create-receipt']);
  }
}
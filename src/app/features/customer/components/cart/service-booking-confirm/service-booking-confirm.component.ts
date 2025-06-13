import { CommonModule, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CurrencyVndPipe } from '../../../../../shared/pipes/currency-vnd.pipe';
import { SpinnerComponent } from '../../../../../shared/components/spinner/spinner.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-service-booking-confirm',
  imports: [CommonModule,
      CurrencyVndPipe,
      DatePipe,
      ReactiveFormsModule,
      SpinnerComponent,
      RouterModule],
  templateUrl: './service-booking-confirm.component.html',
  styleUrl: './service-booking-confirm.component.css'
})
export class ServiceBookingConfirmComponent {
  isLoading: boolean = true;
  paymentStatus: any;
  grandTotal: number = 0;
  bookingCode: string = '';

  rooms: any[] = [];
  meals: any[] = [];
  activities: any[] = [];

  paymentUrl: string = '';

  bookingStatus: string = '';

  constructor(
    private route: ActivatedRoute,
    private cartService: CartService
  
  ) {

  }


  ngOnInit(): void {

    const bookingCode = this.route.snapshot.paramMap.get('code')!;
    this.bookingCode = bookingCode;
    this.route.queryParams.subscribe(params => {
      this.paymentStatus = params['status']; // 'success' or 'fail'
    });

    if (this.paymentStatus === 'success') {
      this.successMessage = 'Thanh toán thành công';
      this.triggerSuccess()
    } else if (this.paymentStatus === 'fail') {
      this.errorMessage = 'Thanh toán thất bại';
      this.triggerError()
    }


    this.fetchServiceData();

  }


  fetchServiceData() {

    this.cartService.details(this.bookingCode).subscribe({
      next: (response) => {
        this.rooms = response.data.rooms;
        this.meals = response.data.meals;
        this.activities = response.data.activities;
        this.isLoading = false;


        this.grandTotal = [
            ...this.rooms,
            ...this.meals,
            ...this.activities
          ].reduce((total, item) => {
            const quantity = item.quantity || 0;
            const price = item.sellingPrice || 0;
            return total + quantity * price;
          }, 0);

        this.paymentUrl = response.data.paymentUrl || '';
        this.bookingStatus = response.data.bookingStatus || '';


      },
      error: (error) => {
        console.error('Error fetching service data:', error);
        this.isLoading = false;
      }
    });
  }


  forwardPayment() {
    if (this.paymentUrl) {
      window.location.href = this.paymentUrl;
    } else {
      this.triggerError();
    }
  }

  showSuccess: boolean = false;
  showError: boolean = false;


  successMessage: string = 'Thay đổi thành công';
  errorMessage: string = 'Thay đổi thất bại';

  triggerSuccess() {
    this.showSuccess = true;

    // Hide warning after 3 seconds
    setTimeout(() => {
      this.showSuccess = false;
    }, 4000);
  }

  triggerError() {
    this.showError = true;

    // Hide warning after 3 seconds
    setTimeout(() => {
      this.showError = false;
      this.errorMessage = 'Thay đổi thất bại';
    }, 4000);
  }

}

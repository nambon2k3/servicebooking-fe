import { Component } from '@angular/core';
import { UserStorageService } from '../../../../../core/services/user-storage/user-storage.service';
import { BookingInfoService } from '../../../services/booking-infor.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CurrencyVndPipe } from "../../../../../shared/pipes/currency-vnd.pipe";

@Component({
  selector: 'app-tour-booking-confirm',
  imports: [CommonModule, CurrencyVndPipe],
  templateUrl: './tour-booking-confirm.component.html',
  styleUrl: './tour-booking-confirm.component.css'
})
export class TourBookingConfirmComponent {
  isLoading: boolean = true;
  bookingData?: any;


  numberAdults: number = 1;
  numberChildren: number = 0;

  childrenPrice: number = 0;

  numberSingleRooms: number = 1;

  constructor(
    private bookingInforService: BookingInfoService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  paymentStatus: any;

  ngOnInit(): void {
    // const bookingCode = this.router.url.split('/').pop();

    // console.log(bookingCode)

    const bookingCode = this.route.snapshot.paramMap.get('code')!;
    this.route.queryParams.subscribe(params => {
      this.paymentStatus = params['status']; // 'success' or 'fail'
    });

    if(this.paymentStatus === 'success') {
      this.successMessage = 'Thanh toán thành công';
      this.triggerSuccess()
    } else if(this.paymentStatus === 'fail') {
      this.errorMessage = 'Thanh toán thất bại';
      this.triggerError()
    }

    console.log(this.paymentStatus)

    if(bookingCode) {
      this.getBookingDetailByBookingCode(bookingCode);
    }

  }

  forwardPayment() {
    console.log(this.bookingData.paymentUrl)
    window.location.href = `${this.bookingData.paymentUrl}`;
  }


  getBookingDetailByBookingCode(bookingCode: string) {
    this.bookingInforService.getBookingDetails(bookingCode).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.bookingData = response.data

        this.numberSingleRooms = this.bookingData.adults.filter((t: any) => t?.singleRoom === true).length


        this.numberAdults = this.bookingData.adults.length;
        this.numberChildren = this.bookingData.children.length;

        console.log(this.bookingData)

        this.calculateTotal();

        this.setExpiredDate();
        
      },
    })
  }

  total: number = 0;


  calculateTotal() {
    const adultsArray = this.bookingData.adults;
    const childrenArray = this.bookingData.children;

    const adultPrice = this.bookingData.sellingPrice;
    const childrenPrice = adultPrice * 0.75;

    this.childrenPrice = adultPrice * 0.75;

    const adultTotal = adultsArray.length * adultPrice!;
    const childrenTotal = childrenArray.length * childrenPrice;

    const extra = this.numberSingleRooms * this.bookingData.extraHotelCost!;

    this.total = adultTotal + childrenTotal + extra;


    //this.bookingForm.patchValue({ total: this.total }, { emitEvent: false });
  }


  changePaymentMethod() {

    const newMethod = this.bookingData.paymentMethod === 'CASH' ? 'BANKING' : 'CASH';

    console.log(this.bookingData.id)

    this.bookingInforService.changePaymentStatus(this.bookingData.id, newMethod).subscribe({
      next: (response) => {
        console.log(response)




        this.bookingData.paymentMethod = newMethod;
        this.triggerSuccess()
      }, 
      error: (error) => {
        console.log(error)
      }
    })
  }

  expiredDate?:Date;

  setExpiredDate(): void {
    let date = new Date(this.bookingData.createdAt);
    date.setHours(date.getHours() + 2);
    this.expiredDate = date;
    console.log(this.expiredDate)
  }


  range(end: number): number[] {
    return Array.from({ length: end - 0 }, (_, i) => 0 + i);
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

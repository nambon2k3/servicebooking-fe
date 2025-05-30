import { AfterViewInit, Component } from '@angular/core';
import { TourService } from '../../services/tour.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { CurrencyVndPipe } from "../../../../../shared/pipes/currency-vnd.pipe";
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { Modal } from 'flowbite';
import { CANCELLED } from 'node:dns';
import { SpinnerComponent } from '../../../../../shared/components/spinner/spinner.component';
import { h } from '@fullcalendar/core/preact.js';

@Component({
  selector: 'app-tour-booking-service',
  imports: [CommonModule, CurrencyVndPipe, ReactiveFormsModule, RouterModule, SpinnerComponent],
  templateUrl: './tour-booking-service.component.html',
  styleUrl: './tour-booking-service.component.css',
})
export class TourBookingServiceComponent implements AfterViewInit{

  tourBookingId?: number;

  dayServices : any;

  totalServices: number = 0;

  selectedTourBookingService: any;

  isLoading: boolean = false;

  serviceCategoryMap: { [key: string]: string } = {
    'Hotel': 'Khách sạn',
    'Restaurant': 'Nhà hàng',
    'Transport': 'Phương tiện',
    'Flight Ticket': 'Vé máy bay',
    'Activity': 'Hoạt động',
  };

  constructor(
    private tourService: TourService,
    private router: Router,
    private fb: FormBuilder,
    private bookingService: BookingService,
  ) {

  }

  bookingServiceForm!: FormGroup;

  bookingServiceNotOrderForm!: FormGroup;

  serviceNotOrderModal: Modal | null = null;

  serviceModal: Modal | null = null;

  tourType: any;

  ngAfterViewInit(): void {
    this.serviceModal = new Modal(document.getElementById('service-modal'));
    this.serviceNotOrderModal = new Modal(document.getElementById('service-not-order-modal'));
  }


  openModal(service: any): void {
    if(service.status === 'NOT_ORDERED' || service.status === 'CANCELLED' || service.status === 'CHECKING' || service.status === 'SUCCESS') {
      this.openServiceNotOrderModal(service);
    } else {
      this.openServiceModal(service);
    }
  }

  openServiceNotOrderModal(service: any): void {
    this.serviceNotOrderModal?.show();
    this.selectedTourBookingService = service;

    this.updateInfoBookingServiceNotOrderForm();
  }

  closeServiceNotOrderModal(): void {
    this.serviceNotOrderModal?.hide();
  }

  openServiceModal(service: any): void {
    this.serviceModal?.show();
    this.selectedTourBookingService = service;

    this.updateInfoBookingServiceForm();
  }

  closeServiceModal(): void {
    this.serviceModal?.hide();
  }

  updateInfoBookingServiceForm() {
    this.bookingServiceForm.patchValue({
      tourBookingServiceId: this.selectedTourBookingService.id,
      currentQuantity: this.selectedTourBookingService.currentQuantity,
      requestedQuantity: this.selectedTourBookingService.requestedQuantity,
    });



  }



  updateStatus() {
    this.bookingService.updateStatus(this.selectedTourBookingService.id).subscribe(
      (response) => {
        console.log('Updated booking status:', response);
        this.getBookingService(this.tourBookingId!);
      },
      (error) => {
        console.error('Error updating booking status:', error);
      }
    );


    this.closeServiceNotOrderModal();
    this.closeServiceModal();

    this.bookingServiceForm.reset();
    this.bookingServiceNotOrderForm.reset();
  }

  ngOnInit():void {
    const tourBookingId = Number(this.router.url.split('/').pop());
    //const tourBookingId = 84;

    if (tourBookingId) {
      this.tourBookingId = tourBookingId;
      this.getBookingService(tourBookingId);
    }

    this.bookingServiceForm = this.fb.group({
      tourBookingServiceId: [5, Validators.required],
      currentQuantity: [0, [Validators.required, Validators.min(0)]],
      requestedQuantity: [0, [Validators.required, Validators.min(0)]],
      reason: ['', Validators.required]
    });

    this.bookingServiceNotOrderForm = this.fb.group({
      tourBookingServiceId: [5, Validators.required],
      currentQuantity: [0, [Validators.required, Validators.min(0)]],
    });
  }

  updateInfoBookingServiceNotOrderForm() {
    this.bookingServiceNotOrderForm.patchValue({
      tourBookingServiceId: this.selectedTourBookingService.id,
      currentQuantity: this.selectedTourBookingService.currentQuantity,
      
    });


    console.log('updateInfoBookingServiceNotOrderForm', this.bookingServiceNotOrderForm.value);

  }

  hasNotOrdered:boolean = true;

  getBookingService(tourBookingId: number): void {
    this.isLoading = true;
    this.bookingService.getBookingService(tourBookingId).subscribe({
      next: (response) => {
        this.dayServices = response.data.servicesByDay;

        this.tourType = response.data.tourType;

        this.dayServices.sort((a:any, b:any) => a.tourDay.dayNumber - b.tourDay.dayNumber);
        this.calculateSummary()

        console.log('RESPONSE:', response);


        const hasNotOrdered = this.dayServices.some((day: any) =>
          day.bookingServices.some((service: any) => service.status === 'NOT_ORDERED')
        );

        this.hasNotOrdered = hasNotOrdered

        console.log('Day Services:', this.dayServices);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Booking Failed:', error);
        this.isLoading = false;
      }
    });

  }

  totalDays = 0;
  statusCounter = {
    PENDING: 0,
    NOT_ORDERED: 0,
    CANCELLED: 0,
    AVAILABLE: 0,
    CHECKING: 0,
    REJECTED_BY_OPERATOR: 0,
    CANCEL_REQUEST: 0,
    NOT_AVAILABLE: 0
  };

  statusLabels: { [key: string]: string } = {
    PENDING: 'Đang chờ xử lý',
    NOT_ORDERED: 'Chưa đặt dịch vụ',
    CANCELLED: 'Đã hủy',
    AVAILABLE: 'Đã xác thực',
    CHECKING: 'Chờ xác thực',
    REJECTED_BY_OPERATOR: 'Điều hành từ chối',
    CANCEL_REQUEST: 'Yêu cầu hủy',
    NOT_AVAILABLE: 'Không khả dụng'
  };

  statusKeys(): string[] {
    return Object.keys(this.statusCounter);
  }

  getStatusCount(status: string): number {
    return this.statusCounter[status as keyof typeof this.statusCounter] || 0;
  }

  calculateSummary(): void {
    this.totalDays = this.dayServices.length;
    this.totalServices = 0;
    this.statusCounter = {
      PENDING: 0,
      NOT_ORDERED: 0,
      CANCELLED: 0,
      AVAILABLE: 0,
      CHECKING: 0,
      REJECTED_BY_OPERATOR: 0,
      CANCEL_REQUEST: 0,
      NOT_AVAILABLE: 0
    };
    this.dayServices.forEach((dayService: any) => {
      this.totalServices += dayService.bookingServices.length;
      dayService.bookingServices.forEach((service:any) => {
        const status = service.status as keyof typeof this.statusCounter
        if (this.statusCounter.hasOwnProperty(status)) {
          this.statusCounter[status]++;
        }
      });
    });
  }


  onSubmit(): void {
    if (this.bookingServiceForm.valid) {
      console.log('Updated booking service:', this.bookingServiceForm.value);
      // call your update API here
    }
  }


  submitBooking(action: string) {
    switch(action) {
      case 'CHECKING':
        this.chekingService();
        break;
      case 'SAVE':
        this.saveChanges();
        break;
      case 'CANCEL':
        this.cancelService();
        break;
    }

    this.closeServiceModal();
    this.closeServiceNotOrderModal();
  }

  chekingService() {
    // Logic đặt dịch vụ
    console.log('Đặt dịch vụ:', this.bookingServiceNotOrderForm.value);

    this.isLoading = true;

    this.bookingService.sendCheckingSICAvailable(this.bookingServiceNotOrderForm.value.tourBookingServiceId, 0 , '').subscribe({
      next: (response) => {
        this.isLoading = true;
        console.log('Updated service:', response);
        this.getBookingService(this.tourBookingId!);
        
      },
      error: (error) => {
        console.error('Booking Failed:', error);
        this.isLoading = false;
      }

    });
    this.closeServiceNotOrderModal();
    this.closeServiceModal();

    this.bookingServiceForm.reset();
    this.bookingServiceNotOrderForm.reset();

  }


  chekingSICService() {
    // Logic đặt dịch vụ
    console.log('Đặt dịch vụ:', this.bookingServiceNotOrderForm.value);

    this.isLoading = true;

    this.bookingService.sendCheckingSICAvailable(this.bookingServiceForm.value.tourBookingServiceId, this.bookingServiceForm.value.requestedQuantity, this.bookingServiceForm.value.reason).subscribe({
      next: (response) => {
        this.isLoading = true;
        console.log('Updated service:', response);
        this.getBookingService(this.tourBookingId!);
        this.closeServiceNotOrderModal();
      },
      error: (error) => {
        console.error('Booking Failed:', error);
        this.isLoading = false;
      }

    });

    this.closeServiceModal();
    this.closeServiceNotOrderModal();

    this.bookingServiceForm.reset();
    this.bookingServiceNotOrderForm.reset();

  }
  
  saveChanges() {
    // Logic lưu thay đổi
    console.log('Lưu thay đổi:', this.bookingServiceNotOrderForm.value);

    this.isLoading = true;

    this.bookingService.updateServiceQuantity(this.bookingServiceNotOrderForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Updated service:', response);
        this.getBookingService(this.tourBookingId!);
        this.closeServiceNotOrderModal();
      },
      error: (error) => {
        console.error('Booking Failed:', error);
        this.isLoading = false;
      }
    });


  }
  
  cancelService() {
    // Logic hủy dịch vụ
    this.isLoading = true;

    console.log('Hủy dịch vụ:', this.bookingServiceNotOrderForm.value.tourBookingServiceId);
    console.log('Hủy dịch vụ:', this.bookingServiceNotOrderForm.value);

    this.bookingService.cancelService(this.bookingServiceNotOrderForm.value.tourBookingServiceId).subscribe({
      next: (response) => {
        console.log('Canceled service:', response);
        this.getBookingService(this.tourBookingId!);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Booking Failed:', error);
        this.isLoading = false;
      }
    });


    this.closeServiceModal();
    this.closeServiceNotOrderModal();

  }


  cancelSICService() {
    // Logic hủy dịch vụ
    this.isLoading = true;

    this.bookingService.cancelService(this.bookingServiceForm.value.tourBookingServiceId).subscribe({
      next: (response) => {
        console.log('Canceled service:', response);
        this.getBookingService(this.tourBookingId!);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Booking Failed:', error);
        this.isLoading = false;
      }
    });


    this.closeServiceModal();
    this.closeServiceNotOrderModal();
  }


  checkingService() {

    console.log('Kiểm tra all dịch vụ:', this.bookingServiceNotOrderForm.value);

    this.bookingService.sendCheckingAllAvailable(this.tourBookingId!).subscribe({
      next: (response) => {
        console.log('Updated service:', response);
        this.getBookingService(this.tourBookingId!);
      },
      error: (error) => {
        console.error('Booking Failed:', error);
        this.isLoading = false;
      }
    });


    this.closeServiceModal();
    this.closeServiceNotOrderModal();


  }

}

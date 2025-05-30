import { Component, EventEmitter, Input, Output, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Modal } from 'flowbite';
import { TourService } from '../../../../services/tour.service';
import { SsrService } from '../../../../../../../core/services/ssr.service';

interface PaymentEvent {
  success: boolean;
  error?: string;
}

@Component({
  selector: 'app-pay-service',
  imports: [
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './pay-service.component.html',
  styleUrls: ['./pay-service.component.css']
})
export class PayServiceComponent {
  @Input() selectedService: any;
  @Output() sendRequest : EventEmitter<PaymentEvent> = new EventEmitter<PaymentEvent>();
  paymentForm: FormGroup;
  modal: Modal | null = null;
  displayTransactionType: string = "Phiếu Chi";
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private tourService: TourService,
    private ssrService: SsrService,
    private cdr: ChangeDetectorRef
  ) {
    this.paymentForm = this.fb.group({
      amount: ['', Validators.required],
      paidBy: ['Viet Travel', Validators.required],
      receivedBy: ['', Validators.required],
      paymentMethod: ['CASH', Validators.required],
      transactionType: ['PAYMENT', Validators.required],
      notes: [''],
      serviceId: ['', Validators.required],
      serviceName: [''],
      quantity: ['', Validators.required],
      tourDayId: ['', Validators.required],
    });
  }

  sendPayment() {
    if (this.paymentForm.invalid) {
      this.errorMessage = 'Vui lòng điền đầy đủ thông tin thanh toán.';
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    const { serviceName, ...payload } = {
      bookingId: this.selectedService?.bookingId,
      tourDayId: this.selectedService?.tourDayId,
      ...this.paymentForm.value
    };

    this.tourService.payService(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.code === 200) {
          this.sendRequest.emit({ success: true });
          this.close();
        } else {
          this.errorMessage = res.message;
          this.sendRequest.emit({ success: false, error: this.errorMessage! });
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err;
        this.sendRequest.emit({ success: false, error: this.errorMessage! });
        console.error('Payment Failed:', err);
        this.cdr.detectChanges();
      }
    });
  }

  open() {
    this.errorMessage = null; // Clear previous error
    this.isLoading = false;
    const doc = this.ssrService.getDocument();
    if (doc) {
      const modalElement = doc.getElementById('paymentModal');
      if (modalElement) {
        this.modal = new Modal(modalElement);
      } else {
        this.errorMessage = 'Không thể khởi tạo modal thanh toán.';
        this.cdr.detectChanges();
        return;
      }
    }

    if (this.selectedService) {
      const defaultNote = `Thanh toán cho dịch vụ ${this.selectedService.serviceName} của nhà cung cấp ${this.selectedService.providerName}`;

      this.paymentForm.patchValue({
        amount: (this.selectedService.amountToPayForBooking - this.selectedService.paidForBooking) || '',
        receivedBy: this.selectedService.providerName || '',
        serviceId: this.selectedService.id || '',
        quantity: this.selectedService.quantity || '',
        serviceName: this.selectedService.serviceName || '',
        tourDayId: this.selectedService.tourDayId || '',
        notes: defaultNote
      });
    } else {
      this.errorMessage = 'Dịch vụ không hợp lệ.';
      this.cdr.detectChanges();
      return;
    }
    this.modal?.show();
  }

  close() {
    this.errorMessage = null; // Clear error on close
    this.isLoading = false;
    this.modal?.hide();
  }
}
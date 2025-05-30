import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Modal } from 'flowbite';
import { SsrService } from '../../../../../../../core/services/ssr.service';
import { TourService } from '../../../../services/tour.service';

interface PaymentEvent {
  success: boolean;
  error?: string;
}

@Component({
  selector: 'app-tour-guide-pay',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './tour-guide-pay.component.html',
  styleUrls: ['./tour-guide-pay.component.css'],
})
export class TourGuidePayComponent {
  @Input() selectedService: any;
  @Output() sendRequest : EventEmitter<PaymentEvent> = new EventEmitter<PaymentEvent>();
  paymentForm: FormGroup;
  modal: Modal | null = null;
  @Input() tourGuide: any = null;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private tourService: TourService, private ssrService: SsrService) {
    this.paymentForm = this.fb.group({
      amount: ['', Validators.required],
      paidBy: ['', Validators.required],
      receivedBy: ['', Validators.required],
      paymentMethod: ['CASH', Validators.required],
      transactionType: ['ADVANCED', Validators.required],
      notes: [''],
      serviceId: ['', Validators.required],
      serviceName: [''],
      quantity: ['', Validators.required]
    });
  }

  sendPayment() {
    const { serviceName, ...payload } = {
      bookingId: this.selectedService?.bookingId,
      ...this.paymentForm.value
    };

    this.tourService.payService(payload).subscribe({
      next: (res: any) => {
        if (res.code === 200) {
          this.sendRequest.emit({ success: true });
          this.close();
        } else {
          this.errorMessage = res.message;
          this.sendRequest.emit({ success: false, error: this.errorMessage! });
        }
      },
      error: (err: any) => {
        this.errorMessage = err;
        this.sendRequest.emit({ success: false, error: this.errorMessage! });
        console.error('Payment Failed:', err);
      }
    });
  }


  open() {
    const doc = this.ssrService.getDocument();
    if (doc) {
      const modalElement = document.getElementById('tourGuidePayModal');
      if (modalElement) {
        this.modal = new Modal(modalElement);
      }
    }

    if (this.selectedService) {
      this.paymentForm.patchValue({
        amount: (this.selectedService.amountToPayForBooking - this.selectedService.paidForBooking) || '',
        receivedBy: this.selectedService.providerName || '',
        paidBy: this.tourGuide || '',
        serviceId: this.selectedService.id || '',
        quantity: this.selectedService.quantity || '',
        serviceName: this.selectedService.serviceName || '',
      });
    }
    this.modal?.show();
  }

  close() {
    this.modal?.hide();
  }
}
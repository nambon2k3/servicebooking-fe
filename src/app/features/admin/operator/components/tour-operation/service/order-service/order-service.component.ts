import { Component, Input, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { TourService } from '../../../../services/tour.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Modal } from 'flowbite';
import { SsrService } from '../../../../../../../core/services/ssr.service';
import { BlogContentComponent } from "../../../../../marketer/components/blog-detail/blog-content/blog-content.component";
import { SpinnerComponent } from "../../../../../../../shared/components/spinner/spinner.component";
import { RequestService } from '../../../../services/request.service';

interface EmailSentEvent {
  success: boolean;
  error?: string;
}

@Component({
  selector: 'app-order-service',
  templateUrl: './order-service.component.html',
  styleUrls: ['./order-service.component.css'],
  imports: [
    FormsModule,
    CommonModule,
    BlogContentComponent,
    SpinnerComponent
  ]
})
export class OrderServiceComponent {
  @Input() selectedService: any;
  @Output() emailSent: EventEmitter<EmailSentEvent> = new EventEmitter<EmailSentEvent>();
  requestDate: string = new Date().toISOString().split('T')[0];
  private modal: Modal | null = null;
  errorMessage: string | null = null;
  isLoading: boolean = false;

  emailData = {
    bookingServiceId: 0,
    providerId: 0,
    providerName: '',
    providerEmail: '',
    emailSubject: '',
    emailContent: ''
  };

  convertedtext: string = '';

  constructor(
    private tourService: TourService,
    private ssrService: SsrService,
    private requestService: RequestService,
    private cdr: ChangeDetectorRef
  ) { }

  async open() {
    this.errorMessage = null; // Clear previous error
    const document = this.ssrService.getDocument();
    if (document && !this.modal) {
      const modalElement = document.getElementById('orderModal');
      if (modalElement) {
        this.modal = new Modal(modalElement);
      }
    }
    await this.previewEmail();
    this.generateEmailContent();
    this.cdr.detectChanges();
    this.modal?.show();
  }

  async previewEmail() {
    this.isLoading = true;
    this.errorMessage = null; // Clear previous error
    const payload = {
      bookingServiceId: this.selectedService.bookingServiceId,
      serviceId: this.selectedService.id,
      orderQuantity: this.selectedService.quantity,
      requestDate: this.requestDate === 'Chưa đặt'
        ? new Date().toISOString()
        : `${this.requestDate}T00:00:00`
    };

    try {
      const response = await this.tourService.previewEmail(payload).toPromise() as { data: any, code: number, message: string };
      this.isLoading = false;
      if (response.code === 200) {
        this.emailData = { ...response.data };
      } else {
        this.errorMessage = response.message || 'Có lỗi xảy ra khi lấy thông tin email.';
      }
    } catch (error: any) {
      this.isLoading = false;
      this.errorMessage = error;
      console.error('Có lỗi xảy ra khi lấy thông tin email:', error);
    }
    this.cdr.detectChanges();
  }

  close() {
    this.errorMessage = null; // Clear error on close
    this.isLoading = false;
    this.modal?.hide();
  }

  generateEmailContent() {
    const data = this.emailData;

    this.convertedtext = `
      Kính gửi: <strong>${data.providerName}</strong>,<br><br>
      
      Dưới đây là thông tin đặt dịch vụ của chúng tôi. Mong quý đối tác vui lòng sắp xếp và xác nhận thông tin sau:<br><br>
      
      <strong>Dịch vụ:</strong> ${data.emailContent.match(/Dịch vụ: (.*)/)?.[1] || 'N/A'}<br>
      <strong>Số lượng:</strong> ${data.emailContent.match(/Số lượng: (\d+)/)?.[1] || 'N/A'}<br>
      <strong>Ngày yêu cầu:</strong> <span>${data.emailContent.match(/Ngày yêu cầu: (.*)/)?.[1] || 'N/A'}</span><br><br>
      
      <strong>Tổng số tiền:</strong> <span>${data.emailContent.match(/Tổng số tiền: (.*)/)?.[1] || 'N/A'}</span><br><br>
      
      <b>Vui lòng xác nhận yêu cầu tại website của chúng tôi.</b><br><br>
      
      Kính mong quý đối tác cho chúng tôi biết phản hồi trong thời gian sớm nhất!<br><br>
      
      Best Regards,<br>
      <strong>Viet Travel</strong>
    `;
  }

  approveService(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.requestService.updateRequestStatus(this.selectedService.bookingServiceId).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.code !== 200) {
          this.errorMessage = response.message || 'Có lỗi khi phê duyệt dịch vụ.';
          this.emailSent.emit({ success: false, error: this.errorMessage! });
        }
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error;
        this.emailSent.emit({ success: false, error: this.errorMessage! });
        this.cdr.detectChanges();
      }
    });
  }

  onConfirm() {
    this.isLoading = true;
    this.errorMessage = null; // Clear previous error
    this.tourService.sendOrder(this.emailData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.code === 200) {
          this.approveService();
          this.emailSent.emit({ success: true, error: this.errorMessage! });
          this.close();
        } else {
          this.errorMessage = response;
          this.emailSent.emit({ success: false, error: this.errorMessage! });
        }
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error;
        this.emailSent.emit({ success: false, error: this.errorMessage! });
        this.cdr.detectChanges();
      }
    });
  }
}
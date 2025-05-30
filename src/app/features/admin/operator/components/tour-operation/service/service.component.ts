import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { SsrService } from '../../../../../../core/services/ssr.service';
import { TourGuidePayComponent } from './tour-guide-pay/tour-guide-pay.component';
import { PostServiceComponent } from './post-service/post-service.component';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderServiceComponent } from './order-service/order-service.component';
import { CurrencyVndPipe } from '../../../../../../shared/pipes/currency-vnd.pipe';
import { FormatDatePipe } from '../../../../../../shared/pipes/format-date.pipe';
import { TourService } from '../../../services/tour.service';
import { ServiceDetailComponent } from './service-detail/service-detail.component';
import { PayServiceComponent } from './pay-service/pay-service.component';
import { SpinnerComponent } from '../../../../../../shared/components/spinner/spinner.component';
import { initFlowbite } from 'flowbite';
import { RequestService } from '../../../services/request.service';

interface Service {
  bookingServiceId: number;
  bookingCode: string;
  bookingStatus: string;
  location: string;
  bookingId: number;
  id: number;
  providerName: string;
  uniqueId: string;
  name: string;
  type: string;
  date: string;
  quantity: number;
  requestQuantity: number;
  amountToPayForBooking: number;
  paidForBooking: number;
  serviceName: string;
  order: string;
  payment: string;
  status: string;
  tourDayId: number;
}

interface TourDay {
  id: number;
  title: string;
  dayNumber: number;
  content: string;
  mealPlan: string;
}

interface ServiceGroup {
  bookingCode: string;
  days: DayGroup[];
}

interface DayGroup {
  dayNumber: number;
  tourDayId: number;
  title: string;
  services: Service[];
}

@Component({
  selector: 'app-service',
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.css'],
  imports: [
    CommonModule,
    TourGuidePayComponent,
    PostServiceComponent,
    OrderServiceComponent,
    ServiceDetailComponent,
    CurrencyVndPipe,
    FormatDatePipe,
    PayServiceComponent,
    SpinnerComponent
  ]
})
export class ServiceComponent {
  selectedService: Service | null = null;
  services: Service[] = [];
  tourDays: TourDay[] = [];
  groupedServices: ServiceGroup[] = [];
  totalService: number = 0;
  paid: number = 0;
  remain: number = 0;
  totalCost: number = 0;
  tourGuide: string | null = null;
  scheduleId: number | null = null;
  isLoading: boolean = false;
  showPopup: boolean = false;
  isSuccess: boolean = true;
  popupMessage: string = '';
  minPax: number | null = null;

  @ViewChild('chooseServiceModal') chooseServiceModal!: PostServiceComponent;
  @ViewChild('changeServiceModal') changeServiceModal!: ServiceDetailComponent;
  @ViewChild('tourGuidePayModal') tourGuidePayModal!: TourGuidePayComponent;
  @ViewChild('orderModal') orderModal!: OrderServiceComponent;
  @ViewChild('paymentModal') paymentModal!: PayServiceComponent;

  constructor(
    private ssrService: SsrService,
    private tourService: TourService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.scheduleId = +id;
        this.fetchTourGuide(this.scheduleId);
        this.fetchTourDays(this.scheduleId);
        this.fetchServices(this.scheduleId);
      } else {
        this.showNotification('ID không hợp lệ.', false);
      }
    });
  }

  showNotification(message: string, success: boolean = true): void {
    this.popupMessage = message;
    this.isSuccess = success;
    this.showPopup = true;
    setTimeout(() => {
      this.showPopup = false;
      this.popupMessage = '';
    }, 3000);
  }

  fetchTourGuide(id: number): void {
    this.isLoading = true;
    this.tourService.getTourById(id).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.code === 200) {
          this.minPax = response.data.minPax;
          this.tourGuide = response.data.tourGuideName;
          console.log('minPax:', this.minPax);
        } else {
          this.showNotification('Lỗi khi tải thông tin hướng dẫn viên: ' + response.message, false);
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        this.showNotification('Lỗi khi tải chi tiết tour: ' + error.message, false);
      }
    });
  }

  fetchServices(id: number): void {
    this.isLoading = true;
    this.tourService.getServices(id).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.code === 200) {
          this.services = response.data.services.map((service: any) => ({
            bookingServiceId: service.bookingServiceId,
            bookingCode: service.bookingCode,
            bookingStatus: service.bookingStatus,
            location: service.location,
            bookingId: service.bookingId,
            id: service.serviceId,
            providerName: service.providerName,
            uniqueId: `${service.serviceId}-${service.bookingId}-${service.bookingServiceId}`,
            name: service.serviceName,
            type: this.mapCategory(service.serviceCategory),
            date: service.usingDate ? service.usingDate : 'Chưa đặt',
            quantity: service.currentQuantity,
            requestQuantity: service.requestQuantity,
            amountToPayForBooking: service.amountToPayForBooking,
            paidForBooking: service.paidForBooking,
            serviceName: service.serviceName,
            order: this.mapOrderStatus(service.bookingStatus),
            payment: this.mapPaymentStatus(service.paymentStatus),
            status: this.mapOrderStatus(service.bookingStatus),
            tourDayId: service.tourDayId
          }));
          console.log(this.services);
          this.totalService = response.data.totalNumOfService;
          this.paid = response.data.paidAmount;
          this.remain = response.data.remainingAmount;
          this.totalCost = response.data.totalAmount;

          this.groupServices();
          this.initDropdowns();
        } else {
          this.showNotification('Lỗi khi tải danh sách dịch vụ: ' + response.message, false);
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        this.showNotification('Lỗi khi tải danh sách dịch vụ: ' + error.message, false);
      }
    });
  }

  fetchTourDays(id: number): void {
    this.isLoading = true;
    this.tourService.getTourDays(id).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.code === 200) {
          this.tourDays = response.data;
          this.groupServices();
        } else {
          this.showNotification('Lỗi khi tải danh sách ngày tour: ' + response.message, false);
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        this.showNotification('Lỗi khi tải danh sách ngày tour: ' + error.message, false);
      }
    });
  }

  groupServices(): void {
    if (!this.tourDays.length || !this.services.length) {
      this.groupedServices = [];
      return;
    }

    // First group by booking code
    const groupedByBooking = this.services.reduce((acc: { [key: string]: Service[] }, service: Service) => {
      (acc[service.bookingCode] = acc[service.bookingCode] || []).push(service);
      return acc;
    }, {});

    // Then for each booking, group services by tour day
    this.groupedServices = Object.keys(groupedByBooking).map(bookingCode => {
      const services = groupedByBooking[bookingCode];
      
      // Group services by tourDayId
      const servicesByDay = services.reduce((acc: { [key: number]: Service[] }, service: Service) => {
        (acc[service.tourDayId] = acc[service.tourDayId] || []).push(service);
        return acc;
      }, {});

      // Map to DayGroup structure
      const days = Object.keys(servicesByDay).map(tourDayId => {
        const tourDay = this.tourDays.find(day => day.id === +tourDayId);
        return {
          tourDayId: +tourDayId,
          dayNumber: tourDay ? tourDay.dayNumber : 0,
          title: tourDay ? tourDay.title : 'Unknown Day',
          services: servicesByDay[+tourDayId]
        };
      }).sort((a, b) => a.dayNumber - b.dayNumber); // Sort by dayNumber

      return {
        bookingCode,
        days
      };
    });
  }

  get hasAnyService(): boolean {
    return this.groupedServices?.some(group => group.days?.length > 0 && group.days.some(day => day.services?.length > 0));
  }

  mapOrderStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'APPROVED': 'Đã phê duyệt',
      'NOT_ORDERED': 'Chưa đặt hàng',
      'CANCELLED': 'Bị hủy',
      'REJECTED': 'Bị từ chối',
      'ADD_REQUEST': 'Chờ phê duyệt',
      'PENDING': 'Đang xử lý',
      'NOT_AVAILABLE': 'Không có sẵn',
      'AVAILABLE': 'Có sẵn',
      'CHECKING': 'Đang kiểm tra',
      'PAID': 'Đã thanh toán',
      'REJECTED_BY_OPERATOR': 'Điều hành từ chối',
      'CANCEL_REQUEST': 'Yêu cầu hủy',
      'PARTIALLY_PAID': 'Thanh toán một phần'
    };
    return statusMap[status] || 'Không xác định';
  }

  mapCategory(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Hotel': 'Khách sạn',
      'Restaurant': 'Nhà hàng',
      'Transport': 'Phương tiện',
      'Activity': 'Hoạt động',
      'Flight Ticket': 'Vé máy bay',
    };
    return statusMap[status] || 'Nhà hàng';
  }

  mapPaymentStatus(status: string): string {
    const paymentStatusMap: { [key: string]: string } = {
      'UNPAID': 'Chưa thanh toán',
      'PAID': 'Đã thanh toán',
      'PARTIALLY_PAID': 'Thanh toán một phần'
    };
    return paymentStatusMap[status] || 'Chưa thanh toán';
  }

  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'Đã phê duyệt': 'bg-green-500/20 text-green-800',
      'Chưa đặt hàng': 'bg-yellow-400/20 text-yellow-700',
      'Bị hủy': 'bg-red-500/20 text-red-800',
      'Điều hành từ chối': 'bg-red-700/20 text-red-900',
      'Bị từ chối': 'bg-rose-500/20 text-rose-800',
      'Chờ phê duyệt': 'bg-blue-400/20 text-blue-700',
      'Đang xử lý': 'bg-orange-400/20 text-orange-700',
      'Hoàn thành': 'bg-emerald-500/20 text-emerald-800',
      'Không có sẵn': 'bg-gray-500/20 text-gray-800',
      'Có sẵn': 'bg-lime-400/20 text-lime-700',
      'Đang kiểm tra': 'bg-cyan-400/20 text-cyan-700',
      'Yêu cầu hủy': 'bg-red-400/20 text-red-900',
      'Đã thanh toán': 'bg-teal-500/20 text-teal-800',
      'Chưa thanh toán': 'bg-amber-400/20 text-amber-700',
      'Thanh toán một phần': 'bg-fuchsia-400/20 text-fuchsia-700'
    };
    return colorMap[status] || 'bg-gray-500/20 text-gray-800';
  }

  async initDropdowns(): Promise<void> {
    const { Dropdown } = await import('flowbite');
    const doc = this.ssrService.getDocument();

    if (doc) {
      this.groupedServices.forEach(group => {
        group.days.forEach(day => {
          day.services.forEach(service => {
            const orderButton = doc.getElementById(`dropdownOrderButton-${service.uniqueId}`);
            const orderDropdown = doc.getElementById(`dropdownOrder-${service.uniqueId}`);
            if (orderButton && orderDropdown) {
              new Dropdown(orderDropdown, orderButton);
            } else {
              console.warn(`Order dropdown elements not found for service ${service.uniqueId}`);
            }
          });
        });
      });
    }
  }

  deleteService(serviceId: number): void {
    this.isLoading = true;
    this.tourService.deleteService(serviceId).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.code === 200) {
          this.showNotification('Dịch vụ đã được xóa thành công!', true);
          this.fetchServices(this.scheduleId!);
          this.fetchTourGuide(this.scheduleId!);
          this.reInitFlowbite();
        } else {
          this.showNotification('Lỗi khi xóa dịch vụ: ' + response.message, false);
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        this.showNotification('Lỗi khi xóa dịch vụ: ' + error.message, false);
      }
    });
  }

  openDeleteModal(bookingServiceId: number): void {
    const doc = this.ssrService.getDocument();
    if (doc) {
      const modalElement = doc.getElementById(`deleteTourPaxModal-${bookingServiceId}`) as HTMLElement;
      if (modalElement) {
        modalElement.classList.remove('hidden');
        modalElement.setAttribute('aria-hidden', 'false');
      }
    }
  }
  
  closeDeleteModal(bookingServiceId: number): void {
    const doc = this.ssrService.getDocument();
    if (doc) {
      const modalElement = doc.getElementById(`deleteTourPaxModal-${bookingServiceId}`) as HTMLElement;
      if (modalElement) {
        modalElement.classList.add('hidden');
        modalElement.setAttribute('aria-hidden', 'true');
      }
    }
    this.fetchServices(this.scheduleId!);
    this.fetchTourGuide(this.scheduleId!);
    this.reInitFlowbite();
  }  

  openPayModal(service: Service): void {
    this.selectedService = service;
    this.paymentModal.selectedService = service;
    this.paymentModal.open();
  }

  openServiceDetail(service: Service): void {
    this.selectedService = service;
    this.changeServiceModal.minPax = this.minPax;
    this.changeServiceModal.service = service;
    this.changeServiceModal.getServiceDetail();
    this.changeServiceModal.open();
  }

  openOrderModal(service: Service): void {
    this.selectedService = service;
    this.orderModal.selectedService = service;
    this.orderModal.open();
  }

  openTourGuidePayModal(service: Service): void {
    this.selectedService = service;
    this.tourGuidePayModal.selectedService = service;
    this.tourGuidePayModal.tourGuide = this.tourGuide;
    this.tourGuidePayModal.open();
  }

  onEmailSent(event: { success: boolean, error?: string }): void {
    if (event.success) {
      this.fetchTourGuide(this.scheduleId!);
      this.reInitFlowbite();
      this.fetchServices(this.scheduleId!);
      this.showNotification('Email đã được gửi thành công!', true);
    } else {
      this.showNotification(event.error || 'Lỗi khi gửi email.', false);
    }
  }

  onServiceAdded(event: any): void {
    this.fetchTourGuide(this.scheduleId!);
    this.reInitFlowbite();
    this.fetchServices(this.scheduleId!);
    this.showNotification('Dịch vụ đã được thêm thành công!', true);
  }

  onServiceChange(event: any): void {
    this.fetchTourGuide(this.scheduleId!);
    this.reInitFlowbite();
    this.fetchServices(this.scheduleId!);
    this.showNotification('Dịch vụ đã được thay đổi thành công!', true);
  }

  onPaymentSent(event: { success: boolean, error?: string }): void {
    if (event.success) {
      this.fetchTourGuide(this.scheduleId!);
      this.fetchServices(this.scheduleId!);
      this.showNotification('Thanh toán đã được gửi thành công!', true);
    } else {
      this.showNotification(event.error || 'Lỗi khi gửi thanh toán.', false);
    }
  }

  private reInitFlowbite(): void {
    if (this.ssrService.isBrowser) {
      setTimeout(() => {
        initFlowbite();
      }, 0);
    }
  }
}
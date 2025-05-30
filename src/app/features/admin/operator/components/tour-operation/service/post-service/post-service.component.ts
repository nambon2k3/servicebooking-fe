import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { Modal } from 'flowbite';
import { SsrService } from '../../../../../../../core/services/ssr.service';
import { FormsModule } from '@angular/forms';
import { CurrencyVndPipe } from "../../../../../../../shared/pipes/currency-vnd.pipe";
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { TourService } from '../../../../services/tour.service';

interface TourDay {
  id: number;
  title: string;
  dayNumber: number;
  content: string;
}

@Component({
  selector: 'app-post-service',
  standalone: true,
  imports: [FormsModule, CommonModule, CurrencyVndPipe, NgSelectModule],
  templateUrl: './post-service.component.html',
  styleUrls: ['./post-service.component.css']
})
export class PostServiceComponent {
  @Output() serviceAdded = new EventEmitter<any[]>();
  @Input() scheduleId: number | null = null;
  @Input() tourDays: TourDay[] = [];
  @Input() minPax: number | null = null;
  modal: Modal | null = null;
  errorMessage: string | null = null;

  locations = signal<any[]>([]);
  categories = signal<any[]>([]);
  providers = signal<any[]>([]);
  services = signal<any[]>([]);
  bookings = signal<any[]>([]);

  selectedLocationId: number | null = null;
  selectedCategoryId: number | null = null;
  selectedProviderId: number | null = null;
  selectedBookingId: number | null = null;
  selectedTourDayId: number | null = null;

  servicePrices: any[] = [];
  finalServiceList: any[] = [];

  constructor(
    private ssrService: SsrService,
    private tourService: TourService
  ) { }

  ngOnInit() {
    this.fetchLocationsAndCategories();
    this.fetchListBookings();

    console.log('tourDays:', this.tourDays);
  }

  ngAfterViewInit() {
    const document = this.ssrService.getDocument();
    if (document) {
      const modalElement = document.getElementById('chooseServiceModal');
      if (modalElement) {
        this.modal = new Modal(modalElement);
      }
    }
  }

  fetchListBookings() {
    this.tourService.getListBooking(this.scheduleId).subscribe({
      next: (response: any) => {
        if (response.code === 200) {
          const formattedBookings = response.data.map((booking: any) => ({
            id: booking.bookingId,
            name: `${booking.customerName} (${booking.bookingCode || 'No Code'})`
          }));
          this.bookings.set(formattedBookings);
        } else {
          this.errorMessage = response.message;
          console.error('Lỗi khi lấy danh sách đặt chỗ:', response.message);
        }
      },
      error: (error) => {
        console.error('Lỗi khi lấy danh sách đặt chỗ:', error);
      }
    });
  }

  fetchLocationsAndCategories() {
    this.tourService.getLocationsAndCategories(this.scheduleId!).subscribe({
      next: (response: any) => {
        if (response.code === 200) {
          const locationsArray = Object.entries(response.data.locations).map(([id, name]) => ({
            id: Number(id),
            name
          }));
          this.locations.set(locationsArray);
          this.categories.set(this.mapCategoriesToVietnamese(response.data.serviceCategories));
        } else {
          this.errorMessage = response.message;
          console.error('Lỗi khi lấy vị trí và danh mục:', response.message);
        }
      },
      error: (error) => {
        console.error('Lỗi khi lấy vị trí và danh mục:', error);
      }
    });
  }

  fetchServiceProviders() {
    if (this.selectedLocationId && this.selectedCategoryId) {
      this.tourService.getServiceProviders(this.selectedLocationId, this.selectedCategoryId).subscribe({
        next: (response: any) => {
          if (response.code === 200) {
            const providersArray = Object.entries(response.data).map(([id, name]) => ({
              id: Number(id),
              name
            }));
            this.providers.set(providersArray);
            this.selectedProviderId = null;
            this.services.set([]);
          } else {
            this.errorMessage = response.message;
            console.error('Lỗi khi lấy nhà cung cấp dịch vụ:', response.message);
          }
        },
        error: (error) => {
          console.error('Lỗi khi lấy nhà cung cấp dịch vụ:', error);
        }
      });
    } else {
      this.providers.set([]);
      this.services.set([]);
    }
  }

  fetchServices() {
    if (this.selectedProviderId && this.selectedCategoryId) {
      this.tourService.getServicesByProvider(this.selectedProviderId, this.selectedCategoryId).subscribe({
        next: (response: any) => {
          if (response.code === 200) {
            console.log('min pax:', this.minPax);
            const servicesArray = Array.isArray(response.data)
              ? response.data.map((service: any) => ({ id: service.id, name: service.name }))
              : Object.values(response.data).map((service: any) => ({ id: service.id, name: service.name }));

            this.services.set(servicesArray);

            this.services().forEach(service => {
              this.fetchServiceDetails(service.id);
            });
          } else {
            this.errorMessage = response.message;
            console.error('Lỗi khi lấy danh sách dịch vụ:', response.message);
          }
        },
        error: (error) => {
          console.error('Lỗi khi lấy danh sách dịch vụ:', error);
        }
      });
    } else {
      this.services.set([]);
    }
  }

  fetchServiceDetails(serviceId: number) {
    this.tourService.getServiceDetails(serviceId).subscribe({
      next: (response: any) => {
        if (response.code === 200) {
          const updatedServices = this.services().map(service => {
            if (service.id === serviceId) {
              return {
                ...service,
                serviceId: service.id,
                unitPrice: response.data?.sellingPrice || 0,
                type: response.data?.serviceCategory,
                room: response.data?.room || null,
                meal: response.data?.meal || null
              };
            }
            return service;
          });
          this.services.set(updatedServices);
        } else {
          this.errorMessage = response.message;
          console.error('Lỗi khi lấy chi tiết dịch vụ:', response.message);
        }
      },
      error: (error) => {
        console.error('Lỗi khi lấy chi tiết dịch vụ:', error);
      }
    });
  }

  mapCategoriesToVietnamese(categories: { [key: string]: string }): { id: number, name: string }[] {
    const translations: { [key: string]: string } = {
      'Hotel': 'Khách sạn',
      'Restaurant': 'Nhà hàng',
      'Transport': 'Phương tiện di chuyển',
      'Activity': 'Hoạt động',
      'Flight Ticket': 'Vé máy bay'
    };

    return Object.entries(categories).map(([id, name]) => ({
      id: Number(id),
      name: translations[name] || name
    }));
  }

  getTotalPrice(): number {
    return this.servicePrices.reduce((sum, item) => {
      const pricePerUnit = item.type === 'Transport' && this.minPax
        ? item.unitPrice / this.minPax
        : item.unitPrice;
      return sum + pricePerUnit * item.quantity;
    }, 0);
  }  

  addData(service: any) {
    if (!service) return;
    console.log('min pax:', this.minPax);
    this.servicePrices.push({
      serviceId: service.id,
      name: service.name,
      type: service.type,
      unitPrice: service.unitPrice || 0,
      quantity: 1,
      requestDate: new Date().toISOString().split('T')[0]
    });
    console.log('servicePrices:', this.servicePrices);
  }

  increaseQuantity(index: number) {
    this.servicePrices[index].quantity = Number(this.servicePrices[index].quantity) + 1;
  }

  decreaseQuantity(index: number) {
    const currentQuantity = Number(this.servicePrices[index].quantity);
    if (currentQuantity > 1) {
      this.servicePrices[index].quantity = currentQuantity - 1;
    }
  }

  updateQuantity(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    let newQuantity = Number(input.value);

    if (isNaN(newQuantity) || newQuantity < 1) {
      newQuantity = 1;
    }

    this.servicePrices[index].quantity = newQuantity;
  }

  removeService(index: number) {
    this.servicePrices.splice(index, 1);
  }

  addServicesToFinalList() {
    if (!this.selectedBookingId) {
      this.errorMessage = 'Vui lòng chọn một đặt chỗ trước';
      return;
    }

    console.log('selectedTourDayId:', this.selectedTourDayId);

    if (!this.selectedTourDayId) {
      this.errorMessage = 'Vui lòng chọn ngày tour trước';
      return;
    }

    const payloads = this.servicePrices.map(service => {
      if (!service.serviceId) {
        throw new Error('ID dịch vụ không thể null');
      }
      return {
        bookingId: this.selectedBookingId,
        serviceId: service.serviceId,
        addQuantity: service.quantity,
        requestDate: new Date(service.requestDate).toISOString(),
        tourDayId: this.selectedTourDayId,
        reason: ''
      };
    });

    for (const payload of payloads) {
      this.tourService.addServices(payload).subscribe({
        next: (response: any) => {
          if (response.code === 200) {
            this.serviceAdded.emit(this.servicePrices);
            this.errorMessage = null;
            this.close();
          } else {
            this.errorMessage = response.message;
          }
        },
        error: (error) => {
          this.errorMessage = error || 'Lỗi khi thêm dịch vụ';
        },
        complete: () => {
          if (payload === payloads[payloads.length - 1]) {
            this.serviceAdded.emit(this.servicePrices);
            this.resetForm();
          }
        }
      });
    }
  }

  resetForm() {
    this.selectedLocationId = null;
    this.selectedCategoryId = null;
    this.selectedProviderId = null;
    this.selectedBookingId = null;
    this.selectedTourDayId = null;
    this.servicePrices = [];
    this.errorMessage = null;
    this.services.set([]);
  }

  open() {
    this.modal?.show();
  }

  close() {
    this.errorMessage = null;
    this.modal?.hide();
  }
}
import { Component, ViewChild, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyVndPipe } from "../../../../../shared/pipes/currency-vnd.pipe";
import { CommonModule } from '@angular/common';
import { AddHotelComponent } from "./add-hotel/add-hotel.component";
import { AddTransportationComponent } from './add-transportation/add-transportation.component';
import { AddRestaurantComponent } from "./add-restaurant/add-restaurant.component";
import { AddActivityComponent } from "./add-activity/add-activity.component";
import { ConfigTourPaxComponent } from "./config-tour-pax/config-tour-pax.component";
import { TourDiscountService } from '../../services/discount.service';
import { ConfigPriceComponent } from './config-price/config-price.component';
import { FormsModule } from '@angular/forms';
import { ConfigMarkupComponent } from "./config-markup/config-markup.component";
import { AddFlightComponent } from './add-flight/add-flight.component';
import { SpinnerComponent } from "../../../../../shared/components/spinner/spinner.component";
import { initFlowbite } from 'flowbite';
import { SsrService } from '../../../../../core/services/ssr.service';

interface PriceRange {
  [key: string]: number;
}

interface PaxPrice {
  paxId: number;
  minPax: number;
  maxPax: number;
  paxRange: string;
  price: number;
  serviceNettPrice: number;
  sellingPrice: number;
  fixedCost: number;
  extraHotelCost: number;
}

interface Service {
  id: number;
  name: string;
  dayNumber: number;
  status: string;
  nettPrice: number;
  sellingPrice: number;
  locationName: string;
  locationId: number;
  serviceProviderName: string;
  serviceProviderId: number;
  paxPrices: { [key: string]: PaxPrice };
}

interface ServiceCategory {
  categoryName: string;
  services: Service[];
}

interface PaxOption {
  id: number;
  minPax: number;
  maxPax: number;
  paxRange: string;
  fixedCost: number;
  sellingPrice: number;
  validFrom: string;
  validTo: string;
}

interface ApiResponse {
  code: number;
  message: string;
  data: {
    tourId: number;
    tourName: string;
    tourType: string;
    totalDays: number;
    serviceCategories: ServiceCategory[];
    paxOptions: PaxOption[];
  };
}

@Component({
  selector: 'app-tour-discount',
  standalone: true,
  imports: [
    CurrencyVndPipe,
    CommonModule,
    AddHotelComponent,
    AddTransportationComponent,
    AddRestaurantComponent,
    AddActivityComponent,
    AddFlightComponent,
    ConfigTourPaxComponent,
    ConfigPriceComponent,
    FormsModule,
    SpinnerComponent
  ],
  templateUrl: './tour-discount.component.html',
  styleUrls: ['./tour-discount.component.css']
})
export class TourDiscountComponent implements OnInit {
  @ViewChild('addHotelModal') addHotelModal!: AddHotelComponent;
  @ViewChild('addFlightModal') addFlightModal!: AddFlightComponent;
  @ViewChild('addTransportationModal') addTransportationModal!: AddTransportationComponent;
  @ViewChild('addRestaurantModal') addRestaurantModal!: AddRestaurantComponent;
  @ViewChild('addActivityModal') addActivityModal!: AddActivityComponent;
  @ViewChild('tourConfigPaxModal') tourConfigPaxModal!: ConfigTourPaxComponent;
  @ViewChild('addPriceModal') addPriceModal!: ConfigPriceComponent;
  @ViewChild('configMarkupModal') configMarkupModal!: ConfigMarkupComponent;

  tourName: string = '';
  tourType: string = '';
  tourDay: number = 0;
  tourDays: number[] = [];
  tourId: number = 0;
  hotels: Service[] = [];
  flights: Service[] = [];
  transports: Service[] = [];
  restaurants: Service[] = [];
  activities: Service[] = [];
  priceRanges: string[] = [];
  prices: PaxOption[] = [];
  locations = signal<any[]>([]);

  mintotalNetPrices: PriceRange = {};
  extraHotelCost: PriceRange = {};
  minsalePrices: PriceRange = {};
  markupPercentage: number = 0;
  finalTourPrices: PriceRange = {};
  isLoading: boolean = false;

  // New properties for popup
  showPopup: boolean = false;
  popupMessage: string = '';
  isSuccess: boolean = false;

  constructor(
    private router: Router,
    private tourDiscountService: TourDiscountService,
    private route: ActivatedRoute,
    private ssrService: SsrService
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.tourId = +params['id']; // Convert to number
      if (this.tourId) {
        this.fetchTourData(this.tourId);
        this.fetchLocations();
      }
    });
  }

  fetchTourData(id: number) {
    this.isLoading = true;
    this.tourDiscountService.getTourDiscount(id).subscribe({
      next: (response: ApiResponse) => {
        this.isLoading = false;
        if (response.code === 200) {
          const data = response.data;
          this.tourName = data.tourName;
          this.tourDay = data.totalDays;
          this.priceRanges = data.paxOptions.map(pax => pax.paxRange);
          this.prices = data.paxOptions;
          this.tourType = data.tourType;

          data.serviceCategories.forEach(category => {
            switch (category.categoryName) {
              case 'Hotel':
                this.hotels = category.services.map(service => this.mapService(service));
                for (const hotel of this.hotels) {
                  if (hotel.paxPrices) {
                    for (const range of Object.keys(hotel.paxPrices)) {
                      this.extraHotelCost[range] = hotel.paxPrices[range].sellingPrice / 2;
                    }
                  }
                }
                break;
              case 'Transport':
                this.transports = category.services.map(service => this.mapService(service));
                break;
              case 'Restaurant':
                this.restaurants = category.services.map(service => this.mapService(service));
                break;
              case 'Flight Ticket':
                this.flights = category.services.map(service => this.mapService(service));
                break;
              case 'Activity':
                this.activities = category.services.map(service => this.mapService(service));
                break;
            }
          });

          this.calculateTourDays();
          this.calculateTotalNetPrice();
          this.calculateTotalPrices();
          this.calculateFinalTourPrices();
        } else {
          this.showPopupMessage(response.message || 'Lỗi khi tải dữ liệu tour.', false);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.showPopupMessage(error.message || 'Đã xảy ra lỗi khi tải dữ liệu tour.', false);
      }
    });
  }

  fetchLocations() {
    this.isLoading = true;
    this.tourDiscountService.getLocations(this.tourId).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.code === 200) {
          const mappedLocations = response.data.items.map((item: any) => ({
            id: item.id,
            name: item.name
          }));
          this.locations.set(mappedLocations);
        } else {
          this.showPopupMessage(response.message || 'Lỗi khi tải danh sách địa điểm.', false);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.showPopupMessage(error.message || 'Đã xảy ra lỗi khi tải danh sách địa điểm.', false);
      }
    });
  }

  mapService(service: any): Service {
    return {
      id: service.id,
      name: service.name,
      dayNumber: service.dayNumber,
      status: service.status,
      nettPrice: service.nettPrice,
      sellingPrice: service.sellingPrice,
      locationName: service.locationName || '',
      locationId: service.locationId,
      serviceProviderName: service.serviceProviderName,
      serviceProviderId: service.serviceProviderId,
      paxPrices: Object.keys(service.paxPrices || {}).reduce((acc: { [key: string]: PaxPrice }, key: string) => {
        const pax = service.paxPrices[key];
        acc[pax.paxRange] = {
          paxId: pax.paxId,
          minPax: pax.minPax,
          maxPax: pax.maxPax,
          paxRange: pax.paxRange,
          price: pax.price,
          serviceNettPrice: pax.serviceNettPrice,
          sellingPrice: pax.sellingPrice,
          fixedCost: pax.fixedCost,
          extraHotelCost: pax.extraHotelCost
        };
        return acc;
      }, {})
    };
  }

  calculateTourDays() {
    const maxDay = this.tourDay;
    this.tourDays = Array.from({ length: maxDay }, (_, i) => i + 1);
  }  

  calculateTotalNetPrice() {
    this.priceRanges.forEach(range => {
      let total = 0;
      this.hotels.forEach(h => total += (Number(h.nettPrice) / 2 ));
      this.transports.forEach(t => total += (Number(t.nettPrice) / this.getMinPax(range)));
      this.restaurants.forEach(r => total += r.nettPrice);
      this.activities.forEach(a => total += a.nettPrice);
      this.flights.forEach(a => total += a.nettPrice);
      this.mintotalNetPrices[range] = total;
    });
  }

  calculateFinalTourPrices() {
    this.priceRanges.forEach(range => {
      const sellingPrice = this.getPriceByRange(range)?.sellingPrice || 0;
      this.finalTourPrices[range] = sellingPrice;
    });
  }

  calculateTotalPrices() {
    this.priceRanges.forEach(range => {
      let total = 0;
  
      this.hotels.forEach(hotel => {
        if (hotel.paxPrices && hotel.paxPrices[range]) {
          total += ((hotel.paxPrices[range].sellingPrice || 0) / 2);
        }
      });

      this.transports.forEach(transport => {
        if (transport.paxPrices && transport.paxPrices[range]) {
          total += ((transport.paxPrices[range].sellingPrice || 0) / this.getMinPax(range));
        }
      });
  
      [this.restaurants, this.activities, this.flights].forEach(services => {
        services.forEach(service => {
          if (service.paxPrices && service.paxPrices[range]) {
            total += (service.paxPrices[range].sellingPrice || 0);
          }
        });
      });
  
      this.minsalePrices[range] = total;
    });
  }  

  getMinPax(range: string): number {
    return parseInt(range.split('-')[0], 10);
  }

  getPriceByRange(range: string): PaxOption | undefined {    
    return this.prices.find(p => p.paxRange === range);
  }

  handlePriceConfirm(updatedPrices: { paxRange: string, sellingPrice: number }[]) {
    updatedPrices.forEach(price => {
      const existing = this.prices.find(p => p.paxRange === price.paxRange);
      if (existing) {
        existing.sellingPrice = price.sellingPrice;
      }
    });
    this.calculateTotalPrices();
    this.calculateFinalTourPrices();
    this.showPopupMessage('Cấu hình giá thành công!', true);
  }

  handleMarkupConfirm(markup: number) {
    this.markupPercentage = markup;
    this.calculateFinalTourPrices();
    this.showPopupMessage('Cấu hình lợi nhuận thành công!', true);
  }

  backToList() {
    this.router.navigate(['head-business/list-tour']);
  }

  openAddHotelModal(serviceId?: number, dayNumber?: number) {
    if (this.addHotelModal) {
      this.addHotelModal.serviceId = serviceId || null;
      this.addHotelModal.day = dayNumber || null;
      this.addHotelModal.fetchHotelDetails();
      this.addHotelModal.showModal();
    }
  }

  openAddFlightModal(serviceId?: number, dayNumber?: number) {
    if (this.addFlightModal) {
      this.addFlightModal.serviceId = serviceId || null;
      this.addFlightModal.day = dayNumber || null;
      this.addFlightModal.fetchServiceProviders();
      this.addFlightModal.fetchFlightDetails();
      this.addFlightModal.showModal();
    }
  }

  openAddTransportationModal(serviceId?: number, dayNumber?: number) {
    if (this.addTransportationModal) {
      this.addTransportationModal.serviceId = serviceId || null;
      this.addTransportationModal.day = dayNumber || null;
      this.addTransportationModal.fetchTransportationDetails();
      this.addTransportationModal.showModal();
    }
  }

  openAddRestaurantModal(serviceId?: number, dayNumber?: number) {
    if (this.addRestaurantModal) {
      this.addRestaurantModal.serviceId = serviceId || null;
      this.addRestaurantModal.day = dayNumber || null;
      this.addRestaurantModal.fetchRestaurantDetails();
      this.addRestaurantModal.showModal();
    }
  }

  openAddActivityModal(serviceId?: number, dayNumber?: number) {
    if (this.addActivityModal) {
      this.addActivityModal.serviceId = serviceId || null;
      this.addActivityModal.day = dayNumber || null;
      this.addActivityModal.fetchActivityDetails();
      this.addActivityModal.showModal();
    }
  }
  
  openConfigMarkup() {
    if (this.configMarkupModal) {
      this.configMarkupModal.tourId = this.tourId || null;
      this.configMarkupModal.getMarkup();
      this.configMarkupModal.showModal();
    }
  }

  closeTourPax() {
    this.fetchTourData(this.tourId);
    this.reInitFlowbite();
  }

  private reInitFlowbite(): void {
      if (this.ssrService.isBrowser) {
        setTimeout(() => {
          initFlowbite(); 
        }, 0); 
      }
    }

  addNewHotel(event: { hotel: Service, isUpdate: boolean }) {
    const { hotel, isUpdate } = event;
    if (isUpdate && this.addHotelModal.serviceId) {
      const index = this.hotels.findIndex(h => h.id === this.addHotelModal.serviceId);
      if (index !== -1) {
        this.hotels[index] = hotel;
      }
    } else {
      this.hotels.push(hotel);
    }
    this.calculateTourDays();
    this.calculateTotalNetPrice();
    this.calculateTotalPrices();
    this.calculateFinalTourPrices();
    this.reInitFlowbite();
    this.showPopupMessage('Thêm/Cập nhật khách sạn thành công!', true);
  }

  handleError(error: any) {
    this.showPopupMessage(error, false);
  }

  handleRestaurantError(error: any) {
    this.showPopupMessage(error, false);
  }

  handleTransportationError(error: any) {
    this.showPopupMessage(error, false);
  }

  handleFlightError(error: any) {
    this.showPopupMessage(error, false);
  }

  handleActivityError(error: any) {
    this.showPopupMessage(error, false);
  }

  deleteHotel(index: number, serviceId: number, dayNumber: number) {
    this.tourDiscountService.deleteService(this.tourId, serviceId, dayNumber).subscribe({
      next: (response: any) => {
        if (response.code === 200) {
          this.hotels.splice(index, 1);
          this.calculateTourDays();
          this.calculateTotalNetPrice();
          this.calculateTotalPrices();
          this.calculateFinalTourPrices();
          this.reInitFlowbite();
          this.showPopupMessage('Xóa khách sạn thành công!', true);
        } else {
          this.showPopupMessage(response.message || 'Lỗi khi xóa khách sạn.', false);
        }
      },
      error: (error) => {
        this.showPopupMessage(error.message || 'Đã xảy ra lỗi khi xóa khách sạn.', false);
      }
    });
  }

  addNewFlight(event: { flight: Service, isUpdate: boolean }) {
    const { flight, isUpdate } = event;
    if (isUpdate && this.addFlightModal.serviceId) {
      const index = this.flights.findIndex(h => h.id === this.addFlightModal.serviceId);
      if (index !== -1) {
        this.flights[index] = flight;
      }
    } else {
      this.flights.push(flight);
    }
    this.calculateTourDays();
    this.calculateTotalNetPrice();
    this.calculateTotalPrices();
    this.calculateFinalTourPrices();
    this.reInitFlowbite();
    this.showPopupMessage('Thêm/Cập nhật vé máy bay thành công!', true);
  }

  deleteFlight(index: number, serviceId: number, dayNumber: number) {
    this.tourDiscountService.deleteService(this.tourId, serviceId, dayNumber).subscribe({
      next: (response: any) => {
        if (response.code === 200) {
          this.flights.splice(index, 1);
          this.calculateTourDays();
          this.calculateTotalNetPrice();
          this.calculateTotalPrices();
          this.calculateFinalTourPrices();
          this.reInitFlowbite();
          this.showPopupMessage('Xóa vé máy bay thành công!', true);
        } else {
          this.showPopupMessage(response.message || 'Lỗi khi xóa vé máy bay.', false);
        }
      },
      error: (error) => {
        this.showPopupMessage(error.message || 'Đã xảy ra lỗi khi xóa vé máy bay.', false);
      }
    });
  }

  addNewTransportation(event: { transport: Service, isUpdate: boolean }) {
    const { transport, isUpdate } = event;
    if (isUpdate && this.addTransportationModal.serviceId) {
      const index = this.transports.findIndex(t => t.id === this.addTransportationModal.serviceId);
      if (index !== -1) {
        this.transports[index] = transport;
      }
    } else {
      this.transports.push(transport);
    }
    this.calculateTourDays();
    this.calculateTotalNetPrice();
    this.calculateTotalPrices();
    this.calculateFinalTourPrices();
    this.reInitFlowbite();
    this.showPopupMessage('Thêm/Cập nhật phương tiện thành công!', true);
  }

  deleteTransportation(index: number, serviceId: number, dayNumber: number) {
    this.tourDiscountService.deleteService(this.tourId, serviceId, dayNumber).subscribe({
      next: (response: any) => {
        if (response.code === 200) {
          this.transports.splice(index, 1);
          this.calculateTourDays();
          this.calculateTotalNetPrice();
          this.calculateTotalPrices();
          this.calculateFinalTourPrices();
          this.reInitFlowbite();
          this.showPopupMessage('Xóa phương tiện thành công!', true);
        } else {
          this.showPopupMessage(response.message || 'Lỗi khi xóa phương tiện.', false);
        }
      },
      error: (error) => {
        this.showPopupMessage(error.message || 'Đã xảy ra lỗi khi xóa phương tiện.', false);
      }
    });
  }

  addNewRestaurant(event: { restaurant: Service, isUpdate: boolean }) {
    const { restaurant, isUpdate } = event;
    if (isUpdate && this.addRestaurantModal.serviceId) {
      const index = this.restaurants.findIndex(r => r.id === this.addRestaurantModal.serviceId);
      if (index !== -1) {
        this.restaurants[index] = restaurant;
      }
    } else {
      this.restaurants.push(restaurant);
    }
    this.calculateTourDays();
    this.calculateTotalNetPrice();
    this.calculateTotalPrices();
    this.calculateFinalTourPrices();
    this.reInitFlowbite();
    this.showPopupMessage('Thêm/Cập nhật nhà hàng thành công!', true);
  }

  deleteRestaurant(index: number, serviceId: number, dayNumber: number) {
    this.tourDiscountService.deleteService(this.tourId, serviceId, dayNumber).subscribe({
      next: (response: any) => {
        if (response.code === 200) {
          this.restaurants.splice(index, 1);
          this.calculateTourDays();
          this.calculateTotalNetPrice();
          this.calculateTotalPrices();
          this.calculateFinalTourPrices();
          this.reInitFlowbite();
          this.showPopupMessage('Xóa nhà hàng thành công!', true);
        } else {
          this.showPopupMessage(response.message || 'Lỗi khi xóa nhà hàng.', false);
        }
      },
      error: (error) => {
        this.showPopupMessage(error.message || 'Đã xảy ra lỗi khi xóa nhà hàng.', false);
      }
    });
  }

  addNewActivity(event: { activity: Service, isUpdate: boolean }) {
    const { activity, isUpdate } = event;
    if (isUpdate && this.addActivityModal.serviceId) {
      const index = this.activities.findIndex(a => a.id === this.addActivityModal.serviceId);
      if (index !== -1) {
        this.activities[index] = activity;
      }
    } else {
      this.activities.push(activity);
    }
    this.calculateTourDays();
    this.calculateTotalNetPrice();
    this.calculateTotalPrices();
    this.calculateFinalTourPrices();
    this.reInitFlowbite();
    this.showPopupMessage('Thêm/Cập nhật hoạt động thành công!', true);
  }

  deleteActivity(index: number, serviceId: number, dayNumber: number) {
    this.tourDiscountService.deleteService(this.tourId, serviceId, dayNumber).subscribe({
      next: (response: any) => {
        if (response.code === 200) {
          this.activities.splice(index, 1);
          this.calculateTourDays();
          this.calculateTotalNetPrice();
          this.calculateTotalPrices();
          this.calculateFinalTourPrices();
          this.reInitFlowbite();
          this.showPopupMessage('Xóa hoạt động thành công!', true);
        } else {
          this.showPopupMessage(response.message || 'Lỗi khi xóa hoạt động.', false);
        }
      },
      error: (error) => {
        this.showPopupMessage(error.message || 'Đã xảy ra lỗi khi xóa hoạt động.', false);
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
    }, 2000); // Hide after 2 seconds
  }
}
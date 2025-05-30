import { Component, Input, Output, EventEmitter, AfterViewInit, signal, SimpleChanges } from '@angular/core';
import { Modal } from 'flowbite';
import { SsrService } from '../../../../../../core/services/ssr.service';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { TourDiscountService } from '../../../services/discount.service';

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

interface ServiceDetailResponse {
  code: number;
  message: string;
  data: {
    id: number;
    name: string;
    dayNumber: number;
    status: string;
    nettPrice: number;
    sellingPrice: number;
    locationId: number;
    locationName: string;
    serviceProviderId: number;
    serviceProviderName: string;
    paxPrices: { [key: string]: PaxPrice };
  };
}

interface TourDay {
  dayNumber: number;
  serviceCategories: string[];
}

@Component({
  selector: 'app-add-restaurant',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule
  ],
  templateUrl: './add-restaurant.component.html',
  styleUrls: ['./add-restaurant.component.css']
})
export class AddRestaurantComponent implements AfterViewInit {
  @Input() days: number[] = [];
  @Input() day: number | null = null;
  @Input() tourId: number = 0;
  @Input() serviceId: number | null = null;
  @Input() prices: PaxOption[] = [];
  @Input() locations = signal<any[]>([]);
  @Output() restaurantAdded = new EventEmitter<{ restaurant: Service, isUpdate: boolean }>();
  @Output() error = new EventEmitter<any>();

  modal: Modal | null = null;
  addRestaurantForm!: FormGroup;
  providers = signal<any[]>([]);
  restaurants = signal<any[]>([]);
  tourDays: TourDay[] = [];
  errorMessage: string | null = null;

  constructor(
    private ssrService: SsrService,
    private fb: FormBuilder,
    private tourDiscountService: TourDiscountService
  ) {
    this.initializeForm();
  }

  ngAfterViewInit() {
    const doc = this.ssrService.getDocument();
    if (!doc) return;
    const modalElement = document.getElementById('addRestaurantModal');
    if (modalElement) {
      this.modal = new Modal(modalElement);
    }
  }

  validateSellingPriceVsNetPrice(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const sellingPrice = control.get('sellingPrice')?.value;
      const netPrice = this.addRestaurantForm.get('netPrice')?.value;
      if (sellingPrice !== null && netPrice !== null && sellingPrice < netPrice) {
        return { sellingPriceTooLow: true };
      }
      return null;
    };
  }

  initializeForm() {
    this.addRestaurantForm = this.fb.group({
      selectedDay: [null, Validators.required],
      selectedRestaurant: [null, Validators.required],
      selectedLocation: [null, Validators.required],
      selectedProvider: [null, Validators.required],
      netPrice: [null, Validators.required],
      paxPrices: this.fb.array(this.prices.map(price =>
        this.fb.group({
          paxRange: [price.paxRange],
          paxId: [price.id],
          sellingPrice: [null, [Validators.required, Validators.min(0)]]
        }, {
          validators: this.validateSellingPriceVsNetPrice()
        })))
    });

    // Listen to netPrice changes to revalidate paxPrices
    this.addRestaurantForm.get('netPrice')?.valueChanges.subscribe(() => {
      this.paxPrices.controls.forEach(control => {
        control.get('sellingPrice')?.updateValueAndValidity();
      });
    });
  }

  get paxPrices(): FormArray {
    return this.addRestaurantForm.get('paxPrices') as FormArray;
  }

  initPaxPrices() {
    const paxPricesArray = this.paxPrices;
    paxPricesArray.clear();
    this.prices.forEach(pax => {
      paxPricesArray.push(
        this.fb.group({
          paxId: [pax.id],
          paxRange: [pax.paxRange],
          sellingPrice: [0, [Validators.required, Validators.min(0)]]
        }, {
          validators: this.validateSellingPriceVsNetPrice()
        })
      );
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['prices'] && changes['prices'].currentValue) {
      this.initPaxPrices();
    }
  }

  fetchServiceProviders() {
    const locationId = this.addRestaurantForm.get('selectedLocation')?.value;
    if (locationId) {
      this.tourDiscountService.getServiceProviders(this.tourId, locationId, 'Restaurant').subscribe({
        next: (response: any) => {
          if (response.code === 200) {
            const mappedProviders = response.data.serviceProviders.map((provider: any) => ({
              id: provider.id,
              name: provider.name
            }));
            this.providers.set(mappedProviders);
          }
        },
        error: (error: any) => {
          console.error('Error fetching service providers:', error);
        }
      });
    }
  }

  fetchRestaurants() {
    const locationId = this.addRestaurantForm.get('selectedLocation')?.value;
    const providerId = this.addRestaurantForm.get('selectedProvider')?.value;
    if (locationId && providerId) {
      this.tourDiscountService.getServices(this.tourId, locationId, providerId, 'Restaurant').subscribe({
        next: (response: any) => {
          if (response.code === 200) {
            const mappedRestaurants = response.data.availableServices.map((service: any) => ({
              id: service.id,
              name: service.name,
              nettPrice: service.nettPrice,
              sellingPrice: service.sellingPrice
            }));
            this.restaurants.set(mappedRestaurants);
          }
        },
        error: (error: any) => {
          console.error('Error fetching restaurants:', error);
        }
      });
    }
  }

  fetchRestaurantDetails() {
    if (this.serviceId && this.tourId) {
      this.tourDiscountService.getServiceDetails(this.tourId, this.serviceId, this.day).subscribe({
        next: (response: ServiceDetailResponse) => {
          if (response.code === 200) {
            const restaurant = response.data;

            this.addRestaurantForm.patchValue({
              selectedDay: restaurant.dayNumber,
              selectedLocation: restaurant.locationId,
              selectedProvider: restaurant.serviceProviderId,
              selectedRestaurant: restaurant.id,
              netPrice: restaurant.nettPrice,
              sellingPrice: restaurant.sellingPrice
            });

            const paxPricesArray = this.paxPrices;
            paxPricesArray.clear();
            Object.values(restaurant.paxPrices).forEach(pax => {
              paxPricesArray.push(
                this.fb.group({
                  paxId: [pax.paxId],
                  paxRange: [pax.paxRange],
                  sellingPrice: [pax.sellingPrice, [Validators.required, Validators.min(0)]]
                }, {
                  validators: this.validateSellingPriceVsNetPrice()
                })
              );
            });

            this.fetchServiceProviders();
            this.fetchRestaurants();
          }
        },
        error: (error: any) => {
          console.error('Error fetching restaurant details:', error);
        }
      });
    } else {
      this.initPaxPrices();
    }
  }

  onLocationChange() {
    this.addRestaurantForm.patchValue({ selectedProvider: null, selectedRestaurant: null, netPrice: 0 });
    this.providers.set([]);
    this.restaurants.set([]);
    this.fetchServiceProviders();
  }

  onProviderChange() {
    this.addRestaurantForm.patchValue({ selectedRestaurant: null, netPrice: 0 });
    this.restaurants.set([]);
    this.fetchRestaurants();
  }

  onRestaurantChange() {
    const selectedRestaurantId = this.addRestaurantForm.get('selectedRestaurant')?.value;
    const selectedRestaurant = this.restaurants().find(t => t.id === selectedRestaurantId);

    if (selectedRestaurant) {
      this.addRestaurantForm.patchValue({
        netPrice: selectedRestaurant.nettPrice
      });

      const paxPricesArray = this.paxPrices;
      paxPricesArray.controls.forEach(control => {
        control.patchValue({
          sellingPrice: selectedRestaurant.sellingPrice || 0
        });
        control.get('sellingPrice')?.updateValueAndValidity();
      });
    }
  }

  getTourDays() {
    this.tourDiscountService.getTourDayById(this.tourId).subscribe({
      next: (response: any) => {
        if (response.code === 200) {
          this.tourDays = response.data;
          console.log('Danh sách ngày tour: ', this.tourDays);
        }
      },
      error: (error: any) => {
        console.error('Error fetching tour days:', error);
      }
    });
  }

  onSubmit() {
    if (this.addRestaurantForm.invalid) {
      this.errorMessage = 'Vui lòng điền đầy đủ thông tin trước khi thêm nhà hàng';
      return;
    }

    if (this.addRestaurantForm.valid) {
      const formValue = this.addRestaurantForm.getRawValue();

      const selectedDay = formValue.selectedDay;
      const tourDay = this.tourDays.find(day => day.dayNumber === Number(selectedDay));

      if (!tourDay || !tourDay.serviceCategories.includes('Restaurant')) {
        this.error.emit(`Trong ngày ${selectedDay} không có dịch vụ nhà hàng`);
        this.onCancel();
        return;
      }

      const paxPrices = formValue.paxPrices.reduce((acc: { [key: string]: PaxPrice }, pax: any) => {
        acc[pax.paxRange] = {
          paxId: pax.paxId,
          minPax: this.prices.find(p => p.paxRange === pax.paxRange)?.minPax || 0,
          maxPax: this.prices.find(p => p.paxRange === pax.paxRange)?.maxPax || 0,
          paxRange: pax.paxRange,
          price: 0,
          serviceNettPrice: formValue.netPrice,
          sellingPrice: pax.sellingPrice,
          fixedCost: 0,
          extraHotelCost: 0
        };
        return acc;
      }, {});

      const restaurantData: Service = {
        id: this.serviceId || formValue.selectedRestaurant,
        name: this.restaurants().find(h => h.id === formValue.selectedRestaurant)?.name || '',
        dayNumber: formValue.selectedDay,
        status: 'ACTIVE',
        nettPrice: formValue.netPrice,
        sellingPrice: 0,
        locationName: this.locations().find(l => l.id === formValue.selectedLocation)?.name || '',
        locationId: formValue.selectedLocation,
        serviceProviderName: this.providers().find(p => p.id === formValue.selectedProvider)?.name || '',
        serviceProviderId: formValue.selectedProvider,
        paxPrices: paxPrices
      };

      if (this.serviceId) {
        this.updateRestaurant(restaurantData);
      } else {
        this.createRestaurant(restaurantData);
      }
    }
  }

  createRestaurant(restaurantData: Service) {
    const payload = {
      serviceId: restaurantData.id,
      locationId: restaurantData.locationId,
      serviceProviderId: restaurantData.serviceProviderId,
      dayNumber: Number(restaurantData.dayNumber),
      paxPrices: Object.values(restaurantData.paxPrices).reduce((acc: any, pax) => {
        acc[pax.paxId] = pax.sellingPrice;
        return acc;
      }, {})
    };

    this.tourDiscountService.addService(this.tourId, payload).subscribe({
      next: (response: any) => {
        if (response.code === 200) {
          this.restaurantAdded.emit({ restaurant: restaurantData, isUpdate: false });
          this.addRestaurantForm.reset({
            selectedDay: this.days.length > 0 ? this.days[0] : 1,
            selectedLocation: null,
            selectedProvider: null,
            selectedRestaurant: null,
            netPrice: 0
          });
          this.initPaxPrices();
          this.providers.set([]);
          this.restaurants.set([]);
          this.modal?.hide();
        }
      },
      error: (error: any) => {
        this.error.emit(error);
        this.onCancel();
        console.error('Error creating restaurant:', error);
      }
    });
  }

  updateRestaurant(restaurantData: Service) {
    const payload = {
      serviceId: restaurantData.id,
      locationId: restaurantData.locationId,
      serviceProviderId: restaurantData.serviceProviderId,
      dayNumber: Number(restaurantData.dayNumber),
      paxPrices: Object.values(restaurantData.paxPrices).reduce((acc: any, pax) => {
        acc[pax.paxId] = pax.sellingPrice;
        return acc;
      }, {})
    };

    this.tourDiscountService.updateService(this.tourId, this.serviceId!, payload).subscribe({
      next: (response: any) => {
        if (response.code === 200) {
          this.restaurantAdded.emit({ restaurant: restaurantData, isUpdate: true });
          this.addRestaurantForm.reset({
            selectedDay: this.days.length > 0 ? this.days[0] : 1,
            selectedLocation: null,
            selectedProvider: null,
            selectedRestaurant: null,
            netPrice: 0
          });
          this.initPaxPrices();
          this.providers.set([]);
          this.restaurants.set([]);
          this.modal?.hide();
        }
      },
      error: (error: any) => {
        this.error.emit(error);
        this.onCancel();
        console.error('Error updating restaurant:', error);
      }
    });
  }

  showModal() {
    this.fetchRestaurantDetails();
    this.getTourDays();
    this.modal?.show();
  }

  onCancel() {
    this.modal?.hide();
    this.addRestaurantForm.reset({
      selectedDay: this.days.length > 0 ? this.days[0] : 1,
      selectedLocation: null,
      selectedProvider: null,
      selectedRestaurant: null,
      netPrice: 0
    });
    this.errorMessage = null;
    this.initPaxPrices();
  }
}
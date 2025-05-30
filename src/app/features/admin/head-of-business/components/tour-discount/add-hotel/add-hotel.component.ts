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
  selector: 'app-add-hotel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule
  ],
  templateUrl: './add-hotel.component.html',
  styleUrls: ['./add-hotel.component.css']
})
export class AddHotelComponent implements AfterViewInit {
  @Input() days: number[] = [];
  @Input() day: number | null = null;
  @Input() tourId: number = 0;
  @Input() serviceId: number | null = null;
  @Input() prices: PaxOption[] = [];
  @Input() locations = signal<any[]>([]);
  @Output() hotelAdded = new EventEmitter<{ hotel: Service, isUpdate: boolean }>();
  @Output() error = new EventEmitter<any>();

  modal: Modal | null = null;
  addHotelForm!: FormGroup;
  providers = signal<any[]>([]);
  hotels = signal<any[]>([]);
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
    const modalElement = document.getElementById('addHotelModal');
    if (modalElement) {
      this.modal = new Modal(modalElement);
    }
  }

  validateSellingPriceVsNetPrice(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const sellingPrice = control.get('sellingPrice')?.value;
      const netPrice = this.addHotelForm.get('netPrice')?.value;
      if (sellingPrice !== null && netPrice !== null && sellingPrice < netPrice) {
        return { sellingPriceTooLow: true };
      }
      return null;
    };
  }

  initializeForm() {
    this.addHotelForm = this.fb.group({
      selectedDay: [null, Validators.required],
      selectedHotel: [null, Validators.required],
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
    this.addHotelForm.get('netPrice')?.valueChanges.subscribe(() => {
      this.paxPrices.controls.forEach(control => {
        control.get('sellingPrice')?.updateValueAndValidity();
      });
    });
  }

  get paxPrices(): FormArray {
    return this.addHotelForm.get('paxPrices') as FormArray;
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
    const locationId = this.addHotelForm.get('selectedLocation')?.value;
    if (locationId) {
      this.tourDiscountService.getServiceProviders(this.tourId, locationId, 'Hotel').subscribe({
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

  fetchHotels() {
    const locationId = this.addHotelForm.get('selectedLocation')?.value;
    const providerId = this.addHotelForm.get('selectedProvider')?.value;
    if (locationId && providerId) {
      this.tourDiscountService.getServices(this.tourId, locationId, providerId, 'Hotel').subscribe({
        next: (response: any) => {
          if (response.code === 200) {
            const mappedHotels = response.data.availableServices.map((service: any) => ({
              id: service.id,
              name: service.name,
              nettPrice: service.nettPrice,
              sellingPrice: service.sellingPrice
            }));
            this.hotels.set(mappedHotels);
          }
        },
        error: (error: any) => {
          console.error('Error fetching hotels:', error);
        }
      });
    }
  }

  fetchHotelDetails() {
    if (this.serviceId && this.tourId) {
      this.tourDiscountService.getServiceDetails(this.tourId, this.serviceId, this.day).subscribe({
        next: (response: ServiceDetailResponse) => {
          if (response.code === 200) {
            const hotel = response.data;

            this.addHotelForm.patchValue({
              selectedDay: hotel.dayNumber,
              selectedLocation: hotel.locationId,
              selectedProvider: hotel.serviceProviderId,
              selectedHotel: hotel.id,
              netPrice: hotel.nettPrice,
              sellingPrice: hotel.sellingPrice
            });

            const paxPricesArray = this.paxPrices;
            paxPricesArray.clear();
            Object.values(hotel.paxPrices).forEach(pax => {
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
            this.fetchHotels();
          }
        },
        error: (error: any) => {
          console.error('Error fetching hotel details:', error);
        }
      });
    } else {
      this.initPaxPrices();
    }
  }

  onLocationChange() {
    this.addHotelForm.patchValue({ selectedProvider: null, selectedHotel: null, netPrice: 0 });
    this.providers.set([]);
    this.hotels.set([]);
    this.fetchServiceProviders();
  }

  onProviderChange() {
    this.addHotelForm.patchValue({ selectedHotel: null, netPrice: 0 });
    this.hotels.set([]);
    this.fetchHotels();
  }

  onHotelChange() {
    const selectedHotelId = this.addHotelForm.get('selectedHotel')?.value;
    const selectedHotel = this.hotels().find(t => t.id === selectedHotelId);

    if (selectedHotel) {
      this.addHotelForm.patchValue({
        netPrice: selectedHotel.nettPrice
      });

      const paxPricesArray = this.paxPrices;
      paxPricesArray.controls.forEach(control => {
        control.patchValue({
          sellingPrice: selectedHotel.sellingPrice || 0
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
    if (this.addHotelForm.invalid) {
      this.errorMessage = 'Vui lòng điền đầy đủ thông tin trước khi thêm khách sạn';
      return;
    }

    if (this.addHotelForm.valid) {
      const formValue = this.addHotelForm.getRawValue();

      const selectedDay = formValue.selectedDay;
      const tourDay = this.tourDays.find(day => day.dayNumber === Number(selectedDay));

      if (!tourDay || !tourDay.serviceCategories.includes('Hotel')) {
        this.error.emit(`Trong ngày ${selectedDay} không có dịch vụ khách sạn`);
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

      const hotelData: Service = {
        id: this.serviceId || formValue.selectedHotel,
        name: this.hotels().find(h => h.id === formValue.selectedHotel)?.name || '',
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
        this.updateHotel(hotelData);
      } else {
        this.createHotel(hotelData);
      }
    }
  }

  createHotel(hotelData: Service) {
    const payload = {
      serviceId: hotelData.id,
      locationId: hotelData.locationId,
      serviceProviderId: hotelData.serviceProviderId,
      dayNumber: Number(hotelData.dayNumber),
      paxPrices: Object.values(hotelData.paxPrices).reduce((acc: any, pax) => {
        acc[pax.paxId] = pax.sellingPrice;
        return acc;
      }, {})
    };

    this.tourDiscountService.addService(this.tourId, payload).subscribe({
      next: (response: any) => {
        if (response.code === 200) {
          this.hotelAdded.emit({ hotel: hotelData, isUpdate: false });
          this.addHotelForm.reset({
            selectedDay: this.days.length > 0 ? this.days[0] : 1,
            selectedLocation: null,
            selectedProvider: null,
            selectedHotel: null,
            netPrice: 0
          });

          this.initPaxPrices();
          this.providers.set([]);
          this.hotels.set([]);
          this.modal?.hide();
        }
      },
      error: (error: any) => {
        this.error.emit(error);
        this.onCancel();
        console.error('Error creating hotel:', error);
      }
    });
  }

  updateHotel(hotelData: Service) {
    const payload = {
      serviceId: hotelData.id,
      locationId: hotelData.locationId,
      serviceProviderId: hotelData.serviceProviderId,
      dayNumber: Number(hotelData.dayNumber),
      paxPrices: Object.values(hotelData.paxPrices).reduce((acc: any, pax) => {
        acc[pax.paxId] = pax.sellingPrice;
        return acc;
      }, {})
    };

    this.tourDiscountService.updateService(this.tourId, this.serviceId!, payload).subscribe({
      next: (response: any) => {
        if (response.code === 200) {
          this.hotelAdded.emit({ hotel: hotelData, isUpdate: true });
          this.addHotelForm.reset({
            selectedDay: this.days.length > 0 ? this.days[0] : 1,
            selectedLocation: null,
            selectedProvider: null,
            selectedHotel: null,
            netPrice: 0
          });
          this.initPaxPrices();
          this.providers.set([]);
          this.hotels.set([]);
          this.modal?.hide();
        }
      },
      error: (error: any) => {
        this.error.emit(error);
        this.onCancel();
        console.error('Error updating hotel:', error);
      }
    });
  }

  showModal() {
    this.fetchHotelDetails();
    this.getTourDays();
    this.modal?.show();
  }

  onCancel() {
    this.modal?.hide();
    this.addHotelForm.reset({
      selectedDay: this.days.length > 0 ? this.days[0] : 1,
      selectedLocation: null,
      selectedProvider: null,
      selectedHotel: null,
      netPrice: 0
    });
    this.errorMessage = null;
    this.initPaxPrices();
  }
}
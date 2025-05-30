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
  selector: 'app-add-flight',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule
  ],
  templateUrl: './add-flight.component.html',
  styleUrls: ['./add-flight.component.css']
})
export class AddFlightComponent implements AfterViewInit {
  @Input() days: number[] = [];
  @Input() day: number | null = null;
  @Input() tourId: number = 0;
  @Input() serviceId: number | null = null;
  @Input() prices: PaxOption[] = [];
  @Input() locations = signal<any[]>([]);
  @Output() flightAdded = new EventEmitter<{ flight: Service, isUpdate: boolean }>();
  @Output() error = new EventEmitter<any>();

  modal: Modal | null = null;
  addFlightForm!: FormGroup;
  providers = signal<any[]>([]);
  flights = signal<any[]>([]);
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
    const modalElement = document.getElementById('addFlightModal');
    if (modalElement) {
      this.modal = new Modal(modalElement);
    }
  }

  validateSellingPriceVsNetPrice(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const sellingPrice = control.get('sellingPrice')?.value;
      const netPrice = this.addFlightForm.get('netPrice')?.value;
      if (sellingPrice !== null && netPrice !== null && sellingPrice < netPrice) {
        return { sellingPriceTooLow: true };
      }
      return null;
    };
  }

  initializeForm() {
    this.addFlightForm = this.fb.group({
      selectedDay: [null, Validators.required],
      selectedFlight: [null, Validators.required],
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
    this.addFlightForm.get('netPrice')?.valueChanges.subscribe(() => {
      this.paxPrices.controls.forEach(control => {
        control.get('sellingPrice')?.updateValueAndValidity();
      });
    });
  }

  get paxPrices(): FormArray {
    return this.addFlightForm.get('paxPrices') as FormArray;
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
    this.tourDiscountService.getFlightServiceProviders(this.tourId).subscribe({
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

  fetchFlights() {
    const providerId = this.addFlightForm.get('selectedProvider')?.value;
    if (providerId) {
      this.tourDiscountService.getFlightServices(this.tourId, providerId).subscribe({
        next: (response: any) => {
          if (response.code === 200) {
            const mappedFlights = response.data.availableServices.map((service: any) => ({
              id: service.id,
              name: service.name,
              nettPrice: service.nettPrice,
              sellingPrice: service.sellingPrice
            }));
            this.flights.set(mappedFlights);
          }
        },
        error: (error: any) => {
          console.error('Error fetching flights:', error);
        }
      });
    }
  }

  fetchFlightDetails() {
    if (this.serviceId && this.tourId) {
      this.tourDiscountService.getServiceDetails(this.tourId, this.serviceId, this.day).subscribe({
        next: (response: ServiceDetailResponse) => {
          if (response.code === 200) {
            const flight = response.data;

            this.addFlightForm.patchValue({
              selectedDay: flight.dayNumber,
              selectedLocation: flight.locationId,
              selectedProvider: flight.serviceProviderId,
              selectedFlight: flight.id,
              netPrice: flight.nettPrice,
              sellingPrice: flight.sellingPrice
            });

            const paxPricesArray = this.paxPrices;
            paxPricesArray.clear();
            Object.values(flight.paxPrices).forEach(pax => {
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
            this.fetchFlights();
          }
        },
        error: (error: any) => {
          console.error('Error fetching flight details:', error);
        }
      });
    } else {
      this.initPaxPrices();
    }
  }

  onProviderChange() {
    this.addFlightForm.patchValue({ selectedFlight: null, netPrice: 0 });
    this.flights.set([]);
    this.fetchFlights();
  }

  onFlightChange() {
    const selectedFlightId = this.addFlightForm.get('selectedFlight')?.value;
    const selectedFlight = this.flights().find(t => t.id === selectedFlightId);

    if (selectedFlight) {
      this.addFlightForm.patchValue({
        netPrice: selectedFlight.nettPrice
      });

      const paxPricesArray = this.paxPrices;
      paxPricesArray.controls.forEach(control => {
        control.patchValue({
          sellingPrice: selectedFlight.sellingPrice || 0
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
    if (this.addFlightForm.invalid) {
      this.errorMessage = 'Vui lòng điền đầy đủ thông tin trước khi thêm vé máy bay';
      return;
    }

    if (this.addFlightForm.valid) {
      const formValue = this.addFlightForm.getRawValue();

      const selectedDay = formValue.selectedDay;
      const tourDay = this.tourDays.find(day => day.dayNumber === Number(selectedDay));

      if (!tourDay || !tourDay.serviceCategories.includes('Flight Ticket')) {
        this.error.emit(`Trong ngày ${selectedDay} không có dịch vụ vé máy bay`);
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

      const flightData: Service = {
        id: this.serviceId || formValue.selectedFlight,
        name: this.flights().find(h => h.id === formValue.selectedFlight)?.name || '',
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
        this.updateFlight(flightData);
      } else {
        this.createFlight(flightData);
      }
    }
  }

  createFlight(flightData: Service) {
    const payload = {
      serviceId: flightData.id,
      locationId: flightData.locationId,
      serviceProviderId: flightData.serviceProviderId,
      dayNumber: Number(flightData.dayNumber),
      paxPrices: Object.values(flightData.paxPrices).reduce((acc: any, pax) => {
        acc[pax.paxId] = pax.sellingPrice;
        return acc;
      }, {})
    };

    this.tourDiscountService.addService(this.tourId, payload).subscribe({
      next: (response: any) => {
        if (response.code === 200) {
          this.flightAdded.emit({ flight: flightData, isUpdate: false });
          this.addFlightForm.reset({
            selectedDay: this.days.length > 0 ? this.days[0] : 1,
            selectedLocation: null,
            selectedProvider: null,
            selectedFlight: null,
            netPrice: 0
          });
          this.initPaxPrices();
          this.providers.set([]);
          this.flights.set([]);
          this.modal?.hide();
        }
      },
      error: (error: any) => {
        this.error.emit(error);
        this.onCancel();
        console.error('Error creating flight:', error);
      }
    });
  }

  updateFlight(flightData: Service) {
    const payload = {
      serviceId: flightData.id,
      locationId: flightData.locationId,
      serviceProviderId: flightData.serviceProviderId,
      dayNumber: Number(flightData.dayNumber),
      paxPrices: Object.values(flightData.paxPrices).reduce((acc: any, pax) => {
        acc[pax.paxId] = pax.sellingPrice;
        return acc;
      }, {})
    };

    this.tourDiscountService.updateService(this.tourId, this.serviceId!, payload).subscribe({
      next: (response: any) => {
        if (response.code === 200) {
          this.flightAdded.emit({ flight: flightData, isUpdate: true });
          this.addFlightForm.reset({
            selectedDay: this.days.length > 0 ? this.days[0] : 1,
            selectedLocation: null,
            selectedProvider: null,
            selectedFlight: null,
            netPrice: 0
          });
          this.initPaxPrices();
          this.providers.set([]);
          this.flights.set([]);
          this.modal?.hide();
        }
      },
      error: (error: any) => {
        this.error.emit(error);
        this.onCancel();
        console.error('Error updating flight:', error);
      }
    });
  }

  showModal() {
    this.fetchFlightDetails();
    this.getTourDays();
    this.modal?.show();
  }

  onCancel() {
    this.modal?.hide();
    this.addFlightForm.reset({
      selectedDay: this.days.length > 0 ? this.days[0] : 1,
      selectedLocation: null,
      selectedProvider: null,
      selectedFlight: null,
      netPrice: 0
    });
    this.errorMessage = null;
    this.initPaxPrices();
  }
}
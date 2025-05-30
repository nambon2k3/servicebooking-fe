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

interface TourDay {
  dayNumber: number;
  serviceCategories: string[];
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

@Component({
  selector: 'app-add-activity',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule
  ],
  templateUrl: './add-activity.component.html',
  styleUrls: ['./add-activity.component.css']
})
export class AddActivityComponent implements AfterViewInit {
  @Input() days: number[] = [];
  @Input() day: number | null = null;
  @Input() tourId: number = 0;
  @Input() serviceId: number | null = null;
  @Input() prices: PaxOption[] = [];
  @Input() locations = signal<any[]>([]);
  @Output() activityAdded = new EventEmitter<{ activity: Service, isUpdate: boolean }>();
  @Output() error = new EventEmitter<any>();

  modal: Modal | null = null;
  addActivityForm!: FormGroup;
  providers = signal<any[]>([]);
  activitys = signal<any[]>([]);
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
    const modalElement = document.getElementById('addActivityModal');
    if (modalElement) {
      this.modal = new Modal(modalElement);
    }
  }

  validateSellingPriceVsNetPrice(netPrice: number): ValidatorFn {
    console.log('netPrice', netPrice);
    return (control: AbstractControl): { [key: string]: any } | null => {
      const sellingPrice = control.get('sellingPrice')?.value;
      if (sellingPrice !== null && sellingPrice < netPrice) {
        return { sellingPriceTooLow: true };
      }
      return null;
    };
  }

  initializeForm() {
    this.addActivityForm = this.fb.group({
      selectedDay: [null, Validators.required],
      selectedActivity: [null, Validators.required],
      selectedLocation: [null, Validators.required],
      selectedProvider: [null, Validators.required],
      netPrice: [null, Validators.required],
      paxPrices: this.fb.array(this.prices.map(price =>
        this.fb.group({
          paxRange: [price.paxRange],
          paxId: [price.id],
          sellingPrice: [null, Validators.required]
        }, {
          validators: this.validateSellingPriceVsNetPrice(this.addActivityForm.get('netPrice')?.value) // net giá theo từng dòng
        })))
    });
  }

  get paxPrices(): FormArray {
    return this.addActivityForm.get('paxPrices') as FormArray;
  }

  initPaxPrices() {
    const paxPricesArray = this.paxPrices;
    paxPricesArray.clear();
    this.prices.forEach(pax => {
      paxPricesArray.push(
        this.fb.group({
          paxId: [pax.id],
          paxRange: [pax.paxRange],
          sellingPrice: [0]
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
    const locationId = this.addActivityForm.get('selectedLocation')?.value;
    if (locationId) {
      this.tourDiscountService.getServiceProviders(this.tourId, locationId, 'Activity').subscribe({
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

  fetchActivitys() {
    const locationId = this.addActivityForm.get('selectedLocation')?.value;
    const providerId = this.addActivityForm.get('selectedProvider')?.value;
    if (locationId && providerId) {
      this.tourDiscountService.getServices(this.tourId, locationId, providerId, 'Activity').subscribe({
        next: (response: any) => {
          if (response.code === 200) {
            const mappedActivitys = response.data.availableServices.map((service: any) => ({
              id: service.id,
              name: service.name,
              nettPrice: service.nettPrice,
              sellingPrice: service.sellingPrice
            }));
            this.activitys.set(mappedActivitys);
          }
        },
        error: (error: any) => {
          console.error('Error fetching activitys:', error);
        }
      });
    }
  }

  fetchActivityDetails() {
    if (this.serviceId && this.tourId) {
      this.tourDiscountService.getServiceDetails(this.tourId, this.serviceId, this.day).subscribe({
        next: (response: ServiceDetailResponse) => {
          if (response.code === 200) {
            const activity = response.data;

            this.addActivityForm.patchValue({
              selectedDay: activity.dayNumber,
              selectedLocation: activity.locationId,
              selectedProvider: activity.serviceProviderId,
              selectedActivity: activity.id,
              netPrice: activity.nettPrice,
              sellingPrice: activity.sellingPrice
            });

            const paxPricesArray = this.paxPrices;
            paxPricesArray.clear();
            Object.values(activity.paxPrices).forEach(pax => {
              paxPricesArray.push(
                this.fb.group({
                  paxId: [pax.paxId],
                  paxRange: [pax.paxRange],
                  sellingPrice: [pax.sellingPrice]
                })
              );
            });

            this.fetchServiceProviders();
            this.fetchActivitys();
          }
        },
        error: (error: any) => {
          console.error('Error fetching activity details:', error);
        }
      });
    } else {
      this.initPaxPrices();
    }
  }

  onLocationChange() {
    this.addActivityForm.patchValue({ selectedProvider: null, selectedActivity: null, netPrice: 0 });
    this.providers.set([]);
    this.activitys.set([]);
    this.fetchServiceProviders();
  }

  onProviderChange() {
    this.addActivityForm.patchValue({ selectedActivity: null, netPrice: 0 });
    this.activitys.set([]);
    this.fetchActivitys();
  }

  onActivityChange() {
    const selectedActivityId = this.addActivityForm.get('selectedActivity')?.value;
    const selectedActivity = this.activitys().find(t => t.id === selectedActivityId);

    if (selectedActivity) {
      this.addActivityForm.patchValue({
        netPrice: selectedActivity.nettPrice
      });

      const paxPricesArray = this.paxPrices;
      paxPricesArray.controls.forEach(control => {
        control.patchValue({
          sellingPrice: selectedActivity.sellingPrice || 0
        });
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
    if (this.addActivityForm.invalid) {
      this.errorMessage = 'Vui lòng điền đầy đủ thông tin trước khi thêm hoạt động';
      return;
    }

    if (this.addActivityForm.valid) {
      const formValue = this.addActivityForm.getRawValue();

      const selectedDay = formValue.selectedDay;
      const tourDay = this.tourDays.find(day => day.dayNumber === Number(selectedDay));

      if (!tourDay || !tourDay.serviceCategories.includes('Activity')) {
        this.error.emit(`Trong ngày ${selectedDay} không có dịch vụ hoạt động`);
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

      const activityData: Service = {
        id: this.serviceId || formValue.selectedActivity,
        name: this.activitys().find(h => h.id === formValue.selectedActivity)?.name || '',
        dayNumber: formValue.selectedDay,
        status: 'ACTIVE',
        nettPrice: formValue.netPrice,
        sellingPrice: 0, // Will be calculated based on paxPrices
        locationName: this.locations().find(l => l.id === formValue.selectedLocation)?.name || '',
        locationId: formValue.selectedLocation,
        serviceProviderName: this.providers().find(p => p.id === formValue.selectedProvider)?.name || '',
        serviceProviderId: formValue.selectedProvider,
        paxPrices: paxPrices
      };

      if (this.serviceId) {
        this.updateActivity(activityData);
      } else {
        this.createActivity(activityData);
      }
    }
  }

  createActivity(activityData: Service) {
    const payload = {
      serviceId: activityData.id,
      locationId: activityData.locationId,
      serviceProviderId: activityData.serviceProviderId,
      dayNumber: Number(activityData.dayNumber),
      paxPrices: Object.values(activityData.paxPrices).reduce((acc: any, pax) => {
        acc[pax.paxId] = pax.sellingPrice;
        return acc;
      }, {})
    };

    this.tourDiscountService.addService(this.tourId, payload).subscribe({
      next: (response: any) => {
        if (response.code === 200) {
          this.activityAdded.emit({ activity: activityData, isUpdate: false });
          this.addActivityForm.reset({
            selectedDay: this.days.length > 0 ? this.days[0] : 1,
            selectedLocation: null,
            selectedProvider: null,
            selectedActivity: null,
            netPrice: 0
          });
          this.initPaxPrices();
          this.providers.set([]);
          this.activitys.set([]);
          this.modal?.hide();
        }
      },
      error: (error: any) => {
        this.error.emit(error);
        this.onCancel();
        console.error('Error creating activity:', error);
      }
    });
  }

  updateActivity(activityData: Service) {
    const payload = {
      serviceId: activityData.id,
      locationId: activityData.locationId,
      serviceProviderId: activityData.serviceProviderId,
      dayNumber: Number(activityData.dayNumber),
      paxPrices: Object.values(activityData.paxPrices).reduce((acc: any, pax) => {
        acc[pax.paxId] = pax.sellingPrice;
        return acc;
      }, {})
    };

    this.tourDiscountService.updateService(this.tourId, this.serviceId!, payload).subscribe({
      next: (response: any) => {
        if (response.code === 200) {
          this.activityAdded.emit({ activity: activityData, isUpdate: true });

          // Reset toàn bộ form
          this.addActivityForm.reset({
            selectedDay: this.days.length > 0 ? this.days[0] : 1,
            selectedLocation: null,
            selectedProvider: null,
            selectedActivity: null,
            netPrice: 0
          });

          // Reset paxPrices về giá trị mặc định từ this.prices
          this.initPaxPrices();

          // Reset providers và activitys
          this.providers.set([]);
          this.activitys.set([]);

          // Ẩn modal
          this.modal?.hide();
        }
      },
      error: (error: any) => {
        this.error.emit(error);
        this.onCancel();
        console.error('Error updating activity:', error);
      }
    });
  }

  showModal() {
    this.fetchActivityDetails();
    this.getTourDays();
    this.modal?.show();
  }

  onCancel() {
    this.modal?.hide();
    this.addActivityForm.reset({
      selectedDay: this.days.length > 0 ? this.days[0] : 1,
      selectedLocation: null,
      selectedProvider: null,
      selectedActivity: null,
      netPrice: 0
    });
    this.errorMessage = null;
    this.initPaxPrices();
  }
}
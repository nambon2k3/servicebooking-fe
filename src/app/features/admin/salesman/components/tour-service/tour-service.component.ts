import { AfterViewInit, Component } from '@angular/core';
import { TourService } from '../../services/tour.service';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Modal } from 'flowbite';
import { NgSelectModule } from '@ng-select/ng-select';
import { ProviderService } from '../../services/provider.service';
import { CurrencyVndPipe } from "../../../../../shared/pipes/currency-vnd.pipe";
import { Router } from '@angular/router';
import { SpinnerComponent } from '../../../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-tour-service',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectModule,
    CurrencyVndPipe,
    SpinnerComponent
  ],
  templateUrl: './tour-service.component.html',
  styleUrl: './tour-service.component.css',
})
export class TourServiceComponent implements AfterViewInit {
  serviceCategoriesWithTourDays: any[] = [];

  tourDayServiceForm: FormGroup;

  serviceModal: Modal | null = null;

  locations: any[] = [];

  tourId?: number;

  isLoading: boolean = false;

  ngAfterViewInit(): void {
    // Initialize the modal after the view has been initialized
    this.serviceModal = new Modal(document.getElementById('hotel-modal'));

  }


  addServiceForm: FormGroup;

  openModal(day: any, categoryName: string): void {


    this.addServiceForm.patchValue({
      id: day.id,
      dayNumber: day.dayNumber,
      title: day.title,
    });

    this.selectedCategory = categoryName;

    this.serviceModal?.show();

  }

  closeModal(): void {
    this.serviceModal?.hide();

    this.addServiceForm.reset();

    this.services = []

    this.providers = []
  }

  constructor(
    private tourService: TourService,
    private fb: FormBuilder,
    private providerService: ProviderService,
    private router: Router
  ) {

    this.tourDayServiceForm = fb.group({
      categories: new FormArray([]),
    });


    this.addServiceForm = fb.group({
      id: [1, Validators.required],
      dayNumber: [null, Validators.required],
      title: [null, Validators.required],
      selectedLocation: [null, Validators.required],
      selectedProvider: [null, Validators.required],
      selectedService: [null, Validators.required],
      netPrice: [{ value: 0, disabled: true }],
      sellingPrice: [{ value: 0, disabled: true }]
    })
  }

  ngOnInit(): void {
    // Initialization code here
    const tourId = Number(this.router.url.split('/').pop());

    console.log(tourId);

    if (tourId) {
      this.tourId = tourId;
      this.getServiceCategoriesWithTourDays(tourId); // Example tourId, replace with actual value
      this.getLocations(tourId); // Example tourId, replace with actual value
    }


  }


  get categoriesArray(): FormArray {
    return this.tourDayServiceForm.get('categories') as FormArray;
  }

  providers: any;
  selectedProvider: any;

  services: any;


  selectedCategory: any;


  onLocationChange() {
    this.addServiceForm.patchValue({ selectedProvider: null, selectedService: null });
    this.providers = [];
    this.services = [];
    this.fetchServiceProviders();
  }

  onProviderChange() {
    this.addServiceForm.patchValue({ selectedService: null });
    this.services = []
    this.fetchServices();
  }

  onServiceChange() {
    const selectedServiceId = this.addServiceForm.get('selectedService')?.value;
    const selectedService = this.services.find((h: any) => h.id === selectedServiceId);

    if (selectedService) {
      this.addServiceForm.patchValue({
        netPrice: selectedService.nettPrice,
        sellingPrice: selectedService.sellingPrice
      });
    }
  }

  fetchServiceProviders() {

    const locationId = this.addServiceForm.get('selectedLocation')?.value;
    const categoryName = this.selectedCategory;

    this.providerService.getProviderByLocationIds(locationId, categoryName).subscribe({
      next: (response: any) => {
        this.providers = response.data
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  backToList() {
    console.log('Back to list clicked!');
    this.router.navigate(['/salesman/list-tour-private']);
  }

  fetchServices() {

    const providerId = this.addServiceForm.get('selectedProvider')?.value;
    const categoryName = this.selectedCategory;

    if (providerId) {
      this.providerService.getServiceByProviderIds(providerId, categoryName).subscribe({
        next: (response: any) => {
          this.services = response.data
        },
        error: (error) => {
          console.log(error);
        }
      });
    }


  }

  getServiceLength(tourDayId: number, categoryName: string) {
    const length = this.getServicesByTourDayId(tourDayId, categoryName).length;
    return length > 0 ? length : 1;
  }


  getServicesByTourDayId(tourDayId: number, categoryName: string) {
    const tourDaysArray = this.tourDayServiceForm.get('tourDays') as FormArray;

    // Find the tourDay FormGroup by id
    const tourDayGroup = tourDaysArray.controls.find((group) =>
      group.get('id')?.value === tourDayId
    );

    if (!tourDayGroup) {
      console.warn(`TourDay with id ${tourDayId} not found.`);
      return [];
    }

    // Get services and filter by categoryName
    const servicesArray = tourDayGroup.get('services') as FormArray;

    return servicesArray.value.filter((service: any) => service.categoryName === categoryName);
  }



  getServiceCategoriesWithTourDays(tourId: number) {
    this.isLoading = true;
    this.tourService.getServiceCategoriesWithTourDays(tourId).subscribe(
      (response: any) => {
        this.serviceCategoriesWithTourDays = response.data;

        console.log('RESPONSE: ', this.serviceCategoriesWithTourDays)

        this.serviceCategoriesWithTourDays = this.serviceCategoriesWithTourDays.map(category => ({
          ...category,
          tourDays: category.tourDays.sort((a: any, b: any) => a.dayNumber - b.dayNumber) // Sort by dayNumber
        }));

        this.initializeForm(this.serviceCategoriesWithTourDays);

        console.log('FORM: ', this.tourDayServiceForm.value)

        this.isFullService = this.hasAllServices(this.tourDayServiceForm.value.categories);

        console.log('Is Full Service:', this.isFullService);

        this.isLoading = false;

        

      },
      (error: any) => {
        console.error(
          'Error fetching service categories with tour days:',
          error
        );
      }
    );
  }

  isFullService: boolean = false;

  // Check if all categories have services
  hasAllServices(categories: any): boolean {
    return categories.every((category: any) =>
      category.tourDays.every((tourDay: any) => tourDay.services.length > 0)
    );
  }


  initializeForm(data: any[]): void {
    const categoriesArray = this.tourDayServiceForm.get('categories') as FormArray;
    data.forEach(category => {
      categoriesArray.push(this.fb.group({
        id: category.id,
        categoryName: category.categoryName,
        tourDays: this.fb.array(category.tourDays.map((day: any) => this.fb.group({
          id: day.id,
          title: day.title,
          dayNumber: day.dayNumber,
          services: this.fb.array(this.mapServicesForDay(day.tourDayServices, category.categoryName))
        })))
      }));
    });
  }

  mapServicesForDay(serviceResponse: any[], categoryName: string): FormGroup[] {

    return serviceResponse
      .filter(service => service.service.serviceCategory.categoryName === categoryName) // Match services by categoryName
      .map(service => this.fb.group({
        provider: this.fb.group({
          id: service.service.serviceProvider.id,
          name: service.service.serviceProvider.name,
          abbreviation: service.service.serviceProvider.abbreviation,
          imageUrl: service.service.serviceProvider.imageUrl
        }),
        serviceDetails: this.fb.group({
          id: service.service.id,
          name: service.service.name,
          imageUrl: service.service.imageUrl,
          nettPrice: service.service.nettPrice,
          sellingPrice: service.service.sellingPrice
        })
      }));
  }

  getLocations(tourId: number) {
    this.tourService.getTourLocations(tourId).subscribe(
      (response: any) => {
        this.locations = response.data;
        console.log('Locations:', this.locations); // Log the locations for debugging
      },
      (error: any) => {
        console.error('Error fetching tour locations:', error);
      }
    );
  }



  onSubmit() {
    if (this.tourDayServiceForm.valid) {
      console.log('VALID :', this.tourDayServiceForm.value);

      const data = this.tourDayServiceForm.value;
      const tourDayMap = new Map<number, any>();

      data.categories.forEach((category: any) => {
        category.tourDays.forEach((day: any) => {
          if (!tourDayMap.has(day.id)) {
            // Initialize the tourDay with only serviceDetail IDs
            tourDayMap.set(day.id, {
              id: day.id,
              title: day.title,
              dayNumber: day.dayNumber,
              services: day.services.map((service: any) => service.serviceDetails.id) // Extract only serviceDetail.id
            });
          } else {
            // Merge unique serviceDetail IDs for the same tourDay
            const existingDay = tourDayMap.get(day.id);
            const newServiceIds = day.services
              .map((service: any) => service.serviceDetails.id)
              .filter((serviceId: number) => !existingDay.services.includes(serviceId));

            existingDay.services.push(...newServiceIds);
          }
        });
      });
      const uniqueTourDays = Array.from(tourDayMap.values());

      console.log('Unique Tour Days:', uniqueTourDays); // Log the unique tour days for debugging
      this.isLoading = true;

      this.tourService.updateTourServies(uniqueTourDays).subscribe(
        (response: any) => {
          this.isLoading = false;
          console.log('Tour services updated successfully:', response);
          // Handle success response here (e.g., show a success message)
          this.successMessage = "Cập nhật dịch vụ thành công!";
          this.triggerSuccess()
          this.buildForm();
          // this.tourDayServiceForm.reset(); // Reset the form after successful submission
          this.getServiceCategoriesWithTourDays(this.tourId!); // Refresh the data
        },
        (error: any) => {
          console.error('Error updating tour services:', error);
          // Handle error response here (e.g., show an error message)
        }
      );

    } else {
      console.log('INVALID :', this.tourDayServiceForm.value)
    }
  }

  buildForm(){
    this.tourDayServiceForm = this.fb.group({
      categories: new FormArray([]),
    });
  }

  removeService(categoryIndex: number, tourDayIndex: number, removeIndex: number) {
    const servicesArray = this.getTourDays(categoryIndex).at(tourDayIndex).get('services') as FormArray;
    servicesArray.removeAt(removeIndex);
  }


  addService() {
    if (this.addServiceForm.valid) {

      // Extract values from the form
      const serviceId = this.addServiceForm.value.selectedService;
      const providerId = this.addServiceForm.value.selectedProvider;

      const serviceObj = this.services.find((service: any) => service.id === serviceId);
      const providerObj = this.providers.find((provider: any) => provider.id === providerId);

      const serviceData = {
        provider: providerObj,
        service: serviceObj,
      };

      // Find the category index
      const categoryIndex = this.categoriesArray.controls.findIndex(
        (cat) => cat.get('categoryName')?.value === this.selectedCategory
      );
      if (categoryIndex === -1) return;

      const dayId = this.addServiceForm.value.id;

      // Find the tourDay index
      const tourDaysArray = this.getTourDays(categoryIndex);
      const tourDayIndex = tourDaysArray.controls.findIndex(
        (day) => day.get('id')?.value === dayId
      );

      console.log(dayId)

      if (tourDayIndex === -1) return;

      // Get the services array
      const servicesArray = this.getServices(categoryIndex, tourDayIndex);




      const isDuplicate = servicesArray.controls.some(
        (service) =>
          service.get('provider')?.value.name === serviceData.provider.name &&
          service.get('serviceDetails')?.value.name === serviceData.service?.name
      );

      if (isDuplicate) {
        this.triggerError()
        return;
      }

      servicesArray.push(
        this.fb.group({
          provider: serviceData.provider,
          serviceDetails: serviceData.service
        })
      );

      this.closeModal();

      this.triggerSuccess()



    } else {
      this.addServiceForm.markAllAsTouched()
    }
  }

  getTourDays(categoryIndex: number): FormArray {
    return this.categoriesArray.at(categoryIndex).get('tourDays') as FormArray;
  }

  getServices(categoryIndex: number, tourDayIndex: number): FormArray {
    return this.getTourDays(categoryIndex).at(tourDayIndex).get('services') as FormArray;
  }

  showSuccess: boolean = false;
  showError: boolean = false;


  successMessage: string = 'Thêm dịch vụ thành công!';
  errorMessage: string = 'Dịch vụ đã tồn tại! Vui lòng chọn dịch vụ khác!';

  triggerSuccess() {
    this.showSuccess = true;

    // Hide warning after 3 seconds
    setTimeout(() => {
      this.showSuccess = false;
      this.successMessage = 'Thêm dịch vụ thành công!';
    }, 4000);
  }

  triggerError() {
    this.showError = true;


    // Hide warning after 3 seconds
    setTimeout(() => {
      this.showError = false;
    }, 4000);
  }

  success: boolean = false;
  second: number = 2;

  showSuccessSendPricing() {
    this.success = true;
    this.second = 2; // Set countdown to 3 seconds
    const intervalId = setInterval(() => {
      this.second--; // Decrease countdown
      if (this.second === 0) {
        clearInterval(intervalId); // Stop interval when reaching 0
      }
    }, 1000);
    
    // Hide warning after 3 seconds
    setTimeout(() => {
      this.success = false;
      this.router.navigate(['/salesman/list-tour-private']); // Navigate to the desired route
    }, 2000);
  }

  sendPricing() {
    if (this.tourId) {
      this.tourService.sendPricing(this.tourId).subscribe(
        (response: any) => {
          console.log('Send pricing successfully:', response);
          this.showSuccessSendPricing()
        },
        (error: any) => {
          console.error('Error sending pricing:', error);
          // Handle error response here (e.g., show an error message)
        }
      );
    }

  }

}

import { AfterViewInit, Component } from '@angular/core';
import { BlogContentComponent } from '../../../marketer/components/blog-detail/blog-content/blog-content.component';
import { TourService } from '../../services/tour.service';
import { BookingService } from '../../services/booking.service';
import { Router, RouterModule } from '@angular/router';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { Modal } from 'flowbite';
import { start } from 'node:repl';
import { SpinnerComponent } from '../../../../../shared/components/spinner/spinner.component';
import { tick } from '@angular/core/testing';
@Component({
  selector: 'app-create-tour-private-content',
  imports: [BlogContentComponent, DatePipe, CommonModule, ReactiveFormsModule, RouterModule, SpinnerComponent],
  templateUrl: './create-tour-private-content.component.html',
  styleUrl: './create-tour-private-content.component.css'
})
export class CreateTourPrivateContentComponent implements AfterViewInit {

  tourPrivateContentForm: FormGroup;

  editTourModal: Modal | null = null;


  isLoading: boolean = false;

  ngAfterViewInit(): void {
    this.editTourModal = new Modal(document.getElementById('day-modal'));
  }

  openModal() {
    this.editTourModal?.show();
  }

  closeModal() {
    this.editTourModal?.hide();
  }

  constructor(
    private tourService: TourService,
    private router: Router,
    private fb: FormBuilder,
    private bookingService: BookingService
  ) {

    this.tourPrivateContentForm = this.fb.group({
      tourId: ['', Validators.required],
      tourDays: this.fb.array([]),
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      highlights: ['', Validators.required],
      privacy: ['', Validators.required],
      note: ['Không có'],
      tourScheduleId: ['']
    });



    this.editTourDayForm = this.fb.group({
      title: ['', Validators.required],
      dayNumber: ['', Validators.required],
      content: ['', Validators.required],
      meals: ['3 bữa (sáng, trưa, tối)', Validators.required],
      serviceCategory: this.fb.group({
        restaurant: [false],
        hotel: [false],
        activity: [false],
        ticket: [false],
        transport: [false]
      }, { validators: this.atLeastOneChecked }),
      deleted: [false],
      locationId: ['', Validators.required],
    });


    this.setupDateChangeListeners();
  }


  numberDays: number = 1;


  setupDateChangeListeners() {
    this.tourPrivateContentForm.get('startDate')?.valueChanges.subscribe((startDate) => {
      this.calculateEndDate();

      console.log(startDate);
    });
  }

  calculateEndDate() {
    const startDate = this.tourPrivateContentForm.get('startDate')?.value;

    if (startDate) {
      const start = new Date(startDate);
      start.setDate(start.getDate() + this.tourData?.numberDays - 1); // Calculate End Date
      const endDateFormatted = start.toISOString().split('T')[0];

      this.tourPrivateContentForm.get('endDate')?.setValue(endDateFormatted);
    }
  }

  minStartDate: string = '';


  tourId?: number;

  tourData: any;

  ngOnInit(): void {
    const tourId = Number(this.router.url.split('/').pop());

    //const tourBookingId = 71;

    console.log(tourId);

    this.setMinStartDate();

    if (tourId) {
      this.tourId = tourId;
      this.getTourData(tourId);
      this.tourPrivateContentForm.get('tourId')?.setValue(tourId);
    }
  }

  setMinStartDate() {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Set to tomorrow
    this.minStartDate = today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }


  getTourData(tourId: number) {
    this.isLoading = true; // Start loading
    this.bookingService.getToursPrivateContent(tourId).subscribe({
      next: (response) => {

        this.tourData = response.data;
        console.log(this.tourData);

        this.isLoading = false; // Stop loading


        this.tourData.tourDays = this.tourData.tourDays.sort((a : any, b: any) => a.dayNumber - b.dayNumber);

        console.log(this.tourData)


        this.patchTourDays(this.tourData.tourDays);

        this.tourPrivateContentForm.patchValue({
          highlights: this.tourData.highlights,
          privacy: this.tourData.privacy,
          note: this.tourData.note,
          startDate: this.tourData.tourSchedules.at(0)?.startDate.split('T')[0],
          endDate: this.tourData.tourSchedules.at(0)?.endDate.split('T')[0],
          tourScheduleId: this.tourData.tourSchedules.at(0)?.id,
        });

        

      },
      error: (error) => {
        this.isLoading = false; // Stop loading
        console.log(error);
      }
    });
  }

  patchTourDays(data: any[]) {
    this.tourDays.clear(); // clear form nếu đã có dữ liệu cũ

    data.forEach(day => {

      const serviceCategories = {
        restaurant: false,
        hotel: false,
        ticket: false,
        activity: false
      };
    
      // Map the service categories based on the existing data
      day.tourDayServiceCategories?.forEach((service: any) => {
        if (service.serviceCategory.categoryName === "Restaurant") {
          serviceCategories.restaurant = true;
        }
        if (service.serviceCategory.categoryName === "Hotel") {
          serviceCategories.hotel = true;
        }
        if (service.serviceCategory.categoryName === "Activity") {
          serviceCategories.activity = true;
        }
        if (service.serviceCategory.categoryName === "Flight Ticket") {
          serviceCategories.activity = true;
        }
        if (service.serviceCategory.categoryName === "Transport") {
          serviceCategories.restaurant = true;
        }
      });

      const dayGroup = this.fb.group({
        id: [day.id],
        dayNumber: [day.dayNumber],
        title: [day.title, Validators.required],
        meals: [day.mealPlan],
        content: [day.content],
        serviceCategory: serviceCategories,
        locationId: [day.location?.id]
      });
      this.tourDays.push(dayGroup);
    });
  }

  editTourDayForm: FormGroup;

  selectedDayIndex: number = -1;

  editTourDay(index: number) {
    this.selectedDayIndex = index;
    const day = this.tourDays.at(index).value;

    const serviceCategory = day.serviceCategory || { restaurant: false, hotel: false, activity: false, ticket: false, transport: false };

    this.editTourDayForm.patchValue({
      title: day.title,
      dayNumber: day.dayNumber,
      content: day.content,
      meals: day.meals,
      serviceCategory: {
        restaurant: serviceCategory.restaurant || false,
        hotel: serviceCategory.hotel || false,
        activity: serviceCategory.activity || false,
        ticket: serviceCategory.ticket || false,
        transport: serviceCategory.transport || false
      },
      locationId: day.locationId
    });

    console.log(day);

    this.openModal();
  }


  saveTourDay() {
    if (this.selectedDayIndex !== null && this.editTourDayForm.valid) {
      this.tourDays.at(this.selectedDayIndex).patchValue({
        title: this.editTourDayForm.get('title')?.value,
        dayNumber: this.editTourDayForm.get('dayNumber')?.value,
        content: this.editTourDayForm.get('content')?.value,
        meals: this.editTourDayForm.get('meals')?.value,
        serviceCategory: this.editTourDayForm.get('serviceCategory')?.value,
        locationId: this.editTourDayForm.get('locationId')?.value
      });
      this.closeModal();
      this.editTourDayForm.markAsUntouched();
    } else {
      this.editTourDayForm.markAllAsTouched();
    }

    console.log(this.editTourDayForm.value);
  }

  atLeastOneChecked(control: AbstractControl): ValidationErrors | null {
    const serviceCategory = control.value;
    if (!serviceCategory) return { atLeastOneRequired: true };
  
    // Check if at least one checkbox isLoading: boolean = false; selected
    if (!serviceCategory.restaurant && !serviceCategory.hotel && !serviceCategory.ticket && !serviceCategory.activity && !serviceCategory.transport) {
      return { atLeastOneRequired: true };
    }
  
    return null; // Valid
  }


  get tourDays() {
    return this.tourPrivateContentForm.get('tourDays') as FormArray;
  }

  success: boolean = false;

  onSubmit() {
    if (this.tourPrivateContentForm.valid) {
      const formData = { ...this.tourPrivateContentForm.value }; // Clone form data to avoid mutations
      console.log('Raw Form Data:', formData);
  
      // Format Start Date for Backend
      if (formData.startDate) {
        formData.startDate = new Date(formData.startDate).toISOString(); 
        formData.endDate = new Date(formData.endDate).toISOString();
      }
  
      // Process Tour Days
      formData.tourDays = formData.tourDays.map((day: any) => {
        // Convert checkboxes to IDs
        const selectedCategories: number[] = [];
        if (day.serviceCategory?.restaurant) selectedCategories.push(2); // ID for "Nhà hàng"
        if (day.serviceCategory?.hotel) selectedCategories.push(1); // ID for "Khách sạn"
        if (day.serviceCategory?.activity) selectedCategories.push(4); // ID for "Hoạt động"
        if (day.serviceCategory?.ticket) selectedCategories.push(5); // ID for "Hoạt động"
        if (day.serviceCategory?.transport) selectedCategories.push(3); // ID for "Vận chuyển"
  
        return {
          id: day.id,
          title: day.title,
          dayNumber: day.dayNumber,
          content: day.content,
          meals: day.meals,
          serviceCategoryIds: selectedCategories, // Send IDs only
          locationId: day.locationId
        };
      });
  
      console.log('Processed Tour Data:', formData); // Debugging output
  
      this.isLoading = true; // Start loading
      //Call API to update tour content
      this.tourService.updateTourContent(formData).subscribe({
        next: (response) => {
          this.isLoading = false; // Stop loading
          console.log('Response:', response);
          this.showSuccess(); // Show success message
          
          this.tourPrivateContentForm.reset(); // Reset form after successful submission
        },
        error: (error) => {
          this.isLoading = false; // Stop loading
          console.error('Error:', error);
        }
      });
  
    } else {
      this.tourPrivateContentForm.markAllAsTouched();
      console.log('Form Invalid');
    }
  }

  second: number = 0;

  showSuccess() {
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
      this.router.navigate(['/salesman/tour-private-service', this.tourId]); // Navigate to the desired route
    }, 2000);
  }
  

  // Getter for easier access
  get serviceCategoryArray(): FormArray {
    return this.editTourDayForm.get('serviceCategory') as FormArray;
  }

}

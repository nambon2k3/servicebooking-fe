import { Component, OnInit } from '@angular/core';
import { BookingInfoService } from '../../services/booking-infor.service';
import { TourBookingData, TourDetail, TourSchedule } from '../../../../core/models/tour-detail.model';
import { CommonModule, DatePipe } from '@angular/common';
import { UserStorageService } from '../../../../core/services/user-storage/user-storage.service';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CurrencyVndPipe } from "../../../../shared/pipes/currency-vnd.pipe";
import { TourDetailService } from '../../services/tour-detail.service';
import { SpinnerComponent } from "../../../../shared/components/spinner/spinner.component";

@Component({
  selector: 'app-tour-booking',
  imports: [CommonModule, ReactiveFormsModule, CurrencyVndPipe, SpinnerComponent],
  templateUrl: './tour-booking.component.html',
  styleUrl: './tour-booking.component.css',
  providers: [DatePipe]
})
export class TourBookingComponent implements OnInit{


  tourDetails?: TourDetail;
  tourSchedule?:TourSchedule;
  userInformation: any;
  bookingForm: FormGroup;

  numberAdults: number = 1;
  numberChildren: number = 0;

  childrenPrice: number = 0;

  numberSingleRooms: number = 1;

  isLoading: boolean = true;




  constructor(
    private bookingInforService: BookingInfoService,
    private fb: FormBuilder,
    private userStorageService: UserStorageService,
    private router: Router,
    private tourDetailService: TourDetailService,
  ) {

    this.bookingForm = this.fb.group({
      userId: ['', Validators.required],
      tourId: ['', Validators.required],
      scheduleId: ['', Validators.required],
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [null, [Validators.required, Validators.pattern('^[0-9]*$')]],
      address: ['', Validators.required],
      note: [''],
      paymentMethod: ['CASH', Validators.required],
      adults: this.fb.array([]),
      children: this.fb.array([]),
      total: [0],
      sellingPrice: [0, Validators.required],
      extraHotelCost: [0, Validators.required]
    });

    // Dynamically add adult form groups based on numberAdults
    this.addAdults(this.numberAdults);


    this.adultsFormArray.valueChanges.subscribe(() => {
      this.updateNumberOfSingleRooms();
      this.calculateTotal();
    });
  }


  total: number = 0;

  warningMessage: string = '';

  calculateTotal() {
    const adultsArray = this.adultsFormArray;
    const childrenArray = this.childrenFormArray;

    const adultPrice = this.tourSchedule?.sellingPrice;
    const childrenPrice = this.childrenPrice;

    const adultTotal = adultsArray.controls.length * adultPrice!;
    const childrenTotal = childrenArray.controls.length * childrenPrice;

    const extra = this.numberSingleRooms * this.tourSchedule?.extraHotelCost!;

    this.total = adultTotal + childrenTotal + extra;


    this.bookingForm.patchValue({ total: this.total }, { emitEvent: false });
  }


  updateNumberOfSingleRooms(): void {
    const adultsArray = this.adultsFormArray;
    this.numberSingleRooms = adultsArray.controls.filter(
      (adultGroup) => adultGroup.get('singleRoom')?.value === true
    ).length;
  }

  addAdults(count: number): void {
    const adultsArray = this.adultsFormArray;
    for (let i = 0; i < count; i++) {
      adultsArray.push(this.createAdultGroup());
    }
  }

  // Helper method to create a single adult FormGroup
  createAdultGroup(): FormGroup {
    return this.fb.group({
      fullName: ['', Validators.required],
      gender: ['MALE', Validators.required],
      dateOfBirth: ['', Validators.required],
      singleRoom: this.numberAdults == 1 ? [true] : [false], // Checkbox value (default: false)
    });
  }

  createChildrenGroup(): FormGroup {
    return this.fb.group({
      fullName: ['', Validators.required],
      gender: ['MALE', Validators.required],
      dateOfBirth: ['', Validators.required],
      singleRoom: [false]
    });
  }

  addChildren(): void {
    const childrenArray = this.childrenFormArray;
    childrenArray.push(this.createChildrenGroup());
  }

  updateSingleRoomValues(): void {
    const adultsArray = this.adultsFormArray;
    const isSingleAdult = adultsArray.length === 1;
  
    adultsArray.controls.forEach((adultGroup) => {
      const singleRoomControl = adultGroup.get('singleRoom');
      if (singleRoomControl) {
        singleRoomControl.setValue(isSingleAdult); // Set to true if only one adult, otherwise false
        
      }
    });
  }



  // Getter for the adults FormArray
  get adultsFormArray(): FormArray {
    return this.bookingForm.get('adults') as FormArray;
  }

  // Getter for the children FormArray
  get childrenFormArray(): FormArray {
    return this.bookingForm.get('children') as FormArray;
  }

  scheduleId: number = 0;
  tourId: number = 0;
  maxDateOfBirth: string = '';
  today: string = '';

  ngOnInit(): void {

    const tourId = Number(this.router.url.split('/')[2]);
    const scheduleId = Number(this.router.url.split('/')[3]);

    console.log(this.router.url.split('/'))

    this.tourId = tourId;
    this.scheduleId = scheduleId;

    this.getTourDetails(tourId);

    console.log(this.tourDetails)

    

    

    this.getUserData();


    console.log(this.tourSchedule?.extraHotelCost)

    const today = new Date();
    const twelveYearsAgo = new Date(
      today.getFullYear() - 13,
      today.getMonth(),
      today.getDate()
    );

    this.maxDateOfBirth = twelveYearsAgo.toISOString().split('T')[0];
    this.today = today.toISOString().split('T')[0];


  }

  getTourDetails(tourId: number) {
    this.isLoading = true;
    this.tourDetailService.getTourDetails(tourId).subscribe({
      next: (response) => {
        this.tourDetails = response.data;
        this.tourSchedule = this.tourDetails?.tourSchedules.find(schedule => schedule.scheduleId === this.scheduleId);
        console.log(this.tourDetails)
        this.childrenPrice = this.tourSchedule?.sellingPrice! * 0.75;

        this.calculateTotal();

        this.bookingForm.patchValue({
          tourId: this.tourDetails?.id,
          scheduleId: this.tourSchedule?.scheduleId,
          sellingPrice: this.tourSchedule?.sellingPrice,
          extraHotelCost: this.tourSchedule?.extraHotelCost
        });

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load tour details:', error);
        this.isLoading = false;
      }
    });
  }

  getUserData() {
    const cookie = this.userStorageService.getUser();
    
    this.bookingInforService.getUserInformation(cookie.userId).subscribe({
      next: (response) => {
        this.userInformation = response.data;
        this.bookingForm.patchValue({
          userId: cookie.userId,
          fullName: this.userInformation.fullName,
          email: this.userInformation.email,
          phone: this.userInformation.phone,
          address: this.userInformation.address,
        });
      }
    });
  }


  


  onSubmit() {
    if (this.bookingForm.valid) {

      const formData = this.bookingForm.value;

      console.log('Form Data:', formData);

      this.isLoading = true;

      this.bookingInforService.submitBooking(formData).subscribe({
        next: (response) => {
          this.router.navigate(['/tour-booking-detail', response.data]);
        },
        error: (error) => {
          console.error('Booking Failed:', error);
          this.warningMessage = 'Failed to create booking. Please try again.';
          this.triggerWarning();
        }
      });

    } else {
      console.log('Form Submitted:', this.bookingForm.value);
      this.warningMessage = 'Please fill in all required fields';
      this.triggerWarning();
      this.bookingForm.markAllAsTouched()
    }
  }



  incrementAldults() {
    if (this.numberAdults + this.numberChildren < this.tourSchedule?.availableSeats!){
      this.numberAdults++;
      this.addAdults(1);
      this.updateSingleRoomValues();
    } 
    else {
      this.warningMessage = 'Sorry, the current tour has only ' + this.tourSchedule?.availableSeats + ' seats left.';
      this.triggerWarning();
    }
  }

  decrementAldults() {
    if (this.numberAdults > 1) {
      this.numberAdults--;
      this.adultsFormArray.removeAt(this.numberAdults); // Remove the last adult form group
      this.updateSingleRoomValues();
    } // Prevent negative values
  }

  incrementChildren() {
    if (this.numberAdults + this.numberChildren < this.tourSchedule?.availableSeats!) {
      this.numberChildren++
      this.addChildren();
      this.calculateTotal();
    }
    else {
      this.warningMessage = 'Sorry, the current tour has only ' + this.tourSchedule?.availableSeats + ' seats left.';
      this.triggerWarning();
    }
  }

  decrementChildren() {
    if (this.numberChildren > 0) {
      this.numberChildren--;
      this.childrenFormArray.removeAt(this.numberChildren); // Remove the last children form group
      this.calculateTotal();
    } // Prevent negative values
  }

  showWarning: boolean = false;

  triggerWarning() {
    this.showWarning = true;
    
    // Hide warning after 3 seconds
    setTimeout(() => {
      this.showWarning = false;
    }, 4000);
  }


  range(end: number): number[] {
    return Array.from({ length: end - 0 }, (_, i) => 0 + i);
  }

  agreeTerms: boolean = false;

  confirmAgreeTerms() {
    this.agreeTerms = !this.agreeTerms;
  }

}

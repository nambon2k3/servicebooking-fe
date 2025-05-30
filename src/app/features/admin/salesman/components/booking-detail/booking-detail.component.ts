import { AfterViewInit, Component } from '@angular/core';
import { TourService } from '../../services/tour.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { CurrencyVndPipe } from "../../../../../shared/pipes/currency-vnd.pipe";
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { Modal } from 'flowbite';
import { SpinnerComponent } from '../../../../../shared/components/spinner/spinner.component';
import { BlogContentComponent } from '../../../marketer/components/blog-detail/blog-content/blog-content.component';
@Component({
  selector: 'app-booking-detail',
  imports: [DatePipe, CommonModule, CurrencyVndPipe, ReactiveFormsModule, RouterModule, SpinnerComponent, BlogContentComponent],
  templateUrl: './booking-detail.component.html',
  styleUrl: './booking-detail.component.css'
})
export class BookingDetailComponent implements AfterViewInit {


  tourBookingId?: number;

  bookingDetail: any;

  bookedPerson: any;

  tourCustomers: any;

  remainingAmount: number = 0.0;


  customerForm: FormGroup;



  showWarning: boolean = false;

  maxPax: number = 0;


  transactionDetailModal: Modal | null = null;
  forwardBookingModal: Modal | null = null;

  forwardSchedules: any[] = [];



  ngAfterViewInit(): void {
    this.transactionDetailModal = new Modal(document.getElementById('transaction-modal'));
    this.forwardBookingModal = new Modal(document.getElementById('forward-booking-modal'));
    this.priceModal = new Modal(document.getElementById('price-modal'));
  }


  openForwardBookingModal() {
    this.forwardBookingModal?.show();
    this.getForwardSchedules(this.tourId!, this.scheduleId!);
  }

  closeForwardBookingModal() {
    this.forwardBookingModal?.hide();
  }


  getForwardSchedules(tourId: number, sheduleId: number) {
    this.bookingService.getForwardTourSchedules(tourId, sheduleId, this.bookingDetail.seats).subscribe({
      next: (response) => {
        console.log(response.data)
        this.forwardSchedules = response.data
      },
      error: (error) => {
        console.log(error);
      }
    })
  }

  transactionForm: FormGroup;

  selectedTransaction: any;

  openTransactionDetailModal(transaction: any): void {
    this.transactionDetailModal?.show();
    this.selectedTransaction = transaction;
    this.loadTransactionData(transaction);
  }

  closeTransactionDetailModal(): void {
    this.transactionDetailModal?.hide();
  }

  selectedId : number = 0;
  selectedIndex : number = 0;

  showConfirmModal(index: number): void {
    const customerGroup = this.customersFormArray.at(index);
    const id = customerGroup.get('id')?.value;
    if (id) {
      this.showWarning = true;
      this.selectedId = id;
      this.selectedIndex = index;
    } else {
      this.customersFormArray.removeAt(index);
    }
  }

  closeConfirmModal(): void {
    this.showWarning = false;
  }

  constructor(
    private tourService: TourService,
    private router: Router,
    private fb: FormBuilder,
    private bookingService: BookingService
  ) {
    this.customerForm = this.fb.group({
      customers: this.fb.array([]),
      bookingId: [null],
    });

    this.transactionForm = this.fb.group({
      id: [{ value: '', disabled: true }],
      amount: ['', Validators.required],
      category: ['', Validators.required],
      paidBy: ['', Validators.required],
      receivedBy: ['', Validators.required],
      paymentMethod: ['', Validators.required],
      notes: [''],
      createdAt: [{ value: '', disabled: true }],
      costAccount: this.fb.array([]) // Array chứa các dòng cost
    });
    

    this.cancelBookingForm = this.fb.group({
      bookingId: [null],
      status: ['REQUEST_CANCELLED_WITH_REFUND', Validators.required],
      reason: [null],
    });

    this.sendMailForm = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
      subject: [null, Validators.required],
      content: [null, Validators.required],
    });
  }

  tourId: number = 0;
  scheduleId: number = 0;


  ngOnInit() {
    const tourBookingId = Number(this.router.url.split('/').pop());

    //const tourBookingId = 71;

    if (tourBookingId) {
      this.tourBookingId = tourBookingId;
      this.getBookingDetail(tourBookingId);
    }
  }

  createCustomerGroup(): FormGroup {
    return this.fb.group({
      id: [null],
      fullName: [null, Validators.required],
      address: [null],
      email: [null, [Validators.email]],
      dateOfBirth: [null, [Validators.required]],
      phoneNumber: [null],
      pickUpLocation: [null],
      note: [null],
      gender: ['MALE', Validators.required],
      ageType: ['ADULT', Validators.required],
      singleRoom: [false],
      deleted: [false],
      bookedPerson: [false],
    });
  }

  addCustomer(count: number): void {
    const adultsArray = this.customersFormArray;
    for (let i = 0; i < count; i++) {
      adultsArray.push(this.createCustomerGroup());
    }
  }

  addCostItem(): void {
    this.costAccount.push(this.fb.group({
      id: [''],
      content: ['', Validators.required],
      amount: [0, Validators.required],
      discount: [0],
      quantity: [1],
      finalAmount: [0],
      status: ['UNPAID']
    }));
  }

  removeCostItem(index: number): void {
    this.costAccount.removeAt(index);
  }

  get customersFormArray(): FormArray {
    return this.customerForm.get('customers') as FormArray;
  }

  get costAccount(): FormArray {
    return this.transactionForm.get('costAccount') as FormArray;
  }

  getBookingDetail(tourBookingId: number) {
    this.isLoading = true;
    this.tourService.getBookingDetail(tourBookingId).subscribe({
      next: (response) => {
        this.bookingDetail = response.data;
        this.bookedPerson = response.data.customers.filter((customer: any) => customer.bookedPerson)[0];
        this.tourCustomers = response.data.customers.filter((customer: any) => !customer.bookedPerson);
        this.remainingAmount = this.bookingDetail.total - this.bookingDetail.paid;

        this.maxPax = this.bookingDetail.schedule.availableSeats + this.tourCustomers.length;

        this.setTourCustomersForm(this.tourCustomers);

        this.customerForm.patchValue({
          bookingId: this.bookingDetail.id
        });

        this.transactionForm.patchValue({
          bookingCode: this.bookingDetail.bookingCode
        });

        this.cancelBookingForm.patchValue({
          bookingId: this.bookingDetail.id,
        });

        this.tourId = this.bookingDetail?.tour?.id;
        this.scheduleId = this.bookingDetail?.schedule?.scheduleId;

        console.log(this.bookingDetail);

        this.isLoading = false;
      },
      error: (error) => {
        console.log(error);
        this.isLoading = false;
      }
    });
  }


  loadTransactionData(data: any): void {
    this.transactionForm.patchValue({
      id: data.id,
      amount: data.amount,
      category: data.category,
      paidBy: data.paidBy,
      receivedBy: data.receivedBy,
      paymentMethod: data.paymentMethod,
      notes: data.notes,
      createdAt: data.createdAt
    });

    this.costAccount.clear();
    data.costAccount.forEach((item: any) => {
      this.costAccount.push(this.fb.group({
        id: [item.id],
        content: [item.content, Validators.required],
        amount: [item.amount, Validators.required],
        discount: [item.discount],
        quantity: [item.quantity],
        finalAmount: [item.finalAmount],
        status: [item.status]
      }));
    });
  }


  setTourCustomersForm(customers: any[]): void {
    const customersFormArray = this.customersFormArray;
    customersFormArray.clear(); // Clear existing controls if needed

    customers.forEach(customer => {
      const group = this.createCustomerGroup();
      group.patchValue({
        id: customer.id || null,
        fullName: customer.fullName || '',
        address: customer.address || '',
        email: customer.email || '',
        dateOfBirth: customer.dateOfBirth || '',
        phoneNumber: customer.phoneNumber || '',
        pickUpLocation: customer.pickUpLocation || '',
        note: customer.note || '',
        gender: customer.gender || 'MALE',
        ageType: customer.ageType || 'ADULT',
        singleRoom: customer.singleRoom || false,
        deleted: customer.deleted || false,
        bookedPerson: customer.bookedPerson || false,
      });
      const isDeleted = group.get('deleted')?.value;
      if (isDeleted) {
        group.disable();
      }
      customersFormArray.push(group);
    });

    this.customerForm.patchValue({
      customers: customers.map(customer => ({
        ...customer,
        dateOfBirth: this.formatDate(customer.dateOfBirth)
      }))
    });

    this.customersFormArray.controls.forEach((customerGroup) => {
      customerGroup.get('deleted')?.valueChanges.subscribe((deleted) => {
        if (deleted && customerGroup.enabled) {
          customerGroup.disable({ emitEvent: false });
        } else if (!deleted && customerGroup.disabled) {
          customerGroup.enable({ emitEvent: false });
        }
      });
    });
  }



  fetchCustomers(tourBookingId: number) {
    this.bookingService.getBookingCustomers(tourBookingId).subscribe({
      next: (response) => {

        const customers = response.data;

        this.tourCustomers = customers.filter((customer: any) => !customer.bookedPerson);

        this.setTourCustomersForm(this.tourCustomers);

        console.log(customers);
      },
      error: (error) => {
        console.log(error);
      }
    });
  }


  deleteCustomer(): void {
    if (this.selectedId) {
      this.bookingService.updateCustomerStatus(this.selectedId).subscribe({
        next: (response) => {
          this.customersFormArray.at(this.selectedIndex).get('deleted')?.setValue(response.data.deleted);
          this.tourCustomers = this.tourCustomers.map((customer: any) => {
            if (customer.id === this.selectedId) {
              return {
                ...customer,
                deleted: response.data.deleted
              };
            }
            return customer;
          });
          this.triggerSuccess();
        },
        error: (error) => {
          console.log(error);
          this.triggerError();
        }
      });
    } else {
      this.customersFormArray.removeAt(this.selectedIndex);
    }
    this.closeConfirmModal();
  }

  changeStatus(index: number): void {
    const customerGroup = this.customersFormArray.at(index);
    const deleted = customerGroup.get('deleted');
    customerGroup.get('deleted')?.setValue(!deleted)
  }

  getRemainingAmount(transaction: any): number {
    if (!transaction) {
      return 0;
    }

    const paidAmount = (transaction.costAccount || [])
      .filter((ca: any) => ca.status === 'PAID')
      .reduce((sum: number, ca: any) => sum + (ca.amount || 0), 0);


    return (transaction.amount || 0) - paidAmount;
  }

  isLoading: boolean = false;

  cancelBooking() {
    if (this.cancelBookingForm.valid) {
      const formData = this.cancelBookingForm.value;
      console.log('Cancel Booking Form Submitted:', formData);

      this.isLoading = true; // Set loading state to true

      this.bookingService.cancelBooking(formData).subscribe({
        next: (response: any) => {
          console.log('Booking Cancelled:', response);
          this.triggerSuccess();
          this.isLoading = false; // Reset loading state
          this.getBookingDetail(this.tourBookingId!); // Refresh booking detail
        },
        error: (error: any) => {
          console.error('Cancellation Failed:', error);
          this.triggerError();
          this.isLoading = false; // Reset loading state
        }
      });
    } else {
      console.log('Cancel Booking Form is invalid:', this.cancelBookingForm.value);
    }
  }

  successBooking(): void {
    this.bookingService.updateBookingStatus(this.tourBookingId!, 'SUCCESS').subscribe({
      next: (response) => {
        console.log('Booking Success:', response);
        this.triggerSuccess();
        this.getBookingDetail(this.bookingDetail?.id)
      },
      error: (error) => {
        console.error('Booking Failed:', error);
        this.triggerError();
      }
    });
  }

  showSuccess: boolean = false;
  showError: boolean = false;


  successMessage: string = 'Chuyển đổi trạng thái thành công!';
  errorMessage: string = 'Đã có lỗi xảy ra! Vui lòng thử lại.';

  triggerSuccess() {
    this.showSuccess = true;

    // Hide warning after 3 seconds
    setTimeout(() => {
      this.showSuccess = false;
    }, 4000);
  }

  triggerError() {
    this.showError = true;


    // Hide warning after 3 seconds
    setTimeout(() => {
      this.showError = false;
    }, 4000);
  }
  
  getEmailContent() {
    console.log(this.tourId, this.scheduleId);
    this.bookingService.getEmail(this.tourId!, this.scheduleId!).subscribe({
      next: (response) => {
        console.log('Email sent:', response);
        this.emailContent = response.data;
        this.sendMailForm.patchValue({
          content: response.data,
          subject: '[VIET TRAVEL]: Báo giá tour: ' + this.bookingDetail?.tour?.name,
          email: this.bookedPerson?.email
        });
      },
      error: (error) => {
        console.error('Email content get failed:', error);
        this.triggerError();
      }
    });
  }

  sendMail() {
    if(this.sendMailForm.valid) {

      this.isLoading = true; // Set loading state to true

      const formData = this.sendMailForm.value;
      console.log('Send Mail Form Submitted:', formData);

      this.bookingService.sendEmail(formData).subscribe({
        next: (response) => {
          console.log('Email sent:', response);
          this.isLoading = false; // Reset loading state
          this.successMessage = 'Gửi email thành công!';
          this.triggerSuccess();
        },
        error: (error) => {
          console.error('Email send failed:', error);
          this.triggerError();
          this.isLoading = false; // Reset loading state
        }
      });

      this.closePriceModal();

    }
  }

  cancelBookingForm: FormGroup;

  forwardBookingId = null;

  onChangeForwardSchedule(event: any) {
    const selectedSchedule = event.target.value;
    console.log(selectedSchedule);
    this.forwardBookingId = selectedSchedule;
  }
  

  forwardBooking() {
    if (this.forwardBookingId) {
      this.bookingService.forwardBooking(this.tourBookingId!, this.forwardBookingId).subscribe({
        next: (response) => {
          console.log('Forward Booking Success:', response);
          this.triggerSuccess();
          this.getBookingDetail(this.tourBookingId!); // Refresh booking detail
        },
        error: (error) => {
          console.error('Forward Booking Failed:', error);
          this.triggerError();
        }
      });
    } else {
      console.log('Forward Booking Form is invalid:', this.forwardBookingId);
    }

    this.closeForwardBookingModal();
  }


  onSubmit(): void {
    if (this.customerForm.valid) {

      const formData = this.customerForm.value;

      console.log('Form Submitted success:', formData);

      this.bookingService.updateCustomers(formData).subscribe({
        next: (response) => {
          console.log('Booking Success:', response);
          this.tourCustomers = response.data
          this.setTourCustomersForm(this.tourCustomers);
          this.successMessage = 'Cập nhật thông tin thành công!';
          this.triggerSuccess();

        },
        error: (error) => {
          console.error('Booking Failed:', error);
          this.errorMessage = 'Cập nhật thông tin thất bại!';
          this.triggerError();
        }
      });

    } else {
      console.log('Form Submitted failed:', this.customerForm.value);

    }
  }


  onTransactionSubmit(): void {
    if (this.transactionForm.valid) {
    }
  }


  private formatDate(dateString: string): string {
    return dateString ? new Date(dateString).toISOString().substring(0, 10) : '';
  }


  sendMailForm: FormGroup;


  emailContent: any;


  priceModal: Modal | null = null;
  openPriceModal(): void {
    this.priceModal?.show();
    this.getEmailContent();
  }
  closePriceModal(): void {
    this.priceModal?.hide();
  }


}

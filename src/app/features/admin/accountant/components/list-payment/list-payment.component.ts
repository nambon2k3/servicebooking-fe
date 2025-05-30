import { AfterViewInit, Component, computed, signal } from '@angular/core';
import { TableActionComponent } from './table-action/table-action.component';
import { TableHeaderComponent } from './table-header/table-header.component';
import { TableRowComponent } from './table-row/table-row.component';
import { PaymentRecord } from '../../../../../core/models/tour-accountant.model';
import { TableFooterComponent } from '../../../../../shared/components/table/table-footer/table-footer.component';
import { Router } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
import { Modal } from 'flowbite';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyVndPipe } from '../../../../../shared/pipes/currency-vnd.pipe';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from '../../../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-list-payment',
  imports: [
    CommonModule,
    TableActionComponent,
    TableFooterComponent,
    TableHeaderComponent,
    TableRowComponent,
    ReactiveFormsModule,
    CurrencyVndPipe,
    SpinnerComponent
  ],
  templateUrl: './list-payment.component.html',
  styleUrl: './list-payment.component.css'
})
export class ListPaymentComponent implements AfterViewInit {
  payments: any;
  totalItems = 0;
  page = 0;
  size = 10;
  totalPages = signal(0);
  isLoading: boolean = false;

  keyword = '';
  transactionStatus?: string;
  sortField = 'createdAt';
  sortDirection = 'desc';
  type: string[] = ["PAYMENT", "ADVANCED"];

  receiptForm: FormGroup;

  isBookingLoading: boolean = false;

  selectedBooking: any = null;
  bookings: any[] = [];

  providers: any[] = [];
  
  constructor(
    private router: Router,
    private transactionService: TransactionService,
    private fb: FormBuilder
  ) {
    this.receiptForm = this.fb.group({
      bookingCode: ['', Validators.required],
      receivedBy: ['', Validators.required],
      paidBy: ['Viet Travel', Validators.required],
      category: ['PAYMENT', Validators.required],
      paymentMethod: ['CASH', Validators.required],
      notes: ['Phiếu chi tiền dịch vụ'],
      costAccounts: this.fb.array([]), // Initialize FormArray,
    });


    this.receiptForm.get('bookingCode')?.valueChanges
      .pipe(
        debounceTime(800),
        distinctUntilChanged()
      )
      .subscribe(value => {
        if (value && value.length >= 2) {
          this.isBookingLoading = true;
          if (value !== this.selectedBooking?.booking) {
            this.transactionService.getBookingData(value).subscribe((res: any) => {
              this.bookings = res.data;
              this.isBookingLoading = false;


              console.log(this.bookings)

            }, () => this.isBookingLoading = false);
          } else {
            this.isBookingLoading = false;
          }
        } else {
          this.bookings = [];
          this.isBookingLoading = false
        }
      });

      

  }

  loadProviders(bookingId: number) {
    this.transactionService.getProviderData(bookingId).subscribe((res: any) => {
      this.providers = res.data;
    }
    , () => this.isBookingLoading = false);
  }

  ngOnInit(): void {
    this.loadPayments();
  }


  ngAfterViewInit(): void {
    this.createPaymentModal = new Modal(document.getElementById('create-payment-modal'));
  }

  loadPayments(): void {
    this.isLoading = true;
    this.transactionService.getTransactionByPage(
      this.page,
      this.size,
      this.keyword,
      this.sortField,
      this.sortDirection,
      this.type,
      this.transactionStatus
    ).subscribe({
      next: (response) => {
        this.payments = response.data.items;
        console.log('RECEPITS', this.payments);
        this.isLoading = 
        this.totalItems = response.data.total;
        this.page = response.data.page;
        this.size = response.data.size;
        this.totalPages.set(Math.ceil(this.totalItems / this.size));
        this.isLoading = false;
      },
      error: (error) => {
        console.log(error);
        this.isLoading = false;
      }
    });
  }

  get bookingCode() {
    return this.receiptForm.get('bookingCode');
  }


  onSearch(filters: any): void {
    this.keyword = filters.keyword || '';
    this.transactionStatus = filters.status;
    this.sortDirection = filters.order === '1' ? 'desc' : 'asc';
    this.type = filters.type === ''? ['RECEIPT', 'COLLECTION'] : [filters.type];
    this.page = 0;
    this.loadPayments();
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages()) {
      this.page = newPage;
      this.loadPayments();
    }
  }

  getCurrentDate() {
    return new Date();
  }


  selectBooking(booking: any) {
    this.bookings = [];
    this.selectedBooking = booking;

    this.loadProviders(booking.id);

    this.receiptForm.patchValue({
      bookingCode: booking.bookingCode,
    });
  }

  onSubmit() {
    if (this.receiptForm.valid) {
      const formData = { ...this.receiptForm.value, totalAmount: this.getTotalAmount(), category: 'PAYMENT' };

      console.log('Process Data: ', formData)

      this.transactionService.createTransaction(formData).subscribe({
        next: (response: any) => {
          const receipts = response.data;
          console.log('RECEPITS', receipts);
          this.triggerSuccess();
          this.loadPayments();
        },
        error: (error) => {
          console.log(error);
          this.isLoading = false;
          this.triggerError();
        }
      })



    } else {
      console.log('Invalid: ', this.receiptForm.value);
      this.receiptForm.markAllAsTouched();
    }
  }

  onPageSizeChange(newSize: number): void {
    this.size = newSize;
    this.page = 0;
    this.loadPayments();
  }

  addPayment(): void {
    this.router.navigate(['/accountant/invoice-details']);
  }

  openModal(): void {
    this.createPaymentModal?.show();


    if(this.costAccounts.length === 0) {
      this.addCostAccount();
    }

  }


  addCostAccount() {
    const costAccountGroup = this.fb.group({
      id: [null],
      content: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0)]],
      discount: [0],
      quantity: [1],
      finalAmount: [0], // Initialize finalAmount with amount
      status: ['PENDING']
    });

    // Listen for changes in 'amount' and update 'finalAmount'
    costAccountGroup.get('amount')?.valueChanges.subscribe((newAmount) => {
      costAccountGroup.get('finalAmount')?.setValue(newAmount, { emitEvent: false });
    });

    this.costAccounts.push(costAccountGroup);
  }


  deleteCostAccount(index: number) {
    this.costAccounts.removeAt(index);
  }

  getTotalAmount(): number {
    return this.costAccounts.value.reduce((sum: number, row: any) => sum + row.amount * row.quantity, 0);
  }

  get costAccounts(): FormArray {
    return this.receiptForm.get('costAccounts') as FormArray;
  }

  showSuccess: boolean = false;
  showError: boolean = false;

  createPaymentModal: Modal | null = null;


  triggerSuccess() {
    this.showSuccess = true;


    this.createPaymentModal?.hide();

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

}

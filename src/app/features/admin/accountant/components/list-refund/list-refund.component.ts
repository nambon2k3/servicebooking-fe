import { AfterViewInit, Component, computed, signal } from '@angular/core';
import { TableActionComponent } from './table-action/table-action.component';
import { TableHeaderComponent } from './table-header/table-header.component';
import { TableRowComponent } from './table-row/table-row.component';
import { RefundRecord } from '../../../../../core/models/tour-accountant.model';
import { TableFooterComponent } from '../../../../../shared/components/table/table-footer/table-footer.component';
import { Router } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
import { Modal } from 'flowbite';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CommonModule } from '@angular/common';
import { CurrencyVndPipe } from '../../../../../shared/pipes/currency-vnd.pipe';
import { SpinnerComponent } from '../../../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-list-refund',
  imports: [
    TableActionComponent,
    TableFooterComponent,
    TableHeaderComponent,
    TableRowComponent,
    CommonModule,
    CurrencyVndPipe,
    ReactiveFormsModule,
    SpinnerComponent
  ],
  templateUrl: './list-refund.component.html',
  styleUrl: './list-refund.component.css'
})
export class ListRefundComponent implements AfterViewInit {
  refunds: any;
  totalItems = 0;
  page = 0;
  size = 10;
  totalPages = signal(0);
  isLoading: boolean = false;

  keyword = '';
  transactionStatus?: string;
  sortField = 'createdAt';
  sortDirection = 'desc';

  showSuccess: boolean = false;
  showError: boolean = false;

  createRefundModal: Modal | null = null;

  refundForm: FormGroup;

  isBookingLoading: boolean = false;
  bookings: any[] = [];
  selectedBooking: any = null;


  ngAfterViewInit(): void {
    this.createRefundModal = new Modal(document.getElementById('create-refund-modal'));
  }

  constructor(
    private router: Router,
    private transactionService: TransactionService,
    private fb: FormBuilder
  ) {

    this.refundForm = this.fb.group({
      bookingCode: ['', Validators.required],
      receivedBy: ['', Validators.required],
      paidBy: ['Viet Travel', Validators.required],
      category: [{ value: 'RECEIPT', disabled: true }, Validators.required],
      paymentMethod: ['CASH', Validators.required],
      notes: ['Phiếu hoàn tiền cho khách'],
      costAccounts: this.fb.array([]), // Initialize FormArray,
    });


    this.refundForm.get('bookingCode')?.valueChanges
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

  ngOnInit(): void {
    this.loadRefunds();
  }

  loadRefunds(): void {
    this.isLoading = true;
    this.transactionService.getTransactionByPage(
      this.page,
      this.size,
      this.keyword,
      this.sortField,
      this.sortDirection,
      ['REFUND'],
      this.transactionStatus
    ).subscribe({
      next: (response) => {
        this.refunds = response.data.items;
        console.log('REFUND', this.refunds);
        this.isLoading = false;
        this.totalItems = response.data.total;
        this.page = response.data.page;
        this.size = response.data.size;
        this.totalPages.set(Math.ceil(this.totalItems / this.size));
      },
      error: (error) => {
        console.log(error);
        this.isLoading = false;
      }
    });
  }

  onSearch(filters: any): void {
    this.keyword = filters.keyword || '';
    this.transactionStatus = filters.status;
    this.sortDirection = filters.order === '1' ? 'desc' : 'asc';
    this.page = 0;
    this.loadRefunds();
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages()) {
      this.page = newPage;
      this.loadRefunds();
    }
  }

  onPageSizeChange(newSize: number): void {
    this.size = newSize;
    this.page = 0;
    this.loadRefunds();
  }

  openModal(): void {
    this.createRefundModal?.show();
    if(this.costAccounts.length === 0) {
      this.addCostAccount();
    }
  }


  addCostAccount() {
    const costAccountGroup = this.fb.group({
      id: [null],
      content: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0)]],
      discount: [0, [Validators.required, Validators.min(0)]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      finalAmount: [0,  [Validators.required, Validators.min(0)]], // Initialize finalAmount with amount
      status: ['PENDING']
    });

    // Listen for changes in 'amount' and update 'finalAmount'
    costAccountGroup.get('amount')?.valueChanges.subscribe((newAmount) => {

      const quantity = costAccountGroup.get('quantity')?.value || 1;
      const discount = costAccountGroup.get('discount')?.value || 0;

      costAccountGroup.get('finalAmount')?.setValue((newAmount! * quantity) * (100 - discount)/100.0, { emitEvent: false });
    });


    costAccountGroup.get('discount')?.valueChanges.subscribe((newDiscount) => {

      const quantity = costAccountGroup.get('quantity')?.value || 1;
      const amount = costAccountGroup.get('amount')?.value || 0;

      costAccountGroup.get('finalAmount')?.setValue((amount! * quantity) * (100 - newDiscount!)/100.0, { emitEvent: false });
    });

    this.costAccounts.push(costAccountGroup);
  }


  get bookingCode() {
    return this.refundForm.get('bookingCode');
  }


  deleteCostAccount(index: number) {
    this.costAccounts.removeAt(index);
  }

  getTotalAmount(): number {
    return this.costAccounts.value.reduce((sum: number, row: any) => sum + (row.amount * row.quantity) * (100 - row.discount)/100.0, 0);
  }

  get costAccounts(): FormArray {
    return this.refundForm.get('costAccounts') as FormArray;
  }

  getCurrentDate() {
    return new Date();
  }

  selectBooking(booking: any) {
    this.bookings = [];
    this.selectedBooking = booking;

    this.refundForm.patchValue({
      bookingCode: booking.bookingCode,
      receivedBy: booking.bookedPerson.fullName
    });
  }


  onSubmit() {
    if(this.refundForm.valid) {
      const formData = { ...this.refundForm.value, totalAmount: this.getTotalAmount(), category: 'REFUND' };

      console.log('Process Data: ', formData)

      this.transactionService.createTransaction(formData).subscribe({
        next: (response: any) => {
          const refunds = response.data;
          console.log('REFUNDS', refunds);
          this.triggerSuccess();
          this.loadRefunds();
        },
        error: (error) => {
          console.log(error);
          this.isLoading = false;
          this.triggerError();
        }
      })

      

    } else {
      console.log('Invalid: ', this.refundForm.value);
      this.refundForm.markAllAsTouched();
    }
  }


  triggerSuccess() {
    this.showSuccess = true;


    this.createRefundModal?.hide();

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

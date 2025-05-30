import { AfterViewInit, Component, computed, signal } from '@angular/core';
import { TableActionComponent } from './table-action/table-action.component';
import { TableHeaderComponent } from './table-header/table-header.component';
import { TableRowComponent } from './table-row/table-row.component';
import { ReceiptRecord } from '../../../../../core/models/tour-accountant.model';
import { TableFooterComponent } from '../../../../../shared/components/table/table-footer/table-footer.component';
import { Router } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CurrencyVndPipe } from "../../../../../shared/pipes/currency-vnd.pipe";
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Modal } from 'flowbite';
import { SpinnerComponent } from '../../../../../shared/components/spinner/spinner.component';
import { AddTransportationComponent } from "../../../head-of-business/components/tour-discount/add-transportation/add-transportation.component";

@Component({
  selector: 'app-list-receipt',
  imports: [
    CommonModule,
    TableActionComponent,
    TableFooterComponent,
    TableHeaderComponent,
    TableRowComponent,
    ReactiveFormsModule,
    CurrencyVndPipe,
    SpinnerComponent,
  ],
  templateUrl: './list-receipt.component.html',
  styleUrl: './list-receipt.component.css'
})
export class ListReceiptComponent implements AfterViewInit {
  receipts: any;
  totalItems = 0;
  page = 0;
  size = 10;
  totalPages = signal(0);
  isLoading: boolean = false;

  keyword = '';
  transactionStatus?: string;
  sortField = 'createdAt';
  sortDirection = 'desc';
  type = ['RECEIPT', 'COLLECTION'];

  isBookingLoading: boolean = false;


  bookings: any[] = [];

  createReceiptModal: Modal | null = null;

  ngAfterViewInit(): void {
    this.createReceiptModal = new Modal(document.getElementById('create-receipt-modal'));
  }

  constructor(
    private router: Router,
    private transactionService: TransactionService,
    private fb: FormBuilder
  ) {

    this.receiptForm = this.fb.group({
      bookingCode: ['', Validators.required],
      receivedBy: ['Viet Travel', Validators.required],
      paidBy: ['', Validators.required],
      category: ['RECEIPT' , Validators.required],
      paymentMethod: ['CASH', Validators.required],
      notes: ['Phiếu thu tiền của khách'],
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

  ngOnInit(): void {
    this.loadReceipts();
  }


  showSuccess: boolean = false;
  showError: boolean = false;

  loadReceipts(): void {
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
        this.receipts = response.data.items;
        console.log('RECEPITS', this.receipts);
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
    this.type = filters.type === ''? ['RECEIPT', 'COLLECTION'] : [filters.type];
    this.page = 0;
    this.loadReceipts();
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages()) {
      this.page = newPage;
      this.loadReceipts();
    }
  }

  onPageSizeChange(newSize: number): void {
    this.size = newSize;
    this.page = 0;
    this.loadReceipts();
  }

  openModal(): void {
    this.createReceiptModal?.show();
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
      quantity: [1, [Validators.required, Validators.min(1)]],
      finalAmount: [0], // Initialize finalAmount with amount
      status: ['PENDING']
    });

    // Listen for changes in 'amount' and update 'finalAmount'
    costAccountGroup.get('amount')?.valueChanges.subscribe((newAmount) => {
      costAccountGroup.get('finalAmount')?.setValue(newAmount, { emitEvent: false });
    });

    this.costAccounts.push(costAccountGroup);
  }

  selectedBooking: any;

  get bookingCode() {
    return this.receiptForm.get('bookingCode');
  }


  deleteCostAccount(index: number) {
    this.costAccounts.removeAt(index);
  }

  getTotalAmount(): number {
    return this.costAccounts.value.reduce((sum: number, row: any) => sum + Number(row.amount || 0), 0);
  }
  

  get costAccounts(): FormArray {
    return this.receiptForm.get('costAccounts') as FormArray;
  }

  getCurrentDate() {
    return new Date();
  }


  receiptForm: FormGroup;


  selectBooking(booking: any) {
    this.bookings = [];
    this.selectedBooking = booking;

    this.receiptForm.patchValue({
      bookingCode: booking.bookingCode,
      paidBy: booking.bookedPerson.fullName
    });
  }


  onSubmit() {
    if (this.receiptForm.valid) {
      const formData = { ...this.receiptForm.value, totalAmount: this.getTotalAmount() };

      console.log('Process Data: ', formData)

      this.transactionService.createTransaction(formData).subscribe({
        next: (response: any) => {
          const receipts = response.data;
          console.log('RECEPITS', receipts);
          this.triggerSuccess();
          this.loadReceipts();
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

  triggerSuccess() {
    this.showSuccess = true;


    this.createReceiptModal?.hide();

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

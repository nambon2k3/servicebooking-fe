import { AfterViewInit, Component } from '@angular/core';
import { TourService } from '../../services/tour.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CurrencyVndPipe } from "../../../../../shared/pipes/currency-vnd.pipe";
import { SpinnerComponent } from '../../../../../shared/components/spinner/spinner.component';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Modal } from 'flowbite';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-booking-settlement',
  imports: [
    CommonModule,
    CurrencyVndPipe,
    SpinnerComponent,
    ReactiveFormsModule,

  ],
  templateUrl: './booking-settlement.component.html',
  styleUrl: './booking-settlement.component.css'
})
export class BookingSettlementComponent implements AfterViewInit {

  tourScheduleSettlement: any;

  isLoading: boolean = false;

  totalSeatsBookings = 0;

  transactionForm: FormGroup;

  transactionModal: Modal | null = null;
  transactionModalId: string = 'transaction-modal';

  selectedTransaction: any = null;

  selectedBookingCode: string | null = null;

  createReceiptModal: Modal | null = null;
  createPaymentModal: Modal | null = null;
  createRefundModal: Modal | null = null;

  paymentForm: FormGroup;
  refundForm: FormGroup;

  constructor(
    private tourService: TourService,
    private router: Router,
    private fb: FormBuilder,
    private transactionService: TransactionService // Assuming you have a service for transactions

  ) {
    this.transactionForm = this.fb.group({
      id: ['', Validators.required],
      amount: ['', Validators.required],
      category: ['', Validators.required],
      paidBy: ['', Validators.required],
      receivedBy: ['', Validators.required],
      paymentMethod: ['', Validators.required],
      notes: [''],
      createdAt: [{ value: '', disabled: true }],
      costAccounts: this.fb.array([]) // Array chứa các dòng cost
    });

    this.refundForm = this.fb.group({
      bookingCode: ['', Validators.required],
      receivedBy: ['', Validators.required],
      paidBy: ['Viet Travel', Validators.required],
      category: ['REFUND', Validators.required],
      paymentMethod: ['CASH', Validators.required],
      notes: ['Phiếu hoàn tiền cho khách'],
      costAccounts: this.fb.array([]), // Initialize FormArray,
    });

    

    this.paymentForm = this.fb.group({
      bookingCode: ['', Validators.required],
      receivedBy: ['', Validators.required],
      paidBy: ['Viet Travel', Validators.required],
      category: ['PAYMENT', Validators.required],
      paymentMethod: ['CASH', Validators.required],
      notes: ['Phiếu chi tiền dịch vụ'],
      costAccounts: this.fb.array([]), // Initialize FormArray,
    });


    this.receiptForm = this.fb.group({
      bookingCode: ['', Validators.required],
      receivedBy: ['Viet Travel', Validators.required],
      paidBy: ['', Validators.required],
      category: ['RECEIPT', Validators.required],
      paymentMethod: ['CASH', Validators.required],
      notes: ['Phiếu thu tiền của khách'],
      costAccounts: this.fb.array([]), // Initialize FormArray,
    });
  }

  ngAfterViewInit(): void {
    const modalElement = document.getElementById(this.transactionModalId);
    if (modalElement) {
      this.transactionModal = new Modal(modalElement);
    }

    this.createReceiptModal = new Modal(document.getElementById('create-receipt-modal'));
    this.createPaymentModal = new Modal(document.getElementById('create-payment-modal'));
    this.createRefundModal = new Modal(document.getElementById('create-refund-modal'));
  }

  deleteCostAccount(index: number) {
    this.costAccounts.removeAt(index);
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
      const quantity = costAccountGroup.get('quantity')?.value || 1;
      const discount = costAccountGroup.get('discount')?.value || 0;

      costAccountGroup.get('finalAmount')?.setValue((newAmount! * quantity) * (100 - discount!) / 100.0, { emitEvent: true });
    });

    costAccountGroup.get('quantity')?.valueChanges.subscribe((newQuantity) => {
      const amount = costAccountGroup.get('amount')?.value || 1;
      const discount = costAccountGroup.get('discount')?.value || 0;

      costAccountGroup.get('finalAmount')?.setValue((Number(amount) * Number(newQuantity)) * (100 - Number(discount)) / 100.0, { emitEvent: false });
    });

    costAccountGroup.get('discount')?.valueChanges.subscribe((newDiscount) => {

      const quantity = costAccountGroup.get('quantity')?.value || 1;
      const amount = costAccountGroup.get('amount')?.value || 0;

      costAccountGroup.get('finalAmount')?.setValue((amount! * quantity) * (100 - newDiscount!) / 100.0, { emitEvent: true });
    });

    this.costAccounts.push(costAccountGroup);
  }

  openTransactionModal(transaction: any) {
    this.transactionForm.reset(); // Reset form fields
    this.transactionForm.patchValue(transaction); // Set the values of the form fields


    this.selectedBookingCode = this.tourScheduleSettlement?.bookings?.find((booking: any) => booking.transactions?.some((t: any) => t.id === transaction.id))?.bookingCode || null;

    this.transactionForm.patchValue({
      id: transaction.id,
      amount: transaction.amount,
      category: transaction.category,
      paidBy: transaction.paidBy,
      receivedBy: transaction.receivedBy,
      paymentMethod: transaction.paymentMethod,
      notes: transaction.notes,
      createdAt: transaction.createdAt
    });

    const costAccountsArray = this.transactionForm.get('costAccounts') as FormArray;
    costAccountsArray.clear(); // Clear existing entries if any

    transaction.costAccount.forEach((account: any) => {

      const costAccountGroup = this.fb.group(account);

      // Listen for changes in 'amount' and update 'finalAmount'
      costAccountGroup.get('amount')?.valueChanges.subscribe((newAmount) => {
        const quantity = costAccountGroup.get('quantity')?.value || 1;
        const discount = costAccountGroup.get('discount')?.value || 0;

        costAccountGroup.get('finalAmount')?.setValue((Number(newAmount) * Number(quantity)) * (100 - Number(discount)) / 100.0, { emitEvent: false });
      });

      costAccountGroup.get('quantity')?.valueChanges.subscribe((newQuantity) => {
        const amount = costAccountGroup.get('amount')?.value || 1;
        const discount = costAccountGroup.get('discount')?.value || 0;

        costAccountGroup.get('finalAmount')?.setValue((Number(amount) * Number(newQuantity)) * (100 - Number(discount)) / 100.0, { emitEvent: false });
      });

      costAccountGroup.get('discount')?.valueChanges.subscribe((newDiscount) => {

        const quantity = Number(costAccountGroup.get('quantity')?.value || 1);
        const amount = Number(costAccountGroup.get('amount')?.value || 0);

        costAccountGroup.get('finalAmount')?.setValue((amount * quantity) * (100 - Number(newDiscount)) / 100.0, { emitEvent: false });
      });

      costAccountsArray.push(costAccountGroup);
    });


    console.log('Transaction:', this.transactionForm.value);


    if (this.transactionModal) {
      this.transactionModal.show();
    }
    this.selectedTransaction = transaction; // Set the selected transaction
  }

  getTotalAmount(): number {
    return this.costAccounts.value.reduce((sum: number, row: any) => sum + row.amount * row.quantity * (100 - row.discount) / 100.0, 0);
  }

  closeTransactionModal() {
    if (this.transactionModal) {
      this.transactionModal.hide();
    }
  }

  get costAccounts(): FormArray {
    return this.transactionForm.get('costAccounts') as FormArray;
  }


  onSave() {
    if (this.transactionForm.valid) {
      const formData = { ...this.transactionForm.value, totalAmount: this.getTotalAmount() };
      console.log("Form Submitted!", formData);
      this.isLoading = true; // Start loading
      this.transactionService.updateTransaction(formData).subscribe({
        next: (response) => {
          this.isLoading = false; // Stop loading
          console.log('Transaction updated successfully:', response);
          this.triggerSuccess(); // Show success message
          this.getSettlementDetails(this.tourScheduleSettlement.id); // Refresh the settlement details
        },
        error: (error) => {
          this.isLoading = false; // Stop loading
          console.error('Error updating transaction:', error);
          this.triggerError(); // Show error message
        }
      });

      this.transactionForm.reset(); // Reset form fields
      this.closeTransactionModal(); // Close the modal
    } else {
      this.transactionForm.markAllAsTouched(); // Mark all fields as touched to show validation errors
    }
  }

  showSuccess: boolean = false;

  triggerSuccess() {
    this.showSuccess = true;


    // Hide warning after 3 seconds
    setTimeout(() => {
      this.showSuccess = false;
    }, 4000);
  }

  scheduleId: number = 0;


  ngOnInit(): void {

    const tourScheduleId = Number(this.router.url.split('/').pop());
    this.scheduleId = tourScheduleId;
    console.log('Tour Schedule ID:', tourScheduleId);

    // Initialization logic here\
    this.getSettlementDetails(tourScheduleId);

  }

  getSettlementDetails(tourScheduleId: number) {
    this.isLoading = true;
    this.tourService.getSettlementDetails(tourScheduleId).subscribe(
      (response) => {
        console.log('Settlement Details:', response);
        // Handle the response data as needed
        this.tourScheduleSettlement = response.data;

        this.setReceiptStatistic();
        this.setTransactionArray();
        this.calculateActualPaidAmounts();

        console.log('After: ', this.tourScheduleSettlement);
        console.log('Receipts:', this.receipts);
        console.log('Payments:', this.payments);
        console.log('Refunds:', this.refunds);
        this.checkAllTransactionsCompleted();
        this.getTotalSeatsBookings();

        this.receiptForm.patchValue({
          bookingCode: this.tourScheduleSettlement?.bookings[0]?.bookingCode,
          paidBy: this.tourScheduleSettlement?.bookings[0]?.customer?.fullName,
        });

        this.paymentForm.patchValue({
          bookingCode: this.tourScheduleSettlement?.bookings[0]?.bookingCode,
        });

        this.refundForm.patchValue({
          bookingCode: this.tourScheduleSettlement?.bookings[0]?.bookingCode,
          receivedBy: this.tourScheduleSettlement?.bookings[0]?.customer?.fullName,
        });

        this.getProviderByScheduleId();

        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching settlement details:', error);
        this.isLoading = false;
        // Handle the error as needed
      }
    );
  }

  getTotalSeatsBookings() {
    this.totalSeatsBookings = this.tourScheduleSettlement.bookings
      ?.filter((booking: any) => booking.status === 'SUCCESS')
      .reduce((sum: number, booking: any) => sum + (booking.seats || 0), 0);
  }

  calculateActualPaidAmounts() {
    if (!this.tourScheduleSettlement?.bookings) return;

    this.tourScheduleSettlement.bookings.forEach((booking: any) => {
      booking.transactions?.forEach((transaction: any) => {
        const totalPaid = transaction.costAccount
          ?.filter((item: any) => item.status === 'PAID')
          .reduce((sum: number, item: any) => sum + item.finalAmount, 0);

        transaction.actualPaid = totalPaid || 0;
      });
    });
  }

  receipts: any[] = [];
  payments: any[] = [];
  refunds: any[] = [];


  setTransactionArray(bookingCode?: string) {
    this.receipts = [];
    this.payments = [];
    this.refunds = [];

    this.tourScheduleSettlement.bookings.forEach((booking: any) => {
      const matchBooking = !bookingCode || booking.bookingCode === bookingCode;

      if (matchBooking) {
        booking.transactions.forEach((transaction: any) => {
          if (transaction.category === 'RECEIPT' || transaction.category === 'COLLECTION') {
            this.receipts.push(transaction);
          } else if (transaction.category === 'PAYMENT' || transaction.category === 'ADVANCED') {
            this.payments.push(transaction);
          } else if (transaction.category === 'REFUND') {
            this.refunds.push(transaction);
          }
        });
      }
    });
  }

  onBookingSelectChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    const bookingCode = value || null;
    this.setTransactionArray(bookingCode!);

    console.log('Selected Booking Code:', bookingCode);
  }

  allTransactionsCompleted: boolean = false;

  checkAllTransactionsCompleted() {
    const allTransactionsCompleted: boolean = this.tourScheduleSettlement.bookings
      ?.every((booking: any) =>
        booking.transactions?.every(
          (transaction: any) => transaction.transactionStatus === 'PAID' || transaction.transactionStatus === 'CANCELLED'
        )
      ) ?? false;
    this.allTransactionsCompleted = allTransactionsCompleted;
  }

  openPaymentModal() {
    this.createPaymentModal?.show();
    if (this.costPaymentAccounts.length === 0) {
      this.addCostPaymentAccount();
    }
  }


  setReceiptStatistic() {
    this.tourScheduleSettlement.bookings = this.tourScheduleSettlement.bookings.map((booking: any) => {
      const totalRevenue = booking.transactions
        ?.filter((t: any) => t.category === 'RECEIPT')
        .reduce((sum: any, t: any) => sum + t.amount, 0) || 0;

      const actualRevenue = booking.transactions
        ?.filter((t: any) => t.category === 'RECEIPT')
        .reduce((sum: number, t: any) => {
          // Sum the finalAmount of all costAccount items with status 'PAID'
          const paidAmount = t.costAccount
            ?.filter((account: any) => account.status === 'PAID')
            .reduce((accountSum: number, account: any) => accountSum + account.finalAmount, 0) || 0;

          return sum + paidAmount;
        }, 0) || 0;

      return {
        ...booking,
        totalRevenue,
        actualRevenue
      };
    });


  }



  finishSettlement() {
    this.isLoading = true;
    this.tourService.finishSettlement(this.tourScheduleSettlement.id).subscribe(
      (response: any) => {
        console.log('Settlement finished successfully:', response);
        this.isLoading = false;
        // Handle success response
        this.showFinishSettlement();

      },
      (error: any) => {
        console.error('Error finishing settlement:', error);
        this.isLoading = false;
        // Handle error response
      }
    );
  }



  success: boolean = false;
  second: number = 2;


  showFinishSettlement() {
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
      this.router.navigate(['/accountant/list-tour']); // Navigate to the desired route
    }, 2000);
  }


  goBack() {
    this.router.navigate(['/accountant/list-tour']);
  }



  receiptForm: FormGroup;


  //test
  get costReceiptAccounts(): FormArray {
    return this.receiptForm.get('costAccounts') as FormArray;
  }


  get costPaymentAccounts(): FormArray {
    return this.paymentForm.get('costAccounts') as FormArray;
  }

  get costRefundAccounts(): FormArray {
    return this.refundForm.get('costAccounts') as FormArray;
  }


  onPaymentBookingSelectChange(event: any) {
    const value = (event.target as HTMLSelectElement).value;
    const bookingCode = value || null;
    const booking = this.getBookingByBookingCode(bookingCode!);
    this.paymentForm.patchValue({
      bookingCode: bookingCode,
    });

    console.log('Selected Booking Code:', booking);
  }



  openReceiptModal(): void {
    this.createReceiptModal?.show();
    if (this.costReceiptAccounts.length === 0) {
      this.addReceiptCostAccount();
    }
  }

  getCurrentDate() {
    return new Date();
  }


  addReceiptCostAccount() {

    console.log('Add Receipt Cost Account');

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

    this.costReceiptAccounts.push(costAccountGroup);
  }

  deleteReceiptCostAccount(index: number) {
    this.costReceiptAccounts.removeAt(index);
  }

  getReceiptTotalAmount(): number {
    return this.costReceiptAccounts.value.reduce((sum: number, row: any) => sum + Number(row.amount || 0), 0);
  }


  getBookingByBookingCode(bookingCode: string): any {
    const booking = this.tourScheduleSettlement.bookings.find((b: any) => b.bookingCode === bookingCode);
    return booking || null;
  }

  onReceiptBookingSelectChange(event: any) {

    const value = (event.target as HTMLSelectElement).value;
    const bookingCode = value || null;
    const booking = this.getBookingByBookingCode(bookingCode!);
    this.receiptForm.patchValue({
      bookingCode: bookingCode,
      paidBy: booking?.customer?.fullName,
    });

    

    console.log('Selected Booking Code:', booking);
  }

  showError: boolean = false;

  triggerError() {
    this.showError = true;


    // Hide warning after 3 seconds
    setTimeout(() => {
      this.showError = false;
    }, 4000);
  }


  onReceiptCreate() {
    if (this.receiptForm.valid) {
      const formData = { ...this.receiptForm.value, totalAmount: this.getReceiptTotalAmount() };

      console.log('Process Data: ', formData)

      this.isLoading = true; // Start loading

      this.transactionService.createTransaction(formData).subscribe({
        next: (response: any) => {
          const receipts = response.data;
          console.log('RECEPITS', receipts);
          this.getSettlementDetails(this.tourScheduleSettlement.id); // Refresh the settlement details
          this.triggerSuccess(); // Show success message
          this.receiptForm.reset(); // Reset form fields
        },
        error: (error) => {
          console.log(error);
          this.isLoading = false;
          this.triggerError();
          
        }
      })

      this.createReceiptModal?.hide();


    } else {
      console.log('Invalid: ', this.receiptForm.value);
      this.receiptForm.markAllAsTouched();
    }
  }


  onPaymentCreate() {
    if (this.paymentForm.valid) {
      const formData = { ...this.paymentForm.value, totalAmount: this.getTotalPaymentAmount()};

      console.log('Process Data: ', formData)

      this.transactionService.createTransaction(formData).subscribe({
        next: (response: any) => {
          const payments = response.data;
          console.log('PAYMENT', payments);
          this.triggerSuccess();
          this.getSettlementDetails(this.tourScheduleSettlement.id); // Refresh the settlement details
          this.paymentForm.reset(); // Reset form fields
        },
        error: (error) => {
          console.log(error);
          this.isLoading = false;
          this.triggerError();
        }
      })

      this.createPaymentModal?.hide();


    } else {
      console.log('Invalid: ', this.paymentForm.value);
      this.paymentForm.markAllAsTouched();
    }
  }



  addCostPaymentAccount() {
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

    this.costPaymentAccounts.push(costAccountGroup);
  }


  deleteCostPaymentAccount(index: number) {
    this.costPaymentAccounts.removeAt(index);
  }

  getTotalPaymentAmount(): number {
    return this.costPaymentAccounts.value.reduce((sum: number, row: any) => sum + row.amount * row.quantity, 0);
  }


  onRefundCreate() {
    if(this.refundForm.valid) {
      const formData = { ...this.refundForm.value, totalAmount: this.getTotalRefundAmount(), category: 'REFUND' };

      console.log('Process Data: ', formData)

      this.transactionService.createTransaction(formData).subscribe({
        next: (response: any) => {
          const refunds = response.data;
          console.log('REFUNDS', refunds);
          this.triggerSuccess();
          this.getSettlementDetails(this.tourScheduleSettlement.id); // Refresh the settlement details
          this.refundForm.reset(); // Reset form fields
        },
        error: (error) => {
          console.log(error);
          this.isLoading = false;
          this.triggerError();
        }
      })

      this.createRefundModal?.hide();

      

    } else {
      console.log('Invalid: ', this.refundForm.value);
      this.refundForm.markAllAsTouched();
    }
  }

  openRefundModal() {
    this.createRefundModal?.show();

    if(this.costRefundAccounts.length === 0) {
      this.addRefundCostAccount();

    }
  }


  providers: any[] = [];

  getProviderByScheduleId() {
    this.providers = [];
    this.transactionService.getProviderByScheduleId(this.scheduleId).subscribe(
      (response: any) => {
        console.log('Provider:', response);
        // Handle the response data as needed
        this.providers = response.data;
        console.log('Providers:', this.providers);
      },
      (error) => {
        console.error('Error fetching provider:', error);
        // Handle the error as needed
      }
    );

  }

  onRefundBookingSelectChange(event: any) {
    const value = (event.target as HTMLSelectElement).value;
    const bookingCode = value || null;
    const booking = this.getBookingByBookingCode(bookingCode!);
    this.refundForm.patchValue({
      bookingCode: bookingCode,
      paidBy: booking?.customer?.fullName,
    });

    console.log('Selected Booking Code:', booking);
  }


  getTotalRefundAmount(): number {
    return this.costRefundAccounts.value.reduce((sum: number, row: any) => sum + (row.amount * row.quantity) * (100 - row.discount)/100.0, 0);
  }

  deleteRefundCostAccount(index: number) {
    this.costRefundAccounts.removeAt(index);
  }

  addRefundCostAccount() {
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

    this.costRefundAccounts.push(costAccountGroup);
  }

}

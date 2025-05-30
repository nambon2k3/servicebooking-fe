import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CurrencyVndPipe } from '../../../../../shared/pipes/currency-vnd.pipe';
import { TransactionService } from '../../services/transaction.service';
import { create } from 'domain';
import { stat } from 'fs';
import { SpinnerComponent } from '../../../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-post-receipt',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CurrencyVndPipe,
    CommonModule,
    SpinnerComponent
  ],
  templateUrl: './post-receipt.component.html',
  styleUrls: ['./post-receipt.component.css']
})
export class PostReceiptComponent {
  receiptForm: FormGroup;

  transaction: any;

  isLoading: boolean = false;

  showSuccess: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private transactionService: TransactionService
  ) {
    this.receiptForm = this.fb.group({
      id: [null, Validators.required],
      receivedBy: ['Viet Travel', Validators.required],
      paidBy: ['Lan Than', Validators.required],
      category: [{ value: 'Pay', disabled: true }, Validators.required],
      paymentMethod: ['CASH', Validators.required],
      notes: ['Viet Travel'],
      costAccounts: this.fb.array([]) // Initialize FormArray
    });

  }

  receiptId: number | null = null;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.receiptId = params['id'];
    });

    if (this.receiptId) {
      this.getTranstactionById(this.receiptId);
    } else {
      console.log('No receipt ID provided in query params.');
    }
  }

  getTranstactionById(id: number) {
    this.isLoading = true; // Start loading
    // Call the service to get transaction by ID
    this.transactionService.getTranscationById(id).subscribe(
      (response) => {
        this.isLoading = false; // Stop loading
        this.transaction = response.data;
        console.log('Transaction data:', response);
        // // Populate the form with the received data
        this.receiptForm.patchValue({
          bookingCode: this.transaction.booking.bookingCode,
          paidBy: this.transaction.paidBy,
          receivedBy: this.transaction.receivedBy,
          createdAt: this.transaction.createdAt.split('T')[0],
          paymentMethod: this.transaction.paymentMethod,
          category: this.transaction.category,
          notes: this.transaction.notes,
          id: this.transaction.id,
        });

        const costAccountsArray = this.receiptForm.get('costAccounts') as FormArray;
        costAccountsArray.clear(); // Clear existing entries if any

        this.transaction.costAccount.forEach((account: any) => {

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

        console.log('Form values after patching:', this.receiptForm.value);

      },
      (error) => {
        console.error('Error fetching transaction:', error);
      }
    );

  }

  get costAccounts(): FormArray {
    return this.receiptForm.get('costAccounts') as FormArray;
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

  deleteCostAccount(index: number) {
    this.costAccounts.removeAt(index);
  }

  getTotalAmount(): number {
    return this.costAccounts.value.reduce((sum: number, row: any) => sum + row.amount * row.quantity * (100 - row.discount) / 100.0, 0);
  }

  onCancel() {
    if (this.transaction.category == 'RECEIPT') {
      this.router.navigate(['/accountant/list-receipt']);

    } else {
      this.router.navigate(['/accountant/list-payment']);
    }
  }

  onSave() {
    if (this.receiptForm.valid) {
      const formData = { ...this.receiptForm.value, totalAmount: this.getTotalAmount() };
      console.log("Form Submitted!", formData);
      this.isLoading = true; // Start loading
      this.transactionService.updateTransaction(formData).subscribe({
        next: (response) => {
          this.isLoading = false; // Stop loading
          console.log('Transaction updated successfully:', response);
          this.triggerSuccess(); // Show success message
          this.getTranstactionById(this.receiptId!); // Refresh the transaction data
        },
        error: (error) => {
          this.isLoading = false; // Stop loading
          console.error('Error updating transaction:', error);
        }
      });
    } else {
      this.receiptForm.markAllAsTouched(); // Mark all fields as touched to show validation errors
    }
  }

  triggerSuccess() {
    this.showSuccess = true;


    // Hide warning after 3 seconds
    setTimeout(() => {
      this.showSuccess = false;
    }, 4000);
  }

}

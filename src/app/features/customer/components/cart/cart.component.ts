import { AfterViewInit, Component } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { UserStorageService } from '../../../../core/services/user-storage/user-storage.service';
import { h } from '@fullcalendar/core/preact.js';
import { CommonModule, DatePipe } from '@angular/common';
import { CurrencyVndPipe } from "../../../../shared/pipes/currency-vnd.pipe";
import { Modal } from 'flowbite';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-cart',
  imports: [
    CommonModule,
    CurrencyVndPipe,
    DatePipe,
    ReactiveFormsModule,
    SpinnerComponent,
    RouterModule
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements AfterViewInit {

  carts: any;
  isLoading: boolean = false;


  hotels: any;
  meals: any;
  activities: any;

  serviceModal: Modal | null = null;


  cartItemForm: FormGroup;

  selectedCartItem: any;


  constructor(
    private cartService: CartService,
    private userStorageService: UserStorageService,
    private fb: FormBuilder,
    private router: Router,
  ) {

    this.cartItemForm = this.fb.group({
      cartItemId: ['', Validators.required],
      checkInDate: ['', Validators.required],
      checkOutDate: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });

  }

  ngOnInit(): void {
    this.loadCartDetails();
  }

  ngAfterViewInit() {
    this.serviceModal = new Modal(document.getElementById('authentication-modal'));
  }

  onSubmit(): void {
    if (this.cartItemForm.valid) {
      console.log('Updated booking:', this.cartItemForm.value);

      const formData = this.cartItemForm.value;
      this.cartService.updateCartItem(formData).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          if (response.code === 200 && response.data) {
            this.loadCartDetails()
            this.triggerSuccess()
            this.closeServiceModal();

          }
        },
        error: (err: any) => {
          this.isLoading = false;
          console.error('Error fetching cart details', err);
        }
      })

    } else {
      this.cartItemForm.markAllAsTouched()
    }
  }



  openServiceModal(cartItem: any) {
    if (this.serviceModal) {
      this.serviceModal.show();
      this.selectedCartItem = cartItem;

      this.cartItemForm.patchValue({
        cartItemId: cartItem.id,
        checkInDate: this.toDateTimeLocal(cartItem.checkInDate),
        checkOutDate: this.toDateTimeLocal(cartItem.checkOutDate),
        quantity: cartItem.quantity
      })

    }
  }

  toDateTimeLocal(date: string | Date): string {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); // đảm bảo đúng múi giờ
    return d.toISOString().slice(0, 16); // lấy yyyy-MM-ddTHH:mm
  }


  closeServiceModal() {
    if (this.serviceModal) {
      this.serviceModal.hide();
    }
  }


  deleteCartItem(cartItemId: number) {
    this.cartService.deleteCartItem(cartItemId).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.code === 200 && response.data) {
          this.loadCartDetails()
          this.triggerSuccess();
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error fetching cart details', err);
      },
    });
  }

  grandTotal: number = 0;


  loadCartDetails() {
    this.isLoading = true;
    const userId = this.userStorageService.getUserId() || 1;
    this.cartService.getCarts(userId).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.code === 200 && response.data) {
          this.carts = response.data;
          this.hotels = this.carts.hotelItems.sort((a: any, b: any) => a.id - b.id);
          this.meals = this.carts.mealItems.sort((a: any, b: any) => a.id - b.id);
          this.activities = this.carts.activityItems.sort((a: any, b: any) => a.id - b.id);
          console.log(this.hotels)

          this.grandTotal = [
            ...this.carts.hotelItems,
            ...this.carts.mealItems,
            ...this.carts.activityItems
          ].reduce((total, item) => {
            const quantity = item.quantity || 0;
            const price = item.service?.sellingPrice || 0;
            return total + quantity * price;
          }, 0);

          console.log(this.grandTotal)


        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error fetching cart details', err);
      },
    });
  }

  submitBooking() {
    this.isLoading = true;
    const userId = this.userStorageService.getUserId() || 1;
    this.cartService.submit({ userId: userId, total: this.grandTotal }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.code === 200 && response.data) {
          console.log(response.data)
          this.showSuccesss(response.data)
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error booking', err);
      },
    })
  }

  showSuccess: boolean = false;
  showError: boolean = false;

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

   success: boolean = false;

   second: number = 0;

  showSuccesss(boookingCode: string) {
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
      this.router.navigate([`/customer/service-booking-confirm/${boookingCode}`]); // Navigate to the desired route
    }, 2000);
  }



  


}

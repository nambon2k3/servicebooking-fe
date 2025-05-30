import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TourDiscountService } from '../../../../services/discount.service';
import { FormsModule } from '@angular/forms';

interface TourPax {
  minPax: number;
  maxPax: number;
  fixedCost: number;
  extraHotelCost: number;
  nettPricePerPax: number;
  sellingPrice: number;
  validFrom: string; // Date as string (e.g., "YYYY-MM-DD")
  validTo: string;   // Date as string (e.g., "YYYY-MM-DD")
}

@Component({
  selector: 'app-create-tour-pax',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './create-tour-pax.component.html',
  styleUrls: ['./create-tour-pax.component.css']
})
export class CreateTourPaxComponent {
  @Input() tourId!: number;
  @Output() confirmCreate = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  newPax: TourPax = {
    minPax: 0,
    maxPax: 0,
    fixedCost: 0,
    extraHotelCost: 0,
    nettPricePerPax: 0,
    sellingPrice: 0,
    validFrom: new Date().toISOString().split('T')[0],
    validTo: (() => {
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      return nextYear.toISOString().split('T')[0];
    })()
  };  

  showPopup: boolean = false;
  popupMessage: string = '';
  isSuccess: boolean = false;

  constructor(private tourDiscountService: TourDiscountService) {}

  createTourPax() {
    const tourPaxData: TourPax = {
      minPax: this.newPax.minPax,
      maxPax: this.newPax.maxPax,
      fixedCost: this.newPax.fixedCost,
      extraHotelCost: this.newPax.extraHotelCost,
      nettPricePerPax: this.newPax.nettPricePerPax,
      sellingPrice: this.newPax.sellingPrice,
      validFrom: this.newPax.validFrom,
      validTo: this.newPax.validTo
    };

    this.tourDiscountService.createTourPax(this.tourId, tourPaxData).subscribe({
      next: (response: any) => {
        if (response.code === 201) {
          this.confirmCreate.emit();
          this.showPopupMessage('Tạo mới cấu hình khách hàng thành công!', true);
        } else {
          this.showPopupMessage(response.message || 'Lỗi khi tạo mới cấu hình khách hàng.', false);
        }
      },
      error: (error) => {
        this.showPopupMessage(error.message || 'Đã xảy ra lỗi khi tạo mới cấu hình khách hàng.', false);
      }
    });
  }

  onCancel() {
    this.cancel.emit();
  }

  showPopupMessage(message: string, isSuccess: boolean) {
    this.popupMessage = message;
    this.isSuccess = isSuccess;
    this.showPopup = true;

    setTimeout(() => {
      this.showPopup = false;
    }, 2000);
  }
}
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TourDiscountService } from '../../../../services/discount.service';

interface TourPax {
  minPax: number;
  maxPax: number;
  fixedCost: number;
  extraHotelCost: number;
  nettPricePerPax: number;
  sellingPrice: number;
  validFrom: string;
  validTo: string;
}

@Component({
  selector: 'app-update-tour-pax',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-tour-pax.component.html',
  styleUrls: ['./update-tour-pax.component.css']
})
export class UpdateTourPaxComponent {
  @Input() tourId!: number;
  @Input() tourPaxId!: number;
  @Output() confirmUpdate = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>(); // New event for canceling

  tourPax: TourPax = {
    minPax: 0,
    maxPax: 0,
    fixedCost: 0,
    extraHotelCost: 0,
    nettPricePerPax: 0,
    sellingPrice: 0,
    validFrom: new Date().toISOString().split('T')[0],
    validTo: new Date().toISOString().split('T')[0]
  };

  // New properties for popup
  showPopup: boolean = false;
  popupMessage: string = '';
  isSuccess: boolean = false;

  constructor(private tourDiscountService: TourDiscountService) {}

  ngOnInit() {
    this.fetchTourPaxData();
  }

  fetchTourPaxData() {
    this.tourDiscountService.getTourPaxDetailById(this.tourId, this.tourPaxId).subscribe({
      next: (response: any) => {
        if (response.code === 200) {
          this.tourPax = response.data;
          this.tourPax.validFrom = new Date(this.tourPax.validFrom).toISOString().split('T')[0];
          this.tourPax.validTo = new Date(this.tourPax.validTo).toISOString().split('T')[0];
        } else {
          this.showPopupMessage(response.message || 'Lỗi khi tải dữ liệu cấu hình khách hàng.', false);
        }
      },
      error: (error) => {
        this.showPopupMessage(error.message || 'Đã xảy ra lỗi khi tải dữ liệu cấu hình khách hàng.', false);
      }
    });
  }

  updateTourPax() {
    this.tourDiscountService.updateTourPax(this.tourId, this.tourPaxId, this.tourPax).subscribe({
      next: (response: any) => {
        if (response.code === 200) {
          this.confirmUpdate.emit();
          this.showPopupMessage('Cập nhật cấu hình khách hàng thành công!', true);
        } else {
          this.showPopupMessage(response.message || 'Lỗi khi cập nhật cấu hình khách hàng.', false);
        }
      },
      error: (error) => {
        this.showPopupMessage(error.message || 'Đã xảy ra lỗi khi cập nhật cấu hình khách hàng.', false);
      }
    });
  }

  onCancel() {
    this.cancel.emit();
  }

  // New method to show popup message
  showPopupMessage(message: string, isSuccess: boolean) {
    this.popupMessage = message;
    this.isSuccess = isSuccess;
    this.showPopup = true;

    setTimeout(() => {
      this.showPopup = false;
    }, 2000); // Hide after 2 seconds
  }
}
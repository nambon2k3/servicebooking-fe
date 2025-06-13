import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { BookingDetail, RoomDetailResponse, MealDetailResponse, ServiceBookingDetail } from '../admin.component';

@Component({
  selector: 'app-booking-detail-dialog',
  templateUrl: './booking-detail-dialog.component.html',
  styleUrls: ['./booking-detail-dialog.component.css'],
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
})
export class BookingDetailDialogComponent {
  protected displayData: {
    bookingCode: string;
    customerName: string; // Thêm tên khách hàng
    status: string; // Thêm trạng thái
    hotelItems: RoomDetailResponse[];
    mealItems: MealDetailResponse[];
    activityItems: ServiceBookingDetail[];
  } = {
    bookingCode: '',
    customerName: '',
    status: '',
    hotelItems: [],
    mealItems: [],
    activityItems: []
  };

  protected totalAmount: number = 0;

  constructor(
    public dialogRef: MatDialogRef<BookingDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public injectedData: BookingDetail
  ) {
    console.log('Dialog Injected Data:', injectedData);
    this.displayData.bookingCode = injectedData.bookingCode || '';
    this.displayData.customerName = injectedData.customerName || 'N/A'; // Gán tên khách hàng
    this.displayData.status = injectedData.status || 'UNKNOWN'; // Gán trạng thái
    this.displayData.hotelItems = injectedData.hotelItems || [];
    this.displayData.mealItems = injectedData.mealItems || [];
    this.displayData.activityItems = injectedData.activityItems || [];
    console.log('Display Data:', this.displayData);

    this.totalAmount = this.calculateTotalAmount();
  }

  onClose(): void {
    this.dialogRef.close();
  }

  private calculateTotalAmount(): number {
    let total = 0;
    this.displayData.hotelItems.forEach(item => {
      total += (item.sellingPrice || 0) * (item.quantity || 1);
    });
    this.displayData.mealItems.forEach(item => {
      total += (item.sellingPrice || 0) * (item.quantity || 1);
    });
    this.displayData.activityItems.forEach(item => {
      total += (item.sellingPrice || 0) * (item.quantity || 1);
    });
    return total;
  }
}
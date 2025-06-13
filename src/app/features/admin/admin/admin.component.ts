import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../admin.service';
import { ServiceBooking, BookingStatus } from '../../../core/models/service-booking.model';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { Observable, of } from 'rxjs';
import { BookingDetailDialogComponent } from './booking-detail/booking-detail-dialog.component';

// Enum for MealType
export enum MealType {
  BREAKFAST = 'BREAKFAST',
  LUNCH = 'LUNCH',
  DINNER = 'DINNER'
}

export interface ServiceBookingDetail {
  serviceId: number;
  name: string;
  sellingPrice: number;
  nettPrice: number;
  imageUrl: string;
  quantity: number;
  checkInDate: Date | string;
  checkOutDate: Date | string;
}
// booking-status-update.dto.ts
export interface BookingStatusUpdateDTO {
  id: number;
  bookingStatus: 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'SUCCESS' | 'COMPLETED';
}


export interface RoomDetailResponse extends ServiceBookingDetail {
  roomId: number;
  capacity: number;
  availableQuantity: number;
  facilities: string;
}

export interface MealDetailResponse extends ServiceBookingDetail {
  type: MealType;
  mealDetail: string;
}

export interface BookingDetail {
  bookingCode: string;
  customerName: string; // Thêm tên khách hàng
  status: BookingStatus; // Thêm trạng thái
  hotelItems: RoomDetailResponse[] | undefined;
  mealItems: MealDetailResponse[] | undefined;
  activityItems: ServiceBookingDetail[] | undefined;
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule, MatDialogModule],
})
export class AdminComponent implements OnInit {
  bookings: ServiceBooking[] = [];
  filteredBookings: ServiceBooking[] = [];
  searchBookingCode: string = '';
  filterStatus: string = '';
  currentPage: number = 0;
  totalPages: number = 1;
  pageSize: number = 20;
  errorMessage: string | null = null;
  availableStatuses = Object.values(BookingStatus);

  constructor(private adminService: AdminService, private snackBar: MatSnackBar, public dialog: MatDialog) {}

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.adminService.getBookings(this.currentPage, this.pageSize, this.searchBookingCode, this.filterStatus).subscribe({
      next: (response) => {
        const data = response.data;
        this.bookings = data.items.map((item: ServiceBooking) => ({
          ...item,
          createdAt: item.createdAt ? new Date(item.createdAt) : null
        }));
        this.filteredBookings = [...this.bookings];
        this.totalPages = Math.ceil(data.total / this.pageSize);
        this.errorMessage = null;
        console.log('Bookings:', this.bookings);
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        this.errorMessage = 'Không thể tải danh sách booking.';
      },
    });
  }

  searchBookings() {
    this.currentPage = 0;
    this.loadBookings();
  }

  filterBookings() {
    this.currentPage = 0;
    this.loadBookings();
  }

  changePage(page: number) {
    this.currentPage = page;
    this.loadBookings();
  }

  openStatusDropdown(event: MouseEvent, booking: ServiceBooking) {
    event.stopPropagation();
    const statuses = this.availableStatuses.filter(s => s !== booking.status);
    this.dialog.open(StatusDialogComponent, {
      width: '250px',
      data: { booking, statuses }
    });
  }

  openBookingDetail(bookingId: number) {
    console.log('Opening detail for bookingId:', bookingId);
    this.adminService.getBookingDetail(bookingId).subscribe({
      next: (detail: BookingDetail) => {
        console.log('Detail Received in openBookingDetail:', detail);
        // Tìm booking tương ứng trong danh sách để lấy customerName và status
        const booking = this.bookings.find(b => b.id === bookingId);
        const dialogData: BookingDetail = {
          ...detail,
          customerName: booking?.userName || 'N/A', // Giả định customerName từ ServiceBooking
          status: booking?.status || 'UNKNOWN' as BookingStatus // Giả định status từ ServiceBooking
        };
        const dialogRef = this.dialog.open(BookingDetailDialogComponent, {
          width: '1400px',
          height: 'auto',
          maxHeight: '95vh',
          panelClass: 'custom-wide-dialog',
          autoFocus: false,
          data: dialogData
        });

        dialogRef.afterOpened().subscribe(() => {
          const dialogContent = document.querySelector('.mat-mdc-dialog-content');
          if (dialogContent) {
            dialogContent.scrollTop = 0;
          }
        });
      },
      error: (error: any) => {
        console.error('Error fetching booking details:', error);
        this.snackBar.open('Failed to load booking details.', 'Close', { duration: 3000 });
      }
    });
  }
  openedDropdownBookingId: number | null = null;

bookingStatuses: string[] = ['PENDING', 'CONFIRMED', 'CANCELED', 'SUCCESS', 'COMPLETED'];

toggleStatusDropdown(event: MouseEvent, booking: any): void {
  event.stopPropagation();
  if (this.openedDropdownBookingId === booking.id) {
    this.openedDropdownBookingId = null;
  } else {
    this.openedDropdownBookingId = booking.id;
  }
}
updateBookingStatus(booking: any, newStatus: string): void {
  const dto = {
    id: booking.id,
    bookingStatus: newStatus as BookingStatusUpdateDTO['bookingStatus']
  };

  this.adminService.updateBookingStatus(dto).subscribe({
    next: () => {
      booking.status = newStatus;
      this.openedDropdownBookingId = null;
      this.snackBar.open('Cập nhật trạng thái thành công!', 'Đóng', { duration: 3000 });
    },
    error: () => {
      this.snackBar.open('Cập nhật trạng thái thất bại.', 'Đóng', { duration: 3000 });
    }
  });
}

}



// Status Dialog Component
@Component({
  selector: 'app-status-dialog',
  template: `
    <h2 mat-dialog-title>Confirm Status Change</h2>
    <mat-dialog-content>
      <p>Change status of booking {{ data.booking.bookingCode }} to:</p>
      <mat-radio-group [(ngModel)]="selectedStatus">
        <mat-radio-button *ngFor="let status of data.statuses" [value]="status" class="block mb-2">
          {{ status }}
        </mat-radio-button>
      </mat-radio-group>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-button (click)="onConfirm()" [disabled]="!selectedStatus">Confirm</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [MatDialogModule, MatRadioModule, MatButtonModule, FormsModule],
})
export class StatusDialogComponent {
  selectedStatus: string | null = null;

  constructor(public dialogRef: MatDialogRef<StatusDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private adminService: AdminService, private snackBar: MatSnackBar) {}

  onCancel() {
    this.dialogRef.close();
  }

  onConfirm() {
  if (this.selectedStatus && this.data.booking.id) {
    const dto = {
      id: this.data.booking.id,
      bookingStatus: this.selectedStatus as BookingStatus
    };

    this.adminService.updateBookingStatus(dto).subscribe({
      next: () => {
        this.data.booking.status = this.selectedStatus as BookingStatus;
        this.snackBar.open('Status updated successfully!', 'Close', { duration: 3000 });
        this.dialogRef.close();
      },
      error: (error) => {
        console.error('Error updating status:', error);
        this.snackBar.open('Failed to update status.', 'Close', { duration: 3000 });
      },
    });
  }
}

}



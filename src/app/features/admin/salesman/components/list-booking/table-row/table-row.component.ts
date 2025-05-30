import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CommonModule, DatePipe } from '@angular/common';
import { UserStorageService } from '../../../../../../core/services/user-storage/user-storage.service';
import { BookingService } from '../../../services/booking.service';
@Component({
  selector: '[app-table-row]',
  imports: [FormsModule, AngularSvgIconModule, CommonModule],
  templateUrl: './table-row.component.html',
  styleUrl: './table-row.component.css',
})
export class TableRowComponent {
  @Input() tourBookingDetail: any = <any>{};
  @Input() index: any = <any>{};
  @Output() bookingTaken = new EventEmitter<number>();

  ngOnInit(): void {
    console.log(this.tourBookingDetail)
  }

  userId: number = 0;

  constructor(
    private userStorageService: UserStorageService,
    private bookingService: BookingService,

  ) {
    this.userId = this.userStorageService.getUserId()!;
  }

  takeBooking(bookingId: number) {
    this.bookingService.takeBooking(bookingId, this.userId).subscribe({
      next: (response: any) => {
        console.log(response);
        this.bookingTaken.emit(bookingId); // Notify parent to reload data
      },
      error: (error: any) => {
        console.error(error);
        this.triggerError(); // Show error message
      },
    });
  }

  showError: boolean = false;

  triggerError() {
    this.showError = true;


    // Hide warning after 3 seconds
    setTimeout(() => {
      this.showError = false;
    }, 4000);
  }
  
}

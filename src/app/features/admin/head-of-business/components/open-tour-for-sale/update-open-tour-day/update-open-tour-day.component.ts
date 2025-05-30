import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { EventInput } from '@fullcalendar/core/index.js';
import { Modal } from 'flowbite';
import { SsrService } from '../../../../../../core/services/ssr.service';
import { TourService } from '../../../services/tour.service';

@Component({
  selector: 'app-update-open-tour-day',
  standalone: true,
  imports: [FullCalendarModule, CommonModule, FormsModule],
  templateUrl: './update-open-tour-day.component.html',
  styleUrls: ['./update-open-tour-day.component.css']
})
export class UpdateOpenTourDayComponent {
  @Input() selectedEvent!: EventInput;
  @Input() scheduleId: string = '';
  @Input() tourId: string | null = null;
  @Input() tourName: string = '';
  calculatedEndDate: string | null = null;

  private modalInstance!: Modal;
  @Output() daySetted: EventEmitter<any> = new EventEmitter<any>();

  selectedDate: string = '';
  name: string = '';

  calculatedEndDates: string[] = [];

  // New properties for popup
  showPopup: boolean = false;
  popupMessage: string = '';
  isSuccess: boolean = false;

  constructor(
    private router: Router,
    private ssrService: SsrService,
    private tourService: TourService,
  ) { }

  ngAfterViewInit() {
    const document = this.ssrService.getDocument();
    if (document) {
      const modalEl = document.getElementById('updateOpenTourDayModal');
      if (modalEl) {
        this.modalInstance = new Modal(modalEl);
      }
    }
  }

  onSelectedDateChange(newDate: string) {
    this.selectedDate = newDate;
    this.getEndDate();
  }

  openModal(date: string, name: string, scheduleId: string, tourId: string) {
    this.selectedDate = date;
    this.name = name;
    this.scheduleId = scheduleId;
    this.tourId = tourId;

    if (this.modalInstance) {
      this.modalInstance.show();
    }

    this.getEndDate();
  }

  close() {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
  }

  getEndDate() {
    if (this.tourId && this.selectedDate) {
      const formattedDate = `${this.selectedDate}T00:00:00`;
      this.tourService.calculateEndDates(this.tourId!, formattedDate).subscribe({
        next: (response) => {
          this.calculatedEndDate = response.data[0].endDate;
        },
        error: (error) => {
          this.showPopupMessage(error.message || 'Đã xảy ra lỗi không xác định.', false);
          this.calculatedEndDate = '';
        }
      });
    }
  }

  updateTourSaleDay() {
    const requestBody = {
      tourId: this.tourId,
      scheduleId: this.scheduleId,
      startDate: new Date(this.selectedDate).toISOString(),
      endDate: this.calculatedEndDate ? new Date(this.calculatedEndDate).toISOString() : null,
    };

    this.tourService.updateTourSchedule(requestBody).subscribe({
      next: (response) => {
        this.daySetted.emit(response.data);
        this.close();
        this.showPopupMessage('Cập nhật lịch trình tour thành công!', true);
      },
      error: (error) => {
        this.showPopupMessage(error.message || 'Đã xảy ra lỗi không xác định.', false);
      }
    });
  }

  deleteDay() {
    this.tourService.cancelTourSchedule(this.scheduleId).subscribe({
      next: (response) => {
        this.daySetted.emit(response.data);
        this.close();
        this.showPopupMessage('Xoá ngày thành công!', true);
      },
      error: (error) => {
        this.showPopupMessage(error.message || 'Đã xảy ra lỗi không xác định.', false);
      }
    });
  }

  viewListBooking() {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
    this.router.navigate([`/head-business/tour-list-booking/${this.tourId}`]);
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
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core/index.js';
import dayGridPlugin from '@fullcalendar/daygrid';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import interactionPlugin from '@fullcalendar/interaction';
import { BookingService } from '../../services/booking.service';
import { TourService } from '../../services/tour.service';
import { ActivatedRoute } from '@angular/router';
import { SpinnerComponent } from '../../../../../shared/components/spinner/spinner.component';
import { UserStorageService } from '../../../../../core/services/user-storage/user-storage.service';
import { Modal } from 'flowbite';
import { CurrencyVndPipe } from "../../../../../shared/pipes/currency-vnd.pipe";
@Component({
  selector: 'app-tour-list-booking',
  imports: [FullCalendarModule, CommonModule, RouterModule, DatePipe, SpinnerComponent, CurrencyVndPipe],
  templateUrl: './tour-list-booking.component.html',
  styleUrl: './tour-list-booking.component.css',
  providers: [DatePipe]
})
export class TourListBookingComponent implements AfterViewInit {

  events: { scheduleId: number; title: string; start: string; }[] | undefined = [];

  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: 'vi', // Set Vietnamese locale
    events: this.events,
    themeSystem: 'bootstrap',
    headerToolbar: {
      left: 'prev',
      center: 'title',
      right: 'next'
    },
    dateClick: (arg) => this.handleDateClick(arg),
  };



  operatorModal: Modal | null = null;

  ngAfterViewInit() {
    const modalElement = document.getElementById('operator-modal') as HTMLElement;
    this.operatorModal = new Modal(modalElement);
  }

  openOperatorModal() {
    this.operatorModal?.show();
  }
  closeOperatorModal() {
    if (this.operatorModal) {
      this.operatorModal.hide();
    }
  }


  handleDateClick(arg: any) {
    // Check if the clicked date has an event
    const eventOnDate = this.events?.find(event => event.start === arg.dateStr);

    if (eventOnDate) {
      const selectedScheduleId = eventOnDate.scheduleId;

      console.log(selectedScheduleId)

      this.getTourDetails(this.tourId!, selectedScheduleId);

      const modal = document.getElementById("close");
      if (modal) {
        modal.click();
      }
    }
  }


  tourId?: number;
  tourDetails: any;

  bookedPerson: any;


  selectedSchedule: any;
  isLoading: boolean = true;

  uniqueMonths = new Set<string>();

  userId: number = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private tourService: TourService,
    private datePipe: DatePipe,
    private userStorageService: UserStorageService,
    private bookingService: BookingService,
  ) {
  }


  ngOnInit(): void {
    this.userId = this.userStorageService.getUserId()!;
    this.route.paramMap.subscribe(params => {
      const tourId = Number(params.get('tourId'));
      const scheduleId = params.get('scheduleId') ? Number(params.get('scheduleId')) : undefined;

      console.log(tourId, scheduleId)

      if (tourId) {
        this.tourId = tourId;

        this.getTourDetails(tourId, scheduleId);
      }
    });
  }

  goToMonth(month: string, year: string) {
    const calendarApi = this.calendarComponent.getApi();
    calendarApi.gotoDate(`${year}-${month.padStart(2, '0')}-01`);
  }

  pendingSeats: number = 0;
  bookedSeats: number = 0;
  cancelSeats: number = 0;

  openDetail(tourId: number): void {
    if (this.tourDetails.tour.tourType === 'SIC') {
      this.router.navigate(['/salesman/tour-details'], {
        queryParams: {
          id: this.tourDetails.tour.id,
        },
      });
    } else {
      this.router.navigate([`/salesman/tour-private-content/${this.tourDetails.tour.id}`]);
    }
  }

  getTourDetails(tourId: number, scheduleId?: number) {
    this.isLoading = true;
    this.tourService.getListBooking(tourId, scheduleId).subscribe({
      next: (response) => {
        this.tourDetails = response.data;

        console.log('Response', this.tourDetails);


        if (!scheduleId) {
          this.selectedSchedule = this.tourDetails?.tour.tourSchedules.at(0);
        } else {
          this.selectedSchedule = this.tourDetails?.tour.tourSchedules.find((schedule: any) => schedule.id === scheduleId);
        }
        this.loadCalendar = false;


        const bookings = this.tourDetails?.bookings;

        const pendingBookings = bookings.filter((booking: any) => booking.status === 'PENDING');

        const successBookins = bookings.filter((booking: any) => booking.status === 'SUCCESS');

        const cancelBooking = bookings.filter((booking: any) => booking.status?.includes('CANCEL'));

        this.pendingSeats = pendingBookings.reduce((acc: number, booking: any) => acc + booking.seats, 0);
        this.bookedSeats = successBookins.reduce((acc: number, booking: any) => acc + booking.seats, 0);
        this.cancelSeats = cancelBooking.reduce((acc: number, booking: any) => acc + booking.seats, 0);


        console.log('Selected Schedule: ', this.selectedSchedule)

        this.tourDetails?.tour?.tourSchedules.forEach((schedule: any) => {
          const formattedDate = this.datePipe.transform(schedule.startDate, 'MM/yyyy');
          if (formattedDate) {
            this.uniqueMonths.add(formattedDate);
          }
        })

        this.events = this.tourDetails?.tour.tourSchedules.map((schedule: any) => ({
          scheduleId: schedule.id,
          title: schedule.status === 'ONGOING' ? `Vận Hành` : schedule.status === 'OPEN' ? 'Mở Bán' : 'Hoàn thành', // Show price in title
          start: schedule.startDate.split("T")[0] // Extract only YYYY-MM-DD
        }));

        // this.selectedSchedule = this.tourDetails?.tourSchedules[0];

        const initialDate = this.events?.length ? this.events[0].start : new Date().toISOString().split("T")[0];

        this.calendarOptions = {
          ...this.calendarOptions,
          events: [...this.events!],
          initialDate: initialDate
        };

        this.isLoading = false;

      },
      error: (err) => {
        console.error('Failed to load blog:', err);
      }
    });
  }


  takeBooking(bookingId: number) {



    this.bookingService.takeBooking(bookingId, this.userId).subscribe({
      next: (response: any) => {
        console.log(response);
        this.getTourDetails(this.tourId!, this.selectedSchedule.id); // Refresh the tour details after taking the booking
        this.successMessage = 'Nhận booking thành công!';
        this.triggerSuccess(); // Show success message

      },
      error: (error: any) => {
        console.error(error);
        this.triggerError(); // Show error message
      },
    });
  }


  loadCalendar: boolean = false;

  isLoadCalendar() {
    this.loadCalendar = true;
  }


  sendOperator() {
    this.isLoading = true;
    if (this.selectedSchedule?.tourPax?.maxPax - this.bookedSeats < 0) {
      this.triggerError();
      this.isLoading = false;
      return;

    }

    this.tourService.sendOperator(this.tourId!, this.selectedSchedule.id).subscribe({
      next: (response: any) => {
        console.log('Response', response);
        this.isLoading = false;
        this.successMessage = 'Chuyển điều hành thành công!';
        this.triggerSuccess();

        this.selectedSchedule.status = 'ONGOING'
      },
      error: (err: any) => {
        console.error('Failed to load blog:', err);
      }
    });
  }

  showSuccess: boolean = false;
  showError: boolean = false;


  successMessage: string = 'Chuyển điều hành thành công!';
  errorMessage: string = 'Số chỗ vượt quá giới hạn vui lòng chuyển booking hoặc hủy.';

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


}

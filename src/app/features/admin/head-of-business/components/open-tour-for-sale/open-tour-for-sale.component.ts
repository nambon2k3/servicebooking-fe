import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FormsModule } from '@angular/forms';
import { CreateOpenTourDayComponent } from './create-open-tour-day/create-open-tour-day.component';
import { UpdateOpenTourDayComponent } from './update-open-tour-day/update-open-tour-day.component';
import { TourService } from '../../services/tour.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SpinnerComponent } from "../../../../../shared/components/spinner/spinner.component";

@Component({
  selector: 'app-open-tour-for-sale',
  standalone: true,
  imports: [FullCalendarModule, CommonModule, FormsModule, CreateOpenTourDayComponent, UpdateOpenTourDayComponent, SpinnerComponent],
  templateUrl: './open-tour-for-sale.component.html',
  styleUrls: ['./open-tour-for-sale.component.css']
})
export class OpenTourForSaleComponent implements OnInit {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  @ViewChild('createOpenTourDayModal') createOpenTourDayModal!: CreateOpenTourDayComponent;
  @ViewChild('updateOpenTourDayModal') updateOpenTourDayModal!: UpdateOpenTourDayComponent;

  isLoading: boolean = false;
  selectedMonth: string;
  tourId: string | null = null;
  tourData: any;
  tourSaleEvents: EventInput[] = [];
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: 'vi',
    events: this.tourSaleEvents,
    timeZone: 'Asia/Ho_Chi_Minh',
    themeSystem: 'bootstrap',
    headerToolbar: {
      left: 'prev',
      center: 'title',
      right: 'next'
    },
    eventMinHeight: 30,
    eventDisplay: 'block',
    dayMaxEvents: 2,
    eventDidMount: (arg) => {
      const eventEl = arg.el;
      const props = arg.event.extendedProps;

      // Set a max-width and allow text wrapping
      eventEl.style.maxHeight = '25px'; // Adjust this value to fit your design
      eventEl.style.whiteSpace = 'wrap'; // Allow text to wrap\

      // Update the HTML content with wrapped text
      eventEl.innerHTML = `
        <div style="font-size: 12px; line-height: 2;">
          Số chỗ: ${props['seats']}
          Đã bán: ${props['sold']}
        </div>
      `;

      eventEl.style.overflow = 'visible';
      eventEl.style.minWidth = '100%';
    },
    dateClick: this.handleDateClick.bind(this),
    eventClick: this.handleEventClick.bind(this)
  };

  constructor(
    private tourService: TourService,
    private route: ActivatedRoute,
    private router : Router
  ) {
    const now = new Date();
    this.selectedMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  ngOnInit() {
    this.tourId = this.route.snapshot.queryParamMap.get('id');
    if (this.tourId) {
      this.loadTourDetail(this.tourId);
    }
  }

  goBack() {
    this.router.navigate(['/head-business/list-tour']);
  }

  onDaySetted(event: any) {
    this.loadTourDetail(this.tourId!);
  }

  loadTourDetail(id: string) {
    this.isLoading = true;
    this.tourService.getTourScheduleById(id).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.tourData = response.data;

        if (this.tourData?.tourSchedules?.length > 0) {
          const startDate = new Date(this.tourData.tourSchedules[0].startDate);
          this.selectedMonth = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
        } else {
          const now = new Date();
          this.selectedMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        }

        this.updateCalendarEvents();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error fetching tour detail:', error);
      }
    });
  }

  onMonthChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.selectedMonth = target.value;

    const [year, month] = this.selectedMonth.split('-');
    const firstDayOfMonth = new Date(parseInt(year), parseInt(month), 1);

    this.calendarOptions.initialDate = firstDayOfMonth.toISOString().split('T')[0]; // Cập nhật ngày ban đầu của lịch

    if (this.calendarComponent) {
      this.calendarComponent.getApi().gotoDate(firstDayOfMonth);
    }
  }


  updateCalendarEvents() {
    const colorPalette = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
      '#D4A5A5', '#9B59B6', '#3498DB', '#E74C3C', '#2ECC71'
    ];

    if (this.tourData && this.tourData.tourSchedules) {
      this.tourSaleEvents = this.tourData.tourSchedules.map((schedule: any, index: number) => {
        const colorIndex = index % colorPalette.length;
        const randomColor = colorPalette[colorIndex];

        const endDate = new Date(schedule.endDate);
        endDate.setDate(endDate.getDate() + 1);

        return {
          start: schedule.startDate.split('T')[0],
          end: endDate.toISOString().split('T')[0],
          title: '',
          backgroundColor: randomColor,
          borderColor: randomColor,
          extendedProps: {
            startDate: schedule.startDate.split('T')[0],
            scheduleId: schedule.scheduleId,
            seats: schedule.maxPax,
            sold: schedule.maxPax - schedule.availableSeats
          }
        };
      });

      this.calendarOptions.events = this.tourSaleEvents;
      this.calendarOptions.initialDate = this.tourData.tourSchedules[0].startDate.split('T')[0];
      if (this.calendarComponent) {
        this.calendarComponent.getApi().gotoDate(this.calendarOptions.initialDate!);
      }
    }
  }

  handleDateClick(arg: any) {
    this.createOpenTourDayModal.openModal(arg.dateStr, this.tourData?.name || '');
  }

  handleEventClick(arg: any) {
    const startDate = arg.event.extendedProps?.startDate || '';
    const scheduleId = arg.event.extendedProps?.scheduleId || '';
    const tourName = this.tourData?.name || '';
    const tourId = this.tourData?.id || '';
    this.updateOpenTourDayModal.openModal(startDate, tourName, scheduleId, tourId);
  }


  get tourName() { return this.tourData?.name || ''; }
  get tourType() { return 'SIC'; }
  get tourTags() { return this.tourData?.tags?.length || 0; }
  get tourDuration() { return `${this.tourData?.numberDays}N${this.tourData?.numberNight}Đ`; }
  get departureLocation() { return this.tourData?.departLocation?.name || ''; }
  get totalBookings() { return this.tourData?.tourSchedules?.reduce((sum: number, schedule: any) => sum + (schedule.maxPax - schedule.availableSeats), 0) || 0; }
  get createdDate() { return this.tourData?.createdAt ? new Date(this.tourData.createdAt).toLocaleDateString('vi-VN') : ''; }
  get createdPerson() { return this.tourData?.createdBy?.fullName || ''; }
  get today() { return new Date(); }
}
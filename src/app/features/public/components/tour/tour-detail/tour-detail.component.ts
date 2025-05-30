import { Component, ViewChild, AfterViewInit } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import { CommonModule, DatePipe, ViewportScroller } from '@angular/common';
import { TourDetail, TourSchedule } from '../../../../../core/models/tour-detail.model';
import { TourDetailService } from '../../../services/tour-detail.service';
import { Router } from '@angular/router';
import interactionPlugin from '@fullcalendar/interaction';
import { BookingInfoService } from '../../../services/booking-infor.service';
import { CurrencyVndPipe } from "../../../../../shared/pipes/currency-vnd.pipe";
import { TruncatePipe } from "../../../../../shared/pipes/truncate.pipe";
import { FooterComponent } from "../../../../../shared/components/footer/footer.component";
import { initFlowbite } from 'flowbite';
import { HomepageService } from '../../../services/homepage.service';
import { WishlistService } from '../../../../customer/components/wishlist/wishlist.service';
import { WishlistComponent } from '../../../../customer/components/wishlist/wishlist.component';
import { UserStorageService } from '../../../../../core/services/user-storage/user-storage.service';

@Component({
  selector: 'app-tour-detail',
  imports: [FullCalendarModule, CommonModule, CurrencyVndPipe, TruncatePipe, FooterComponent],
  templateUrl: './tour-detail.component.html',
  styleUrls: ['./tour-detail.component.css'],
  providers: [DatePipe]
})
export class TourDetailComponent implements AfterViewInit {
  tourDetails: TourDetail | undefined;
  isLoading = true;
  events: { scheduleId: number; title: string; start: string; }[] | undefined = [];
  uniqueMonths = new Set<string>();
  selectedSchedule: TourSchedule | undefined;
  minPrice: number | undefined;

  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  @ViewChild('wishlistModal') wishlistModal!: WishlistComponent;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: 'vi',
    events: this.events,
    themeSystem: 'bootstrap',
    headerToolbar: {
      left: 'prev',
      center: 'title',
      right: 'next'
    },
    dateClick: (arg) => this.handleDateClick(arg),
  };

  userId: number | null;

  constructor(
    private tourDetailService: TourDetailService,
    private router: Router,
    private datePipe: DatePipe,
    private bookingInforService: BookingInfoService,
    private viewportScroller: ViewportScroller,
    private homepageService: HomepageService,
    private wishlistService: WishlistService,
    private userStorageService: UserStorageService,
  ) {

    this.userId = this.userStorageService.getUserId();

   }

  ngOnInit(): void {
    const tourId = Number(this.router.url.split('/').pop());
    if (tourId) {
      this.tourDetailService.getTourDetails(tourId).subscribe({
        next: (response) => {
          this.tourDetails = response.data;
          this.tourDetails?.tourDays.sort((a: any, b: any) => a.id - b.id);

          this.events = this.tourDetails?.tourSchedules.map(schedule => ({
            scheduleId: schedule.scheduleId,
            title: `${schedule.sellingPrice / 1000}K`, // Show price in title
            start: schedule.startDate.split("T")[0] // Extract only YYYY-MM-DD
          }));

          if (this.tourDetails?.tourSchedules.length) {
            this.minPrice = Math.min(
              ...this.tourDetails.tourSchedules.map(schedule => schedule.sellingPrice)
            );
          }

          const initialDate = this.events?.length ? this.events[0].start : new Date().toISOString().split("T")[0];
          this.calendarOptions = {
            ...this.calendarOptions,
            events: [...this.events!],
            initialDate: initialDate
          };

          this.tourDetails?.tourSchedules.forEach(schedule => {
            const formattedDate = this.datePipe.transform(schedule.startDate, 'MM/yyyy');
            if (formattedDate) {
              this.uniqueMonths.add(formattedDate);
            }
          });

          this.isLoading = false;
          this.reInitFlowbite(); // Khởi tạo lại Flowbite sau khi dữ liệu load
        },
        error: (err) => {
          console.error('Failed to load tour:', err);
          this.isLoading = false;
        }
      });
    } else {
      console.error('Invalid tour id');
      this.isLoading = false;
    }
  }

  addToWishlist(tour: any) {
    this.homepageService.addWishlist(tour).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.wishlistService.triggerWishlistUpdate();
        }
      },
      error: (err) => {
        console.error('Error adding to wishlist:', err);
      },
    });
  }

  ngAfterViewInit(): void {
    if (!this.isLoading && this.tourDetails) {
      this.reInitFlowbite(); // Khởi tạo lại Flowbite sau khi DOM render
    }
  }

  private reInitFlowbite(): void {
    setTimeout(() => {
      initFlowbite(); // Gọi lại Flowbite để gắn sự kiện cho accordion
    }, 100); // Độ trễ nhỏ để đảm bảo DOM sẵn sàng
  }

  scrollToSchedule(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  resetSchedule() {
    this.selectedSchedule = undefined;
    this.scrollToSchedule('schedule2');
  }

  handleDateClick(arg: any) {
    const eventOnDate = this.events?.find(event => event.start === arg.dateStr);
    if (eventOnDate) {
      this.selectedSchedule = this.tourDetails?.tourSchedules.find(schedule => schedule.scheduleId === eventOnDate.scheduleId);
    }
  }

  goToMonth(month: string, year: string) {
    const calendarApi = this.calendarComponent.getApi();
    calendarApi.gotoDate(`${year}-${month.padStart(2, '0')}-01`);
  }

  navigateToDetails() { 
    if (this.tourDetails && this.selectedSchedule && this.userId) {
      this.router.navigate(['/tour-booking', this.tourDetails.id,this.selectedSchedule.scheduleId]).then(() => {
        this.viewportScroller.scrollToPosition([0, 0]);
      });
    } else {
      this.router.navigate(['/login'])
    }
  }

  isShow = false;

  showOrHide() {
    this.isShow = !this.isShow;
  }
}
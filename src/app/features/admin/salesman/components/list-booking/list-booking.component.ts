import { Component, signal } from '@angular/core';
import { TableActionComponent } from './table-action/table-action.component';
import { TableHeaderComponent } from './table-header/table-header.component';
import { TableRowComponent } from './table-row/table-row.component';
import { SpinnerComponent } from '../../../../../shared/components/spinner/spinner.component';
import { TableFooterComponent } from '../../../../../shared/components/table/table-footer/table-footer.component';
import { Router } from '@angular/router';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-list-booking',
  imports: [TableActionComponent,
    TableFooterComponent,
    TableHeaderComponent,
    TableRowComponent,
    SpinnerComponent],
  templateUrl: './list-booking.component.html',
  styleUrl: './list-booking.component.css'
})
export class ListBookingComponent {

  totalItems = 0;
  page = 0;
  size = 10;
  totalPages = signal(0)
  isLoading: boolean = false;

  tourBookings: any;


  // Store filters to persist data across pages
  keyword = '';
  status?: string;
  sortField = 'createdAt';
  sortDirection = 'desc';

  constructor(
    private router: Router,
    private bookingService: BookingService
  ) {

  }

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.isLoading = true;
    this.bookingService.getTourBookingByPage(
      this.page,
      this.size,
      this.keyword,
      this.status,
      this.sortField,
      this.sortDirection
    ).subscribe({
      next: (response) => {
        this.tourBookings = response.data.items;
        this.totalItems = response.data.total;
        this.page = response.data.page;
        this.size = response.data.size;
        this.totalPages.set(Math.ceil(this.totalItems / this.size));
        this.isLoading = false;

        console.log('Tour Bookings:', this.tourBookings);
      },
      error: (err) => {
        console.error('Failed to load bookings:', err);
      }
    });
  }

  reloadBooking() {
    this.triggerSuccess();
    this.loadBookings();
  }

  showSuccess: boolean = false;


  successMessage: string = 'Nhận booking thành công!';

  triggerSuccess() {
    this.showSuccess = true;

    // Hide warning after 3 seconds
    setTimeout(() => {
      this.showSuccess = false;
    }, 4000);
  }


  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages()) {
      this.page = newPage;
      this.loadBookings();
    }
  }


  public toggleBlogs(checked: boolean): void {

  }

  // Change page size and reload data
  onPageSizeChange(newSize: number): void {
    this.size = newSize;
    this.page = 0; // Reset to first page
    this.loadBookings();
  }

  onSearch(filters: any): void {
    this.keyword = filters.keyword || '';
    this.status = filters.status;
    this.sortDirection = filters.order === '1' ? 'desc' : 'asc';
    this.page = 0; // Reset to first page on new search
    this.loadBookings();
  }

  addBooking(): void {
    this.router.navigate(['/salesman/add-booking']);
  }

}

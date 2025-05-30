import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableFooterComponent } from '../../../../shared/components/table/table-footer/table-footer.component';
import { TableHeaderComponent } from './table-header/table-header.component';
import { TableRowComponent } from './table-row/table-row.component';
import { TableActionComponent } from './table-action/table-action.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ServiceRequestService } from '../../services/service-request.service';
import { PaginatedData, TourBookingService, TourBookingServiceStatusDisplay } from '../../../../core/models/service-request.model';

@Component({
  selector: 'app-service-request',
  imports: [
    CommonModule,
    TableActionComponent,
    TableFooterComponent,
    TableHeaderComponent,
    TableRowComponent,
    SpinnerComponent,
  ],
  templateUrl: './service-request.component.html',
  styleUrls: ['./service-request.component.css'],
  standalone: true,
})
export class ServiceRequestComponent {
  serviceRequests = signal<TourBookingService[]>([]);
  totalItems = signal(0);
  page = signal(0);
  pageItemCount = signal(10);
  totalPages = signal(0);
  isLoading = false;

  searchQuery: string = '';
  statusFilter: string | undefined;
  orderFilter: string = 'desc';

  constructor(private serviceRequestService: ServiceRequestService) {}

  ngOnInit(): void {
    this.loadServiceRequests();
  }

  loadServiceRequests(): void {
    this.isLoading = true;
    this.serviceRequestService
      .getListServiceRequest(this.page(), this.pageItemCount(), this.searchQuery, this.statusFilter, this.orderFilter)
      .subscribe({
        next: (response) => {
          if (response.code === 200) { // Sửa từ response.status thành response.code
            const data: PaginatedData<TourBookingService> = response.data;
            this.serviceRequests.set(data.items || []);
            this.totalItems.set(data.total || 0);
            this.page.set(data.page || 0);
            this.pageItemCount.set(data.size || 10);
            this.totalPages.set(Math.ceil(this.totalItems() / this.pageItemCount()));
          } else {
            console.error('Failed to load service requests:', response.message);
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load service requests:', err);
          this.isLoading = false;
        },
      });
  }

  onSearch(filters: any): void {
    this.searchQuery = filters.keyword || '';
    this.statusFilter = filters.status || undefined;
    this.orderFilter = filters.order || 'desc';
    this.page.set(0);
    this.loadServiceRequests();
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages()) {
      this.page.set(newPage);
      this.loadServiceRequests();
    }
  }

  onPageSizeChange(newSize: number): void {
    this.pageItemCount.set(newSize);
    this.page.set(0);
    this.loadServiceRequests();
  }

  getStatusDisplay(status: string): string {
    return TourBookingServiceStatusDisplay[status as keyof typeof TourBookingServiceStatusDisplay] || status;
  }

  filteredServiceRequests = computed(() => this.serviceRequests());
}
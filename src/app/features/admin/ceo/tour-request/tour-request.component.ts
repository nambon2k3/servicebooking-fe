import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableFooterComponent } from '../../../../shared/components/table/table-footer/table-footer.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { TourRequestService } from '../services/tour-request.service';
import { PagingDTO, Tour, TourStatus } from '../../../../core/models/tour-request.model';
import { TableActionComponent } from './table-action/table-action.component';
import { TableHeaderComponent } from './table-header/table-header.component';
import { TableRowComponent } from './table-row/table-row.component';

@Component({
  selector: 'app-tour-request',
  imports: [
    CommonModule,
    TableActionComponent,
    TableFooterComponent,
    TableHeaderComponent,
    TableRowComponent,
    SpinnerComponent,
  ],
  templateUrl: './tour-request.component.html',
  styleUrls: ['./tour-request.component.css'],
  standalone: true,
})
export class TourRequestComponent {
  tours = signal<Tour[]>([]);
  totalItems = signal(0);
  page = signal(0);
  pageItemCount = signal(10);
  totalPages = signal(0);
  isLoading = false;

  searchQuery: string = '';
  statusFilter: TourStatus | undefined;
  orderFilter: string = 'desc';

  constructor(private tourRequestService: TourRequestService) {}

  ngOnInit(): void {
    this.loadTours();
  }

  loadTours(): void {
    this.isLoading = true;
    this.tourRequestService
      .getAllTourNeedToProcess(this.page(), this.pageItemCount(), this.searchQuery, this.statusFilter, this.orderFilter)
      .subscribe({
        next: (response) => {
          if (response.code === 200) {
            const data: PagingDTO<Tour> = response.data; // Sửa kiểu từ PagingDTO<Tour> thành PagingDTO<Tour[]>
            this.tours.set(data.items || []);
            this.totalItems.set(data.total || 0);
            this.page.set(data.page || 0);
            this.pageItemCount.set(data.size || 10);
            this.totalPages.set(Math.ceil(this.totalItems() / this.pageItemCount()));
          } else {
            console.error('Failed to load tours:', response.message);
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load tours:', err);
          this.isLoading = false;
        },
      });
  }

  onSearch(filters: any): void {
    this.searchQuery = filters.keyword || '';
    this.statusFilter = filters.status ? filters.status as TourStatus : undefined;
    this.orderFilter = filters.order || 'desc';
    this.page.set(0);
    this.loadTours();
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages()) {
      this.page.set(newPage);
      this.loadTours();
    }
  }

  onPageSizeChange(newSize: number): void {
    this.pageItemCount.set(newSize);
    this.page.set(0);
    this.loadTours();
  }

  filteredTours = computed(() => this.tours());
}
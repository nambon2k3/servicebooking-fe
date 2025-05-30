import { Component, computed, signal } from '@angular/core';
import { TourService } from '../../services/tour.service';
import { TableFooterComponent } from '../../../../../shared/components/table/table-footer/table-footer.component';
import { TableActionComponent } from './table-action/table-action.component';
import { TableHeaderComponent } from './table-header/table-header.component';
import { TableRowComponent } from './table-row/table-row.component';
import { TourSchedule } from '../../../../../core/models/tour-operator.model';
import { SpinnerComponent } from "../../../../../shared/components/spinner/spinner.component";

@Component({
  selector: 'app-view-list-tour',
  imports: [
    TableActionComponent,
    TableFooterComponent,
    TableHeaderComponent,
    TableRowComponent,
    SpinnerComponent
],
  templateUrl: './view-list-tour-private.component.html',
  styleUrl: './view-list-tour-private.component.css'
})
export class ViewListTourPrivateComponent {
  tours = signal<TourSchedule[]>([]);

  totalItems = this.tours().length;
  page = 0;
  size = 10;
  totalPages = signal(Math.ceil(this.totalItems / this.size));
  isLoading: boolean = false;

  keyword = '';
  status?: boolean;
  orderDate = 'desc';

  constructor(
    private tourService: TourService
  ) { }

  ngOnInit(): void {
    this.loadTours();
  }

  loadTours(): void {
    this.isLoading = true;
    this.tourService.getTourPrivateByPage(
      this.page,
      this.size,
      this.keyword,
      this.status,
      this.orderDate
    ).subscribe({
      next: (response) => {
        this.tours.set(response.data.items);
        this.totalItems = response.data.total;
        this.page = response.data.page;
        this.size = response.data.size;
        this.totalPages.set(Math.ceil(this.totalItems / this.size));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi khi tải tour:', err);
      }
    });
  }

  onSearch(filters: any): void {
    this.keyword = filters.keyword || '';
    this.status = filters.status === 'OPENED' ? true : filters.status === 'CLOSED' ? false : undefined;
    this.orderDate = filters.order === '1' ? 'desc' : 'asc';
    this.page = 0;
    this.loadTours();
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages()) {
      this.page = newPage;
      this.loadTours();
    }
  }

  onPageSizeChange(newSize: number): void {
    this.size = newSize;
    this.page = 0;
    this.loadTours();
  }

  toggleTours(checked: boolean): void {
    this.tours.update((tours) => {
      return tours.map((tour) => {
        return { ...tour, selected: checked };
      });
    });
  }

  filteredTours = computed(() => {
    return this.tours();
  });
}

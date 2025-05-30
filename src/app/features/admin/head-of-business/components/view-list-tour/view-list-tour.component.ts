import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SpinnerComponent } from '../../../../../shared/components/spinner/spinner.component';
import { TableFooterComponent } from '../../../../../shared/components/table/table-footer/table-footer.component';
import { TableActionComponent } from './table-action/table-action.component';
import { TableHeaderComponent } from './table-header/table-header.component';
import { TableRowComponent } from './table-row/table-row.component';
import { TourHOB } from '../../../../../core/models/tour.model';
import { TourService } from '../../services/tour.service';

@Component({
  selector: 'app-view-list-tour',
  imports: [
    TableActionComponent,
    TableFooterComponent,
    TableHeaderComponent,
    TableRowComponent,
    CommonModule,
    SpinnerComponent
  ],
  templateUrl: './view-list-tour.component.html',
  styleUrl: './view-list-tour.component.css'
})
export class ViewListTourComponent {
  tour = signal<TourHOB[]>([]);
  totalItems = 0;
  page = 0;
  size = 10;
  totalPages = signal(0);
  isLoading: boolean = false;

  constructor(
    private tourService: TourService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadTour();
  }

  loadTour(): void {
    this.isLoading = true;
    this.tourService.getTourByPage(
      this.page,
      this.size,
      this.keyword,
      this.isDeleted,
      this.isOpen,
      this.sortField,
      this.sortDirection
    ).subscribe({
      next: (response) => {
        this.tour.set(response.data.items);
        this.totalItems = response.data.total;
        this.page = response.data.page;
        this.size = response.data.size;
        this.totalPages.set(Math.ceil(this.totalItems / this.size));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load tours:', err);
        this.isLoading = false;
      }
    });
  }

  openAddTourModal(): void {
    this.router.navigate(['/head-business/tour-details']);
  }

  keyword = '';
  isDeleted?: boolean;
  isOpen?: boolean; // Add isOpen property
  sortField = 'createdAt';
  sortDirection = 'desc';

  onSearch(filters: any): void {
    this.keyword = filters.keyword || '';
    this.isDeleted = filters.status === '2' ? true : filters.status === '1' ? false : undefined;
    this.isOpen = filters.isOpen === 'true' ? true : filters.isOpen === 'false' ? false : undefined;
    this.sortDirection = filters.order === '1' ? 'desc' : 'asc';
    this.page = 0;
    this.loadTour();
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages()) {
      this.page = newPage;
      this.loadTour();
    }
  }

  onPageSizeChange(newSize: number): void {
    this.size = newSize;
    this.page = 0;
    this.loadTour();
  }

  public toggleTour(checked: boolean): void {
    this.tour.update((tour) => {
      return tour.map((tour) => {
        return { ...tour, selected: checked };
      });
    });
  }

  filteredTour = computed(() => {
    return this.tour();
  });
}
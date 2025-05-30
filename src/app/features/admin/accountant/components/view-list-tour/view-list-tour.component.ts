import { Component, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TableActionComponent } from './table-action/table-action.component';
import { TableHeaderComponent } from './table-header/table-header.component';
import { TableRowComponent } from './table-row/table-row.component';
import { TableFooterComponent } from '../../../../../shared/components/table/table-footer/table-footer.component';
import { TourAccountant } from '../../../../../core/models/tour-accountant.model';
import { TourService } from '../../services/tour.service';

@Component({
  selector: 'app-view-list-tour',
  imports: [
      TableActionComponent,
      TableFooterComponent,
      TableHeaderComponent,
      TableRowComponent, 
      //SpinnerComponent
    ],
  templateUrl: './view-list-tour.component.html',
  styleUrl: './view-list-tour.component.css'
})
export class ViewListTourComponent {
  tourShedules: any;
  totalItems = 0;
  page = 0;
  size = 10;
  totalPages = signal(0);
  isLoading: boolean = false;

  keyword = '';
  isDeleted?: boolean;
  sortField = 'createdAt';
  sortDirection = 'desc';

  constructor(
    private router: Router,
    //private bookingService: BookingService
    private tourService: TourService
  ) {}

  ngOnInit(): void {
    this.loadTours();
  }

  loadTours(): void {
    this.isLoading = true;
    this.tourService.getListSettlementTourSchedule(
      this.page,
      this.size,
      this.keyword,
      this.isDeleted,
      this.sortField,
      this.sortDirection
    ).subscribe({
      next: (response) => {
        this.tourShedules = response.data.items;
        console.log(this.tourShedules);
        
        this.totalItems = response.data.total;
        this.size = response.data.size;
        this.totalPages.set(Math.ceil(this.totalItems / this.size));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load tours:', err);
      }
    });
  }

  onSearch(filters: any): void {
    this.keyword = filters.keyword || '';
    this.isDeleted = filters.status === '2' ? true : filters.status === '1' ? false : undefined;
    this.sortDirection = filters.order === '1' ? 'desc' : 'asc';
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

}

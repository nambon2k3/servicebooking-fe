import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { TableFooterComponent } from '../../../../../shared/components/table/table-footer/table-footer.component';
import { TableActionComponent } from './table-action/table-action.component';
import { TableHeaderComponent } from './table-header/table-header.component';
import { TableRowComponent } from './table-row/table-row.component';
import { Router } from '@angular/router';
import { Locations } from '../../../../../core/models/location.model';
import { LocationService } from '../../services/location/location.service';
import { SpinnerComponent } from "../../../../../shared/components/spinner/spinner.component";

@Component({
  selector: 'app-list-location',
  imports: [
    TableActionComponent,
    TableFooterComponent,
    TableHeaderComponent,
    TableRowComponent,
    CommonModule,
    SpinnerComponent
],
  templateUrl: './list-location.component.html',
  styleUrl: './list-location.component.css'
})
export class ListLocationComponent {
  location = signal<Locations[]>([]);
  totalItems = 0;
  page = 0;
  size = 10;
  totalPages = signal(0);
  isLoading: boolean = false;

  constructor(
    private locationService: LocationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadLocation();
  }

  loadLocation(): void {
    this.isLoading = true;
    this.locationService.getLocationByPage(
      this.page,
      this.size,
      this.keyword,
      this.isDeleted,
      this.sortDirection
    ).subscribe({
      next: (response) => {
        this.location.set(response.data.items);
        this.totalItems = response.data.total;
        this.page = response.data.page;
        this.size = response.data.size;
        this.totalPages.set(Math.ceil(this.totalItems / this.size));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load locations:', err);
      }
    });
  }

  openAddLocationModal(): void {
    this.router.navigate(['/head-business/location-details']);
  }

  
  keyword = '';
  isDeleted?: boolean;
  sortField = 'createdAt';
  sortDirection = 'desc';
  
  onSearch(filters: any): void {
    this.keyword = filters.keyword || '';
    this.isDeleted = filters.status === '2' ? true : filters.status === '1' ? false : undefined;
    this.sortDirection = filters.order === '1' ? 'desc' : 'asc';
    this.page = 0; // Reset to first page on new search
    this.loadLocation();
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages()) {
      this.page = newPage;
      this.loadLocation();
    }
  }

  // Change page size and reload data
  onPageSizeChange(newSize: number): void {
    this.size = newSize;
    this.page = 0; // Reset to first page
    this.loadLocation();
  }

  public toggleLocation(checked: boolean): void {
    this.location.update((location) => {
      return location.map((location) => {
        return { ...location, selected: checked };
      });
    });
  }

  filteredLocation = computed(() => {
    return this.location();
  });
}

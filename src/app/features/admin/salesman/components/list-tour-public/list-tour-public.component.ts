import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TableActionComponent } from './table-action/table-action.component';
import { TableHeaderComponent } from './table-header/table-header.component';
import { TableRowComponent } from './table-row/table-row.component';
import { SpinnerComponent } from '../../../../../shared/components/spinner/spinner.component';
import { TableFooterComponent } from '../../../../../shared/components/table/table-footer/table-footer.component';
import { TourService } from '../../services/tour.service';


@Component({
  selector: 'app-list-tour-public',
  imports: [TableActionComponent,
      TableFooterComponent,
      TableHeaderComponent,
      TableRowComponent,
      SpinnerComponent],
  templateUrl: './list-tour-public.component.html',
  styleUrl: './list-tour-public.component.css'
})
export class ListTourPublicComponent {
  totalItems = 0;
    page = 0;
    size = 10;
    totalPages = signal(0)
    isLoading: boolean = false;
  
    tourDatas: any;
  
  
    // Store filters to persist data across pages
    keyword = '';
    tourStatus?: string;
    sortField = 'createdAt';
    sortDirection = 'desc';
  
    constructor(
      private router: Router,
      private tourService: TourService
    ) {
  
    }
  
    ngOnInit(): void {
      this.loadTours();
    }
  
    

    loadTours() {
      this.isLoading = true;
      this.tourService.getTourByPage(
        this.page,
        this.size,
        this.keyword,
        this.tourStatus,
        this.sortField,
        this.sortDirection
      ).subscribe({
        next: (response) => {
          this.tourDatas = response.data.items;
          this.isLoading = false;
          this.totalItems = response.data.total;
          this.page = response.data.page;
          this.size = response.data.size;
          this.totalPages.set(Math.ceil(this.totalItems / this.size));
          this.isLoading = false;
        },
        error: (error) => {
          console.log(error);
          this.isLoading = false;
        }
      });
    }
  
  
    onPageChange(newPage: number): void {
      if (newPage >= 0 && newPage < this.totalPages()) {
        this.page = newPage;
        this.loadTours();
      }
    }
  
    // Change page size and reload data
    onPageSizeChange(newSize: number): void {
      this.size = newSize;
      this.page = 0; // Reset to first page
      this.loadTours();
    }
  
    onSearch(filters: any): void {
      this.keyword = filters.keyword || '';
      this.tourStatus = filters.status;
      console.log(filters.status)
      this.sortDirection = filters.order === '1' ? 'desc' : 'asc';
      this.page = 0; // Reset to first page on new search
      this.loadTours();
    }
  

}

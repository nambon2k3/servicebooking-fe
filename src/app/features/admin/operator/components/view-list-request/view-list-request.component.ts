import { Component, computed, signal } from '@angular/core';
import { TableActionComponent } from './table-action/table-action.component';
import { TableFooterComponent } from '../../../../../shared/components/table/table-footer/table-footer.component';
import { TableHeaderComponent } from './table-header/table-header.component';
import { TableRowComponent } from './table-row/table-row.component';
import { SpinnerComponent } from '../../../../../shared/components/spinner/spinner.component';
import { Router } from '@angular/router';
import { RequestService } from '../../services/request.service';

@Component({
  selector: 'app-view-list-request',
  imports: [
    TableActionComponent,
    TableFooterComponent,
    TableHeaderComponent,
    TableRowComponent,
    SpinnerComponent],
  templateUrl: './view-list-request.component.html',
  styleUrl: './view-list-request.component.css'
})

export class ViewListRequestComponent {
  requests = signal<any[]>([]);
  totalItems = 0;
  page = 0;
  size = 10;
  totalPages = signal(0)
  isLoading: boolean = false;

  keyword = '';
  isDeleted?: boolean;
  sortField = 'createdAt';
  sortDirection = 'desc';

  constructor(
    private requestService: RequestService) { }

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.isLoading = true;
    this.requestService.getRequestByPage(
      this.page,
      this.size,
      this.keyword,
      this.isDeleted,
    ).subscribe({
      next: (response) => {
        this.requests.set(response.data.items);
        this.totalItems = response.data.total;
        this.page = response.data.page;
        this.size = response.data.size;
        this.totalPages.set(Math.ceil(this.totalItems / this.size));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load requests:', err);
        this.isLoading = false;
      }
    });
  }


  onSearch(filters: any): void {
    this.keyword = filters.keyword || '';
    this.isDeleted = filters.status === '2' ? true : filters.status === '1' ? false : undefined;
    this.sortDirection = filters.order === '1' ? 'desc' : 'asc';
    this.page = 0;
    this.loadRequests();
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages()) {
      this.page = newPage;
      this.loadRequests();
    }
  }

  // Change page size and reload data
  onPageSizeChange(newSize: number): void {
    this.size = newSize;
    this.page = 0; // Reset to first page
    this.loadRequests();
  }

  public toggleRequests(checked: boolean): void {
    this.requests.update((requests) => {
      return requests.map((request) => {
        return { ...request, selected: checked };
      });
    });

  }

  filteredRequests = computed(() => {
    return this.requests();
  });
}

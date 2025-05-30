import { Component, computed, signal } from '@angular/core';
import { TableFooterComponent } from '../../../../../shared/components/table/table-footer/table-footer.component';
import { TableActionComponent } from './table-action/table-action.component';
import { TableHeaderComponent } from './table-header/table-header.component';
import { TableRowComponent } from './table-row/table-row.component';
import { User } from '../../../../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SpinnerComponent } from "../../../../../shared/components/spinner/spinner.component";
import { StaffService } from '../../services/staff.service';

@Component({
  selector: 'app-list-customer',
  standalone: true,
  imports: [
    TableActionComponent,
    TableFooterComponent,
    TableHeaderComponent,
    TableRowComponent,
    CommonModule,
    SpinnerComponent
],
  templateUrl: './list-customer.component.html',
  styleUrls: ['./list-customer.component.css']
})
export class ListCustomerComponent {
  customers = signal<User[]>([]);
  totalItems = 0;
  page = 0;
  size = 10;
  totalPages = signal(0);
  isLoading: boolean = false;

  // Store filters to persist data across pages
  keyword = '';
  isDeleted?: boolean;
  sortField = 'createdAt';
  sortDirection = 'desc';

  constructor(
    private staffService: StaffService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCustomers();
  }

  // Load customer list with filters and pagination
  loadCustomers(): void {
    this.isLoading = true;
    this.staffService.getCustomerByPage(
      this.page,
      this.size,
      this.keyword,
      this.isDeleted,
      this.sortField,
      this.sortDirection
    ).subscribe({
      next: (response) => {
        this.customers.set(response.data.items);
        this.totalItems = response.data.total;
        this.page = response.data.page;
        this.size = response.data.size;
        this.totalPages.set(Math.ceil(this.totalItems / this.size));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load customers:', err);
      }
    });
  }

  onSearch(filters: any): void {
    this.keyword = filters.keyword || '';
    this.isDeleted = filters.status === '2' ? true : filters.status === '1' ? false : undefined;
    this.sortDirection = filters.order === '1' ? 'desc' : 'asc';
    this.page = 0; // Reset to first page on new search
    this.loadCustomers();
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages()) {
      this.page = newPage;
      this.loadCustomers();
    }
  }

  // Change page size and reload data
  onPageSizeChange(newSize: number): void {
    this.size = newSize;
    this.page = 0; // Reset to first page
    this.loadCustomers();
  }

  openPostCustomerDetail(): void {
    this.router.navigate(['/admin/user-details']);
  }

  openAddCustomerModal(): void {
    this.router.navigate(['/admin/user-details']);
  }

  public toggleCustomers(checked: boolean): void {
    this.customers.update((customers) => {
      return customers.map((customer) => {
        return { ...customer, selected: checked };
      });
    });
  }

  filteredCustomers = computed(() => {
    return this.customers();
  });
}

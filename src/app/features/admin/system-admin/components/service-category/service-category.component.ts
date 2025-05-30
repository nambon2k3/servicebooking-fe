import { Component, computed, signal } from '@angular/core';
import { User } from '../../../../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SpinnerComponent } from '../../../../../shared/components/spinner/spinner.component';
import { TableFooterComponent } from '../../../../../shared/components/table/table-footer/table-footer.component';
import { TableActionComponent } from './table-action/table-action.component';
import { TableHeaderComponent } from './table-header/table-header.component';
import { TableRowComponent } from './table-row/table-row.component';
import { ServiceCategoryService } from '../../services/service-category.service';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-service-category',
  standalone: true,
  imports: [
    TableActionComponent,
    TableFooterComponent,
    TableHeaderComponent,
    TableRowComponent,
    CommonModule,
    SpinnerComponent,
    FormsModule
  ],
  templateUrl: './service-category.component.html',
  styleUrls: ['./service-category.component.css']
})
export class ServiceCategoryComponent {
  servicecategorys = signal<any[]>([]);
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

  // New modal state and form data for creating
  isCreateModalOpen: boolean = false;
  newCategoryName: string = '';

  constructor(
    private servicecategoryService: ServiceCategoryService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadServiceCategories();
  }

  // Load servicecategory list with filters and pagination
  loadServiceCategories(): void {
    this.isLoading = true;
    this.servicecategoryService.getServiceCategoryByPage(
      this.page,
      this.size,
      this.keyword,
      this.isDeleted,
      this.sortField,
      this.sortDirection
    ).subscribe({
      next: (response: any) => {
        this.servicecategorys.set(response.data.items);
        this.totalItems = response.data.total;
        this.page = response.data.page;
        this.size = response.data.size;
        this.totalPages.set(Math.ceil(this.totalItems / this.size));
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Lỗi: ', err);
      }
    });
  }

  onSearch(filters: any): void {
    this.keyword = filters.keyword || '';
    this.isDeleted = filters.status === '2' ? true : filters.status === '1' ? false : undefined;
    this.sortDirection = filters.order === '1' ? 'desc' : 'asc';
    this.page = 0; // Reset to first page on new search
    this.loadServiceCategories();
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages()) {
      this.page = newPage;
      this.loadServiceCategories();
    }
  }

  // Change page size and reload data
  onPageSizeChange(newSize: number): void {
    this.size = newSize;
    this.page = 0; // Reset to first page
    this.loadServiceCategories();
  }

  openPostServiceCategoryDetail(): void {
    this.newCategoryName = ''; // Reset form
    this.isCreateModalOpen = true; // Open the create modal
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false; // Close the modal
  }

  createServiceCategory(): void {
    const newCategory = {
      categoryName: this.newCategoryName
    };

    this.servicecategoryService.createServiceCategory(newCategory).subscribe({
      next: (response: any) => {
        if (response.code === 201) {
          this.loadServiceCategories(); 
        }
      },
      error: (err: any) => {
        console.error('Lỗi khi tạo: ', err);
      }
    });
  }

  public toggleServiceCategorys(checked: boolean): void {
    this.servicecategorys.update((servicecategorys) => {
      return servicecategorys.map((servicecategory) => {
        return { ...servicecategory, selected: checked };
      });
    });
  }

  filteredServiceCategorys = computed(() => {
    return this.servicecategorys();
  });
}
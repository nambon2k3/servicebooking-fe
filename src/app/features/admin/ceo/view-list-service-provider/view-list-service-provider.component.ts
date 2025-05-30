import { Component, computed, signal } from '@angular/core';
import { TableFooterComponent } from '../../../../shared/components/table/table-footer/table-footer.component';
import { TableHeaderComponent } from './table-header/table-header.component';
import { ServiceProvider } from '../../../../core/models/service-provider.model';
import { TableRowComponent } from './table-row/table-row.component';
import { TableActionComponent } from './table-action/table-action.component';
import { Router } from '@angular/router';
import { SpinnerComponent } from "../../../../shared/components/spinner/spinner.component";
import { ServiceProvidedService } from '../services/service-provider.service';

@Component({
  selector: 'app-view-list-service-provider',
  imports: [TableActionComponent, TableFooterComponent, TableHeaderComponent, TableRowComponent, SpinnerComponent],
  templateUrl: './view-list-service-provider.component.html',
  styleUrl: './view-list-service-provider.component.css'
})
export class ViewListServiceProviderComponent {
  serviceProviders = signal<ServiceProvider[]>([]);
  totalItems = signal(0);
  page = signal(0); // Bắt đầu từ 0 giống list-blog
  pageItemCount = signal(10);
  totalPages = signal(0);
  isLoading: boolean = false;

  // Store filters to persist data across pages
  searchQuery: string = '';
  statusFilter: string = '';
  orderFilter: string = '1';

  constructor(
    private router: Router,
    private serviceProvidedService: ServiceProvidedService
  ) {}

  ngOnInit(): void {
    this.loadServiceProviders();
  }

  loadServiceProviders(): void {
    this.isLoading = true;
    this.serviceProvidedService.getServiceProvidedByPage(
      this.page(),
      this.pageItemCount(),
      this.searchQuery,
      this.statusFilter === '2' ? true : this.statusFilter === '1' ? false : undefined,
      'createdAt', // Giả định sắp xếp theo createdAt
      this.orderFilter === '1' ? 'desc' : 'asc'
    ).subscribe({
      next: (response: any) => {
        this.serviceProviders.set(response.data.items || []);
        this.totalItems.set(response.data.total || 0);
        this.page.set(response.data.page || 0);
        this.pageItemCount.set(response.data.size || 10);
        this.totalPages.set(Math.ceil(this.totalItems() / this.pageItemCount()));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load service providers:', err);
        this.isLoading = false;
        if (err.message === 'No authentication token found') {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  onAdd(): void {
    this.router.navigate(['/ceo/service-provider/add']);
  }

  onSearch(filters: any): void {
    this.searchQuery = filters.keyword || '';
    this.statusFilter = filters.status || '';
    this.orderFilter = filters.order || '1';
    this.page.set(0); // Reset to first page on new search
    this.loadServiceProviders();
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages()) {
      this.page.set(newPage);
      this.loadServiceProviders();
    }
  }

  onPageSizeChange(newSize: number): void {
    this.pageItemCount.set(newSize);
    this.page.set(0); // Reset to first page
    this.loadServiceProviders();
  }

  toggleServiceProviders(checked: boolean): void {
    this.serviceProviders.update((providers) => {
      return providers.map((provider) => {
        return { ...provider, selected: checked };
      });
    });
  }

  filteredServiceProviders = computed(() => {
    return this.serviceProviders();
  });

  onUpdate(provider: ServiceProvider): void {
    if (provider.id !== undefined) {
      this.router.navigate([`/ceo/service-provider/${provider.id}/edit`]);
    } else {
      console.error('Service provider ID is undefined');
    }
  }

  onDelete(provider: ServiceProvider): void {
    if (provider.id !== undefined) {
      this.serviceProvidedService.updateServiceProvidedStatus(provider.id, true).subscribe({
        next: (response) => {
          if (response.code === 200) {
            this.serviceProviders.update((providers) => {
              return providers.map(p =>
                p.id === provider.id ? { ...p, deleted: true } : p
              );
            });
          }
        },
        error: (err) => {
          console.error('Failed to delete service provider:', err);
        }
      });
    } else {
      console.error('Service provider ID is undefined');
    }
  }
}
// src/app/features/service-provider/components/service/service.component.ts
import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableFooterComponent } from '../../../../shared/components/table/table-footer/table-footer.component';
import { TableHeaderComponent } from './table-header/table-header.component';
import { TableRowComponent } from './table-row/table-row.component';
import { TableActionComponent } from './table-action/table-action.component';
import { ActivatedRoute, Router } from '@angular/router';
import { SpinnerComponent } from "../../../../shared/components/spinner/spinner.component";
import { ApiResponse, PaginatedData } from '../../../../core/models/api-response.model';
import { ServiceBase } from '../../../../core/models/service.model';
import { ServiceService } from '../../../service-provider/services/service.service';

@Component({
  selector: 'app-service',
  imports: [
    CommonModule,
    TableActionComponent,
    TableFooterComponent,
    TableHeaderComponent,
    TableRowComponent,
    SpinnerComponent
  ],
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.css'],
  standalone: true
})
export class ServiceComponent {
  services = signal<ServiceBase[]>([]);
  totalItems = signal(0);
  page = signal(0);
  pageItemCount = signal(10);
  totalPages = signal(0);
  isLoading: boolean = false;
  providerId: number | null = null;
  serviceProviderName = signal<string | null>(null);
  searchQuery: string = '';
  statusFilter: string = '';
  orderFilter: string = '1';

  constructor(
    private router: Router,
    private serviceService: ServiceService,
    private route : ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.providerId = Number(this.route.snapshot.paramMap.get('id'));
    if(this.providerId !== null) {
      this.loadServices(this.providerId);
    }
  }

  loadServices(id : number): void {
    this.isLoading = true;
    this.serviceService.getServices(
      this.page(),
      this.pageItemCount(),
      this.searchQuery,
      this.statusFilter === '2' ? true : this.statusFilter === '1' ? false : undefined,
      id,
      'createdAt',
      this.orderFilter === '1' ? 'desc' : 'asc'
    ).subscribe({
      next: (response: ApiResponse<PaginatedData<ServiceBase>>) => {
        if (response.code === 200) {
          const data = response.data as PaginatedData<ServiceBase>;
          this.services.set(data.items || []);
          this.totalItems.set(data.total || 0);
          this.page.set(data.page || 0);
          this.pageItemCount.set(data.size || 10);
          this.totalPages.set(Math.ceil(this.totalItems() / this.pageItemCount()));
          if (data.items && data.items.length > 0) {
            this.serviceProviderName.set(data.items[0].serviceProviderName || null);
          }
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load services:', err);
        this.isLoading = false;
      }
    });
  }

   onAdd(): void {
    this.router.navigate([`/ceo/service/add/${this.providerId}`]);
  }

  onBack(): void {
    this.router.navigate([`/ceo/service-provider/${this.providerId}/edit`]);
  }

  onSearch(filters: any): void {
    this.searchQuery = filters.keyword || '';
    this.statusFilter = filters.status || '';
    this.orderFilter = filters.order || '1';
    this.page.set(0);
    this.loadServices(this.providerId!);
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages()) {
      this.page.set(newPage);
      this.loadServices(this.providerId!);
    }
  }

  onPageSizeChange(newSize: number): void {
    this.pageItemCount.set(newSize);
    this.page.set(0);
    this.loadServices(this.providerId!);
  }

  toggleServices(checked: boolean): void {
    this.services.update((services) => {
      return services.map((service) => {
        return { ...service, selected: checked };
      });
    });
  }

  filteredServices = computed(() => {
    const filtered = this.services();
    return filtered;
  });

  onUpdate(service: ServiceBase): void {
    if (service.id !== undefined) {
      this.router.navigate([`/ceo/service/${service.id}/edit`]); // Cập nhật routing
    } else {
      console.error('Service ID is undefined');
    }
  }

  onDelete(service: ServiceBase): void {
    if (service.id !== undefined) {
      this.serviceService.updateServiceStatus(service.id, true).subscribe({
        next: (response) => {
          if (response.code === 200) {
            this.services.update((services) => {
              return services.map(s =>
                s.id === service.id ? { ...s, deleted: true } : s
              );
            });
          }
        },
        error: (err) => {
          console.error('Failed to delete service:', err);
        }
      });
    } else {
      console.error('Service ID is undefined');
    }
  }
}
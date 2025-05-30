import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ServiceProvider } from '../../../../../core/models/service-provider.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ServiceProvidedService } from '../../services/service-provider.service';

@Component({
  selector: '[app-table-row]',
  standalone: true,
  imports: [FormsModule, AngularSvgIconModule, CommonModule],
  templateUrl: './table-row.component.html',
  styleUrl: './table-row.component.css',
})
export class TableRowComponent {
  @Input() serviceProvider: ServiceProvider = <ServiceProvider>{};

  constructor(
    private router: Router,
    private serviceProvidedService: ServiceProvidedService
  ) {}

  openDetail(serviceProvider: ServiceProvider): void {
    if (serviceProvider.id !== undefined) {
      this.router.navigate([`/ceo/service-provider/${serviceProvider.id}/edit`]);
    } else {
      console.error('Service provider ID is undefined');
    }
  }

  openService(serviceProvider: ServiceProvider): void {
    if (serviceProvider.id !== undefined) {
      this.router.navigate([`/ceo/service/${serviceProvider.id}/services`]);
    }
    else {
      console.error('Service provider ID is undefined');
    }
  }

  toggleStatus(): void {
    if (this.serviceProvider.id === undefined) {
      console.error('Service provider ID is undefined');
      return;
    }

    const newStatus = !this.serviceProvider.deleted; // Ngược lại với trạng thái hiện tại
    this.serviceProvidedService.updateServiceProvidedStatus(this.serviceProvider.id, newStatus).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.serviceProvider.deleted = newStatus; // Cập nhật trạng thái cục bộ
        }
      },
      error: (err) => {
        console.error('Failed to toggle service provider status:', err);
      },
    });
  }
}
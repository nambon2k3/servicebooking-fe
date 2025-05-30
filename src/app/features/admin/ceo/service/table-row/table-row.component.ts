import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ServiceBase } from '../../../../../core/models/service.model';
import { FormatDatePipe } from "../../../../../shared/pipes/format-date.pipe";
import { ServiceService } from '../../../../service-provider/services/service.service';

@Component({
  selector: '[app-table-row]',
  imports: [FormsModule, AngularSvgIconModule, CommonModule, FormatDatePipe],
  templateUrl: './table-row.component.html',
  styleUrls: ['./table-row.component.css'],
  standalone: true
})
export class TableRowComponent {
  @Input() service: ServiceBase = <ServiceBase>{};
  @Output() onUpdate = new EventEmitter<ServiceBase>();
  @Output() onDelete = new EventEmitter<ServiceBase>();

  constructor(
    private router: Router,
    private serviceService: ServiceService
  ) {}

  openDetail(service: ServiceBase): void {
    if (service.id !== undefined) {
      this.router.navigate([`/ceo/service/${service.id}/edit`]);
    } else {
      console.error('Service ID is undefined');
    }
  }

  hideService(): void {
    if (this.service.id !== undefined) {
      this.serviceService.updateServiceStatus(this.service.id, true).subscribe({
        next: (response) => {
          if (response.code === 0) {
            this.service.deleted = true;
          }
        },
        error: (err) => {
          console.error('Failed to hide service:', err);
        }
      });
    } else {
      console.error('Service ID is undefined');
    }
  }

  showService(): void {
    if (this.service.id !== undefined) {
      this.serviceService.updateServiceStatus(this.service.id, false).subscribe({
        next: (response) => {
          if (response.code === 0) {
            this.service.deleted = false;
          }
        },
        error: (err) => {
          console.error('Failed to show service:', err);
        }
      });
    } else {
      console.error('Service ID is undefined');
    }
  }
}
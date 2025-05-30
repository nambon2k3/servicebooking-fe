import { Component, Input, Output, EventEmitter, NgModule, ElementRef, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { Router } from '@angular/router';
import { TourHOB } from '../../../../../../core/models/tour.model';
import { CommonModule } from '@angular/common';
import { TourService } from '../../../services/tour.service';

@Component({
  selector: '[app-table-row]',
  imports: [FormsModule, AngularSvgIconModule, CommonModule],
  templateUrl: './table-row.component.html',
  styleUrl: './table-row.component.css',
})
export class TableRowComponent {
  @Input() tour: TourHOB = <TourHOB>{};
  @Output() tourUpdated = new EventEmitter<void>();
  isDropdownOpen = false;

  constructor(
    private router: Router,
    private elementRef: ElementRef,
    private tourService : TourService,
  ) { }

  toggleDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }


  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (this.isDropdownOpen && !this.elementRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  openDiscount(tour: TourHOB): void {
    this.router.navigate(['/head-business/tour-discount'], {
      queryParams: { id: tour.id },
    });
  }

  openDetail(tour: TourHOB): void {
    this.router.navigate(['/head-business/tour-details'], {
      queryParams: {
        id: tour.id,
      },
    });
  }

  openSaleTour(tour: TourHOB): void {
    this.router.navigate(['/head-business/open-sale-tour'], {
      queryParams: { id: tour.id }
    });
  }

  closeSaleTour(tour: TourHOB): void {
    this.tourService.closeTour(tour.id).subscribe((response) => {
      if (response.code === 200) {
        this.tourUpdated.emit();
      } else {
        console.error('Error closing tour:', response.message);
      }
    })
  }

  getVietnameseStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      OPENED: 'Đang mở bán',
      CLOSED: 'Đã đóng',
      DRAFT: 'Bản nháp',
      PENDING_PRICING: 'Chờ chiết tính',
      APPROVED: 'Đã duyệt',
      REJECTED: 'Bị từ chối',
      PENDING: 'Chờ duyệt',
    };
    return statusMap[status] || 'Chưa cập nhật';
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      OPENED: 'text-green-700 bg-green-100',
      CLOSED: 'text-gray-700 bg-gray-200',
      DRAFT: 'text-yellow-700 bg-yellow-100',
      PENDING_PRICING: 'text-blue-700 bg-blue-100',
      APPROVED: 'text-emerald-700 bg-emerald-100',
      REJECTED: 'text-red-700 bg-red-100',
      PENDING: 'text-orange-700 bg-orange-100',
    };
    return statusClasses[status] || 'text-gray-500 bg-gray-100';
  }
}
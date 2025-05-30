import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ServiceCategoryService } from '../../../services/service-category.service';

@Component({
  selector: '[app-table-row]',
  imports: [FormsModule, AngularSvgIconModule],
  templateUrl: './table-row.component.html',
  styleUrl: './table-row.component.css',
})
export class TableRowComponent {
  @Input() servicecategory: any = null;

  // Form data for updating
  categoryName: string = '';

  // Modal visibility flag
  isModalOpen: boolean = false;

  constructor(
    private serviceCategoryService: ServiceCategoryService,
  ) { }

  openUpdateModal(): void {
    this.categoryName = this.servicecategory.categoryName; // Set current category name
    this.isModalOpen = true; // Open the modal
  }

  closeModal(): void {
    this.isModalOpen = false; // Close the modal
  }

  updateServiceCategory(): void {
    const updatedCategory = {
      categoryName: this.categoryName,
    };

    this.serviceCategoryService.updateServiceCategory(this.servicecategory.id, updatedCategory).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.servicecategory.categoryName = this.categoryName;
          this.closeModal();
        }
      },
      error: (err) => {
        console.error('Lỗi khi cập nhật: ', err);
      }
    });
  }

  deleteServiceCategory(): void {
    this.serviceCategoryService.deleteServiceCategory(this.servicecategory.id).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.servicecategory.deleted = true;
        }
      },
      error: (err) => {
        console.error('Lỗi: ', err);
      },
    });
  }

  recoverServiceCategory(): void {
    this.serviceCategoryService.recoverServiceCategory(this.servicecategory.id).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.servicecategory.deleted = false;
        }
      },
      error: (err) => {
        console.error('Lỗi: ', err);
      },
    });
  }
}
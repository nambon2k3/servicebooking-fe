import { AfterViewInit, Component, signal } from '@angular/core';
import { UserStorageService } from '../../../../core/services/user-storage/user-storage.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TableFooterComponent } from '../../../../shared/components/table/table-footer/table-footer.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { Modal } from 'flowbite';
import { PlanService } from '../../../customer/services/plan.service';

@Component({
  selector: 'app-forum-plans',
  imports: [RouterModule, CommonModule, TableFooterComponent, SpinnerComponent],
  templateUrl: './forum-plans.component.html',
  styleUrl: './forum-plans.component.css'
})
export class ForumPlansComponent {
  constructor(
    private planService: PlanService,
    private userStorageService: UserStorageService,
  ) { }

  selectedPlanId: any;

  showSuccess: boolean = false;
  showError: boolean = false;


  successMessage: string = 'Chỉnh sửa thành công';
  errorMessage: string = 'Chỉnh sửa  thất bại';

  triggerSuccess() {
    this.showSuccess = true;

    // Hide warning after 3 seconds
    setTimeout(() => {
      this.showSuccess = false;
    }, 4000);
  }

  triggerError() {
    this.showError = true;

    // Hide warning after 3 seconds
    setTimeout(() => {
      this.showError = false;
    }, 4000);
  }

  userId: any;

  totalItems = 0;
  page = 0;
  size = 9;
  totalPages = signal(0)
  isLoading: boolean = true;

  plans: any;

  ngOnInit() {
    this.getListForumPlan();
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages()) {
      this.page = newPage;
    }
  }

  // Change page size and reload data
  onPageSizeChange(newSize: number): void {
    this.size = newSize;
    this.page = 0; // Reset to first page
  }


  getListForumPlan() {
    this.isLoading = true;
    this.planService.getListForumPlan(
      this.page,
      this.size,
      'id',
      'desc'
    ).subscribe({
      next: (response: any) => {
        console.log(response.data)

        this.totalItems = response.data.total;
        this.page = response.data.page;
        this.size = response.data.size;
        this.totalPages.set(Math.ceil(this.totalItems / this.size));
        this.isLoading = false;

        this.plans = response.data.items.map((item: any) => {
          return {
            ...item,
            content: JSON.parse(item.content.replace(/^```json\n/, '').replace(/\n```$/, '')).plan
          };
        });

        console.log(this.plans)
      },
      error: (error: any) => {
        console.error(error);
        this.isLoading = false;
      }
    });
  }
}

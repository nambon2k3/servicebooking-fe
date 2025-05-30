import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PlanService } from '../../services/plan.service';
import { TableActionComponent } from './table-action/table-action.component';
import { TableFooterComponent } from '../../../../../shared/components/table/table-footer/table-footer.component';
import { TableHeaderComponent } from './table-header/table-header.component';
import { TableRowComponent } from './table-row/table-row.component';
import { SpinnerComponent } from '../../../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-list-plan',
  imports: [
    TableActionComponent,
        TableFooterComponent,
        TableHeaderComponent,
        TableRowComponent,
        SpinnerComponent
  ],
  templateUrl: './list-plan.component.html',
  styleUrl: './list-plan.component.css'
})
export class ListPlanComponent {
 totalItems = 0;
  page = 0;
  size = 10;
  totalPages = signal(0)
  isLoading: boolean = false;

  tourBookings: any;


  // Store filters to persist data across pages
  keyword = '';
  planStatus?: string;
  sortField = 'createdAt';
  sortDirection = 'desc';

  plans: any[] = [];

  constructor(
    private router: Router,
    private planService: PlanService
  ) {

  }

  ngOnInit(): void {
    this.getPlanByPage();
  }

  reloadBooking() {
    this.triggerSuccess();
    this.getPlanByPage();
  }


  getPlanByPage() {
    this.isLoading = true;
    this.planService.getPlanByPage(
      this.page,
      this.size,
      'id',
      'desc',
      this.keyword,
      this.planStatus
    ).subscribe({
      next: (response) => {
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
      error: (error) => {
        console.error(error);
        this.isLoading = false;
      }
    });
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages()) {
      this.page = newPage;
      this.getPlanByPage();
    }
  }


  onPageSizeChange(newSize: number): void {
    this.size = newSize;
    this.page = 0; // Reset to first page
    this.getPlanByPage();
  }

  onSearch(filters: any): void {
    this.keyword = filters.keyword || '';
    this.planStatus = filters.status || undefined;
    this.sortDirection = filters.order === '1' ? 'desc' : 'asc';
    this.page = 0; // Reset to first page on new search
    this.getPlanByPage();
  }


  showSuccess: boolean = false;


  successMessage: string = 'Nhận booking thành công!';

  triggerSuccess() {
    this.showSuccess = true;

    // Hide warning after 3 seconds
    setTimeout(() => {
      this.showSuccess = false;
    }, 4000);
  }

}

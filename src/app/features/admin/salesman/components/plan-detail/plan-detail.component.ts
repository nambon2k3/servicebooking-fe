import { AfterViewInit, Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from "../../../../../shared/components/spinner/spinner.component";
import { PlanService } from '../../../../customer/services/plan.service';
@Component({
  selector: 'app-plan-detail',
  imports: [CommonModule, SpinnerComponent,RouterModule],
  templateUrl: './plan-detail.component.html',
  styleUrl: './plan-detail.component.css'
})
export class PlanDetailComponent {

  constructor(
    private planService: PlanService,
    private router: Router,

  ) { }


  plan: any;


  startDate: any;
  endDate: any;

  isLoading: boolean = true;

  selectedDay: any = null;


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

  onSelectDay(day: any) {
    this.selectedDay = day;


    console.log(this.selectedDay)
  }


  ngOnInit() {

    const planId = Number(this.router.url.split('/').pop());
    console.log(planId)
    this.getPlanDetailById(planId);
  }

  getPlanDetailById(planId: number) {
    this.isLoading = true;
    this.planService.getPlanById(planId).subscribe(
      (response) => {
        this.plan = response.data;

        this.plan.content = JSON.parse(this.plan.content.replace(/^```json\n/, '').replace(/\n```$/, '')).plan
        this.startDate = this.plan.content.days[0].date;
        this.endDate = this.plan.content.days[this.plan.content.days.length - 1].date;
        this.selectedDay = this.plan.content.days[0];
        console.log(this.selectedDay)
        console.log(this.plan)
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching plan details:', error);
        this.isLoading = false;
      }
    );
  }



  updatePlanStatus(planStatus: string) {
    this.isLoading = true;
    this.planService.updatePlanStatus(this.plan.id, planStatus).subscribe(
      (response) => {
        console.log(response)
        this.triggerSuccess();
        this.isLoading = false;
        this.getPlanDetailById(this.plan.id);
      },
      (error) => {
        console.error('Error updating plan status:', error);
        this.triggerError();
        this.isLoading = false;
      }
    );
  }


}

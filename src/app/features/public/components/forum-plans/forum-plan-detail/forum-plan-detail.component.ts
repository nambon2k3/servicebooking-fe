import { Component } from '@angular/core';
import { AfterViewInit } from '@angular/core';
import { UserStorageService } from '../../../../../core/services/user-storage/user-storage.service';
import { Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FooterComponent } from '../../../../../shared/components/footer/footer.component';
import { SpinnerComponent } from '../../../../../shared/components/spinner/spinner.component';
import { Modal } from 'flowbite';
import { GeminiService } from '../../../../public/components/plan/gemini.service';
import { ImageSearchService } from '../../../../public/components/plan/plan-detail/imge.service';
import { PlanService } from '../../../../customer/services/plan.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
@Component({
  selector: 'app-forum-plan-detail',
  imports: [CommonModule,
    FooterComponent,
    SpinnerComponent,
    ReactiveFormsModule,
    DatePipe],
  templateUrl: './forum-plan-detail.component.html',
  styleUrl: './forum-plan-detail.component.css'
})
export class ForumPlanDetailComponent {

  constructor(
    private planService: PlanService,
    private userStorageService: UserStorageService,
    private router: Router,
    private fb: FormBuilder,
    private geminiService: GeminiService,
    private imageSearchService: ImageSearchService
  ) {

  }


  reviewModal: Modal | null = null;

  reviewForm!: FormGroup;



  serviceModal: Modal | null = null;

  activityModal: Modal | null = null;

  editActivityModal: Modal | null = null;

  editTimeModal: Modal | null = null;

  selectedActivity: any;

  onSubmit() {
    if (this.reviewForm.valid) {
      this.isLoading = true;
      this.planService.saveReview(this.planId, this.reviewForm.value).subscribe(
        (response: any) => {
          console.log('Ngon')
          this.isLoading = false;
          this.getPlanReviewsById(this.planId)
        },
        (error: any) => {
          console.error('Error fetching plan details:', error);
          this.isLoading = false;
        }
      );
      this.reviewForm.reset();
    } else {
      console.log(this.reviewForm.value)
    }
  }


  ngAfterViewInit(): void {
    this.serviceModal = new Modal(document.getElementById('service-modal'));
    this.activityModal = new Modal(document.getElementById('activity-modal'));
    this.editActivityModal = new Modal(
      document.getElementById('authentication-modal')
    );

    this.reviewModal = new Modal(document.getElementById('reviewModal'))

    this.editTimeModal = new Modal(document.getElementById('crud-modal'));
  }

  plan: any;

  startDate: any;
  endDate: any;

  isLoading: boolean = true;

  selectedDay: any = null;

  isEdited: boolean = false;

  ids: any[] = [];

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

  activities: any[] = [];
  filteredActivities: any[] = [];

  planId: number = 0;

  ngOnInit() {
    const planId = Number(this.router.url.split('/').pop());
    console.log(planId);

    this.planId = planId;

    this.getPlanDetailById(planId);
    this.getPlanReviewsById(planId);

    this.reviewForm = this.fb.group({
      content: [
        '',
        [
          Validators.required,
          Validators.minLength(20),
          Validators.maxLength(255)
        ]
      ],
      userId: [this.userStorageService.getUserId(), Validators.required]
    });
  }

  onSelectDay(day: any) {
    this.selectedDay = day;

    console.log(this.selectedDay);
  }


  getPlanDetailById(planId: number) {
    this.isLoading = true;
    this.planService.getPlanById(planId).subscribe(
      (response: any) => {
        this.plan = response.data;

        this.plan.content = JSON.parse(
          this.plan.content.replace(/^```json\n/, '').replace(/\n```$/, '')
        ).plan;
        this.startDate = this.plan.content.days[0].date;
        this.endDate =
          this.plan.content.days[this.plan.content.days.length - 1].date;
        this.selectedDay = this.plan.content.days[0];

        console.log(this.selectedDay);

        const ids: number[] = Array.from(
          new Set(
            this.plan.content.days.flatMap((day: any) => [
              ...day.hotels.map((hotel: any) => hotel.id),
              ...day.restaurants.map((restaurant: any) => restaurant.id),
            ])
          )
        );

        this.ids = ids;
        console.log(this.plan);
        this.isLoading = false;
      },
      (error: any) => {
        console.error('Error fetching plan details:', error);
        this.isLoading = false;
      }
    );
  }



  reviews: any;

  getPlanReviewsById(planId: number) {
    this.isLoading = true;
    this.planService.getPlanReviewsById(planId).subscribe(
      (response: any) => {
        this.reviews = response.data.sort((a:any, b: any) => b.id - a.id);
        this.isLoading = false;
        this.triggerSuccess()
      },
      (error: any) => {
        console.error('Error fetching plan reviews:', error);
        this.isLoading = false;
      }
    );
  }

  updateSelectedDay(updatedDay: any): void {
    const index = this.plan.content.days.findIndex(
      (d: any) => d.date === updatedDay.date
    );
    if (index !== -1) {
      this.plan.content.days[index] = { ...updatedDay };
      this.selectedDay = this.plan.content.days[index];
    }
  }





}

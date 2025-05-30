import { AfterViewInit, Component } from '@angular/core';
import { PlanService } from '../../../services/plan.service';
import { UserStorageService } from '../../../../../core/services/user-storage/user-storage.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../../../../../shared/components/footer/footer.component';
import { SpinnerComponent } from "../../../../../shared/components/spinner/spinner.component";
import { Modal } from 'flowbite';
import { GeminiService } from '../../../../public/components/plan/gemini.service';
import { ImageSearchService } from '../../../../public/components/plan/plan-detail/imge.service';
@Component({
  selector: 'app-plan-detail',
  imports: [CommonModule, FooterComponent, SpinnerComponent],
  templateUrl: './plan-detail.component.html',
  styleUrl: './plan-detail.component.css'
})
export class PlanDetailComponent implements AfterViewInit {

  constructor(
    private planService: PlanService,
    private userStorageService: UserStorageService,
    private router: Router,
    private geminiService: GeminiService,
    private imageSearchService: ImageSearchService

  ) { }

  serviceModal: Modal | null = null;

  activityModal: Modal | null = null;


  ngAfterViewInit(): void {
    this.serviceModal = new Modal(document.getElementById('service-modal'));
    this.activityModal = new Modal(document.getElementById('activity-modal'));
  }

  openActivityModal() {
    if (this.activityModal) {
      this.activityModal.show();
    }
    this.fetchActivities();
  }

  closeActivityModal() {
    if (this.activityModal) {
      this.activityModal.hide();
    }
  }

  selectedCategoryName: string = 'Hotel';

  openServiceModal(categoryName: string) {
    if (this.serviceModal) {
      this.serviceModal.show();
    }
    this.selectedCategoryName = categoryName;
    console.log(this.selectedCategoryName)


    this.fetchProviderByCategoryAndLocationId(this.plan.content.locationId, this.selectedCategoryName);

  }

  closeServiceModal() {
    if (this.serviceModal) {
      this.serviceModal.hide();
    }
  }

  plan: any;


  startDate: any;
  endDate: any;

  isLoading: boolean = true;

  selectedDay: any = null;

  isEdited: boolean = false;

  ids: any[] = [];

  onEditPlan() {
    this.isEdited = !this.isEdited;
  }


  deleteRestaurant(restaurant: any) {

    console.log(restaurant)

    console.log(this.selectedDay.restaurants)

    this.selectedDay.restaurants = this.selectedDay.restaurants.filter((r: any) => r.id !== restaurant.id);

    this.triggerSuccess();

    this.updateSelectedDay(this.selectedDay);

  }

  deleteActivity(activity: any) {
    console.log(activity)
    console.log(this.selectedDay.activities)
    this.selectedDay.activities = this.selectedDay.activities.filter((a: any) => a.id !== activity.id);
    this.triggerSuccess();

    this.updateSelectedDay(this.selectedDay);
  }


  deleteHotel(hotel: any) {
    console.log(hotel)

    console.log(this.selectedDay.hotels)

    this.selectedDay.hotels = this.selectedDay.hotels.filter((r: any) => r.id !== hotel.id);

    this.triggerSuccess();

    this.updateSelectedDay(this.selectedDay);
  }




  onCancel() {
    this.getPlanDetailById(this.plan.id);
    this.isEdited = false;
  }


  onSave() {
    console.log(this.plan)
    this.isEdited = false;

    const content = '{"plan":' + JSON.stringify(this.plan.content) + '}';

    this.planService.updatePlan(this.plan.id, content).subscribe(
      (response) => {
        console.log('Plan updated successfully:', response);
        this.triggerSuccess();
      },
      (error) => {
        console.error('Error updating plan:', error);
        this.triggerError();
      }
    );
  }

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


  ngOnInit() {

    const planId = Number(this.router.url.split('/').pop());
    console.log(planId)
    this.getPlanDetailById(planId);
  }

  onSelectDay(day: any) {
    this.selectedDay = day;


    console.log(this.selectedDay)
  }


  filterActivities(event: Event) {
    const input = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredActivities = this.activities.filter(activity =>
      activity.title.toLowerCase().includes(input)
    );
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

        const ids: number[] = Array.from(new Set(
          this.plan.content.days.flatMap((day: any) => [
            ...day.hotels.map((hotel: any) => hotel.id),
            ...day.restaurants.map((restaurant: any) => restaurant.id)
          ])
        ));

        this.ids = ids;
        console.log(this.plan)
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching plan details:', error);
        this.isLoading = false;
      }
    );
  }


  updateSelectedDay(updatedDay: any): void {
    const index = this.plan.content.days.findIndex((d: any) => d.date === updatedDay.date);
    if (index !== -1) {
      this.plan.content.days[index] = { ...updatedDay };
      this.selectedDay = this.plan.content.days[index];
    }
  }


  providers: any[] = [];
  filteredProviders: any[] = [];

  filterProvider(event: Event) {
    const input = (event.target as HTMLInputElement).value.toLowerCase();

    console.log(input)

    this.filteredProviders = this.providers.filter(provider =>
      provider.name.toLowerCase().includes(input)
    );
  }


  fetchProviderByCategoryAndLocationId(locationId: number, categoryName: string) {
    this.providers = [];
    this.planService.fetchProviderByCategoryAndLocationId(locationId, categoryName, this.ids).subscribe(
      (response) => {
        console.log('Providers fetched successfully:', response);
        this.providers = response.data;
        this.filteredProviders = response.data;
      },
      (error) => {
        console.error('Error fetching providers:', error);
      }
    );

  }

  response: any;

  fetchActivities() {
    const maxId = Math.max(...this.selectedDay.activities.map((activity: any) => activity.id));
    this.planService.fetchActivities(this.plan.content.location, this.plan.content.preferences, maxId + 1).subscribe(
      (response) => {
        this.geminiService.generateContent(response.data)
          .subscribe({
            next: (res) => {
              this.response = res?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';


              this.response = this.response
                .replace(/```/g, '')
                .replace(/json/g, '')
                .trim();

              console.log(this.response)
              this.activities = JSON.parse(this.response).activities;

              this.activities.forEach((activity: any) => {
                this.imageSearchService.getImageUrl(activity.title).subscribe({
                  next: (response: any) => {
                    // Assuming the response contains the image result array
                    activity.imageUrl = response.images_results?.[0]?.thumbnail || 'https://via.placeholder.com/300';
                  },
                  error: (error) => {
                    console.error('Error fetching image:', error);
                    activity.imageUrl = 'https://via.placeholder.com/300'; // Default image if error occurs
                  }
                });
              });



              this.filteredActivities = this.activities;
            },
            error: (err) => {
              console.error('Gemini API error:', err);
              // Handle error case
            },
          });
      },
      (error) => {
        console.error('Error fetching activities:', error);
      }
    );
  }

  onSelectActivity(activity: any) {
    console.log(activity)
    this.selectedDay.activities.push(activity);
    this.triggerSuccess();
    this.updateSelectedDay(this.selectedDay);
    this.closeActivityModal();
  }


  onSelectProvider(provider: any) {
    console.log(provider)
    if (this.selectedCategoryName === 'Hotel') {
      this.selectedDay.hotels.push(provider);
      this.triggerSuccess();
    } else if (this.selectedCategoryName === 'Restaurant') {
      this.selectedDay.restaurants.push(provider);
      this.triggerSuccess();
    } else if (this.selectedCategoryName === 'Activity') {
      this.selectedDay.activities.push(provider);
      this.triggerSuccess();
    }
    this.updateSelectedDay(this.selectedDay);
    this.closeServiceModal();
  }


  onSendRequest() {

    this.planService.senRequestPlan(this.plan.id).subscribe(
      (response) => {
        console.log('Plan updated successfully:', response);
        this.successMessage = 'Gửi yêu cầu thành công';
        this.triggerSuccess();
        this.successMessage = 'Thay đổi thành công';
        this.getPlanDetailById(this.plan.id);
      },
      (error) => {
        console.error('Error updating plan:', error);
        this.triggerError();
      }
    );
  }





}

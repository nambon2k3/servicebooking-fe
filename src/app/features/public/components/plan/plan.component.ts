import { CommonModule, DatePipe } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';
import { PlanService } from '../../services/plan.service/plan.service';
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Modal } from 'flowbite';
import { UserStorageService } from '../../../../core/services/user-storage/user-storage.service';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { GeminiService } from './gemini.service';
import { ImageSearchService } from './plan-detail/imge.service';
import { WeatherService } from '../../services/weather/weather.service';

@Component({
  selector: 'app-plan',
  imports: [CommonModule, CommonModule, ReactiveFormsModule, RouterModule, FormsModule, SpinnerComponent, DatePipe],
  templateUrl: './plan.component.html',
  styleUrl: './plan.component.css'
})
export class PlanComponent implements AfterViewInit {

  suggesLocations: any;

  isLoading: boolean = false;

  generatePlanForm: FormGroup;

  locations: any;
  selectedLocation: any;

  isGenerating: boolean = false;

  WEATHER_API_KEY = "1c1b78e3960d40948f191126250602";

  constructor(
    private planService: PlanService,
    private router: RouterModule,
    private fb: FormBuilder,
    private userStorageService: UserStorageService,
    private route: Router,
    private geminiService: GeminiService,
    private imageSearchService: ImageSearchService,
    private weatherService: WeatherService,
  ) {

    this.generatePlanForm = this.fb.group({
      locationId: ['', [Validators.required]],
      locationName: [''],
      userId: ['', [Validators.required]],
      startDate: [''],
      endDate: [''],
      preferences: ['Đồ ăn ngon, Nghệ thuật và văn hóa', [Validators.required]],
      planType: ['Du lịch Cá Nhân', [Validators.required]],
      travelingWithChildren: [false],
    });

    this.addInterestForm = this.fb.group({
      interest: ['']
    });


    this.generatePlanForm.get('locationName')?.valueChanges
      .pipe(
        debounceTime(800),
        distinctUntilChanged()
      )
      .subscribe(value => {
        if (value && value.length >= 2 && !this.selectedLocation) {
          this.isLoading = true;
          this.planService.getAllLocationData(value).subscribe(res => {
            this.locations = res.data;
            console.log('Locations:', this.locations);
            this.isLoading = false;
          }, () => this.isLoading = false);
        } else {
          this.locations = [];
        }
      });

  }

  addInterest() {
    this.otherInterest = this.addInterestForm.value.interest;

  }

  interestModal: Modal | null = null;

  ngAfterViewInit(): void {

    this.interestModal = new Modal(document.getElementById('interest-modal'));

  }

  openModal() {
    if (this.interestModal) {
      this.interestModal.show();
    } else {
      console.log('Open modal Failed')
    }
  }

  closeModal() {
    if (this.interestModal) {
      this.interestModal.hide();
    } else {
      console.log('Hide modal Failed')
    }
  }

  get locationName() {
    return this.generatePlanForm.get('locationName');
  }

  maxEndDate: string = '';
  minEndDate: string = '';

  calculateEndDate() {
    const startDate = this.generatePlanForm.get('startDate')?.value;

    if (startDate) {
      const start = new Date(startDate);
      this.minEndDate = start.toISOString().split('T')[0];
      start.setDate(start.getDate() + 6); // Calculate End Date
      const endDateFormatted = start.toISOString().split('T')[0];

      this.maxEndDate = endDateFormatted;






    } // Set maxEndDate to 7 days after start date} 
    else {
      this.minEndDate = new Date().toISOString().split('T')[0];
    }
  }

  addInterestForm: FormGroup;

  otherInterest: string = '';

  selectLocation(location: any) {
    console.log('Selected location:', location);
    this.selectedLocation = location;
    this.locations = []; // Clear the suggestions after selection
    this.generatePlanForm.patchValue({
      locationId: location.id,
      locationName: location.name,
    });
    this.nextStep();
  }

  ngOnInit(): void {
    // Initialization logic can go here
    this.getLocations();
    this.setMinStartDate();

    this.generatePlanForm.patchValue({
      userId: this.userStorageService.getUserId()
    })
  }

  getLocations() {
    this.planService.getLocationData().subscribe({
      next: (response) => {
        this.suggesLocations = response.data;
      },
      error: (error) => {
        console.error('Error fetching locations:', error);
      }
    });
  }

  onPlanChange(plan: string): void {
    console.log('Selected plan:', plan);
    // Handle the plan change logic here
  }


  response: any;

  onSubmit() {
    if (this.generatePlanForm.valid) {
      const formData = this.generatePlanForm.value;
      formData.isTravelingWithChildren = this.isTravelingWithChildren; // Set the traveling with children flag

      this.selectedInterests.push(this.otherInterest);

      formData.preferences = this.selectedInterests.join(', ');

      console.log('Form submitted:', this.generatePlanForm.value);


      this.isGenerating = true;

      //Handle form submission logic here
      this.planService.generatePlan(formData).subscribe(
        (response) => {

          console.log(response)
          this.geminiService.generateContent(response.data)
            .subscribe({
              next: async (res) => {
                this.isGenerating = false;
                this.response = res?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';

                this.response = this.response
                  .replace(/```/g, '')
                  .replace(/json/g, '')
                  .trim();

                this.response = JSON.parse(this.response);
                console.log('Parsed response:', this.response);
                await this.loadImagesForActivities();

                console.log('Updated response:', this.response);

                this.planService.savePlan(this.userStorageService.getUserId(), JSON.stringify(this.response))
                  .subscribe({
                    next: (res) => {
                      console.log(res)
                      console.log('Plan saved successfully:', res);
                      this.route.navigate(['/plan-detail', res.data]);
                    },
                    error: (err) => {
                      console.error('Gemini API error:', err);
                      this.isGenerating = false;
                      // Handle error case
                    },
                  });

              },
              error: (err) => {
                console.error('Gemini API error:', err);
                this.isGenerating = false;
                // Handle error case
              },
            });
        },
        (error) => {
          console.error('Error generating plan:', error);
          // Handle error case
        }
      );





    } else {
      console.log('Form is invalid:', this.generatePlanForm.value);
    }
  }

  async loadImagesForActivities(): Promise<void> {
    this.isGenerating = true;
    const imageFetchTasks: Promise<void>[] = [];

    this.response.plan.days.forEach((day: any) => {
      day.activities.forEach((activity: any) => {
        const task = this.imageSearchService.getImageUrl(activity.title)
          .toPromise()
          .then((res) => {
            activity.imageUrl = res.images_results?.[0]?.thumbnail || 'https://statics.vinpearl.com/pho-co-ha-noi-10_1687918089.jpg';
          })
          .catch((err) => {
            console.error(`Error fetching image for ${activity.title}:`, err);
            activity.imageUrl = 'https://statics.vinpearl.com/pho-co-ha-noi-10_1687918089.jpg';
          });

        imageFetchTasks.push(task);
      });
    });

    await Promise.all(imageFetchTasks);
    this.isGenerating = false;
  }

  selectTrip(trip: any) {
    this.selectedTrip = trip;
    this.generatePlanForm.patchValue({ planType: trip.label });
    console.log('Selected trip:', trip);
  }


  interests: string[] = [
    'Danh lam thắng cảnh nổi tiếng',
    'Di tích lịch sử - văn hóa',
    'Làng cổ & phố cổ',
    'Ẩm thực đường phố Việt Nam',
    'Đặc sản vùng miền',
    'Nghệ thuật truyền thống (hát chèo, cải lương, múa rối nước)',
    'Lễ hội văn hóa đặc sắc',
    'Tour sinh thái & cộng đồng',
    'Trải nghiệm làm nông dân/ngư dân',
    'Khám phá vẻ đẹp thiên nhiên hoang sơ',
    'Chợ truyền thống & mua sắm đặc sản',
    'Thưởng thức cà phê Việt'
  ];

  selectedInterests: string[] = [];

  toggleInterest(interest: string): void {
    const index = this.selectedInterests.indexOf(interest);
    if (index === -1) {
      this.selectedInterests.push(interest);
    } else {
      this.selectedInterests.splice(index, 1);
    }

    console.log('Selected interests: ', this.selectedInterests)
  }

  isSelected(interest: string): boolean {
    return this.selectedInterests.includes(interest) || this.otherInterest != '';
  }


  tripTypes = [
    { label: 'Du lịch Cá Nhân', icon: '👤' },
    { label: 'Tuần Trang Mật', icon: '💑' },
    { label: 'Du lịch bạn bè', icon: '👥' },
    { label: 'Du lịch gia đình', icon: '👨‍👩‍👧‍👦' },
  ];

  selectedTrip = this.tripTypes[0];
  isTravelingWithChildren = false;

  steps = [
    { label: 'Step 1' },
    { label: 'Step 2' },
    { label: 'Step 3' },
    { label: 'Step 4' },
    { label: 'Step 5' }
  ];

  currentStep = 0;
  widthProgress = 20;

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  showError: boolean = false;
  errorMessage: string = 'Hãy chọn địa điểm!';

  showErrorMessage() {
    this.showError = true;
    setTimeout(() => {
      this.showError = false;
    }, 3000); // Hide after 3 seconds
  }

  weatherData: any;


  getWeather(locationName: string, targetDate: string) {
    this.weatherService.getWeatherForecastForDay(locationName, targetDate).subscribe({
      next: (response) => {
        const parsed = JSON.parse(response.data);
        const day = parsed.forecast.forecastday[0];

        const weather = {
          date: day.date,
          weatherDetail: {
            maxtemp_c: day.day.maxtemp_c,
            maxtemp_f: day.day.maxtemp_f,
            mintemp_c: day.day.mintemp_c,
            mintemp_f: day.day.mintemp_f,
            avgtemp_c: day.day.avgtemp_c,
            avgtemp_f: day.day.avgtemp_f,
            avghumidity: day.day.avghumidity,
            condition: {
              text: day.day.condition.text,
              icon: day.day.condition.icon
            },
            uv: day.day.uv
          }
        };

        this.weatherData.push(weather);
        console.log('Weather data:', this.weatherData);
      },
      error: (error) => {
        console.error('Error fetching weather data:', error);
      }
    });
  }

  removeVietnameseTones(str: string): string {
    return str
      .normalize('NFD')                       // Tách dấu khỏi ký tự gốc
      .replace(/[\u0300-\u036f]/g, '')        // Xóa các dấu
      .replace(/đ/g, 'd')                     // Thay đ bằng d
      .replace(/Đ/g, 'd')                     // Thay Đ bằng d
      .toLowerCase()                          // Chuyển thành chữ thường
      .replace(/\s+/g, '');                   // Bỏ khoảng trắng (nếu cần)
  }

  nextStep() {


    if (this.currentStep == 0) {
      if (this.selectedLocation) {
        this.currentStep++;
      } else {
        console.log('Please select a location!');
        this.showErrorMessage();
      }
    } else if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
    }


    if (this.currentStep == 2) {
      const location = this.removeVietnameseTones(this.selectedLocation.name);

      const rawDate = new Date(this.generatePlanForm.get('startDate')?.value);
      const yyyy = rawDate.getFullYear();
      const mm = String(rawDate.getMonth() + 1).padStart(2, '0');
      const dd = String(rawDate.getDate()).padStart(2, '0');
      const formattedDate = `${yyyy}-${mm}-${dd}`;
      console.log(formattedDate); // Ví dụ: '2025-06-13'


      const startDateRaw = new Date(this.generatePlanForm.get('startDate')?.value);
      const endDateRaw = new Date(this.generatePlanForm.get('endDate')?.value);

      this.weatherData = []; // clear trước

      const currentDate = new Date(startDateRaw);

      while (currentDate <= endDateRaw) {
        const yyyy = currentDate.getFullYear();
        const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
        const dd = String(currentDate.getDate()).padStart(2, '0');
        const formattedDate = `${yyyy}-${mm}-${dd}`;

        console.log('Selected location:', location);
      console.log('Start date:', formattedDate);

        this.getWeather(location, formattedDate);

        // tăng lên 1 ngày
        currentDate.setDate(currentDate.getDate() + 1);
      }


      
      

      return;
    }

  }

  goToStep(index: number) {
    this.currentStep = index;
  }

  minStartDate: string = '';

  setMinStartDate() {
    const today = new Date();
    today.setDate(today.getDate() + 15); // Set to tomorrow
    this.minStartDate = today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }

}

// assign-tour-guide.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TourService } from '../../../services/tour.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-assign-tour-guide',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './assign-tour-guide.component.html',
  styleUrls: ['./assign-tour-guide.component.css']
})
export class AssignTourGuideComponent implements OnChanges {
  @Input() scheduleId!: number;
  @Input() tour: any;
  @Output() tourGuideAssigned = new EventEmitter<void>();

  assignForm!: FormGroup;
  tourGuides: any[] = [];
  id: number = 0;
  showDropdown: boolean = false;
  filteredTourGuides: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private tourService: TourService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.assignForm = this.fb.group({
      searchText: [''],
      tourGuideId: [null, Validators.required],
      meetingLocation: ['', Validators.required],
      departureHour: [0, [Validators.required, Validators.min(0), Validators.max(23)]],
      departureMinute: [0, [Validators.required, Validators.min(0), Validators.max(59)]],
      departureSecond: [0, [Validators.required, Validators.min(0), Validators.max(59)]],
      departureNano: [0]
    });

    this.route.queryParams.subscribe(params => {
      this.scheduleId = params['id'];
      if (this.scheduleId) {
        this.fetchTourGuides();
      }
    });

    this.assignForm.get('searchText')?.valueChanges.subscribe(value => {
      this.filterGuides(value);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tour'] && this.tour) {
      this.populateFormWithTourData();
    }
  }

  populateFormWithTourData() {
    if (this.tour) {
      if (this.tour.meetingLocation && this.tour.meetingLocation !== 'null') {
        this.assignForm.patchValue({ meetingLocation: this.tour.meetingLocation });
      }

      if (this.tour.tourGuideName && this.tour.tourGuideName !== 'null') {
        this.assignForm.patchValue({
          searchText: this.tour.tourGuideName,
          tourGuideId: this.tour.tourGuideId || null 
        });
      }

      if (this.tour.departureTime && this.tour.departureTime !== 'null') {
        const [hour, minute, second] = this.tour.departureTime.split(':').map(Number);
        this.assignForm.patchValue({
          departureHour: hour || 0,
          departureMinute: minute || 0,
          departureSecond: second || 0
        });
      }
      this.showDropdown = false;
    }
  }

  fetchTourGuides(): void {
    this.tourService.getListTourGuide(this.scheduleId).subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.tourGuides = response;
        } else if (response && Array.isArray(response.data)) {
          this.tourGuides = response.data;
        } else {
          this.tourGuides = [];
          console.warn('No valid tour guide data received from API');
        }
        this.filteredTourGuides = [...this.tourGuides];
        // After fetching, ensure the existing tour guide is still set
        this.populateFormWithTourData();
      },
      error: (error: any) => {
        console.error('Error fetching tour guides:', error);
        this.tourGuides = [];
        this.filteredTourGuides = [];
      }
    });
  }

  filterGuides(query: string): void {
    const searchText = query?.toLowerCase() || '';
    this.filteredTourGuides = this.tourGuides.filter(guide =>
      guide.fullName?.toLowerCase().includes(searchText)
    );
  }

  selectGuide(guide: any) {
    this.assignForm.patchValue({
      searchText: guide.fullName,
      tourGuideId: guide.id
    });
    this.toggleDropdown();
  }

  assignGuide() {
    if (this.assignForm.valid) {
      const { departureHour, departureMinute, departureSecond, tourGuideId } = this.assignForm.value;
      const departureTime = `${departureHour.toString().padStart(2, '0')}:${departureMinute.toString().padStart(2, '0')}:${departureSecond.toString().padStart(2, '0')}`;

      const finalTourGuideId = tourGuideId || (this.tour?.tourGuideId && this.tour.tourGuideId !== 'null' ? this.tour.tourGuideId : null);

      const formData = {
        departureTime: departureTime,
        tourGuideId: finalTourGuideId,
        meetingLocation: this.assignForm.value.meetingLocation
      };

      this.tourService.assignTourGuide(this.scheduleId, formData).subscribe({
        next: (response: any) => {
          if (response.code === 200) {
            this.tourGuideAssigned.emit();
            this.assignForm.reset();
          } else {
            console.error('Error:', response.message);
          }
        },
        error: (error: any) => {
          console.error('Error assigning tour guide:', error);
        }
      });
    } else {
      console.error('Invalid form data');
    }
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }
}
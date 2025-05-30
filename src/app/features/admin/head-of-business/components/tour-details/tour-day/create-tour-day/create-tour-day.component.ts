import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BlogContentComponent } from '../../../../../marketer/components/blog-detail/blog-content/blog-content.component';
import { TourService } from '../../../../services/tour.service';
import { LocationService } from '../../../../services/location/location.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Subject } from 'rxjs';
import { IDropdownSettings, NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';


interface Meal {
  id: string;
  name: string;
}

interface Location {
  id: number;
  name: string;
}

@Component({
  selector: 'app-create-tour-day',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BlogContentComponent,
    ReactiveFormsModule,
    NgSelectComponent,
    NgMultiSelectDropDownModule // Import multiselect dropdown
  ],
  templateUrl: './create-tour-day.component.html',
  styleUrls: ['./create-tour-day.component.css'],
})

export class CreateTourDayComponent {
  @Input() tourId: string | null = null;
  @Output() tourChange: EventEmitter<any> = new EventEmitter<any>();
  editTourForm!: FormGroup;
  description: string | null = null;
  dropdownList: Location[] = [];
  dropdownMealList: Meal[] = [];
  dropdownServiceList: Meal[] = [];
  locations: Location[] = [];
  searchText$ = new Subject<string>();
  dropdownSettings: IDropdownSettings = {};

  mealOptions: Meal[] = [
    { id: 'breakfast', name: 'Bữa Sáng' },
    { id: 'lunch', name: 'Bữa Trưa' },
    { id: 'dinner', name: 'Bữa Tối' },
  ];

  serviceOptions: Meal[] = [
    { id: 'Restaurant', name: 'Nhà Hàng' },
    { id: 'Hotel', name: 'Khách Sạn' },
    { id: 'Activity', name: 'Hoạt Động' },
    { id: 'Flight Ticket', name: 'Vé máy bay' },
    { id: 'Transport', name: 'Vận chuyển' },
  ];

  constructor(
    private fb: FormBuilder,
    private tourService: TourService,
    private locationService: LocationService
  ) { }

  ngOnInit(): void {
    this.editTourForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      mealPlan: ['', Validators.required],  // Cập nhật kiểu dữ liệu thành array
      locationId: [null, [Validators.required, Validators.min(0)]],
      serviceCategories: [[], Validators.required], // Cập nhật kiểu dữ liệu thành array
    });


    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      allowSearchFilter: true,
      enableCheckAll: false,
      itemsShowLimit: 3,
      searchPlaceholderText: 'Tìm kiếm dịch vụ...',
    };

    this.mealOptions = this.mealOptions || [];
    this.serviceOptions = this.serviceOptions || [];
    this.dropdownMealList = this.mealOptions;
    this.dropdownServiceList = this.serviceOptions;

    this.loadLocations();
  }

  onSubmit() {
    const formValue = this.editTourForm.value;
    const mealIds = formValue.mealPlan.map((meal: any) => meal.id);
    const mealPlanFormatted = `${mealIds.length}(${mealIds.join(', ')})`;
    const serviceCategoriesFormatted = formValue.serviceCategories.map((service: any) => service.id); 


    const payload = {
      title: formValue.title,
      content: formValue.content,
      mealPlan: mealPlanFormatted, // Định dạng lại chuỗi mealPlan
      locationId: formValue.locationId,
      serviceCategories: serviceCategoriesFormatted
    };

    this.tourService.createTourDay(this.tourId!, payload).subscribe({
      next: (response) => {
        this.tourChange.emit(response.data);
        this.editTourForm.reset();
      },
      error: (error) => {
        console.error('Error creating tour day', error);
      },
    });
  }

  loadLocations(keyword: string = ''): void {
    this.locationService.getLocationByPage(0, 100, keyword).subscribe({
      next: (response: any) => {
        this.locations = response.data.items;
        this.dropdownList = this.locations;
      },
      error: (err: any) => {
        console.error('Failed to load locations:', err);
      },
    });
  }

  onSearch(event: any): void {
    const keyword = event || '';
    this.searchText$.next(keyword);
  }
}
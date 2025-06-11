import { Component, OnInit } from '@angular/core';
import { Activity } from '../../../../core/models/activity.model'; // Define your activity model
import { FooterComponent } from "../../../../shared/components/footer/footer.component";
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ActivityService } from '../../services/activity.service'; // Import your activity service
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, FooterComponent],
})
export class ActivitiesComponent implements OnInit {
  activities: Activity[] = [];
  filteredActivities: Activity[] = [];
  searchQuery: string = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  currentPage: number = 0;
  totalPages: number = 1;
  pageSize: number = 9;
  errorMessage: string | null = null;

  constructor(private activityService: ActivityService) {}

  ngOnInit() {
    this.loadActivities();
  }

  loadActivities() {
    console.log('loadActivities called with:', {
      page: this.currentPage,
      size: this.pageSize,
      keyword: this.searchQuery || undefined,
      budgetFrom: this.minPrice || undefined,
      budgetTo: this.maxPrice || undefined,
    });
    this.activityService
      .getAllActivity(
        this.currentPage,
        this.pageSize,
        this.searchQuery || undefined,
        this.minPrice || undefined,
        this.maxPrice || undefined
      )
      .subscribe({
        next: (response) => {
          console.log('API Response:', response); // Debug
          this.activities = response.data.items;
          this.filteredActivities = this.activities;
          this.totalPages = Math.ceil(response.data.total / this.pageSize);
          this.errorMessage = null;
        },
        error: (error) => {
          console.error('Error fetching activities:', error); // Debug
          this.errorMessage = 'Không thể tải danh sách hoạt động. Vui lòng thử lại sau.';
        },
      });
  }

  searchActivities() {
    this.currentPage = 0; // Reset to first page on search
    this.loadActivities(); // Call API with updated search query
  }

  filterActivities() {
    this.currentPage = 0; // Reset to first page on filter
    this.loadActivities(); // Call API with updated price filters
  }

  changePage(page: number) {
    this.currentPage = page;
    this.loadActivities();
  }

  openActivityDetail(id: number) {
    // Navigate to activity detail page (implement routing as needed)
  }
}
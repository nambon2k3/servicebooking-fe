import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TourService } from '../../../services/tour.service';
import { response } from 'express';
@Component({
  selector: '[app-table-row]',
  imports: [FormsModule, AngularSvgIconModule, CommonModule, RouterModule],
  templateUrl: './table-row.component.html',
  styleUrl: './table-row.component.css',
})
export class TableRowComponent {
  @Input() tourData: any = <any>{};
  @Input() index: any = <any>{};

  ngOnInit(): void {
    console.log(this.tourData)
  }

  constructor(
    private tourService: TourService
  ) {

  }

  error: boolean= false;

  updateStatus() {

    this.tourService.updateTourStatus(this.tourData?.tour?.id, 'DRAFT').subscribe({
      next: (response) => {
        console.log('Response:', response);
        this.tourData.tour.tourStatus = 'DRAFT'
        this.triggerSuccess();
      },
      error: (error) => {
        console.error('Error:', error);
        this.triggerError();
      }
    })
  }

  success: boolean = false;

  triggerSuccess() {
    this.success = true;
    
    // Hide warning after 3 seconds
    setTimeout(() => {
      this.success = false;
    }, 4000);
  }

  triggerError() {
    this.error = true;
    
    // Hide warning after 3 seconds
    setTimeout(() => {
      this.error = false;
    }, 4000);
  }
  
}

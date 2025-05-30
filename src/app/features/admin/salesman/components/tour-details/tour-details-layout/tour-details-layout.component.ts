import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
import { TourService } from '../../../../head-of-business/services/tour.service';

@Component({
  selector: 'app-tour-details-layout',
  imports: [
    RouterOutlet,
    RouterModule,
    CommonModule
  ],
  templateUrl: './tour-details-layout.component.html',
  styleUrl: './tour-details-layout.component.css'
})
export class TourDetailsLayoutComponent {
  tourId: string | null = null;
  tour : any | null = null;
  
  constructor(
    private router : Router,
    private route: ActivatedRoute, 
    private tourService: TourService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.tourId = params['id'] ? params['id'] : null;
    });
    this.loadTourDetails(this.tourId);
  }

  backToList() {
    this.router.navigate([`/salesman/tour-list-booking/${this.tourId}`]);
  }

  loadTourDetails(id: string | null): void {
      this.tourService.getTourById(id!).subscribe({
        next: (response: any) => {
          this.tour = response.data;
        },
        error: (err: any) => {
          console.error('Failed to load tour details:', err);
        },
      });
    }
}

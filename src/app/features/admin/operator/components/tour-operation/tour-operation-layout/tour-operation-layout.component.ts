import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet, ActivatedRoute } from '@angular/router';
import { TourService } from '../../../services/tour.service';
import { FormatDatePipe } from "../../../../../../shared/pipes/format-date.pipe";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tour-operation-layout',
  imports: [
    RouterOutlet,
    RouterModule,
    FormatDatePipe,
    CommonModule
  ],
  templateUrl: './tour-operation-layout.component.html',
  styleUrl: './tour-operation-layout.component.css'
})
export class TourOperationLayoutComponent {
  tourId: number | null = null;
  tour: any | null = null;
  tags: string = '';
  errorMessage: string = '';

  constructor(private route: ActivatedRoute, private router: Router,
    private tourService: TourService
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.tourId = params['id'];
    });
    this.getTourDetails(this.tourId!);
  }

  backToList() {
    if(this.tour.tourType === 'PRIVATE') {
      this.router.navigate(['/operator/view-list-tour-private']);
    } else{
      this.router.navigate(['/operator/view-list-tour']);
    }
  }

  getTourDetails(id: number) {
    this.tourService.getTourById(id).subscribe(response => {
      if (response.code === 200) {
        this.tour = response.data;
        this.tags = this.tour.tags?.map((tag: any) => tag.name).join(', ') || '';
      } else {
        this.errorMessage = response.message;
      }
    });
  }

  sendTour() {
    this.tourService.sendTour(this.tourId!).subscribe(response => {
      if (response.code === 200) {
        this.router.navigate(['/operator/view-list-tour']);
      } else {
        this.errorMessage = response.message;
      }
    });
  }

  receiveTour() {
    this.tourService.operateTour(this.tourId!).subscribe(response => {
      if (response.code === 200) {
        this.router.navigate(['/operator/view-list-tour']);
      } else {
        this.errorMessage = response.message;
      }
    });
  }
}

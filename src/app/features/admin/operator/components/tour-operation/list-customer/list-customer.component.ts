import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TourService } from '../../../services/tour.service';
import { CommonModule } from '@angular/common';
import { BirthDate } from "../../../../../../shared/pipes/birthdate.pipe";
import { SpinnerComponent } from "../../../../../../shared/components/spinner/spinner.component";

@Component({
  selector: 'app-list-customer',
  standalone: true,
  imports: [
    CommonModule,
    BirthDate,
    SpinnerComponent
],
  templateUrl: './list-customer.component.html',
  styleUrl: './list-customer.component.css'
})
export class ListCustomerComponent implements OnInit {
  listCustomers: any | null = null;
  isLoading: boolean = false;

  constructor(private route: ActivatedRoute, private tourService: TourService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadCustomers(id);
      }
    });
  }

  loadCustomers(id: number): void {
    this.isLoading = true;
    this.tourService.getTourCustomers(id).subscribe({
      next: (response : any) => {
        this.isLoading = false;
        if (response.code === 200) {
          this.listCustomers = response.data;
        } else {
          console.error('Lỗi:', response.message);
        }
      },
      error: (error : any) => {
        this.isLoading = false;
        console.error('Lỗi khi tải danh sách khách hàng:', error);
      }
    });
  }
}

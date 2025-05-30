import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TourService } from '../../../services/tour.service';
import { TourDay } from '../../../../../../core/models/tour.model';
import { UpdateTourDayComponent } from '../update-tour-day/update-tour-day.component';
import { CreateTourDayComponent } from './create-tour-day/create-tour-day.component';
import { SpinnerComponent } from "../../../../../../shared/components/spinner/spinner.component";
import { TruncatePipe } from "../../../../../../shared/pipes/truncate.pipe";

@Component({
  selector: 'app-tour-day',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UpdateTourDayComponent,
    CreateTourDayComponent,
    SpinnerComponent,
    TruncatePipe
],
  templateUrl: './tour-day.component.html',
  styleUrls: ['./tour-day.component.css']
})
export class TourDayComponent implements OnInit {
  @ViewChild('editTourDayModal') editTourDayModal!: UpdateTourDayComponent;
  @ViewChild('createTourDayModal') createTourDayModal!: CreateTourDayComponent;

  tourId: string | null = null;
  tourDays: TourDay[] = [];
  isLoading: boolean = false;
  translatedTourDays: { [key: string]: string[] } = {}; // Lưu danh sách dịch vụ đã dịch cho mỗi ngày

  constructor(
    private route: ActivatedRoute,
    private tourService: TourService,
  ) { }

  ngOnInit(): void {
    this.tourId = this.route.snapshot.queryParamMap.get('id');
    if (this.tourId) {
      this.getTourDays();
    }
  }

  getTourDays(): void {
    this.isLoading = true;
    if (this.tourId) {
      this.tourService.getTourDayById(this.tourId).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          if (response.code === 200) {
            this.tourDays = response.data;
            console.log('Danh sách ngày tour: ', this.tourDays);
            // Dịch serviceCategories cho mỗi ngày
            this.tourDays.forEach(day => {
              this.translatedTourDays[day.id] = this.translateServiceCategories(day.serviceCategories);
            });
          } else {
            console.error('Lỗi: ', response.message);
          }
        },
        error: (err: any) => {
          this.isLoading = false;
          console.error('Lỗi: ', err);
        },
      });
    }
  }

  onEdit(day: TourDay): void {
    if(this.editTourDayModal) {
      this.editTourDayModal.tourId = this.tourId;
      this.editTourDayModal.day = day;
      this.editTourDayModal.mapDataToForm(day);
      this.editTourDayModal.showModal();
    }
  }

  translateServiceCategories(categories: any[]): string[] {
    const translationMap: { [key: string]: string } = {
      "Restaurant": "Nhà hàng",
      "Hotel": "Khách sạn",
      "Activity": "Hoạt động",
      "Transport": "Vận chuyển",
      "Flight Ticket": "Vé máy bay"
    };

    return categories.map(category => translationMap[category] || category);
  }

  onCreate(): void {
    this.getTourDays();
  }

  onDelete(id: any): void {
    this.isLoading = true;
    if (this.tourId) {
      this.tourService.changeTourDayStatus(this.tourId, id, true).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          if (response.code === 200) {
            window.location.reload();
          } else {
            console.error('Lỗi: ', response.message);
          }
        },
        error: (err: any) => {
          this.isLoading = false;
          console.error('Lỗi: ', err);
        },
      });
    }
  }

  onRecover(id: any): void {
    this.isLoading = true;
    if (this.tourId) {
      this.tourService.changeTourDayStatus(this.tourId, id, false).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          if (response.code === 200) {
            window.location.reload();
          } else {
            console.error('Lỗi: ', response.message);
          }
        },
        error: (err: any) => {
          this.isLoading = false;
          console.error('Lỗi: ', err);
        },
      });
    }
  }

  // Getter để lấy danh sách dịch vụ đã dịch cho một ngày cụ thể
  getTranslatedServices(dayId: number): string[] {
    return this.translatedTourDays[dayId] || [];
  }
}
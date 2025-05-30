import { Component, Input, ViewChildren, QueryList, AfterViewInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TourDiscountService } from '../../../services/discount.service';
import { CreateTourPaxComponent } from './create-tour-pax/create-tour-pax.component';
import { UpdateTourPaxComponent } from './update-tour-pax/update-tour-pax.component';
import { SsrService } from '../../../../../../core/services/ssr.service';

interface TourPax {
  id: number;
  tourId: number;
  minPax: number;
  maxPax: number;
  paxRange: string;
  fixedCost: number;
  extraHotelCost: number;
  nettPricePerPax: number;
  sellingPrice: number;
  validFrom: string;
  validTo: string;
  valid: boolean;
}

interface ApiResponse {
  code: number;
  message: string;
  data: TourPax[] | TourPax;
}

@Component({
  selector: 'app-config-tour-pax',
  standalone: true,
  imports: [
    CommonModule,
    CreateTourPaxComponent,
    UpdateTourPaxComponent
  ],
  templateUrl: './config-tour-pax.component.html',
  styleUrls: ['./config-tour-pax.component.css']
})
export class ConfigTourPaxComponent implements AfterViewInit {
  @Input() tourId!: number;
  @Output() close = new EventEmitter<void>();
  @ViewChild('createTourPaxModal') createTourPaxModal!: CreateTourPaxComponent;
  @ViewChildren(UpdateTourPaxComponent) updateTourPaxComponents!: QueryList<UpdateTourPaxComponent>;

  tourPaxList: TourPax[] = [];
  selectedPaxId: number | null = null;

  constructor(
    private tourDiscountService: TourDiscountService,
    private ssrService: SsrService
  ) {}

  ngAfterViewInit() {
    if (this.tourId) {
      this.fetchTourPaxData();
    }
  }

  fetchTourPaxData() {
    this.tourDiscountService.getTourPaxById(this.tourId).subscribe({
      next: (response: ApiResponse) => {
        if (response.code === 200) {
          this.tourPaxList = Array.isArray(response.data) ? response.data : [response.data];
          this.tourPaxList = this.tourPaxList.map(pax => ({
            ...pax,
            paxRange: pax.paxRange || `${pax.minPax}-${pax.maxPax}`,
            validFrom: pax.validFrom || new Date().toISOString().split('T')[0],
            validTo: pax.validTo || new Date().toISOString().split('T')[0],
          }));
        } else {
          console.error('Error fetching tour pax data:', response.message);
        }
      },
      error: (error) => {
        console.error('HTTP error fetching tour pax data:', error);
      }
    });
  }

  openUpdateModal(paxId: number) {
    this.selectedPaxId = paxId;
    const doc = this.ssrService.getDocument();
    if (doc) {
      const updateComponent = this.updateTourPaxComponents.find(
        (component) => component.tourPaxId === paxId
      );
      if (updateComponent) {
        const modalElement = doc.getElementById(`updateTourPaxModal-${paxId}`) as HTMLElement;
        if (modalElement) {
          modalElement.classList.remove('hidden');
          modalElement.setAttribute('aria-hidden', 'false');
        }
      }
    }
  }

  closeUpdateModal(paxId: number) {
    const doc = this.ssrService.getDocument();
    if (doc) {
      const modalElement = doc.getElementById(`updateTourPaxModal-${paxId}`) as HTMLElement;
      if (modalElement) {
        modalElement.classList.add('hidden');
        modalElement.setAttribute('aria-hidden', 'true');
      }
    }
  }

  openDeleteModal(index: number) {
    const doc = this.ssrService.getDocument();
    if (doc) {
      const modalElement = doc.getElementById(`deleteTourPaxModal-${index}`) as HTMLElement;
      if (modalElement) {
        modalElement.classList.remove('hidden');
        modalElement.setAttribute('aria-hidden', 'false');
      }
    }
  }

  closeDeleteModal(index: number) {
    const doc = this.ssrService.getDocument();
    if (doc) {
      const modalElement = doc.getElementById(`deleteTourPaxModal-${index}`) as HTMLElement;
      if (modalElement) {
        modalElement.classList.add('hidden');
        modalElement.setAttribute('aria-hidden', 'true');
      }
    }
  }

  deleteTourPax(id: number, index: number) {
    this.tourDiscountService.deleteTourPax(this.tourId, id).subscribe({
      next: (response: ApiResponse) => {
        if (response.code === 200) {
          this.fetchTourPaxData();
          this.closeDeleteModal(index);
        } else {
          console.error('Error deleting tour pax:', response.message);
        }
      },
      error: (error: any) => {
        console.error('HTTP error deleting tour pax:', error);
      }
    });
  }

  reload(){
    this.close.emit();
  }

  onTourPaxCreated() {
    this.fetchTourPaxData();
  }

  onTourPaxUpdated(paxId: number) {
    this.fetchTourPaxData();
    this.closeUpdateModal(paxId);
    this.selectedPaxId = null;
  }
}
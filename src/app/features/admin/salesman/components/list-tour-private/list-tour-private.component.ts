import { AfterViewInit, Component, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TableActionComponent } from './table-action/table-action.component';
import { TableHeaderComponent } from './table-header/table-header.component';
import { TableRowComponent } from './table-row/table-row.component';
import { SpinnerComponent } from '../../../../../shared/components/spinner/spinner.component';
import { TableFooterComponent } from '../../../../../shared/components/table/table-footer/table-footer.component';
import { TourService } from '../../services/tour.service';
import { FormsModule } from '@angular/forms';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { CommonModule } from '@angular/common';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { BlogContentComponent } from '../../../marketer/components/blog-detail/blog-content/blog-content.component';
import { UserStorageService } from '../../../../../core/services/user-storage/user-storage.service';
import { Modal } from 'flowbite';
import { AddTransportationComponent } from "../../../head-of-business/components/tour-discount/add-transportation/add-transportation.component";
import { AdminService } from '../../../admin.service';
@Component({
  selector: 'app-list-tour-private',
  imports: [TableActionComponent,
    TableFooterComponent,
    TableHeaderComponent,
    TableRowComponent,
    SpinnerComponent,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NgMultiSelectDropDownModule,
    BlogContentComponent,
    SpinnerComponent],
  templateUrl: './list-tour-private.component.html',
  styleUrl: './list-tour-private.component.css'
})
export class ListTourPrivateComponent implements AfterViewInit {
  totalItems = 0;
  page = 0;
  size = 10;
  totalPages = signal(0)
  isLoading: boolean = false;

  tourDatas: any;

  dropdownList: any = [];
  dropdownSettings: IDropdownSettings = {};
  selectedItems: any = [];

  imagePreviews: string[] = [];

  createTourModal: Modal | null = null;

  ngAfterViewInit(): void {
    this.createTourModal = new Modal(document.getElementById('create-tour-modal'));
  }

  openModal() {
    this.createTourModal?.show();
  }

  closeModal() {
    this.createTourModal?.hide();
  }

  selectedFiles: File[] = [];

  
  removeImage(index: number): void {
    this.imagePreviews.splice(index, 1);
    this.selectedFiles.splice(index, 1);
    this.tourForm.get('tourImages')?.setValue(this.imagePreviews);
  }


  // Store filters to persist data across pages
  keyword = '';
  tourStatus?: string;
  sortField = 'createdAt';
  sortDirection = 'desc';

  constructor(
    private router: Router,
    private tourService: TourService,
    private fb: FormBuilder,
    private bookingService: BookingService,
    private userStorageService: UserStorageService,
    private adminService: AdminService
  ) {

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      enableCheckAll: false, // disables "Select All"
      itemsShowLimit: 5,
      searchPlaceholderText: 'Search Tags Name',
      allowSearchFilter: true
    };


    this.tourForm = this.fb.group({
      name: ['', Validators.required],
      numberDays: [2, Validators.required],
      numberNights: [1, Validators.required],
      departLocation: ['', Validators.required],
      locations: ['', Validators.required],
      highlights: ['', Validators.required],
      note: [''],
      createdBy: [this.userStorageService.getUserId(), Validators.required],
      pax: [1, Validators.required],
      tourImages: [[]],
    });

    this.tourForm.get('numberDays')?.valueChanges.subscribe((value: number) => {
      const numberNights = value > 2 ? value - 1 : 2;
      this.tourForm.patchValue({
        numberNights: numberNights
      }, { emitEvent: false }); // Prevent recursive loop
    });

  }

  confirmImage(): void {
    if (this.selectedFile && this.previewImage) {
        this.selectedFiles.push(this.selectedFile);
        this.imagePreviews.push(this.previewImage);
        this.saveChanges(); 
        this.selectedFile = null; 
        this.previewImage = null; 
    }
}

  isImageLoading: boolean = false;

  saveChanges(): void {
    this.isImageLoading = true;
    const formData = new FormData();
    this.selectedFiles.forEach(file => {
      formData.append('file', file);
    });

    // this.adminService.uploadImage(formData).subscribe({
    //   next: (response) => {
    //     this.isImageLoading = false;
    //     const uploadedImages = response.data;
    //     const currentImages = this.tourForm.get('tourImages')?.value || [];
    //     this.tourForm.get('tourImages')?.setValue([...currentImages, uploadedImages]);
    //     this.selectedFiles.pop();
    //   },
    //   error: (err) => {
    //     this.isImageLoading = false;
    //     console.error('Lỗi tải ảnh:', err);
    //   }
    // });
  }

  selectedFile: File | null = null;
  previewImage: string | null = null;

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
      input.value = '';
    }
  }

  onItemSelect(item: any) {
    console.log('Selected: ' + item.item_id);
  }

  onDeSelect(item: any) {
    console.log('Unselected: ' + item);
  }

  ngOnInit(): void {
    this.loadTours();
    this.loadLocations();
  }



  loadTours() {
    this.isLoading = true;
    this.tourService.getTourByPage(this.page, this.size, this.keyword, this.tourStatus, undefined, this.keyword, "PRIVATE").subscribe({
      next: (response) => {
        this.tourDatas = response.data.items;
        this.isLoading = false;
        this.totalItems = response.data.total;
        this.page = response.data.page;
        this.size = response.data.size;
        this.totalPages.set(Math.ceil(this.totalItems / this.size));
        this.isLoading = false;
      },
      error: (error) => {
        console.log(error);
        this.isLoading = false;
      }
    });
  }

  locationDatas: any;

  loadLocations() {
    this.bookingService.getLocations().subscribe({
      next: (response) => {
        this.locationDatas = response.data;

        this.dropdownList = this.locationDatas.map((location: { id: string, name: string }) => {
          return {
            item_id: location.id,
            item_text: location.name
          };
        });

      },
      error: (error) => {
        console.log(error);
      }
    });
  }


  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages()) {
      this.page = newPage;
      this.loadTours();
    }
  }

  // Change page size and reload data
  onPageSizeChange(newSize: number): void {
    this.size = newSize;
    this.page = 0; // Reset to first page
    this.loadTours();
  }

  onSearch(filters: any): void {
    this.keyword = filters.keyword || '';
    this.tourStatus = filters.status;
    this.sortDirection = filters.order === '1' ? 'desc' : 'asc';
    this.page = 0; // Reset to first page on new search
    this.loadTours();
  }



  tourForm: FormGroup;

  errorMessages: string = '';

  showSuccess: boolean = false;


  onSubmit() {
    if (this.tourForm.valid) {
      console.log('Valid form: ', this.tourForm.value);

      this.tourForm.get('locations')?.setValue(this.selectedItems.map((location: any) => ({ id: location.item_id, name: location.item_text })));

      this.bookingService.createPrivateTour(this.tourForm.value).subscribe({
        next: (response) => {
          console.log('Create tour successfully: ', response);
          this.loadTours();
          
          console.log('Create tour successfully: ', response);
          this.triggerSuccess();
          this.errorMessages = '';

        },
        error: (error) => {
          this.errorMessages = error;
          console.log('Create tour failed: ', this.errorMessages);
        }
      });
    } else {
      this.tourForm.markAllAsTouched();
      console.log('Invalid form: ', this.tourForm.value);
    }
    
    this.closeModal();
    this.resetItems();

  }

  resetItems(): void {
    this.selectedItems = this.selectedItems.map((location: any) => ({
      item_id: location.id,
      item_text: location.name
    }));
  }


  triggerSuccess() {
    this.showSuccess = true;

    this.tourForm.reset();
    // Hide warning after 3 seconds
    setTimeout(() => {
      this.showSuccess = false;
    }, 4000);
  }

}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiResponse } from '../../../../../core/models/api-response.model';
import { ServiceResponse, RoomWithDisplay, MealWithDisplay, TransportWithDisplay } from '../../../../../core/models/service.model';
import { NgMultiSelectDropDownModule, IDropdownSettings } from 'ng-multiselect-dropdown';
import { NgSelectModule } from '@ng-select/ng-select';
import { ServiceService } from '../../../../service-provider/services/service.service';

@Component({
  selector: 'app-update-service',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    NgMultiSelectDropDownModule,
    NgSelectModule
  ],
  templateUrl: './update-service.component.html',
  styleUrls: ['./update-service.component.css']
})
export class UpdateServiceComponent implements OnInit {
  serviceForm!: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  providerId: number | null = null;
  imagePreview: string | null = null;
  selectedFile: File | null = null;
  isLoading: boolean = true;
  service!: ServiceResponse;

  roomOptions: RoomWithDisplay[] = [];
  mealOptions: MealWithDisplay[] = [];
  transportOptions: TransportWithDisplay[] = [];
  selectedRooms: RoomWithDisplay[] = [];
  selectedMeals: MealWithDisplay[] = [];
  selectedTransports: TransportWithDisplay[] = [];
  categoryOptions: any[] = [];

  detailsDropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'displayText',
    selectAllText: 'Chọn tất cả',
    unSelectAllText: 'Bỏ chọn tất cả',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

  constructor(
    private fb: FormBuilder,
    private serviceService: ServiceService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const today = new Date();
    const nextYear = new Date(today);
    nextYear.setFullYear(today.getFullYear() + 1);

    // Format date thành chuỗi yyyy-MM-dd
    const formatDate = (date: Date): string => date.toISOString().split('T')[0];

    this.serviceForm = this.fb.group({
      id: [null],
      name: [null, Validators.required],
      nettPrice: [null, [Validators.required, Validators.min(0)]],
      sellingPrice: [null, [Validators.required, Validators.min(0)]],
      imageUrl: [null],
      startDate: [formatDate(today), Validators.required],
      endDate: [formatDate(nextYear), Validators.required],
      deleted: [false],
      categoryId: [null, Validators.required],
      categoryName: [null],
      providerId: [this.providerId, Validators.required],
      roomDetails: this.fb.group({
        capacity: [null, [Validators.required, Validators.min(0)]],
        availableQuantity: [null, [Validators.required, Validators.min(0)]],
        facilities: [null, Validators.required]
      }),
      mealDetails: this.fb.group({
        type: [null, Validators.required],
        mealDetail: [null, Validators.required]
      }),
      transportDetails: this.fb.group({
        seatCapacity: [null, [Validators.required, Validators.min(0)]]
      })
    });

    this.loadCategories();

    const providerId = this.route.snapshot.paramMap.get('providerId');
    if (providerId) {
      this.providerId = parseInt(providerId);
      this.serviceForm.patchValue({ providerId: this.providerId });
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const parsedId = parseInt(id);
      if (!isNaN(parsedId)) {
        console.log('Service ID from route:', parsedId);
        this.loadService(parsedId);
      } else {
        this.errorMessage = 'ID dịch vụ không hợp lệ.';
        this.isLoading = false;
        console.error('Invalid service ID:', id);
      }
    } else {
      this.isLoading = false;
    }
  }

  loadCategories(): void {
    this.serviceService.getCategories().subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.code === 200) {
          this.categoryOptions = response.data.map((category: any) => ({
            ...category,
            translatedCategoryName: this.translateCategory(category.categoryName)
          }));
          if (this.serviceForm.get('id')?.value) {
            const currentCategoryId = this.serviceForm.get('categoryId')?.value;
            if (currentCategoryId) {
              const category = this.categoryOptions.find(c => c.id === currentCategoryId);
              this.serviceForm.patchValue({ categoryName: category?.categoryName || '' }, { emitEvent: false });
            }
          }
        } else {
          this.errorMessage = 'Không thể tải danh mục.';
          console.error('Failed to load categories:', response);
        }
      },
      error: (err) => {
        this.errorMessage = 'Lỗi khi tải danh mục: ' + (err.message || 'Vui lòng thử lại.');
        console.error('Categories load error:', err);
      }
    });
  }

  loadService(id: number): void {
    this.isLoading = true;
    this.serviceService.getServiceDetails(id).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.code === 200) {
          this.service = response.data;
          this.imagePreview = this.service.imageUrl || null;
          const category = this.categoryOptions.find(c => c.id === this.service.categoryId);
          this.providerId = this.service.providerId;

          this.serviceForm.patchValue({
            id: this.service.id,
            name: this.service.name,
            nettPrice: this.service.nettPrice,
            sellingPrice: this.service.sellingPrice,
            imageUrl: this.service.imageUrl,
            providerId: this.service.providerId,
            startDate: this.service.startDate ? new Date(this.service.startDate).toISOString().split('T')[0] : null,
            endDate: this.service.endDate ? new Date(this.service.endDate).toISOString().split('T')[0] : null,
            deleted: this.service.deleted,
            categoryId: this.service.categoryId,
            categoryName: category?.categoryName || '',
            roomDetails: this.service.roomDetails || { capacity: null, availableQuantity: null, facilities: null },
            mealDetails: this.service.mealDetails || { type: null, mealDetail: null },
            transportDetails: this.service.transportDetails || { seatCapacity: null }
          });

          this.isLoading = false;
        } else {
          this.errorMessage = response.message || 'Không thể tải thông tin dịch vụ.';
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = `Không thể tải thông tin dịch vụ: ${err.status} - ${err.error?.message || 'Vui lòng kiểm tra backend.'}`;
        console.error('API error:', err);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onCancel(): void {
    this.router.navigate([`/ceo/service/${this.providerId}`]);
  }

  saveChanges(): void {

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const formData = this.serviceForm.getRawValue();

    // Format dates to LocalDateTime string (e.g., "2025-04-08T00:00:00.000Z")
    formData.startDate = this.formatToLocalDateTime(formData.startDate);
    formData.endDate = this.formatToLocalDateTime(formData.endDate);

    // Remove details if category doesn't require them
    const categoryName = formData.categoryName;
    if (categoryName !== 'Hotel') {
      delete formData.roomDetails;
    }
    if (categoryName !== 'Restaurant') {
      delete formData.mealDetails;
    }
    if (categoryName !== 'Transport') {
      delete formData.transportDetails;
    }

    if (this.selectedFile) {
      const uploadData = new FormData();
      uploadData.append('file', this.selectedFile);
      this.serviceService.uploadImage(uploadData).subscribe({
        next: (response: ApiResponse<any>) => {
          if (response.code === 200) {
            formData.imageUrl = response.data;
            console.log('Form submitted:', this.serviceForm.value);
            this.submitForm(formData);
          } else {
            this.isLoading = false;
            this.errorMessage = 'Tải lên hình ảnh thất bại: ' + response.message;
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'Lỗi khi tải lên hình ảnh: ' + (err.error?.message || err.message || 'Vui lòng thử lại.');
        }
      });
    } else {
      if (!formData.imageUrl && this.service?.imageUrl) {
        formData.imageUrl = this.service.imageUrl;
      }
      console.log('Form submitted:', this.serviceForm.value);
      this.submitForm(formData);
    }
  }

  submitForm(formData: any): void {
    const apiCall = formData.id
      ? this.serviceService.updateService(formData.id, formData)
      : this.serviceService.createService(formData);

    apiCall.subscribe({
      next: (response: ApiResponse<any>) => {
        this.isLoading = false;
        if (response.code === 200) {
          this.successMessage = formData.id ? 'Cập nhật dịch vụ thành công.' : 'Tạo dịch vụ thành công.';
          this.errorMessage = null;
          setTimeout(() => this.router.navigate(['/ceo/service/' + formData.providerId]), 1500);
        } else {
          this.errorMessage = response.message || (formData.id ? 'Cập nhật dịch vụ thất bại.' : 'Tạo dịch vụ thất bại.');
          this.successMessage = null;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Lỗi khi ' + (formData.id ? 'cập nhật' : 'tạo') + ' dịch vụ: ' + (err.error?.message || err.message || 'Vui lòng thử lại.');
        this.successMessage = null;
      }
    });
  }

  // Thêm vào trong class UpdateServiceComponent
  removeImage(): void {
    this.imagePreview = null;
    this.selectedFile = null;
    this.serviceForm.patchValue({ imageUrl: null }); // Reset imageUrl trong form nếu cần
  }

  onCategoryChange(selectedCategory: any): void {
    if (selectedCategory) {
      this.serviceForm.patchValue({
        categoryName: selectedCategory.categoryName || ''
      });
    } else {
      this.serviceForm.patchValue({
        categoryName: ''
      });
    }

    // Reset details when category changes
    this.serviceForm.patchValue({
      roomDetails: { capacity: null, availableQuantity: null, facilities: null },
      mealDetails: { type: null, mealDetail: null },
      transportDetails: { seatCapacity: null }
    });
  }

  // Helper function to format date to LocalDateTime string
  private formatToLocalDateTime(dateStr: string | null): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    // Ensure the date is valid
    if (isNaN(date.getTime())) return '';
    // Format to ISO string and append .000Z to match LocalDateTime
    return date.toISOString().split('.')[0] + '.000Z';
  }

  translateCategory(categoryName: string): string {
    const translations: { [key: string]: string } = {
      'Activity': 'Hoạt động',
      'Flight Ticket': 'Vé máy bay',
      'Hotel': 'Khách sạn',
      'Restaurant': 'Nhà hàng',
      'Transport': 'Phương tiện'
    };
    return translations[categoryName] || categoryName;
  }
}
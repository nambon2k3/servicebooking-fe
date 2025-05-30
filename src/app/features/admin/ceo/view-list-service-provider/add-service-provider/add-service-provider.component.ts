import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, of, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ServiceProvidedService } from '../../services/service-provider.service';
import { UserStorageService } from '../../../../../core/services/user-storage/user-storage.service';
import { NgMultiSelectDropDownModule, IDropdownSettings } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-add-service-provider',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    NgMultiSelectDropDownModule
  ],
  templateUrl: './add-service-provider.component.html',
  styleUrls: ['./add-service-provider.component.css']
})
export class AddServiceProviderComponent implements OnInit {
  serviceProviderForm!: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  imagePreview: string | null = null;
  selectedFile: File | null = null;
  isLoading: boolean = false;
  serviceCategories: any[] = [];
  selectedCategories: any[] = [];
  dropdownSettings: IDropdownSettings = {};
  locationDropdownSettings: IDropdownSettings = {};
  locations: any[] = [];
  selectedLocationId: number | null = null;
  selectedLocation: any[] = [];

  constructor(
    private fb: FormBuilder,
    private serviceProvidedService: ServiceProvidedService,
    private userStorageService: UserStorageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = this.userStorageService.getToken();
    if (!token) {
      alert('Vui lòng đăng nhập để thêm nhà cung cấp.');
      this.router.navigate(['/login']);
      return;
    }

    this.serviceProviderForm = this.fb.group({
      imageUrl: [null],
      name: [null, Validators.required],
      abbreviation: [null, Validators.required],
      website: [null],
      email: [null, [Validators.email]],
      star: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
      phone: [null],
      address: [null],
      locationId: [null, Validators.required],
      geoPosition: this.fb.group({
        id: [null],
        latitude: [0],
        longitude: [0]
      }),
      serviceCategories: [[]]
    });

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'categoryName',
      selectAllText: 'Chọn tất cả',
      unSelectAllText: 'Bỏ chọn tất cả',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };

    this.locationDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Chọn tất cả',
      unSelectAllText: 'Bỏ chọn tất cả',
      itemsShowLimit: 1,
      allowSearchFilter: true,
      enableCheckAll: false
    };

    this.loadServiceCategories();
    this.loadLocations().subscribe({
      next: () => {
        console.log('Locations loaded successfully');
      },
      error: (err: any) => {
        this.errorMessage = 'Không thể tải danh sách địa điểm: ' + (err.message || 'Vui lòng thử lại.');
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/ceo/service-provider']);
  }

  loadServiceCategories(): void {
    this.serviceProvidedService.getServiceCategories().subscribe({
      next: (response: any) => {
        if (response.code === 200) {
          this.serviceCategories = response.data.items || [];
        } else {
          this.errorMessage = response.message || 'Không thể tải danh mục dịch vụ.';
        }
      },
      error: (err: any) => {
        this.errorMessage = 'Lỗi khi tải danh mục dịch vụ: ' + (err.message || 'Vui lòng thử lại.');
      }
    });
  }

  loadLocations(): Observable<any> {
    return this.serviceProvidedService.getLocations().pipe(
      map((response: any) => {
        console.log('Raw response from getLocations:', response);
        if (response.code === 200) {
          this.locations = response.data || [];
          console.log('Locations loaded:', this.locations);
        } else {
          this.errorMessage = response.message || 'Không thể tải danh sách địa điểm.';
        }
      }),
      catchError((err: any) => {
        this.errorMessage = 'Lỗi khi tải danh sách địa điểm: ' + (err.message || 'Vui lòng thử lại.');
        return of(null);
      })
    );
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

  onLocationSelect(item: any): void {
    console.log('Selected Item from Dropdown:', item);
    const selectedLocation = this.locations.find(loc => loc.id === item.id);
    console.log('Found Selected Location:', selectedLocation);
  
    if (selectedLocation) {
      this.selectedLocationId = selectedLocation.id;
      this.serviceProviderForm.patchValue({
        locationId: this.selectedLocationId,
        geoPosition: {
          id: selectedLocation.geoPositionId || null, // Sử dụng geoPositionId
          latitude: selectedLocation.latitude || 0,
          longitude: selectedLocation.longitude || 0
        }
      });
      console.log('Updated Form Value:', this.serviceProviderForm.getRawValue());
    } else {
      console.log('No matching location found for item:', item);
    }
  }
  
  onLocationDeSelect(): void {
    this.selectedLocationId = null;
    this.serviceProviderForm.patchValue({
      locationId: null,
      geoPosition: {
        id: null,
        latitude: 0,
        longitude: 0
      }
    });
  }

  saveChanges(): void {
    if (this.serviceProviderForm.invalid) {
      this.errorMessage = 'Vui lòng kiểm tra lại thông tin.';
      this.serviceProviderForm.markAllAsTouched();
      console.log('Form invalid:', this.serviceProviderForm.errors);
      return;
    }

    this.isLoading = true;
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      this.serviceProvidedService.uploadImage(formData).subscribe({
        next: (response: any) => {
          if (response?.code === 200) {
            this.serviceProviderForm.patchValue({ imageUrl: response.data });
            this.submitForm();
          } else {
            this.isLoading = false;
            this.errorMessage = response?.message || 'Lỗi khi tải lên hình ảnh.';
          }
        },
        error: (error: any) => {
          this.isLoading = false;
          this.errorMessage = error.message === 'No authentication token found'
            ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
            : 'Lỗi khi tải lên hình ảnh: ' + (error?.message || 'Vui lòng thử lại.');
          if (error.message === 'No authentication token found') {
            this.router.navigate(['/login']);
          }
        }
      });
    } else {
      this.submitForm();
    }
  }

  submitForm(): void {
    const formData = this.serviceProviderForm.getRawValue();
    const selectedLocation = this.locations.find(loc => loc.id === formData.locationId);
  
    const newData = {
      ...formData,
      locationId: this.selectedLocationId,
      locationName: selectedLocation ? selectedLocation.name : null,
      geoPosition: {
        latitude: selectedLocation?.latitude || 0, // Chỉ gửi latitude
        longitude: selectedLocation?.longitude || 0 // Chỉ gửi longitude
      },
      serviceCategories: this.selectedCategories.map((cat: any) => ({
        id: cat.id,
        categoryName: cat.categoryName
      }))
    };
  
    console.log('Payload sent to create:', newData);
  
    this.serviceProvidedService.createServiceProvider(newData).pipe(
      catchError((error: any) => {
        this.isLoading = false;
        const apiError = error?.error?.message || 'Đã xảy ra lỗi khi thêm nhà cung cấp.';
        this.errorMessage = apiError;
        console.error('Create error:', error);
        if (error.message === 'No authentication token found') {
          this.router.navigate(['/login']);
        }
        return of(null);
      })
    ).subscribe((response: any) => {
      this.isLoading = false;
      if (response?.code === 200) {
        this.successMessage = response?.message || 'Thêm nhà cung cấp thành công.';
        this.errorMessage = null;
        this.router.navigate(['/ceo/service-provider']);
      } else {
        this.errorMessage = response?.message || 'Đã xảy ra lỗi khi thêm nhà cung cấp.';
        this.successMessage = null;
      }
    });
  }
}
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ServiceProvidedService } from '../../services/service-provider.service';
import { UserStorageService } from '../../../../../core/services/user-storage/user-storage.service';
import { ServiceProvider, GeoPosition, ServiceCategory } from '../../../../../core/models/service-provider.model';
import { NgMultiSelectDropDownModule, IDropdownSettings } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-update-service-provider',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    NgMultiSelectDropDownModule
  ],
  templateUrl: './update-service-provider.component.html',
  styleUrls: ['./update-service-provider.component.css']
})
export class UpdateServiceProviderComponent implements OnInit {
  serviceProviderForm!: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  imagePreview: string | null = null;
  selectedFile: File | null = null;
  isLoading: boolean = true;
  serviceProvider!: ServiceProvider;
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
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.serviceProviderForm = this.fb.group({
      id: [null, Validators.required],
      imageUrl: [null],
      name: [null, Validators.required],
      abbreviation: [null, Validators.required],
      website: [null],
      email: [null, [Validators.email]],
      star: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
      phone: [null],
      address: [null],
      deleted: [false],
      locationId: [null, Validators.required],
      geoPosition: this.fb.group({
        id: [null],
        latitude: [{ value: null, disabled: true }],
        longitude: [{ value: null, disabled: true }]
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

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const parsedId = parseInt(id, 10);
      if (!isNaN(parsedId)) {
        this.loadLocations().subscribe({
          next: () => {
            console.log('Calling loadServiceProvider after locations loaded');
            this.loadServiceProvider(parsedId);
          },
          error: (err: any) => {
            this.errorMessage = 'Không thể tải danh sách địa điểm: ' + (err.message || 'Vui lòng thử lại.');
            this.isLoading = false;
          }
        });
      } else {
        this.errorMessage = 'ID nhà cung cấp không hợp lệ.';
        this.isLoading = false;
      }
    } else {
      this.errorMessage = 'Không tìm thấy ID nhà cung cấp.';
      this.isLoading = false;
    }
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
        console.log('Locations API Response:', response); // Log toàn bộ dữ liệu
        if (response.code === 200) {
          this.locations = response.data || [];
          console.log('Parsed Locations:', this.locations); // Log dữ liệu sau khi xử lý
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


  loadServiceProvider(id: number): void {
    this.serviceProvidedService.getServiceProviderById(id).subscribe({
      next: (response: any) => {
        this.serviceProvider = response.data;
        this.imagePreview = this.serviceProvider.imageUrl || null;

        const selected = this.serviceProvider.serviceCategories?.map(category => ({
          id: category.id,
          categoryName: category.categoryName,
          deleted: category.deleted
        })) || [];
        this.selectedCategories = selected;

        const location = this.locations.find(loc => loc.name === this.serviceProvider.location?.name);
        this.selectedLocationId = location ? location.id : null;

        if (!location) {
          console.warn('Location not found for:', this.serviceProvider.location?.name);
        } else {
          console.log('Found location:', location);
          this.selectedLocation = [location];
        }

        this.serviceProviderForm.patchValue({
          id: this.serviceProvider.id,
          imageUrl: this.serviceProvider.imageUrl,
          name: this.serviceProvider.name,
          abbreviation: this.serviceProvider.abbreviation,
          website: this.serviceProvider.website,
          email: this.serviceProvider.email,
          star: this.serviceProvider.star,
          phone: this.serviceProvider.phone,
          address: this.serviceProvider.address,
          deleted: this.serviceProvider.deleted,
          locationId: this.selectedLocationId,
          geoPosition: {
            id: this.serviceProvider.geoPosition?.id || null,
            latitude: this.serviceProvider.geoPosition?.latitude || 0,
            longitude: this.serviceProvider.geoPosition?.longitude || 0
          },
          serviceCategories: selected
        });

        this.isLoading = false;
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err.message === 'No authentication token found'
          ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
          : 'Lỗi khi tải thông tin nhà cung cấp: ' + (err?.message || 'Vui lòng thử lại.');
        if (err.message === 'No authentication token found') {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  openService(): void {
    if (this.serviceProvider.id !== undefined) {
      this.router.navigate([`/ceo/service/${this.serviceProvider.id}`]);
    } else {
      console.error('Service provider ID is undefined');
    }
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
    const selectedLocation = this.locations.find(loc => loc.id === item.id);
    if (selectedLocation) {
      this.selectedLocationId = selectedLocation.id;
      this.serviceProviderForm.patchValue({
        locationId: this.selectedLocationId,
        geoPosition: {
          id: selectedLocation.geoPositionId || null,
          latitude: selectedLocation.latitude || 0,
          longitude: selectedLocation.longitude || 0
        }
      });
      console.log('Updated geoPosition:', this.serviceProviderForm.get('geoPosition')?.value);
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

  onCancel(): void {
    this.router.navigate(['/ceo/service-provider']);
  }

  saveChanges(): void {
    if (this.serviceProviderForm.invalid) {
      this.errorMessage = 'Vui lòng kiểm tra lại thông tin.';
      return;
    }

    this.isLoading = true;
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      this.serviceProvidedService.uploadImage(formData).subscribe({
        next: (response: any) => {
          this.serviceProviderForm.get('imageUrl')?.setValue(response.data);
          this.submitForm();
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

    const updatedData = {
      id: formData.id,
      ...formData,
      locationName: selectedLocation ? selectedLocation.name : null,
      geoPosition: {
        id: selectedLocation?.geoPositionId || null, // Dùng geoPositionId
        latitude: selectedLocation?.latitude || 0,
        longitude: selectedLocation?.longitude || 0
      },
      serviceCategories: this.selectedCategories.map((cat: any) => ({
        id: cat.id,
        categoryName: cat.categoryName
      }))
    };
    console.log('Form data sent:', updatedData);
    this.serviceProvidedService.update(updatedData, formData.id).pipe(
      catchError((error: any) => {
        this.isLoading = false;
        const apiError = error?.error?.message || 'Đã xảy ra lỗi khi cập nhật nhà cung cấp.';
        this.errorMessage = apiError;
        console.error('Update error:', error);
        if (error.message === 'No authentication token found') {
          this.router.navigate(['/login']);
        }
        return of(null);
      })
    ).subscribe((response: any) => {
      this.isLoading = false;
      if (response?.code === 200) {
        this.successMessage = response?.message || 'Cập nhật nhà cung cấp thành công.';
        this.errorMessage = null;
        // this.router.navigate(['/ceo/service-provider']);
      } else if (!response) {
      } else {
        this.errorMessage = response?.message || 'Đã xảy ra lỗi khi cập nhật nhà cung cấp.';
        this.successMessage = null;
      }
    });
  }
}
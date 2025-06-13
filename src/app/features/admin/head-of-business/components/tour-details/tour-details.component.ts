import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BlogContentComponent } from '../../../marketer/components/blog-detail/blog-content/blog-content.component';
import { NgMultiSelectDropDownModule, IDropdownSettings } from 'ng-multiselect-dropdown';
import { Subject } from 'rxjs';
import { LocationService } from '../../services/location/location.service';
import { TourService } from '../../services/tour.service';
import { TourDetailHOB } from '../../../../../core/models/tour.model';
import { NgSelectModule } from '@ng-select/ng-select';
import { AdminService } from '../../../admin.service';
import { SpinnerComponent } from "../../../../../shared/components/spinner/spinner.component";

interface Location {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

@Component({
  selector: 'app-tour-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgMultiSelectDropDownModule,
    ReactiveFormsModule,
    BlogContentComponent,
    NgSelectModule,
    SpinnerComponent
  ],
  templateUrl: './tour-details.component.html',
  styleUrls: ['./tour-details.component.css'],
})
export class TourDetailsComponent implements OnInit {
  highlight: string | null = null;
  editTourForm!: FormGroup;
  tourId: string | null = null;
  locations: Location[] = [];
  tags: Tag[] = [];
  dropdownList: Location[] = [];
  dropdownTagList: Tag[] = [];
  dropdownSettings: IDropdownSettings = {};
  dropdownTagSettings: IDropdownSettings = {};
  searchText$ = new Subject<string>();

  imagePreviews: string[] = [];
  selectedFiles: File[] = [];
  previewImage: string | null = null;
  selectedFile: File | null = null;
  isLoading: boolean = false;
  tour: any;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private tourService: TourService,
    private locationService: LocationService,
    private route: ActivatedRoute,
    private adminService: AdminService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.tourId = params['id'];
      if (this.tourId) {
        this.loadTourDetails(this.tourId);
      }
    });

    this.dropdownSettings = {
      singleSelection: false, // Cho phép chọn nhiều địa điểm
      idField: 'id',
      textField: 'name',
      allowSearchFilter: true,
      enableCheckAll: false,
      itemsShowLimit: 3,
      searchPlaceholderText: 'Tìm kiếm địa điểm...',
    };

    this.dropdownTagSettings = {
      singleSelection: false, // Cho phép chọn nhiều thẻ
      idField: 'id',
      textField: 'name',
      enableCheckAll: false,
      itemsShowLimit: 3,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      searchPlaceholderText: 'Tìm kiếm tên Thẻ',
      allowSearchFilter: true
    };

    this.editTourForm = this.fb.group({
      id: [null],
      name: [null, Validators.required],
      tagIds: [[], Validators.required],
      locationIds: [[], Validators.required],
      markUpPercent: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      departLocationId: [[], Validators.required],
      numberDays: [null, [Validators.required, Validators.min(1)]],
      numberNights: [null, [Validators.required, Validators.min(0)]],
      highlights: [null, Validators.required],
      note: [null, Validators.required],
      privacy: [this.getPrivacy(), Validators.required],
      tourImages: [[]],
      tourType: ["SIC", Validators.required],
      tourStatus: ["DRAFT", Validators.required],
    },
      { validator: this.daysGreaterThanNights });

    this.getAllTags();
    this.loadLocations();
  }

  daysGreaterThanNights(group: AbstractControl): ValidationErrors | null {
    const days = group.get('numberDays')?.value;
    const nights = group.get('numberNights')?.value;

    if (days !== null && nights !== null && days <= nights) {
      return { daysMustBeGreater: true };
    }
    return null;
  }

  loadTourDetails(id: string): void {
    this.isLoading = true;
    this.tourService.getTourById(id).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.tour = response.data;
        this.mapTourDataToForm(this.tour);
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Lỗi: ', err);
      },
    });
  }

  loadLocations(keyword: string = ''): void {
    this.isLoading = true;
    this.locationService.getLocationByPage(0, 100, keyword).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.locations = response.data.items;
        this.dropdownList = this.locations;
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Lỗi: ', err);
      },
    });
  }

  getAllTags(): void {
    this.isLoading = true;
    this.tourService.getAllTags().subscribe({
      next: (response) => {
        this.isLoading = false;
        this.tags = response.data;
        this.dropdownTagList = this.tags;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Lỗi: ', err);
      },
    });
  }

  mapTourDataToForm(tour: TourDetailHOB): void {
    this.editTourForm.patchValue({
      id: tour.id,
      name: tour.name,
      departLocationId: tour.departLocation.id,
      tagIds: tour.tags,  // Lưu ID thay vì name
      locationIds: tour.locations,  // Lưu ID thay vì name
      numberDays: tour.numberDays,
      numberNights: Number(tour.numberDays - 1),
      highlights: tour.highlights,
      note: tour.note,
      privacy: tour.privacy || this.getPrivacy(),
      tourImages: tour.tourImages.map((img: any) => img.imageUrl),
    });

    this.imagePreviews = [...new Set(tour.tourImages.map((img: any) => img.imageUrl))]; // Loại bỏ ảnh trùng
    this.highlight = tour.highlights;
  }

  updateNumberNights(event: Event) {
    const input = event.target as HTMLInputElement;
    const numberDays = Number(input.value);
    if (!isNaN(numberDays) && numberDays > 0) {
      this.editTourForm.get('numberNights')?.setValue(numberDays - 1);
    } else {
      this.editTourForm.get('numberNights')?.setValue(null);
    }
  }

  onCancel(): void {
    this.router.navigate(['/head-business/list-tour']);
  }

  onSubmit(): void {
    this.isLoading = true;
    const requestBody = {
      ...this.editTourForm.value,
      tagIds: this.editTourForm.value.tagIds.map((tag: any) => tag.id), // Đảm bảo gửi ID
      locationIds: this.editTourForm.value.locationIds.map((location: any) => location.id), // Đảm bảo gửi ID
      tourImages: this.imagePreviews.map((img: string) => ({ imageUrl: img })) // Tránh lặp ảnh
    };

    if (this.tourId) {
      this.tourService.updateTour(requestBody).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.router.navigate(['/head-business/list-tour']);
        },
        error: (err: any) => {
          this.isLoading = false;
          console.error('Lỗi: ', err);
        },
      });
    } else {
      this.tourService.createTour(requestBody).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.router.navigate(['/head-business/list-tour']);
        },
        error: (err: any) => {
          this.isLoading = false;
          console.error('Lỗi: ', err);
        },
      });
    }
  }

  onApprove(): void {
    this.isLoading = true;
    if (this.tour.tourType === 'PRIVATE') {
      this.tourService.openPrivateTour(this.tourId!).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.router.navigate(['/head-business/list-tour']);
        },
        error: (err: any) => {
          this.isLoading = false;
          console.error('Lỗi: ', err);
        },
      });
    } else {
      this.tourService.approveTour(this.tourId!).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.router.navigate(['/head-business/list-tour']);
        },
        error: (err: any) => {
          this.isLoading = false;
          console.error('Lỗi: ', err);
        },
      });
    }
  }

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

  confirmImage(): void {
    if (this.selectedFile && this.previewImage) {
      this.selectedFiles.push(this.selectedFile);
      this.imagePreviews.push(this.previewImage);
      this.saveChanges(); // Gửi ảnh mới lên server
      this.selectedFile = null; // Đặt lại selectedFile
      this.previewImage = null; // Đặt lại previewImage
    }
  }

  removeImage(index: number): void {
    this.imagePreviews.splice(index, 1);
    this.selectedFiles.splice(index, 1);
    this.editTourForm.get('tourImages')?.setValue(this.imagePreviews);
  }

  saveChanges(): void {
    this.isLoading = true;
    const formData = new FormData();
    // Chỉ gửi ảnh mới nhất (ảnh cuối cùng trong selectedFiles)
    const latestFile = this.selectedFiles[this.selectedFiles.length - 1];
    if (latestFile) {
      formData.append('file', latestFile);
    }

    // this.adminService.uploadImage(formData).subscribe({
    //   next: (response) => {
    //     this.isLoading = false;
    //     const uploadedImage = response.data; // Giả sử API trả về URL của ảnh vừa upload
    //     const currentImages = this.editTourForm.get('tourImages')?.value || [];
    //     this.editTourForm.get('tourImages')?.setValue([...currentImages, uploadedImage]);
    //     // Xóa file đã gửi khỏi selectedFiles để tránh gửi lại
    //     this.selectedFiles.pop();
    //   },
    //   error: (err) => {
    //     this.isLoading = false;
    //     console.error('Lỗi tải ảnh:', err);
    //   }
    // });
  }

  onSearch(event: any): void {
    const keyword = event || '';
    this.searchText$.next(keyword);
  }

  getPrivacy(): string {
    return `<h2>PHẦN I: ĐIỀU KIỆN BÁN VÉ CÁC CHƯƠNG TRÌNH DU LỊCH NỘI ĐỊA</h2>
    <h3>1. GIÁ VÉ DU LỊCH</h3>
    <p>Giá vé du lịch được tính theo tiền Đồng (Việt Nam - VND). Trường hợp khách thanh toán bằng ngoại tệ sẽ được quy đổi ra VND theo tỷ giá của Ngân hàng Đầu tư và Phát triển Việt Nam - Chi nhánh TP.HCM tại thời điểm thanh toán.</p>
    <p>Giá vé chỉ bao gồm những khoản được liệt kê một cách rõ ràng trong phần “Bao gồm” trong các chương trình du lịch. Vietravel không có nghĩa vụ thanh toán bất cứ chi phí nào không nằm trong phần “Bao gồm”.</p>
    <h3>2. GIÁ DÀNH CHO TRẺ EM</h3>
    <ul>
        <li><strong>Trẻ em dưới 5 tuổi:</strong> không thu phí dịch vụ, bố mẹ tự lo cho bé và thanh toán các chi phí phát sinh (đối với các dịch vụ tính phí theo chiều cao…). Hai người lớn chỉ được kèm 1 trẻ em dưới 5 tuổi, trẻ em thứ 2 sẽ đóng phí theo quy định dành cho độ tuổi từ 5 đến dưới 12 tuổi và phụ thu phòng đơn. Vé máy bay, tàu hỏa, phương tiện vận chuyển công cộng mua vé theo quy định của các đơn vị vận chuyển (nếu có).</li>
        <li><strong>Trẻ em từ 5 tuổi đến dưới 12 tuổi:</strong> 50% giá tour người lớn đối với tuyến xe, 75% giá tour người lớn đối với tuyến có vé máy bay (không có chế độ giường riêng). Hai người lớn chỉ được kèm 1 trẻ em từ 5 - dưới 12 tuổi, trẻ em thứ hai trở lên phải mua 1 suất giường đơn.</li>
        <li><strong>Trẻ em từ 12 tuổi trở lên:</strong> mua một vé như người lớn.</li>
    </ul>
    <h3>3. THANH TOÁN</h3>
    <p>Khi đăng ký, Quý khách vui lòng cung cấp đầy đủ thông tin và đóng một khoản tiền cọc để giữ chỗ. Số tiền cọc khác nhau tùy theo chương trình mà Quý khách chọn, số tiền còn lại sẽ thanh toán trước ngày khởi hành tối thiểu 05 ngày làm việc.</p>
    <p>Thanh toán bằng tiền mặt, cà thẻ tại văn phòng Vietravel hoặc chuyển khoản tới tài khoản ngân hàng của Vietravel.</p>
    <div class="bank-info">
        <p><strong>Tên Tài Khoản:</strong> Công ty CP Du lịch và Tiếp thị GTVT Việt Nam – Vietravel</p>
        <p><strong>Số Tài khoản:</strong> 190261 6659 4669</p>
        <p><strong>Ngân hàng:</strong> Techcombank - Chi nhánh TP.HCM</p>
    </div>`;
  }
}
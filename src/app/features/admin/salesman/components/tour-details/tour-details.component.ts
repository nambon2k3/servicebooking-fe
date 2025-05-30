import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BlogContentComponent } from '../../../marketer/components/blog-detail/blog-content/blog-content.component';
import { NgMultiSelectDropDownModule, IDropdownSettings } from 'ng-multiselect-dropdown';
import { Subject } from 'rxjs';
import { TourDetailHOB } from '../../../../../core/models/tour.model';
import { NgSelectModule } from '@ng-select/ng-select';
import { AdminService } from '../../../admin.service';
import { SpinnerComponent } from "../../../../../shared/components/spinner/spinner.component";
import { TourService } from '../../../head-of-business/services/tour.service';
import { LocationService } from '../../../head-of-business/services/location/location.service';

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

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private tourService: TourService,
    private locationService: LocationService,
    private route: ActivatedRoute,
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
      tourType: ["SIC", Validators.required],
      tourStatus: ["PENDING_PRICING", Validators.required],
      privacy: [this.getPrivacy(), Validators.required],
      tourImages: [[]],
    },
      { validator: this.daysGreaterThanNights });

    // Lấy tourId từ query params
    this.route.queryParams.subscribe(params => {
      this.tourId = params['id'] || null;
      if (this.tourId) {
        this.loadTourDetails(this.tourId);
      }
    });

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
        const tourData: TourDetailHOB = response.data;
        this.mapTourDataToForm(tourData);
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


  tourData: any;

  isExpanded: { [key: number]: boolean } = {};

  toggleContent(dayNumber: number, event: Event): void {
    event.preventDefault();
    this.isExpanded[dayNumber] = !this.isExpanded[dayNumber];
  }

  getTruncatedContent(content: string, maxLength: number = 100): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const text = tempDiv.innerText || tempDiv.textContent || '';
    if (text.length <= maxLength) return content;

    const truncatedText = text.slice(0, maxLength).trim() + '...';
    return `<p>${truncatedText}</p>`;
  }



  mapTourDataToForm(tour: TourDetailHOB): void {


    this.tourData = tour; // Lưu tourData vào biến tourData
    console.log('Tour data:', tour); // Kiểm tra dữ liệu tour

    this.editTourForm.patchValue({
      id: tour.id,
      name: tour.name,
      departLocationId: tour.departLocation.id,
      tagIds: tour.tags,  // Lưu ID thay vì name
      locationIds: tour.locations,  // Lưu ID thay vì name
      numberDays: tour.numberDays,
      numberNights: tour.numberNight,
      highlights: tour.highlights,
      note: tour.note,
      privacy: tour.privacy || this.getPrivacy(),
      tourImages: tour.tourImages.map((img: any) => img.imageUrl),
    });
  
    this.imagePreviews = [...new Set(tour.tourImages.map((img: any) => img.imageUrl))]; // Loại bỏ ảnh trùng
    this.highlight = tour.highlights;

    this.tags = tour.tags
  }  

  onCancel(): void {
    this.router.navigate([`/salesman/tour-list-booking/${this.tourId}`]);
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
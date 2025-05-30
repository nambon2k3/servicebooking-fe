import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FooterComponent } from "../../../../shared/components/footer/footer.component";
import { HomepageService } from '../../services/homepage.service';
import { Activity, Blog, Tour, Location } from '../../../../core/models/homepage.model';
import { Router } from '@angular/router';
import { CurrencyVndPipe } from "../../../../shared/pipes/currency-vnd.pipe";
import { WishlistService } from '../../../customer/components/wishlist/wishlist.service';
import { WishlistComponent } from "../../../customer/components/wishlist/wishlist.component";
import { debounceTime, Subject, take } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { TruncatePipe } from "../../../../shared/pipes/truncate.pipe";

@Component({
  selector: 'app-homepage',
  imports: [
    AngularSvgIconModule,
    CommonModule,
    FooterComponent,
    CurrencyVndPipe,
    WishlistComponent,
    FormsModule,
    TruncatePipe
],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'
})
export class HomepageComponent {
  @ViewChild('wishlistModal') wishlistModal!: WishlistComponent;
  @ViewChild('searchDropdown') searchDropdownRef!: ElementRef;

  selectedCategory: string = 'Tìm kiếm tất cả';
  searchPlaceholder: string = 'TÌm kiếm tour thịnh hành...';
  searchTitle: string = 'Hiện thực hóa chuyến du lịch trong mơ';
  userProfile: any;
  searchQuery: string = '';
  searchResults: any[] = []; // Lưu kết quả tìm kiếm
  private searchSubject = new Subject<string>(); // Sử dụng Subject để debounce

  categories = [
    { name: 'Tìm kiếm tất cả', title: "Hiện thực hóa chuyến du lịch trong mơ", placeholder: 'Địa điểm, hoạt động, khách sạn...' },
    { name: 'Khách sạn', title: "Nghỉ ngơi ở nơi tuyệt vời", placeholder: 'Tên khách sạn hoặc điểm đến' },
    { name: 'Nhà hàng', title: "Tìm địa điểm ăn uống", placeholder: 'Nhà hàng hoặc điểm đến' },
    { name: 'Hoạt động', title: "Trải nghiệm điều mới mẻ", placeholder: 'Điểm tham quan, hoạt động hoặc điểm đến' },
    { name: 'Tour', title: "Khám phá những tour du lịch tuyệt vời", placeholder: 'Tour hoặc điểm đến' }
  ];

  addToWishlist(tour: any) {
    this.homepageService.addWishlist(tour).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.wishlistService.triggerWishlistUpdate();
        }
      },
      error: (err) => {
        console.error('Error adding to wishlist:', err);
      },
    });
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;
    this.searchSubject.next(this.searchQuery); // Gửi từ khóa để debounce
  }

  // Gọi API tìm kiếm tour
  searchTours(keyword: string): void {
    this.homepageService.searchTours(keyword).subscribe({
      next: (res) => {
        if (res.data) {
          this.searchResults = res.data.map((item: any) => ({
            id: item.id,
            name: item.name,
            imageUrl: item.tourImages[0].imageUrl,
          }));
        } else {
          this.searchResults = [];
        }
      },
      error: (err) => {
        console.error('Error searching tours', err);
        this.searchResults = [];
      }
    });
  }

  // Chọn một kết quả từ dropdown
  selectSearchResult(id: number): void {
    this.router.navigate(['/tour-details', id]); // Điều hướng đến chi tiết tour
    this.searchResults = []; // Reset kết quả sau khi chọn
    this.searchQuery = ''; // Reset input
  }

  openTourDetail(tourId: number): void {
    this.router.navigate(['/tour-details', tourId]); 
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (this.searchDropdownRef && !this.searchDropdownRef.nativeElement.contains(event.target)) {
      // Click nằm ngoài dropdown
      this.searchResults = []; // hoặc đặt biến điều khiển hiển thị khác
    }
  }

  onDropdownClick(): void {
    if (this.searchQuery && this.searchQuery.trim().length > 0) {
      this.searchTours(this.searchQuery);
    }
  }

  selectCategory(category: any) {
    this.selectedCategory = category.name;
    this.searchPlaceholder = category.placeholder;
    this.searchTitle = category.title;
  }

  trendingTours: Tour[] = [];
  locations: Location[] = [];
  blogs: Blog[] = [];
  blog: Blog | undefined;
  activities: any[] = [];
  topTourOfYear: Tour | undefined;

  constructor(
    private homepageService: HomepageService,
    private router: Router,
    private wishlistService: WishlistService,
  ) {
     this.searchSubject.pipe(debounceTime(300)).subscribe(query => {
          if (query && query.trim().length > 0) {
            this.searchTours(query);
          } else {
            this.searchResults = [];
          }
        });
  }

  ngOnInit() {
    console.log("ngOnInit called");
    this.fetchHomepageData();
  }

  fetchHomepageData() {
    console.log("fetchHomepageData called");
    this.homepageService.getHomepageData(6, 4, 3, 7).pipe(take(1)).subscribe({
      next: (res) => {
        if (res.code !== 200) {
          console.error('Fetching homepage data:', res.message);
          return;
        }
        this.trendingTours = res.data.trendingTours;
        this.topTourOfYear = res.data.topTourOfYear;
        this.blogs = res.data.newBlogs.slice(0, 3);
        this.blog = res.data.newBlogs[res.data.newBlogs.length - 1];
        this.activities = res.data.recommendedActivities;
        this.locations = res.data.recommendedLocations;
      },
      error: (err) => {
        console.error('Fetching homepage data:', err);
      }
    });
  }

  openBlogDetail(blogid: number | undefined) {
    if (blogid) {
      this.router.navigate(['/blog-details', blogid]);
    } else {
      console.error('Invalid blog id');
    }
  }

}

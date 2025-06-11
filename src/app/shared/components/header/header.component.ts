import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, OnDestroy, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { UserStorageService } from '../../../core/services/user-storage/user-storage.service';
import { CustomerService } from '../../../features/customer/services/customer.service';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { SsrService } from '../../../core/services/ssr.service';
import { WishlistComponent } from '../../../features/customer/components/wishlist/wishlist.component';
import { HomepageService } from '../../../features/public/services/homepage.service';
import { ShufflePipe } from '../../pipes/shuffle.pipe';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    ShufflePipe,
    WishlistComponent,
    FormsModule,
    RouterModule
  ],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild('wishlistModal') wishlistModal!: WishlistComponent;
  @ViewChild('searchDropdown') searchDropdownRef!: ElementRef;

  userProfile: any;
  isScrolled = false;
  private mainContent: HTMLElement | null | undefined;
  isProfileOpen: boolean = false;
  isLoggedIn: boolean = false;
  username: string = '';
  isHomepage: boolean = false;
  listLocation: any[] = [];
  searchQuery: string = '';
  searchResults: any[] = [];
  private searchSubject = new Subject<string>();

  constructor(
    private customerService: CustomerService,
    private userStorageService: UserStorageService,
    private ssrService: SsrService,
    private publicService: HomepageService,
    public router: Router
  ) {
    this.searchSubject.pipe(debounceTime(300)).subscribe(query => {
      if (query && query.trim().length > 0) {
        this.searchTours(query);
      } else {
        this.searchResults = [];
      }
    });
  }

  ngOnInit(): void {
    this.checkLoginStatus();
    this.getListLocation();
    this.isHomepage = this.router.url === '/homepage' || this.router.url === '/';

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        window.scrollTo(0, 0);
        this.isHomepage = this.router.url === '/homepage' || this.router.url === '/';
        this.searchResults = []; // Reset kết quả khi chuyển trang
      }
    });

    if (this.ssrService.getDocument()) {
      const doc = this.ssrService.getDocument();
      if (doc) {
        doc.addEventListener('show.bs.modal', () => {
          doc.body.classList.add('no-scroll');
        });

        doc.addEventListener('hide.bs.modal', () => {
          doc.body.classList.remove('no-scroll');
        });
      }
    }
  }

  // Xử lý sự kiện khi người dùng gõ
  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;
    this.searchSubject.next(this.searchQuery); // Gửi từ khóa để debounce
  }

  // Gọi API tìm kiếm tour
  searchTours(keyword: string): void {
    this.publicService.searchTours(keyword).subscribe({
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

  toggleDropdown() {
    const dropdown = document.getElementById('dropdownLocation');
    if (dropdown) {
      dropdown.classList.toggle('hidden');
    }
  }

  selectLocation(id: number) {
    this.router.navigate(['/location-details', id]);
  }

  getListLocation() {
    this.publicService.getListLocation().subscribe({
      next: (res) => {
        if (res.data) {
          this.listLocation = res.data;
        }
      },
      error: (err) => {
        console.error('Error loading list location', err);
      },
    });
  }

  checkLoginStatus() {
    const user = this.userStorageService.getUser();
    if (user) {
      this.isLoggedIn = true;
      this.username = user.username;
      this.loadUserProfile();
    } else {
      this.isLoggedIn = false;
    }
  }

  loadUserProfile(): void {
    this.customerService.getUserProfile().subscribe({
      next: (data) => {
        if (data?.data) {
          this.userProfile = data.data;
        }
      },
      error: (err) => {
        console.error('Error loading user profile', err);
      },
    });
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

  toggleProfileMenu() {
    this.isProfileOpen = !this.isProfileOpen;
  }

  closeProfileMenu() {
    this.isProfileOpen = false;
  }

  goHomepage(): void {
    this.router.navigate(['/homepage']);
  }

  openHistory(): void {
    this.router.navigate(['/customer/booking-history']);
  }

  ngAfterViewInit() {
    if (this.ssrService.isBrowser) {
      this.mainContent = document.getElementById('main-content');
      if (this.mainContent) {
        this.mainContent.addEventListener('scroll', this.onScroll);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.ssrService.isBrowser) {
      if (this.mainContent) {
        this.mainContent.removeEventListener('scroll', this.onScroll);
      }
      document.removeEventListener('show.bs.modal', () => { });
      document.removeEventListener('hide.bs.modal', () => { });
    }
    this.searchSubject.unsubscribe(); // Hủy subscription khi component destroy
  }

  onScroll = () => {
    if (this.ssrService.isBrowser) {
      if (this.mainContent && this.isHomepage) {
        const isModalOpen = document.body.classList.contains('modal-open');
        if (!isModalOpen) {
          const scrollPosition = this.mainContent.scrollTop;
          this.isScrolled = scrollPosition > 300;
        }
      }
    }
  };

  onLogout() {
    UserStorageService.signOut(this.userStorageService);
    this.isLoggedIn = false;
    this.router.navigate(['/homepage']);
  }
}
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CustomerService } from '../../services/customer.service';
import { EditProfileModalComponent } from '../edit-profile/edit-profile.component';
import { UserProfileService } from '../../services/user-profile.service';
import { ChangePasswordComponent } from '../../../common/components/change-password/change-password.component';
import { ChangeAvatarComponent } from './change-avatar/change-avatar.component';
import { FormatDatePipe } from "../../../../shared/pipes/format-date.pipe";
import { CurrencyVndPipe } from "../../../../shared/pipes/currency-vnd.pipe";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    EditProfileModalComponent,
    ChangePasswordComponent,
    ChangeAvatarComponent,
    FormatDatePipe,
    CurrencyVndPipe,
    FormsModule
],
  templateUrl: 'user-profile-management.component.html',
  styleUrls: ['user-profile-management.component.css'],
})
export class UserProfileManagementComponent implements OnInit, OnDestroy {
  userProfile: any;
  currentRoute: string = '';
  showEditModal = false;
  showChangePasswordModal = false;
  showChangeAvatarModal = false;
  isDropdownOpen: boolean = false;
  userId: string | null = null;
  private subscriptions: Subscription = new Subscription();

  currentPage: number = 0;
  totalPages: number = 0;
  pageSize = 5;


  keyword = '';
  paymentStatus = '';
  orderDate = 'desc';

  constructor(
    private customerService: CustomerService,
    private userProfileService: UserProfileService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUserProfile();
    this.fetchHistoryBooking();

    // Listen for route changes
    this.subscriptions.add(
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.currentRoute = event.urlAfterRedirects;
        }
      })
    );

    // Listen for profile changes
    this.subscriptions.add(
      this.userProfileService.userProfile$.subscribe((profile) => {
        if (profile) {
          this.userProfile = profile;
          this.userId = profile.id;
        }
      })
    );
  }

  bookings: any | [] = [];

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getPaymentStatus() {
    this.fetchHistoryBooking();
  }

  fetchHistoryBooking(): void {
    this.customerService.getHistoryBooking(this.currentPage, this.pageSize, this.keyword, this.paymentStatus, this.orderDate).subscribe({
      next: (res) => {
        this.bookings = res.data.items;
        this.totalPages = Math.ceil(res.data.total / this.pageSize); 
      },
      error: (err) => {
        console.error('Fetching History Booking data:', err);
      }
    });
  }

  getStatusInVietnamese(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Đang chờ',
      'COMPLETED': 'Đã hoàn thành',
      'CANCELLED': 'Đã hủy',
      'SUCCESS': 'Đã phê duyệt'
    };
    return statusMap[status] || status;
  }

  // Phương thức trả về class CSS dựa trên trạng thái
  getStatusClass(status: string): string {
    const baseClass = 'rounded-[30px] px-2 py-0.5 text-xs font-medium inline-block mt-1';
    const statusColors: { [key: string]: string } = {
      'PENDING': 'bg-yellow-500/10 text-yellow-800',
      'COMPLETED': 'bg-blue-500/10 text-blue-800',
      'CANCELLED': 'bg-red-500/10 text-red-800',
      'SUCCESS': 'bg-green-500/10 text-green-800'
    };
    return `${baseClass} ${statusColors[status] || 'bg-gray-500/10 text-gray-800'}`;
  }

  goToBookingDetail(bookingId: string): void {
    this.router.navigate(['/tour-booking-detail/', bookingId]);
  }

  loadUserProfile(): void {
    this.customerService.getUserProfile().subscribe({
      next: (data) => {
        if (data?.data) {
          this.userProfile = data.data;
          this.userProfileService.setUserProfile(data.data);
          this.userProfileService.setUserAvatar(data.data.avatarImg);
          this.userId = data.data.id;
        }
      },
      error: (err) => {
        console.error('Error loading user profile', err);
      },
    });
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.fetchHistoryBooking();
    }
  }

  goToHome(): void {
    this.router.navigate(['/homepage']);
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  onChangePassword(): void {
    this.isDropdownOpen = false;
    this.showChangePasswordModal = true;
  }

  closeChangePasswordModal(): void {
    this.showChangePasswordModal = false;
  }

  onChangeAvatar(): void {
    this.isDropdownOpen = false;
    this.showChangeAvatarModal = true;
  }

  closeChangeAvatarModal(): void {
    this.showChangeAvatarModal = false;
  }

  openEditModal(): void {
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }

  isActive(route: string): boolean {
    return this.currentRoute === route;
  }

  logout(): void {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}
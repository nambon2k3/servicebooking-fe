import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HomepageService } from '../../../public/services/homepage.service';
import { WishlistService } from './wishlist.service';
import { UserStorageService } from '../../../../core/services/user-storage/user-storage.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css',
})
export class WishlistComponent implements OnInit {
  wishlist: any[] = [];
  isLoading: boolean = true;
  error: string | null = null;

  constructor(
    private router: Router,
    private homepageService: HomepageService,
    private wishlistService: WishlistService,
    private userStorage: UserStorageService
  ) {}

  ngOnInit() {
    const user = this.userStorage.getUser();
    if (user) {
    this.fetchWishlist();
    this.wishlistService.wishlistUpdate$.subscribe(() => {
      this.fetchWishlist();
    });
    }
  }

  fetchWishlist() {
    this.isLoading = true;
    this.error = null;

    this.homepageService.getWishlist().subscribe({
      next: (response) => {
        if (response.code === 200 && response.data) {
          this.wishlist = response.data;
          this.isLoading = false;
        } else {
          this.error = 'Failed to load wishlist';
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.error = 'An error occurred while fetching the wishlist';
        this.isLoading = false;
      },
    });
  }

  removeFromWishlist(wishlistId: number) {
    this.isLoading = true;
    this.homepageService.deleteWishlist(wishlistId).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.wishlist = this.wishlist.filter(item => item.id !== wishlistId);
          this.isLoading = false;
        } else {
          this.error = 'Failed to remove item from wishlist';
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.error = 'An error occurred while removing the item';
        this.isLoading = false;
      },
    });
  }

  viewDetails(tourId: number): void {
    //this.router.navigate(['/tour-details', tourId]);
  }


  showSuccess: boolean = false;
  showError: boolean = false;


  successMessage: string = 'Thêm thành công';
  errorMessage: string = 'Thêm thất bại';

  triggerSuccess() {
    this.showSuccess = true;

    // Hide warning after 3 seconds
    setTimeout(() => {
      this.showSuccess = false;
    }, 4000);
  }

  triggerError() {
    this.showError = true;

    // Hide warning after 3 seconds
    setTimeout(() => {
      this.showError = false;
    }, 4000);
  }

}
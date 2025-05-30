import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmEmailService } from '../../services/confirm-email/confirm-email.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-email',
  imports: [
    CommonModule
  ],
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.css'],
})
export class ConfirmEmailComponent implements OnInit {
  token: string | null = null;
  isLoading = true;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private confirmEmailService: ConfirmEmailService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Extract the token from the URL
    this.token = this.route.snapshot.queryParamMap.get('token');

    if (this.token) {
      this.confirmEmail();
    } else {
      this.errorMessage = 'Token hoặc liên kết không hợp lệ.';
      this.isLoading = false;
    }
  }

  /**
   * Sends the token to the ConfirmEmailService to confirm the email
   */
  confirmEmail(): void {
    this.confirmEmailService.confirmEmail(this.token!).subscribe({
      next: (response) => {
        this.successMessage = 'Email của bạn đã được xác nhận thành công! Bạn sẽ được chuyển đến trang đăng nhập trong 5 giây.';
        this.isLoading = false;
        // Optionally redirect after a 5 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 5000);
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Lỗi khi xác nhận email.';
        this.isLoading = false;
      },
    });
  }
}

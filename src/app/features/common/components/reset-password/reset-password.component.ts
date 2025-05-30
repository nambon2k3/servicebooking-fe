import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-reset-password',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {
  token: string | null = null;
  resetPasswordForm!: FormGroup;
  hidePassword = true;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  activeField: string | null = null;
  isLoading = false;

  passwordCriteria = {
    minLength: false,
    uppercase: false,
    lowercase: false,
    specialChar: false,
  };

  confirmPasswordMismatch = false;

  constructor(private fb: FormBuilder,
    private route: ActivatedRoute, private router: Router, private commonService: CommonService) { }

  ngOnInit() {
    this.resetPasswordForm = this.fb.group(
      {
        password: [
          null,
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\W).*$'),
          ],
        ],
        rePassword: [null, [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );

    // Confirm password validation
    this.resetPasswordForm.get('rePassword')?.valueChanges.subscribe((value) => {
      this.confirmPasswordMismatch =
        value !== this.resetPasswordForm.get('password')?.value;
    });
    // Listen to password changes for validation criteria
    this.resetPasswordForm.get('password')?.valueChanges.subscribe((value) => {
      this.validatePasswordCriteria(value);
    });

    // Extract the token from the URL
    this.token = this.route.snapshot.queryParamMap.get('token');
  }

  // Validate password criteria
  validatePasswordCriteria(password: string): void {
    this.passwordCriteria.minLength = password.length >= 8;
    this.passwordCriteria.uppercase = /[A-Z]/.test(password);
    this.passwordCriteria.lowercase = /[a-z]/.test(password);
    this.passwordCriteria.specialChar = /[\W_]/.test(password);
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  onFocus(field: string): void {
    this.activeField = field;
  }

  onBlur(): void {
    this.activeField = null;
  }

  getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }

  // Custom validator for matching passwords
  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const rePassword = group.get('rePassword')?.value;
    return password === rePassword ? null : { mismatch: true };
  }

  onSubmit(): void {
    this.isLoading = true;
    this.errorMessage = null;

    const savedEmail = this.getCookie('email');
    if (this.token) {
      this.commonService.resetPassword(this.token, savedEmail!, this.resetPasswordForm.value).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.successMessage = response.message || 'Password reset successfully. Redirecting to login...';

          setTimeout(() => {
            this.router.navigateByUrl('/login');
          }, 3000);
        },
        error: (error: any) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'An error occurred. Please try again.';
        }
      });
    }
    else {
      this.errorMessage = 'Invalid token or URL.';
      this.isLoading = false;
    }

  }
}

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from '../../services/common.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    RouterModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  forgotPasswordForm!: FormGroup;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  isLoading = false;

  emailCriteria = {
    validFormat: false,
  };

  constructor(private fb: FormBuilder, private router: Router, private commonService: CommonService) { }

  ngOnInit() {
    this.forgotPasswordForm = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
    });

    // Email validation criteria
    this.forgotPasswordForm.get('email')?.valueChanges.subscribe((value) => {
      this.emailCriteria.validFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    });
  }

  onSubmit(): void {
    this.isLoading = true;
    this.errorMessage = null;
    const email = this.forgotPasswordForm.value.email;

    this.commonService.forgotPassword(this.forgotPasswordForm.value).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.successMessage = response.message || 'Password reset link sent. Please check your email.';

        // Save email to cookie (expires in 10 minutes)
        const expiryDate = new Date();
        expiryDate.setTime(expiryDate.getTime() + 10 * 60 * 1000);
        document.cookie = `email=${email}; expires=${expiryDate.toUTCString()}; path=/`;
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error?.error?.message || 'An error occurred. Please try again.';
      }
    });
  }
}

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { CustomerService } from '../../../customer/services/customer.service';
import { UserStorageService } from '../../../../core/services/user-storage/user-storage.service';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-change-password',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent implements OnInit {
  @Output() closeModal = new EventEmitter<void>();
  changePasswordForm!: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  activeField: string | null = null;
  hidePassword = true;

  passwordCriteria = {
    minLength: false,
    uppercase: false,
    lowercase: false,
    specialChar: false,
  };

  newRePasswordMismatch = false;

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private userStorageService: UserStorageService
  ) { }

  ngOnInit(): void {
    this.changePasswordForm = this.fb.group({
      currentPassword: [null, Validators.required],
      newPassword: [
        null,
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\W).*$'),
        ],
      ],
      newRePassword: [null, Validators.required]
    },
      {
        validators: this.passwordMatchValidator,
      });
    // Confirm password validation
    this.changePasswordForm.get('newRePassword')?.valueChanges.subscribe((value) => {
      this.newRePasswordMismatch =
        value !== this.changePasswordForm.get('newPassword')?.value;
    });
    this.changePasswordForm.get('newPassword')?.valueChanges.subscribe((value) => {
      this.validatePasswordCriteria(value);
    });
  }

  // Validate password criteria
  validatePasswordCriteria(password: string): void {
    this.passwordCriteria.minLength = password.length >= 8;
    this.passwordCriteria.uppercase = /[A-Z]/.test(password);
    this.passwordCriteria.lowercase = /[a-z]/.test(password);
    this.passwordCriteria.specialChar = /[\W_]/.test(password);
  }

  // Custom validator for matching passwords
  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('newPassword')?.value;
    const rePassword = group.get('newRePassword')?.value;
    return password === rePassword ? null : { mismatch: true };
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

  close(): void {
    this.closeModal.emit();
  }

  saveChanges(): void {
    const token = this.userStorageService.getToken();
    const formData = this.changePasswordForm.value;

    if (!token) {
      this.errorMessage = 'Authentication error. Please log in again.';
      return;
    }

    this.commonService.changePassword(formData)
      .pipe(
        catchError((error) => {
          const apiError = error || 'An unexpected error occurred. Please try again later.';
          this.errorMessage = apiError;
          return of(null);
        })
      )
      .subscribe((response: any) => {
        if (response?.code === 200) {
          // Success case
          this.successMessage = response?.message || 'Password changed successfully.';
          this.errorMessage = null;
          this.changePasswordForm.reset();
        } else if (response) {
          this.errorMessage = response?.message || 'An error occurred while changing password.';
          this.successMessage = null;
        }
      });
  }
}

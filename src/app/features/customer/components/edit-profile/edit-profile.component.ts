import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CustomerService } from '../../services/customer.service';
import { UserProfileService } from '../../services/user-profile.service';
import { UserStorageService } from '../../../../core/services/user-storage/user-storage.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-edit-profile-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css'],
})
export class EditProfileModalComponent implements OnInit {
  @Output() closeModal = new EventEmitter<void>();
  @Input() userProfile: any;

  editProfileForm!: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private userProfileService: UserProfileService,
    private userStorageService: UserStorageService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.editProfileForm = this.fb.group({
      fullName: [this.userProfile?.fullName || '', Validators.required],
      email: [this.userProfile?.email || '', [Validators.required, Validators.email]],
      gender: [this.userProfile?.gender || 'MALE', Validators.required],
      phone: [this.userProfile?.phone || '', Validators.required],
      address: [this.userProfile?.address || '', Validators.required]
    });
  }

  close(): void {
    this.closeModal.emit();
  }

  saveChanges(): void {
    if (this.editProfileForm.invalid) return;

    const token = this.userStorageService.getToken();
    const userId = this.userProfile?.id;

    if (!token || !userId) {
      this.errorMessage = 'Authentication error. Please log in again.';
      return;
    }

    const formData = this.editProfileForm.value;

    this.customerService.updateUserProfile(userId, formData)
      .pipe(
        catchError((error) => {
          const apiError = error?.error?.message || 'An error occurred while updating profile.';
          this.errorMessage = apiError;
          return of(null);
        })
      )
      .subscribe((response: any) => {
        if (response?.code === 200) {
          this.successMessage = response?.message;
          this.errorMessage = null;
          this.editProfileForm.patchValue(response?.data);
          this.userProfileService.setUserProfile(response?.data);
        } else if (!response) {
        } else {
          this.errorMessage = response?.message || 'An error occurred while updating profile.';
          this.successMessage = null;
        }
      });
  }
}

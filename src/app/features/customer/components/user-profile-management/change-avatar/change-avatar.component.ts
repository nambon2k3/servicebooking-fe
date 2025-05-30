import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CustomerService } from '../../../services/customer.service';
import { UserProfileService } from '../../../services/user-profile.service';

@Component({
  selector: 'app-change-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './change-avatar.component.html',
  styleUrls: ['./change-avatar.component.css'],
})
export class ChangeAvatarComponent {
  @Output() closeModal = new EventEmitter<void>();
  @Input() userId: string | null = null;

  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private customerService: CustomerService,
    private userProfileService: UserProfileService
  ) {}

  // Handle file selection
  onFileSelected(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      if (this.selectedFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target && e.target.result) {
            this.previewUrl = e.target.result as string | ArrayBuffer;
          }
        };
        reader.readAsDataURL(this.selectedFile);
      }
    }
  }

  // Close the modal
  close(): void {
    this.closeModal.emit();
  }

  // Remove the selected file
  removeSelectedFile(): void {
    this.selectedFile = null;
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
      this.previewUrl = null;
    }
  }

  // Upload the selected avatar
  uploadAvatar(): void {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('avatar', this.selectedFile);

    this.customerService.changeAvatar(this.userId, formData).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        if (response?.data) {
          // Use the avatar URL from the response to update the profile
          this.userProfileService.setUserAvatar(response.data);
        }
        this.errorMessage = null;
      },
      error: (err) => {
        this.errorMessage = 'Error: ' + err.message;
      },
    });
  }
}
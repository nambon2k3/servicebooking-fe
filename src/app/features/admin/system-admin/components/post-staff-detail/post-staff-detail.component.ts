import { Component } from '@angular/core';
import { StaffService } from '../../services/staff.service';
import { catchError, of } from 'rxjs';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../../../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { IDropdownSettings, NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { AdminService } from '../../../admin.service';

@Component({
  selector: 'app-staff-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgMultiSelectDropDownModule,
    FormsModule,
  ],
  templateUrl: './post-staff-detail.component.html',
  styleUrls: ['./post-staff-detail.component.css']
})
export class PostStaffDetailComponent {
  editUserForm!: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  imagePreview: string | null = null;
  selectedFile: File | null = null;
  staffId: string | null = null;
  staff: User = <User>{};

  dropdownList: any = [];
  dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'item_id',
    textField: 'item_text',
    selectAllText: 'Chọn tất cả',
    unSelectAllText: 'Bỏ chọn tất cả',
    itemsShowLimit: 5,
    searchPlaceholderText: 'Tìm kiếm tên vai trò',
    allowSearchFilter: true
  };

  selectedItems: any = [];
  isCustomerOnly: boolean = false;

  constructor(
    private staffService: StaffService,
    private adminService: AdminService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.route.queryParams.subscribe(params => {
      this.staffId = params['id'];
      if (this.staffId) {
        this.loadUserById(this.staffId);
      }
    });
    this.getStaffRoles();
  }

  getStaffRoles(): void {
    this.staffService.getStaffRoles().subscribe({
      next: (response) => {
        this.dropdownList = response.data.map((role: { id: number, roleName: string }) => ({
          item_id: role.id,
          item_text: role.roleName
        }));

        if (this.staffId && this.staff.roleNames) {
          this.selectedItems = this.dropdownList.filter((item: any) =>
            this.staff.roleNames.includes(item.item_text)
          );
        }
      },
      error: (err) => {
        this.errorMessage = err.message;
      }
    });
  }

  onItemSelect(item: any) {
    const roleNames = this.editUserForm.get('roleNames')?.value || [];
  }

  onDeSelect(item: any) {
    const roleNames = this.editUserForm.get('roleNames')?.value || [];
    this.editUserForm.get('roleNames')?.setValue(roleNames.filter((role: string) => role !== item.item_text));
  }

  onSelectAll(items: any) {
    console.log("Before update:", this.selectedItems);
    this.selectedItems = [...items];
    console.log("After update:", this.selectedItems);
    this.editUserForm.get('roleNames')?.setValue(items.map((item: any) => item.item_text));
  }
  
  

  resetItems(): void {
    this.selectedItems = this.selectedItems.map((role: any) => ({
      item_text: role.name
    }));
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFile = file;

      // Generate a preview URL for the selected image
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  initForm(): void {
    this.editUserForm = this.fb.group({
      id: [{ value: '', disabled: true }],
      fullName: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
      rePassword: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      gender: ['MALE', Validators.required],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      roleNames: [[], Validators.required],
      avatarImage: ['', Validators.required],
      updatedAt: [new Date()],
      status: ['active', Validators.required]
    });
  }

  loadUserById(id: string): void {
    this.staffService.getStaffById(id).subscribe({
      next: (response: any) => {
        if (response?.code === 200) {
          this.staff = response.data;
          this.editUserForm.patchValue({
            id: this.staff.id,
            fullName: this.staff.fullName,
            username: this.staff.username,
            email: this.staff.email,
            gender: this.staff.gender ? 'MALE' : 'FEMALE',
            phone: this.staff.phone,
            address: this.staff.address,
            roleNames: this.staff.roleNames || [],
            status: this.staff.deleted ? 'inactive' : 'active'
          });

          this.isCustomerOnly = this.staff.roleNames && this.staff.roleNames.length === 1 && this.staff.roleNames[0] === 'CUSTOMER';

          this.selectedItems = this.staff.roleNames ? this.staff.roleNames.map((role: string) => ({
            item_id: role,
            item_text: role
          })) : [];
          this.getStaffRoles();

          if (this.staff.avatarImage) {
            this.imagePreview = this.staff.avatarImage;
          }
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (err) => {
        this.errorMessage = err.message;
      }
    });
  }

  onCancel(): void {
    window.history.back();
  }

  saveChanges(): void {
    const formData = new FormData();
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
      this.adminService.uploadImage(formData).subscribe({
        next: (response) => {
          this.editUserForm.get('avatarImage')?.setValue(response.data);
          if (this.staffId) {
            this.updateStaff();
          } else {
            this.createStaff();
          }
        },
        error: (err) => {
          this.errorMessage = err.message;
        }
      });
    } else {
      if (this.staffId) {
        this.updateStaff();
      } else {
        this.createStaff();
      }
    }
  }

  updateStaff(): void {
    if (this.editUserForm.get('password')?.value !== null) {
      this.editUserForm.get('rePassword')?.setValue(this.editUserForm.get('password')?.value);
    }
    const roles = this.editUserForm.get('roleNames')?.value;
    if (roles && Array.isArray(roles)) {
      this.editUserForm.get('roleNames')?.setValue(roles.map((role: any) => role?.item_text || role));
    } else {
      this.editUserForm.get('roleNames')?.setValue([]);
    }
    const formData = this.editUserForm.getRawValue();

    this.staffService.updateStaff(formData)
      .pipe(
        catchError((error) => {
          this.errorMessage = error?.message;
          this.successMessage = null;
          return of(null);
        })
      )
      .subscribe((response: any) => {
        if (response?.code === 200) {
          this.successMessage = response?.message;
          this.errorMessage = null;
        } else {
          this.errorMessage = response.message;
          this.successMessage = null;
        }
      });
  }


  createStaff(): void {
    this.editUserForm.get('roleNames')?.setValue(this.editUserForm.get('roleNames')?.value.map((role: any) => role.item_text));
    const formData = this.editUserForm.getRawValue();

    this.staffService.createStaff(formData)
      .pipe(
        catchError((error) => {
          const apiError = error?.message;
          this.errorMessage = apiError;
          this.successMessage = null;
          return of(null);
        })
      )
      .subscribe((response: any) => {
        if (response?.code === 201) {
          this.successMessage = response?.message;
          this.errorMessage = null;
          this.router.navigate(['/admin/user']);
        } else {
          this.errorMessage = response.message;
          this.successMessage = null;
        }
      });
  }
}

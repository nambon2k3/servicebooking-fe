import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';

@Component({
    standalone: true,
    selector: 'app-register',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule
    ],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
    signupForm!: FormGroup;
    hidePassword = true;
    errorMessage: string | null = null;
    activeField: string | null = null;
    isLoading = false;

    passwordCriteria = {
        minLength: false,
        uppercase: false,
        lowercase: false,
        specialChar: false,
    };


    usernameCriteria = {
        minLength: false,
        maxLength: false,
        pattern: false,
    };

    fullNameCriteria = {
        pattern: false,
    };

    emailCriteria = {
        validFormat: false,
    };

    phoneCriteria = {
        validFormat: false,
    };

    addressCriteria = {
        validFormat: false,
    };

    gendersCriteria = {
        validFormat: false,
    };

    confirmPasswordMismatch = false;


    constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) { }

    ngOnInit(): void {
        this.signupForm = this.fb.group(
            {
                username: [
                    null,
                    [
                        Validators.required,
                        Validators.minLength(8),
                        Validators.maxLength(30),
                        Validators.pattern('^[a-zA-Z0-9]*$'),
                    ],
                ],
                password: [
                    null,
                    [
                        Validators.required,
                        Validators.minLength(8),
                        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\W).*$'),
                    ],
                ],
                fullName: [
                    null,
                    [
                        Validators.required,
                        Validators.pattern('^[a-zA-Z ]*$'),
                    ],
                ],
                email: [null, [Validators.required, Validators.email]],
                phone: [null, [Validators.required]],
                gender: ["", [Validators.required]],
                address: [null, [Validators.required]],
                rePassword: [null, [Validators.required]],
            },
            {
                validators: this.passwordMatchValidator,
            }
        );

        // Username validation criteria
        this.signupForm.get('username')?.valueChanges.subscribe((value) => {
            this.usernameCriteria.minLength = value.length >= 8;
            this.usernameCriteria.maxLength = value.length <= 30;
            this.usernameCriteria.pattern = /^[a-zA-Z0-9]*$/.test(value);
        });

        // Full name validation criteria
        this.signupForm.get('fullName')?.valueChanges.subscribe((value) => {
            this.fullNameCriteria.pattern = /^[a-zA-Z ]*$/.test(value);
        });

        this.signupForm.get('gender')?.valueChanges.subscribe((value) => {
            this.gendersCriteria.validFormat = value === 'MALE' || value === 'FEMALE';
        });

        // Address validation criteria
        this.signupForm.get('address')?.valueChanges.subscribe((value) => {
            this.addressCriteria.validFormat = /^[a-zA-Z0-9 ]*$/.test(value);
        });

        // Phone validation criteria
        this.signupForm.get('phone')?.valueChanges.subscribe((value) => {
            this.phoneCriteria.validFormat = /^[0-9]{10}$/.test(value);
        });

        // Email validation criteria
        this.signupForm.get('email')?.valueChanges.subscribe((value) => {
            this.emailCriteria.validFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        });

        // Confirm password validation
        this.signupForm.get('rePassword')?.valueChanges.subscribe((value) => {
            this.confirmPasswordMismatch =
                value !== this.signupForm.get('password')?.value;
        });

        // Listen to password changes for validation criteria
        this.signupForm.get('password')?.valueChanges.subscribe((value) => {
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
        const password = group.get('password')?.value;
        const rePassword = group.get('rePassword')?.value;
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

    onSubmit(): void {
        this.isLoading = true;
        this.authService
            .register(this.signupForm.value)
            .subscribe({
                next: (response: any) => {
                    if (response?.code === 201) {
                        this.router.navigate(['/regis-confirm']);
                    }
                    this.isLoading = false;
                },
                error: (error) => {
                    this.isLoading = false;
                    const apiError = error || 'An error occurred during sign in.';
                    this.errorMessage = apiError;
                }
            });
    }
}


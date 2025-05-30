import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registration-confirmation',
  imports: [
    CommonModule
  ],
  templateUrl: './registration-confirmation.component.html',
  styleUrls: ['./registration-confirmation.component.css']
})
export class RegistrationConfirmationComponent implements OnInit {
  errorMessage: string | null = null;
  isLoading = true;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
      setTimeout(() => {
        this.route.queryParams.subscribe(params => {
          const encodedError = params['error'];
          if (encodedError) {
              // Decode the error message
              this.errorMessage = decodeURIComponent(encodedError);
          } else {
              this.errorMessage = null; // No error message provided
          }
          this.isLoading = false;
        });
      }, 3000);
  }
}
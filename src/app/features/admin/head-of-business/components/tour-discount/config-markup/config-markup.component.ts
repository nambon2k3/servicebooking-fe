import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TourDiscountService } from '../../../services/discount.service';
import { Modal } from 'flowbite';
import { SsrService } from '../../../../../../core/services/ssr.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-config-markup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './config-markup.component.html',
  styleUrls: ['./config-markup.component.css']
})
export class ConfigMarkupComponent implements OnInit {
  @Input() tourId!: number | null;
  @Output() confirm = new EventEmitter<number>();

  markupForm!: FormGroup;
  modal: Modal | null = null;

  constructor(
    private fb: FormBuilder,
    private tourService: TourDiscountService,
    private ssrService: SsrService
  ) { }

  ngOnInit() {
    this.markupForm = this.fb.group({
      markUpPercent: [0, [Validators.required, Validators.min(0)]]
    });

    if (this.tourId) {
      this.getMarkup();
    }
  }

  ngAfterViewInit() {
    const doc = this.ssrService.getDocument();
    if (!doc) return;
    const modalElement = document.getElementById('configMarkupModal');
    if (modalElement) {
      this.modal = new Modal(modalElement);
    }
  }

  getMarkup() {
    if (!this.tourId) return;
    
    this.tourService.getMarkup(this.tourId).subscribe(response => {
      const markUpValue = response.data.markUpPercent;
      this.markupForm.patchValue({ markUpPercent: markUpValue });
    });
  }

  onConfirm() {
    if (this.markupForm.invalid || !this.tourId) return;

    const formData = this.markupForm.value;
    this.tourService.updateMarkup(this.tourId, formData).subscribe(response => {
      if (response?.data?.markUpPercent !== undefined) {
        this.confirm.emit(response.data.markUpPercent);
        this.hideModal();
      }
    });
  }

  showModal() {
    this.modal?.show();
  }

  hideModal() {
    this.modal?.hide();
  }
}

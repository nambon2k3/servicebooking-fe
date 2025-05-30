import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { TourService } from '../../../../services/tour.service';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-create-log',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './create-log.component.html',
  styleUrl: './create-log.component.css'
})

export class CreateLogComponent {
  @Input() scheduleId!: number;
  @Output() logCreated = new EventEmitter<void>();
  logForm!: FormGroup;

  constructor(private fb: FormBuilder, private tourService: TourService) {
    this.logForm = this.fb.group({
      action: ['', Validators.required],
      content: ['', Validators.required],
    });
  }

  onSave() {
    if (this.logForm.valid) {
      const formData = { ...this.logForm.value };
      this.tourService.createLog(formData, this.scheduleId).subscribe({
        next: (response: any) => {
          if (response.code === 200) {
            this.logCreated.emit();
          } else {
            console.error('Lỗi:', response.message);
          }
        },
        error: (error: any) => {
          console.error('Lỗi khi tạo log:', error);
        }
      });
    }
  }
}

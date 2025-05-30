import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { DatePipe } from '@angular/common';
import { StaffService } from '../../../services/staff.service';
import { User } from '../../../../../../core/models/user.model';
import { Router } from '@angular/router';
@Component({
  selector: '[app-table-row]',
  imports: [FormsModule, AngularSvgIconModule],
  templateUrl: './table-row.component.html',
  styleUrl: './table-row.component.css',
})
export class TableRowComponent {
  @Input() staff: User = <User>{};

  constructor(
    private staffService: StaffService,
    private router: Router
  ) { }

  deleteStaff(): void {
    this.staffService.deleteStaff(this.staff.id).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.staff.deleted = true;
        }
      },
      error: (err) => {
        console.error('Failed to hide staff:', err);
      },
    });
  }

  openDetail(staff: User): void {
    this.router.navigate(['/admin/user-details'], {
      queryParams: { id: staff.id }
    });
  }

  recoverStaff(): void {
    this.staffService.recoverStaff(this.staff.id).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.staff.deleted = false;
        }
      },
      error: (err) => {
        console.error('Failed to show staff:', err);
      },
    });
  }
}

import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { User } from '../../../../../../core/models/user.model';
import { Router } from '@angular/router';
import { StaffService } from '../../../services/staff.service';
@Component({
  selector: '[app-table-row]',
  imports: [FormsModule, AngularSvgIconModule],
  templateUrl: './table-row.component.html',
  styleUrl: './table-row.component.css',
})
export class TableRowComponent {
  @Input() customer: User = <User>{};

  constructor(
    private staffService: StaffService,
    private router: Router
  ) { }

  deleteCustomer(): void {
    this.staffService.deleteStaff(this.customer.id).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.customer.deleted = true;
        }
      },
      error: (err) => {
        console.error('Failed to hide customer:', err);
      },
    });
  }

  openDetail(customer: User): void {
    this.router.navigate(['/admin/user-details'], {
      queryParams: { id: customer.id }
    });
  }

  recoverCustomer(): void {
    this.staffService.recoverStaff(this.customer.id).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.customer.deleted = false;
        }
      },
      error: (err) => {
        console.error('Failed to show customer:', err);
      },
    });
  }
}

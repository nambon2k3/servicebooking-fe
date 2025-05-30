import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { StaffService } from '../../../services/staff.service';

interface Role {
  id: number;
  roleName: string;
}

@Component({
  selector: 'app-table-action',
  standalone: true,
  imports: [AngularSvgIconModule, FormsModule],
  templateUrl: './table-action.component.html',
  styleUrls: ['./table-action.component.css'],
})
export class TableActionComponent implements OnInit {
  @Input() totalItems = 0;
  @Input() size = 0;

  // Filter inputs
  keyword = '';
  status = '';
  order = '1';
  role = '';

  roles: Role[] = [];

  @Output() searchFilters = new EventEmitter<any>();

  constructor(
    private staffService: StaffService
  ) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  // Gọi API để lấy danh sách roles
  loadRoles(): void {
    this.staffService.getStaffRoles().subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.roles = response.data; // Lưu danh sách roles
        } else {
          console.error('Failed to load roles:', response.message);
        }
      },
      error: (err) => {
        console.error('Error fetching roles:', err);
      }
    });
  }

  onSubmit(): void {
    const filters = {
      keyword: this.keyword,
      status: this.status,
      order: this.order,
      role: this.role,
    };
    this.searchFilters.emit(filters);
  }
}
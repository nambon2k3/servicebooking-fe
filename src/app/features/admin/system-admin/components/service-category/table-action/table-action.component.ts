import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';

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
export class TableActionComponent {
  @Input() totalItems = 0;
  @Input() size = 0;

  // Filter inputs
  keyword = '';
  status = '';
  order = '1';

  @Output() searchFilters = new EventEmitter<any>();

  onSubmit(): void {
    const filters = {
      keyword: this.keyword,
      status: this.status,
      order: this.order,
    };
    this.searchFilters.emit(filters);
  }
}
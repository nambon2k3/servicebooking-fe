import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';

@Component({
  selector: 'app-table-action',
  imports: [
    AngularSvgIconModule,
    FormsModule
  ],
  templateUrl: './table-action.component.html',
  styleUrl: './table-action.component.css',
})
export class TableActionComponent {
  @Input() totalItems = 0;
  @Input() size = 0;

  keyword = '';
  status = '';
  order = '1';

  @Output() searchFilters = new EventEmitter<any>();

  onSubmit(): void {
    const filters = {
      keyword: this.keyword,
      status: this.status,
      order: this.order
    };
    this.searchFilters.emit(filters);
  }
}

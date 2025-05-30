import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormatDatePipe } from '../../../../../../shared/pipes/format-date.pipe';
@Component({
  selector: '[app-table-row]',
  imports: [FormsModule, AngularSvgIconModule, CommonModule, FormatDatePipe],
  templateUrl: './table-row.component.html',
  styleUrl: './table-row.component.css',
})
export class TableRowComponent {

  @Input() tourShedule: any = <any>{};
  @Input() index: any = <any>{};

  authorName: string = 'Loading...';
  tags: string[] = [];

  constructor(
    private router: Router
  ) { 
  }

  openDetail(tourSchedule: any): void {
    this.router.navigate(['/accountant/booking-settlement/' + tourSchedule.id]);
  }
}

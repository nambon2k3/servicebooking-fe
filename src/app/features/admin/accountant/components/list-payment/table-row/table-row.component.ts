import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PaymentRecord } from '../../../../../../core/models/tour-accountant.model';
import { CurrencyVndPipe } from '../../../../../../shared/pipes/currency-vnd.pipe';
import { FormatDatePipe } from '../../../../../../shared/pipes/format-date.pipe';
@Component({
  selector: '[app-table-row]',
  imports: [FormsModule, AngularSvgIconModule, CommonModule, FormatDatePipe, CurrencyVndPipe],
  templateUrl: './table-row.component.html',
  styleUrl: './table-row.component.css',
})
export class TableRowComponent {

  @Input() payment: any;
  @Input() index: any;

  constructor(
    private router: Router
  ) { }

  openDetail(payment: PaymentRecord): void {
    this.router.navigate(['/accountant/invoice-details'],  {
      queryParams: { id: payment.id }
    });
  }
}

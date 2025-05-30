import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyVndPipe } from "../../../../../../shared/pipes/currency-vnd.pipe";
import { CommonModule } from '@angular/common';
import { TourDiscountService } from '../../../services/discount.service';

interface PaxOption {
  id: number;
  minPax: number;
  maxPax: number;
  paxRange: string;
  fixedCost: number;
  sellingPrice: number;
  validFrom: string;
  validTo: string;
}

interface PriceRange {
  [key: string]: number;
}

@Component({
  selector: 'app-config-price',
  standalone: true,
  imports: [FormsModule, CurrencyVndPipe, CommonModule],
  templateUrl: './config-price.component.html'
})
export class ConfigPriceComponent {
  // @Input() markupPercentage: number = 0;
  @Input() tourId!: number;
  @Input() set prices(value: PaxOption[]) {
    this._prices = value.map(p => {
      const netPrice = this.totalSellingPrice[p.paxRange];
      return {
        ...p,
        fixedCostFormatted: p.fixedCost?.toLocaleString('vi-VN'),
        sellingPriceFormatted: Math.round((netPrice + (p.fixedCost / this.getMinPax(p.paxRange))))?.toLocaleString('vi-VN')
      };
    });
  }

  @Output() confirm = new EventEmitter<PaxOption[]>();
  @Output() cancel = new EventEmitter<void>();
  @Output() error = new EventEmitter<string>();
  @Input() totalSellingPrice: PriceRange = {};
  @Input() extraHotelCost: PriceRange = {};
  @Input() nettPricePerPax: PriceRange = {};

  constructor(
    private discountService: TourDiscountService,
  ) { }

  _prices: {
    id: number;
    paxRange: string;
    fixedCostFormatted: string;
    sellingPriceFormatted: string;
  }[] = [];

  ngOnInit(): void {
    console.log('totalSellingPrice', this.totalSellingPrice);
    this.discountService.getPriceConfigurations(this.tourId).subscribe(response => {
      if (response?.data?.priceConfigurations) {
        this.startDate = response.data.priceConfigurations[0].validFrom.split('T')[0];
        this.endDate = response.data.priceConfigurations[0].validTo.split('T')[0];
        this._prices = response.data.priceConfigurations.map((p: any) => {
          const netPrice = this.totalSellingPrice[p.paxRange];
          return {
            id: p.id,
            paxRange: p.paxRange,
            fixedCostFormatted: p.fixedCost?.toLocaleString('vi-VN'),
            sellingPriceFormatted: Math.round((netPrice + (p.fixedCost / this.getMinPax(p.paxRange))))?.toLocaleString('vi-VN'),
          };
        });
      }
    });
  }

  startDate: string = new Date().toISOString().split('T')[0];
  endDate: string = (() => {
    const start = new Date(this.startDate);
    start.setFullYear(start.getFullYear() + 1);
    return start.toISOString().split('T')[0];
  })();

  formatPrice(index: number, field: 'fixedCostFormatted' | 'sellingPriceFormatted'): void {
    let value = this._prices[index][field].replace(/[^0-9\-]/g, '');
    const numericValue = parseInt(value, 10);

    if (!isNaN(numericValue)) {
      this._prices[index][field] = numericValue.toLocaleString('vi-VN');
    } else {
      this._prices[index][field] = '';
    }

    const fixedCost = parseInt(this._prices[index].fixedCostFormatted.replace(/[^0-9]/g, ''), 10) || 0;
    const netPrice = this.totalSellingPrice[this._prices[index].paxRange];
    const minPax = this.getMinPax(this._prices[index].paxRange);
    const sellingPrice = Math.round(netPrice + fixedCost / minPax);

    this.priceErrors[this._prices[index].paxRange] = sellingPrice < this.nettPricePerPax[this._prices[index].paxRange];
    console.log('priceErrors', this.priceErrors);
    console.log('priceErrors', sellingPrice);
    console.log('priceErrors', this.nettPricePerPax[this._prices[index].paxRange]);

    if (field === 'fixedCostFormatted') {
      const fixedCost = parseInt(this._prices[index].fixedCostFormatted.replace(/[^0-9]/g, ''), 10) || 0;
      const netPrice = this.totalSellingPrice[this._prices[index].paxRange];
      const minPax = this.getMinPax(this._prices[index].paxRange);
      const sellingPrice = Math.round(netPrice + fixedCost / minPax);
      this._prices[index].sellingPriceFormatted = sellingPrice.toLocaleString('vi-VN');

      this.costErrors[this._prices[index].paxRange] = fixedCost < 1;
      console.log('costErrors', this.costErrors);
    }
  }

  getMinPax(range: string): number {
    return parseInt(range.split('-')[0], 10);
  }

  getMaxPax(range: string): number {
    return parseInt(range.split('-')[1], 10);
  }

  costErrors: { [key: string]: boolean } = {};
  priceErrors: { [key: string]: boolean } = {};

  onConfirm(): void {
    const priceError = Object.values(this.priceErrors).some(err => err === true);
    if (priceError) {
      return;
    }

    const costError = Object.values(this.costErrors).some(err => err === true);
    if (costError) {
      return;
    }

    const parsedPrices: PaxOption[] = this._prices.map((p) => ({
      id: p.id,
      minPax: this.getMinPax(p.paxRange),
      maxPax: this.getMaxPax(p.paxRange),
      paxRange: p.paxRange,
      extraHotelCost: this.extraHotelCost[p.paxRange] || 0,
      nettPricePerPax: this.nettPricePerPax[p.paxRange] || 0,
      fixedCost: parseInt(p.fixedCostFormatted.replace(/[^0-9]/g, ''), 10) || 0,
      sellingPrice: parseInt(p.sellingPriceFormatted.replace(/[^0-9]/g, ''), 10) || 0,
      validFrom: new Date(this.startDate).toISOString(),
      validTo: new Date(this.endDate).toISOString(),
      tourId: this.tourId
    }));

    parsedPrices.forEach(price => {
      this.discountService.updatePrice(this.tourId, price)
        .subscribe({
          next: () => {
            console.log(`Updated price for paxId: ${price.id}`);
            this.confirm.emit(parsedPrices);
          },
          error: (err: any) => {
            console.error(`Failed to update paxId: ${price.id}`, err);
            this.error.emit(err);
          }
        });
    });
  }
}

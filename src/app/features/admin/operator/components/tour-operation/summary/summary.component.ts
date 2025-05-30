import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CurrencyVndPipe } from "../../../../../../shared/pipes/currency-vnd.pipe";
import { TourService } from '../../../services/tour.service';
import { ActivatedRoute } from '@angular/router';
import { SpinnerComponent } from "../../../../../../shared/components/spinner/spinner.component";

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    CurrencyVndPipe,
    SpinnerComponent
  ]
})
export class SummaryComponent implements OnInit {
  id: number | null = null;
  isLoading: boolean = false;
  totalCollect = {
    total: 0,
    companyCollect: 0,
    travelGuideCollect: 0,
    remain: 0
  };

  totalPaid = {
    total: 0,
    companyPaid: 0,
    travelGuidePaid: 0,
    remain: 0
  };

  summary = [
    { content: 'Đã thu', estimate: 0, summary: 0 },
    { content: 'Đã chi', estimate: 0, summary: 0 },
    { content: 'Lợi nhuận', estimate: 0, summary: 0 }
  ];

  constructor(
    private tourService: TourService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.id = params['id'];
      if (this.id) {
        this.fetchTourSummary(this.id);
      }
    });
  }

  fetchTourSummary(id: number): void {
    this.isLoading = true;
    this.tourService.getSummary(id).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.code === 200 && response.data) {
          const tourData = response.data;

          this.totalCollect = {
            total: parseFloat(tourData.totalReceiptAmount),
            companyCollect: parseFloat(tourData.receiptedAmount),
            travelGuideCollect: parseFloat(tourData.collectionAmount),
            remain: parseFloat(tourData.remainingReceiptAmount)
          };

          this.totalPaid = {
            total: parseFloat(tourData.totalPaymentAmount),
            companyPaid: parseFloat(tourData.paymentAmount),
            travelGuidePaid: parseFloat(tourData.advanceAmount),
            remain: parseFloat(tourData.remainingPaymentAmount)
          };

          const profit = parseFloat(tourData.actualProfitAmount);
          this.summary = [
            {
              content: 'Thu',
              estimate: parseFloat(tourData.estimateReceiptAmount),
              summary:
                parseFloat(tourData.receiptedAmount) + parseFloat(tourData.collectionAmount),
            },
            {
              content: 'Chi',
              estimate: parseFloat(tourData.estimatedPaymentAmount),
              summary:
                parseFloat(tourData.paymentAmount) + parseFloat(tourData.advanceAmount),
            },
            {
              content: 'Lợi nhuận',
              estimate: parseFloat(tourData.estimateProfitAmount),
              summary: profit,
            }
          ];
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error fetching tour summary:', error);
      }
    });
  }
}
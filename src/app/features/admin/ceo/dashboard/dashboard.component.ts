// src/app/components/dashboard/dashboard.component.ts
import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser, CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- Import FormsModule
import { NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { Color } from '@swimlane/ngx-charts';
import { CurrencyVndPipe } from "../../../../shared/pipes/currency-vnd.pipe"; // <-- Adjust path
// import { AdminService, DashboardData } from '../../admin.service';
import { FormatDatePipe } from "../../../../shared/pipes/format-date.pipe";
import { SpinnerComponent } from "../../../../shared/components/spinner/spinner.component";
import { AdminService, DashboardData } from '../../admin.service';

// Interfaces (ChartDataPoint, ChartSeries) remain the same
interface ChartDataPoint {
  name: string;
  value: number;
  }
  
  interface ChartSeries {
  name: string;
  series: ChartDataPoint[];
  }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // <-- Add FormsModule here
    NgxChartsModule,
    DatePipe,
    DecimalPipe,
    CurrencyVndPipe,
    FormatDatePipe,
    SpinnerComponent
],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CurrencyPipe, DatePipe, DecimalPipe] // Keep CurrencyPipe if used in TS logic, CurrencyVndPipe is used via template
})
export class DashboardComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);
  isLoading = true;
  apiError: string | null = null;
  dashboardData: DashboardData | null = null;

  // Date range properties
  fromDate: string = ''; // Will hold YYYY-MM-DD
  toDate: string = '';   // Will hold YYYY-MM-DD

  // Chart data and options (keep existing properties)
  revenueChartData: ChartSeries[] = [];
  newUserChartData: ChartDataPoint[] = [];
  tourTypeChartData: ChartDataPoint[] = [];

  chartColorScheme: Color = {
    name: 'travel-futuristic',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: [
      '#374F43', 
      '#25344F', 
      '#617891',
      '#D5B893',
      '#6F4D38', 
      '#632024',
      '#44576D', 
      '#768A96', 
      '#AAC7D8', 
    ]
  };  

  chartScaleType = ScaleType.Ordinal;
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  showYAxisLabel = true;
  xAxisLabelRevenue = 'Tháng';
  yAxisLabelRevenue = 'Doanh thu';
  xAxisLabelUsers = 'Tháng';
  yAxisLabelUsers = 'Người dùng mới';
  doughnut = true;
  showDataLabel = true;

  revenueChartView: [number, number] = [700, 400]; // Default/SSR size
  newUserChartView: [number, number] = [500, 300];
  tourTypeChartView: [number, number] = [300, 300];

  latestRevenue: number = 0;
  latestMonthStr: string = '';
  totalOnlineOfflineBookings: number = 0;

  constructor(
    private dashboardService: AdminService, // Use injected service
  ) {
  }

  ngOnInit(): void {
    this.isLoading = true; // Set loading state
    this.setDefaultDates(); // Set default dates first
    this.fetchData();       // Then fetch data for the default range

    // Adjust chart sizes only on browser AFTER initial render if needed
    if (isPlatformBrowser(this.platformId)) {
       // Consider if dynamically setting based on window is truly needed vs. responsive CSS/fixed sizes
       // Your existing logic:ce
       this.revenueChartView = [window.innerWidth * 0.73, window.innerHeight * 0.60];
       this.newUserChartView = [window.innerWidth * 0.33, window.innerHeight * 0.35];
       this.tourTypeChartView = [window.innerWidth * 0.3, window.innerHeight * 0.35];
       this.cdr.markForCheck(); // Reflect size changes if needed
    }
    this.isLoading = false; // Set loading state
  }

  // Helper to set default date range (1 year back from today)
  private setDefaultDates(): void {
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    this.toDate = this.formatDateISO(today);
    this.fromDate = this.formatDateISO(oneYearAgo);
  }

  // Helper to format date as YYYY-MM-DD
  private formatDateISO(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
    return `${year}-${month}`;
  }

  // Updated fetchData to use current date properties
  fetchData(): void {
    if (!this.fromDate || !this.toDate) {
        console.log("Dates not yet set, skipping fetch.");
        return;
    }
    
    // Thêm ngày vào `fromDate`
    const fromDateFormatted = `${this.fromDate}-01`;

    // Tính ngày cuối cùng của `toDate`
    const [year, month] = this.toDate.split('-').map(Number);
    const lastDay = new Date(year, month, 0).getDate(); // Ngày cuối tháng
    const toDateFormatted = `${this.toDate}-${lastDay}`;

    this.isLoading = true;
    this.apiError = null;
    this.cdr.markForCheck();

    this.dashboardService.getDashboardData(fromDateFormatted, toDateFormatted).subscribe({
        next: (response) => {
            if (response) {
                this.dashboardData = response.data;
                this.processDataForCharts(response.data);
                this.processOtherData(response.data);


                if (this.dashboardData && this.dashboardData.recentBookings) {
                  this.dashboardData.recentBookings = this.dashboardData.recentBookings.sort((a: any, b: any) => b.bookingId - a.bookingId);
                } else if (this.dashboardData) {
                  this.dashboardData.recentBookings = [];
                }


                this.isLoading = false;
            }
            this.cdr.markForCheck();
        },
        error: (err) => {
            console.error('Lỗi API:', err);
            this.apiError = 'Đã xảy ra lỗi khi lấy dữ liệu.';
            this.isLoading = false;
        }
    });
    
    this.isLoading = false;
}



  private processDataForCharts(data: DashboardData): void {
    this.isLoading = true; // Set loading state
    this.cdr.markForCheck(); // Mark for check to update UI
    const sortedRevenue = Array.isArray(data.monthlyRevenue) ? [...data.monthlyRevenue].sort((a, b) => a.year === b.year ? a.month - b.month : a.year - b.year) : [];
    this.revenueChartData = sortedRevenue.length > 0 ? [
      {
        name: 'Doanh thu',
        series: sortedRevenue.map(item => ({
          name: `${this.getMonthAbbreviation(item.month)} ${item.year}`,
          value: item.revenue
        }))
      }
    ] : []; // Assign empty array if no data


    const sortedUsers = [...data.monthlyNewUsers].sort((a, b) => a.year === b.year ? a.month - b.month : a.year - b.year);
    this.newUserChartData = sortedUsers.map(item => ({
      name: `${this.getMonthAbbreviation(item.month)} ${item.year}`,
      value: item.userCount
    })); // Assign empty array if no data


    const latestRatio = data.tourTypeRatios.length > 0 ? data.tourTypeRatios[0] : null;
    this.tourTypeChartData = latestRatio ? [
      { name: 'Hoàn thành', value: latestRatio.sicRatio },
      { name: 'Khởi tạo', value: latestRatio.privateRatio }
    ] : []; // Assign empty array if no data
    
    this.isLoading = false; // Set loading state
    this.cdr.markForCheck(); // Mark for check to update UI
 }


  private processOtherData(data: DashboardData): void {
    this.isLoading = true; // Set loading state
    this.cdr.markForCheck(); // Mark for check to update UI
    // Reset values
    this.latestRevenue = 0;
    this.latestMonthStr = 'N/A';
    this.totalOnlineOfflineBookings = 0;

    // Process only if data exists
    if (data.monthlyRevenue && data.monthlyRevenue.length > 0) {
       // Assuming API returns sorted descending, get the first (latest)
       const latestRevData = data.monthlyRevenue[0];
       this.latestRevenue = latestRevData.revenue;
       this.latestMonthStr = `${this.getMonthAbbreviation(latestRevData.month)} ${latestRevData.year}`;
    } else if (this.toDate) {
        // If no revenue data, show the end date of the selected range
        try {
           this.latestMonthStr = new Date(this.toDate).toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' });
        } catch (e) {
            this.latestMonthStr = 'N/A';
        }
    }

    // These numbers likely represent totals *within* the selected date range from the API
    this.totalOnlineOfflineBookings = (data.onlineBookingNumber ?? 0) + (data.offlineBookingNumber ?? 0);
    
    this.isLoading = false; // Set loading state
    this.cdr.markForCheck(); // Mark for check to update UI
 }


  // getMonthAbbreviation, formatters, onChartSelect remain the same...
   private getMonthAbbreviation(month: number): string {
    const date = new Date();
    date.setMonth(month - 1);
    return date.toLocaleString('vi-VN', { month: 'short' }); // Use Vietnamese locale
   }

   formatCurrencyAxisTick(value: any): string {
     if (typeof value === 'number') {
       if (value >= 1000000) return `${(value / 1000000).toFixed(1)}Tr`;
       if (value >= 1000) return `${(value / 1000).toFixed(0)}N`;
       return value.toString();
     }
     return value?.toString() ?? '';
   }

   formatPercentage(value: any): string {
     if (typeof value === 'number') {
       return `${value.toFixed(1)}%`; // Format percentage with 1 decimal place
     }
     return value?.toString() ?? '';
   }

   onChartSelect(event: any): void {
     console.log('Chart item selected:', event);
   }

}
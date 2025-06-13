import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ServiceBooking } from '../../core/models/service-booking.model';
import { BookingDetail,BookingStatusUpdateDTO } from './admin/admin.component';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}admin/bookings/list`; // Match BE endpoint

  constructor(private http: HttpClient) { }

  getBookings(page: number, size: number, bookingCode?: string, status?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (bookingCode) {
      params = params.set('bookingCode', bookingCode);
    }
    if (status) {
      params = params.set('paymentStatus', status);
    }

    return this.http.get<any>(this.apiUrl, { params });
  }
 
  getBookingDetail(bookingId: number): Observable<BookingDetail> {
    const url = `${environment.apiUrl}admin/bookings/detail/${bookingId}`;
    console.log('Requesting URL:', url);
    return this.http.get<{ code: number, message: string, status: number, data: BookingDetail }>(url).pipe(
      map(response => {
        console.log('Raw Response:', response); // Debug log
        return {
          bookingCode: response.data.bookingCode || '',
          customerName: response.data.customerName || '',
          status: response.data.status || '',
          hotelItems: response.data.hotelItems || [],
          mealItems: response.data.mealItems || [],
          activityItems: response.data.activityItems || []
        };
      })
    );
  }

  updateBookingStatus(dto: BookingStatusUpdateDTO): Observable<any> {
  return this.http.post(`${environment.apiUrl}admin/bookings/update-status`, dto);
}

}








// import { HttpClient, HttpParams } from "@angular/common/http";
// import { Observable, of } from "rxjs";
// import { Injectable } from "@angular/core";
// import { environment } from "../../../environments/environment";


// export interface DashboardData {
//     monthlyRevenue: { month: number; year: number; revenue: number }[];
//     monthlyNewUsers: { month: number; year: number; userCount: number }[];
//     tourTypeRatios: { month: number; year: number; sicRatio: number; privateRatio: number }[];
//     recentBookings: {
//         bookingId: number;
//         customerName: string;
//         tourName: string;
//         totalAmount: number | null;
//         bookingDate: string; // ISO date string
//     }[];
//     topRevenueTours: {
//         tourId: number;
//         tourName: string;
//         tourType: string;
//         totalRevenue: number;
//     }[];
//     cancelBookingNumber: number;
//     onlineBookingNumber: number;
//     offlineBookingNumber: number;
//     returnCustomerNumber: number;
// }

// export interface ApiResponse {
//     code: number;
//     message: string;
//     data: DashboardData;
//     status: number;
// }

// @Injectable({
//     providedIn: 'root',
// })


// export class AdminService {
//     constructor(private http: HttpClient) { }
//     uploadImage(formData: any): Observable<any> {
//         return this.http.post(`${environment.apiUrl}public/upload-file`, formData);
//     }

//     getDashboardData(fromDate?: string, toDate?: string): Observable<any> {
//         let params = new HttpParams();
//         if (fromDate) {
//           // Ensure the format matches what the API expects (YYYY-MM-DD)
//           params = params.set('fromDate', fromDate);
//         }
//         if (toDate) {
//           // Ensure the format matches what the API expects (YYYY-MM-DD)
//           params = params.set('toDate', toDate);
//         }

//         return this.http.get<any>(`${environment.apiUrl}ceo/dashboard`, { params });
//     }
// }
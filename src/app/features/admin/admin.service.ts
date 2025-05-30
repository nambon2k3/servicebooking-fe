import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";


export interface DashboardData {
    monthlyRevenue: { month: number; year: number; revenue: number }[];
    monthlyNewUsers: { month: number; year: number; userCount: number }[];
    tourTypeRatios: { month: number; year: number; sicRatio: number; privateRatio: number }[];
    recentBookings: {
        bookingId: number;
        customerName: string;
        tourName: string;
        totalAmount: number | null;
        bookingDate: string; // ISO date string
    }[];
    topRevenueTours: {
        tourId: number;
        tourName: string;
        tourType: string;
        totalRevenue: number;
    }[];
    cancelBookingNumber: number;
    onlineBookingNumber: number;
    offlineBookingNumber: number;
    returnCustomerNumber: number;
}

export interface ApiResponse {
    code: number;
    message: string;
    data: DashboardData;
    status: number;
}

@Injectable({
    providedIn: 'root',
})


export class AdminService {
    constructor(private http: HttpClient) { }
    uploadImage(formData: any): Observable<any> {
        return this.http.post(`${environment.apiUrl}public/upload-file`, formData);
    }

    getDashboardData(fromDate?: string, toDate?: string): Observable<any> {
        let params = new HttpParams();
        if (fromDate) {
          // Ensure the format matches what the API expects (YYYY-MM-DD)
          params = params.set('fromDate', fromDate);
        }
        if (toDate) {
          // Ensure the format matches what the API expects (YYYY-MM-DD)
          params = params.set('toDate', toDate);
        }

        return this.http.get<any>(`${environment.apiUrl}ceo/dashboard`, { params });
    }
}
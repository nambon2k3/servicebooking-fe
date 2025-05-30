import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { environment } from "../../../../../environments/environment";

@Injectable({
    providedIn: 'root',
})

export class BookingService {

    constructor(private http: HttpClient) { }

    getTourBookingByPage(
        page: number = 0,
        size: number = 10,
        keyword?: string,
        status?: string,
        sortField: string = 'createdAt',
        sortDirection: string = 'desc'
    ): Observable<any> {
        let params = new HttpParams()
            .set('page', page)
            .set('size', size)
            .set('status', status || '')
            .set('sortField', sortField)
            .set('sortDirection', sortDirection);

        if (keyword) {
            params = params.set('keyword', keyword);
        }

        return this.http.get(`${environment.apiUrl}salesman/bookings/list`, { params });
    }



    getBookingCustomers(tourBookingId: number) : Observable<any> {
        return this.http.get(`${environment.apiUrl}salesman/bookings/customers/list/${tourBookingId}`);
    }

    updateCustomerStatus(customerId: number) : Observable<any> {
        return this.http.post(`${environment.apiUrl}salesman/bookings/customers/change-status`, customerId);
    }


    updateCustomers(customerFormData: any) : Observable<any> {
        return this.http.post(`${environment.apiUrl}salesman/bookings/customers/update`, customerFormData);
    }

    getCustomers(searchName: string): Observable<any> {
        return this.http.get(`${environment.apiUrl}salesman/bookings/create/customers`, {
            params: { customerName: searchName }
        });
    }

    getToursPrivate(searchName: string): Observable<any> {
        return this.http.get(`${environment.apiUrl}salesman/tours/private/list`, {
            params: { name: searchName }
        });
    }

    getToursPrivateContent(tourId: number): Observable<any> {
        return this.http.get(`${environment.apiUrl}salesman/tours/private/details`, {
            params: { tourId: tourId }
        });
    }

    getLocations(): Observable<any> {
        return this.http.get(`${environment.apiUrl}salesman/tours/create/locations`);
    }


    createBooking(formData: any) {
        return this.http.post(`${environment.apiUrl}salesman/bookings/create`, formData);
    }

    getBookingService(tourBookingId: number): Observable<any> {
        return this.http.get(`${environment.apiUrl}salesman/bookings/services/${tourBookingId}`);
    }

    updateServiceQuantity(formData: any): Observable<any> {
        return this.http.post(`${environment.apiUrl}salesman/bookings/services/update-quantity`, formData);
    }

    cancelService(tourBookingId: number): Observable<any> {
        return this.http.post(`${environment.apiUrl}salesman/bookings/services/cancel-service`, tourBookingId);
    }

    sendCheckingAvailable(tourBookingId: number): Observable<any> {
        return this.http.post(`${environment.apiUrl}salesman/bookings/services/checking-available`, tourBookingId);
    }


    sendCheckingSICAvailable(tourBookingServiceId: number, newQuantity: number, reason: string): Observable<any> {
        return this.http.post(`${environment.apiUrl}salesman/bookings/services/checking-available`, {
            tourBookingServiceId: tourBookingServiceId,
            newQuantity: newQuantity,
            reason: reason
        });
    }

    sendCheckingAllAvailable(tourBookingId: number): Observable<any> {
        return this.http.post(`${environment.apiUrl}salesman/bookings/services/checking-available/all`, tourBookingId);
    }


    createPrivateTour(formData: any) {
        return this.http.post(`${environment.apiUrl}salesman/tours/create`, formData);
    }

    updateBookingStatus(bookingId: number, bookingStatus: any): Observable<any> {
        return this.http.post(`${environment.apiUrl}salesman/bookings/update-status`, {
            id: bookingId,
            bookingStatus: bookingStatus
        });

    }

    cancelBooking(formData: any): Observable<any> {
        return this.http.post(`${environment.apiUrl}salesman/bookings/cancel`, formData);
    }

    takeBooking(bookingId: number, saleId: number): Observable<any> {
        return this.http.post(`${environment.apiUrl}salesman/bookings/take-booking`, { bookingId, saleId });
    }


    createCustomer(formData: any) : Observable<any> {
        return this.http.post(`${environment.apiUrl}salesman/customers/create`, formData);
    }


    getForwardTourSchedules(tourId: Number, scheduleId: Number, seats: number) : Observable<any> {
        return this.http.post(`${environment.apiUrl}salesman/tours/forward/schedules`, {
            tourId: tourId,
            scheduleId: scheduleId,
            seats: seats
        });
    }

    getEmail(tourId: number, scheduleId:number) : Observable<any> {
        return this.http.post(`${environment.apiUrl}salesman/bookings/send-email`, {
            tourId: tourId,
            scheduleId: scheduleId
        });
    }

    sendEmail(formData: any) : Observable<any> {
        return this.http.post(`${environment.apiUrl}salesman/bookings/send-email/submit`, formData);
    }

    forwardBooking(bookingId: number, scheduleId: number) : Observable<any> {
        return this.http.post(`${environment.apiUrl}salesman/tours/forward`, {
            bookingId: bookingId,
            scheduleId: scheduleId
        });
    }



    updateStatus(tourBookingServiceId: number) {
        return this.http.post(`${environment.apiUrl}salesman/bookings/services/success-service`, tourBookingServiceId);
    }
}
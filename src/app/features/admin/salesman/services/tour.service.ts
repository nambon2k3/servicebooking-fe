import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { environment } from "../../../../../environments/environment";

@Injectable({
    providedIn: 'root',
})

export class TourService {

    constructor(private http: HttpClient) { }

    getTourByPage(
        page: number = 0,
        size: number = 10,
        keyword?: string,
        tourStatus?: string,
        sortField: string = 'createdAt',
        sortDirection: string = 'desc',
        tourType: string = 'SIC'
    ): Observable<any> {
        let params = new HttpParams()
            .set('page', page)
            .set('size', size)
            .set('tourType', tourType)
            .set('tourStatus', tourStatus || '')
            .set('sortField', sortField)
            .set('sortDirection', sortDirection);

        if (keyword) {
            params = params.set('keyword', keyword);
        }

        return this.http.get(`${environment.apiUrl}salesman/tours/list`, { params });
    }



    getListBooking(tourId: number, scheduleId?:number) : Observable<any> {
        const url = scheduleId 
            ? `${environment.apiUrl}salesman/tours/list-booking/${tourId}/${scheduleId}` 
            : `${environment.apiUrl}salesman/tours/list-booking/${tourId}`;

        return this.http.get(url);
    }


    getBookingDetail(tourBookingId: number) : Observable<any> {
        return this.http.get(`${environment.apiUrl}salesman/bookings/detail/${tourBookingId}`);
    }


    getTourDetail(tourId: number, scheduleId: number) : Observable<any> {
        return this.http.get(`${environment.apiUrl}salesman/bookings/create/tour/${tourId}/${scheduleId}`);
    }


    updateTourContent(formData: any) : Observable<any> {
        return this.http.post(`${environment.apiUrl}salesman/tours/private/update`, formData);
    }


    updateTourStatus(tourId: number, tourStatus: any) : Observable<any> {

        console.log({
            id: tourId,
            tourStatus: tourStatus
        })

        return this.http.post(`${environment.apiUrl}salesman/tours/private/change-status`, {
            id: tourId,
            tourStatus: tourStatus
        });
    }

    getServiceCategoriesWithTourDays(tourId: number): Observable<any> {
        return this.http.get(`${environment.apiUrl}salesman/tour-days/service-categories/list/${tourId}`);
    }

    getTourLocations(tourId: number): Observable<any> {
        return this.http.get(`${environment.apiUrl}salesman/tours/locations/${tourId}`);
    }
    

    updateTourServies(formData: any) : Observable<any> {
        return this.http.post(`${environment.apiUrl}salesman/tours/services`, formData);
    }

    sendPricing(tourId: number): Observable<any> {
        return this.http.post(`${environment.apiUrl}salesman/tours/send-pricing`, tourId );
    }

    sendOperator(tourId: number, tourScheduleId: number): Observable<any> {
        return this.http.post(`${environment.apiUrl}salesman/tours/send-operator`, {
            tourId: tourId,
            tourScheduleId: tourScheduleId
        });
    }

}
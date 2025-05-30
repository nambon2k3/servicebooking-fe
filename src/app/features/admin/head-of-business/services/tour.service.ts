import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TourService {
  constructor(private http: HttpClient) { }

  getTourByPage(
    page: number = 0,
    size: number = 10,
    keyword?: string,
    isDeleted?: boolean,
    isOpen?: boolean,
    sortBy: string = 'createdAt',
    sortDirection: string = 'desc'
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    if (keyword) {
      params = params.set('keyword', keyword);
    }
    if (isDeleted !== undefined) {
      params = params.set('isDeleted', isDeleted.toString());
    }
    if (isOpen !== undefined) {
      params = params.set('isOpen', isOpen.toString());
    }

    return this.http.get(`${environment.apiUrl}head-of-business/tour/list`, { params });
  }

  getTourById(id: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}head-of-business/tour/detail/${id}`);
  }

  getTourScheduleById(id: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}head-of-business/tour/detail-schedule/${id}`);
  }

  getTourDayById(tourId: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}head-of-business/tour/${tourId}/tour-days/list`);
  }

  updateTour(formData: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}head-of-business/tour/update/${formData.id}`, formData);
  }

  createTour(formData: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}head-of-business/tour/create`, formData);
  }

  getAllTags(): Observable<any> {
    return this.http.get(`${environment.apiUrl}head-of-business/tour/list-tag`);
  }

  createTourDay(tourId: string, formData: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}head-of-business/tour/${tourId}/tour-days/create`, formData);
  }

  updateTourDay(tourId: string, id: string, formData: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}head-of-business/tour/${tourId}/tour-days/update/${id}`, formData);
  }

  changeTourDayStatus(tourId: string, tourDayId: string, isDeleted: boolean): Observable<any> {
    const params = new HttpParams().set('isDeleted', isDeleted.toString());
    return this.http.put(`${environment.apiUrl}head-of-business/tour/${tourId}/tour-days/${tourDayId}/status`, params);
  }

  calculateEndDates(tourId: string, startDate: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}head-of-business/tour/schedule/calculate-end-dates/${tourId}`, { params: { startDate } });
  }

  getAvailableOperators(tourId: string, startDate: string, endDate: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}head-of-business/tour/schedule/available-operators`, { params: { tourId, startDate, endDate } });
  }

  getTourPax(tourId: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}head-of-business/tour/${tourId}/tour-pax`);
  }

  createTourSchedule(formData: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}head-of-business/tour/schedule/set`, formData);
  }

  updateTourSchedule(formData: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}head-of-business/tour/schedule/update`, formData);
  }

  cancelTourSchedule(scheduleId: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}head-of-business/tour/schedule/cancel/${scheduleId}`, {});
  }

  approveTour(tourId: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}head-of-business/tour/send-for-approval/${tourId}`, {});
  }

  closeTour(tourId: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}head-of-business/tour/change-to-pending-pricing/${tourId}`, {});
  }

  openPrivateTour(tourId: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}head-of-business/tour/open-tour/${tourId}`, {});
  }

  getTourBookingByPage(
    page: number = 0,
    size: number = 10,
    keyword?: string,
    isDeleted?: boolean,
    sortField: string = 'createdAt',
    sortDirection: string = 'desc'
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sortField', sortField)
      .set('sortDirection', sortDirection);

    if (keyword) {
      params = params.set('keyword', keyword);
    }
    if (isDeleted !== undefined) {
      params = params.set('isDeleted', isDeleted);
    }

    return this.http.get(`${environment.apiUrl}head-of-business/refund-request/list`, { params });
  }

  getTourBookingDetail(tourId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}head-of-business/refund-request/detail/${tourId}`);
  }

  approveRequest(tourId: number): Observable<any> {
    return this.http.put(`${environment.apiUrl}head-of-business/refund-request/approve/${tourId}`, {});
  }

  rejectRequest(tourId: number): Observable<any> {
    return this.http.put(`${environment.apiUrl}head-of-business/refund-request/reject/${tourId}`, {});
  }
}
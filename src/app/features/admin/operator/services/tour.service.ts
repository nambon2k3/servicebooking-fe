import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { get } from 'http';

@Injectable({
  providedIn: 'root'
})
export class TourService {

  constructor(private http: HttpClient) { }

  getTourByPage(
    page: number = 0,
    size: number = 10,
    keyword?: string,
    status?: boolean,
    orderDate: string = 'desc'
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('orderDate', orderDate);

    if (keyword) {
      params = params.set('keyword', keyword);
    }
    if (status !== undefined) {
      params = params.set('status', status);
    }

    return this.http.get(`${environment.apiUrl}operator/list-tour`, { params });
  }

  getTourPrivateByPage(
    page: number = 0,
    size: number = 10,
    keyword?: string,
    status?: boolean,
    orderDate: string = 'desc'
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('orderDate', orderDate);

    if (keyword) {
      params = params.set('keyword', keyword);
    }
    if (status !== undefined) {
      params = params.set('status', status);
    }

    return this.http.get(`${environment.apiUrl}operator/list-tour-private`, { params });
  }

  getTourById(id: number | null): Observable<any> {
    return this.http.get(`${environment.apiUrl}operator/tour-detail/${id}`);
  }

  operateTour(id: number | null): Observable<any> {
    return this.http.put(`${environment.apiUrl}operator/operate-tour/${id}`, {});
  }

  getTourCustomers(id: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}operator/tour-detail/${id}/list-customer`);
  }  

  getTourBookings(id: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}operator/tour-detail/${id}/list-booking`);
  }
  
  getLogs(id: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}operator/tour-detail/${id}/list-operation-log`);
  }

  getTransactions(id: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}operator/tour-detail/${id}/list-transaction`);
  }
  
  createLog(formData: any, id: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}operator/tour-detail/${id}/create-operation-log`, formData);
  }

  getListTourGuide(id: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}operator/tour-detail/${id}/list-available-tour-guide`);
  }

  assignTourGuide(id: number, formData: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}operator/tour-detail/${id}/assign-tour-guide`, formData);
  }

  deleteLog(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}operator/tour-detail/operation-log/change-status/${id}`);
  }

  getServices(id: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}operator/tour-detail/${id}/list-service`);
  }

  deleteService(id: number): Observable<any> {
    return this.http.put(`${environment.apiUrl}operator/cancel-service/${id}`, id);
  }

  previewEmail(payload: any) {
    return this.http.post(`${environment.apiUrl}operator/preview-mail`, payload);
  }

  sendOrder(formData: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}operator/send-mail-to-provider`, formData);
  }

  getSummary(id: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}operator/tour-detail/${id}/summary`);
  }

  getLocationsAndCategories(id: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}operator/tour-service/list-location-and-service-category/${id}`);
  }

  getServiceProviders(selectedLocationId: number, selectedCategoryId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}operator/tour-service/${selectedLocationId}/list-service-provider/${selectedCategoryId}`);
  }

  getServicesByProvider(providerId: number, selectedCategoryId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}operator/tour-service/${providerId}/list-service/${selectedCategoryId}`);
  }

  getServiceDetails(serviceId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}operator/tour-service/${serviceId}/service-detail`);
  }

  getListBooking(id: number | null): Observable<any> {
    return this.http.get(`${environment.apiUrl}operator/tour-service/${id}/list-booking`);
  }

  addServices(services: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}operator/add-service`, services);
  }

  updateServiceQuantity(formData: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}operator/update-service-quantity`, formData);
  }

  payService(formData: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}operator/pay-service`, formData);
  }

  sendTour(id: number): Observable<any> {
    return this.http.put(`${environment.apiUrl}operator/tours/send-accountant/${id}`, {});
  }

  getTourDays(id: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}operator/tour-detail/${id}/list-tour-day`);
  }
}
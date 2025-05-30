import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TourDiscountService {
  constructor(private http: HttpClient) {}

  getTourDiscount(id: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}head-of-business/tour/${id}/discount/list`);
  }

  getLocations(id : number,page: number = 0, size: number = 10, keyword: string = '', isDeleted: boolean = false, orderDate: string = 'desc'): Observable<any> {
    return this.http.get(`${environment.apiUrl}head-of-business/tour/${id}/discount/list-location`, {
      params: { page, size, keyword, isDeleted, orderDate }
    });
  }

  getServiceProviders(tourId: number, locationId: number, categoryName: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}head-of-business/tour/${tourId}/discount/providers`, {
      params: { tourId, locationId, categoryName }
    });
  }

  getFlightServiceProviders(tourId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}head-of-business/tour/${tourId}/discount/ticket-providers`, {
      params: { tourId }
    });
  }

  getServices(tourId: number, locationId: number, providerId: number, categoryName: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}head-of-business/tour/${tourId}/discount/provider/${providerId}/category/${categoryName}/location/${locationId}`);
  }

  getFlightServices(tourId: number, providerId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}head-of-business/tour/${tourId}/discount/ticket-provider/${providerId}`);
  }

  getServiceDetails(tourId: number, serviceId: number, dayNumber: number | null): Observable<any> {
    return this.http.get(`${environment.apiUrl}head-of-business/tour/${tourId}/discount/day/${dayNumber}/service/${serviceId}`);
  }

  getTourPaxById(id: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}head-of-business/tour/${id}/tour-pax`);
  }

  getTourPaxDetailById(id: number, paxId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}head-of-business/tour/${id}/tour-pax/detail/${paxId}`);
  }

  createTourPax(id: number, data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}head-of-business/tour/${id}/tour-pax/create`, data);
  }

  updateTourPax(id: number, paxId: number, data: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}head-of-business/tour/${id}/tour-pax/update/${paxId}`, data);
  }

  deleteTourPax(id: number, paxId: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}head-of-business/tour/${id}/tour-pax/${paxId}`);
  }

  addService(tourId: number, data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}head-of-business/tour/${tourId}/discount/create`, data);
  }

  updateService(tourId: number, serviceId: number, data: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}head-of-business/tour/${tourId}/discount/${serviceId}`, data);
  }

  deleteService(tourId: number, serviceId: number, dayNumber: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}head-of-business/tour/${tourId}/discount/remove/services/${serviceId}`, {
      params: { dayNumber: dayNumber }
    });
  }

  updatePrice(tourId: number, priceData: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}head-of-business/tour/${tourId}/price-configurations/manage`, priceData);
  }

  getPriceConfigurations(tourId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}head-of-business/tour/${tourId}/price-configurations/list`);
  }

  getMarkup(tourId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}head-of-business/tour/${tourId}/tour-pax/markup`);
  }

  updateMarkup(tourId: number, markupData: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}head-of-business/tour/${tourId}/tour-pax/update-markup`, markupData);
  }

  getTourDayById(tourId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}head-of-business/tour/${tourId}/tour-days/list`);
  }
}
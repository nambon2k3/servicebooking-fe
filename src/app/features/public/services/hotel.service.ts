import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, Hotel } from '../../../core/models/hotel.model';

@Injectable({
  providedIn: 'root'
})
export class HotelService {
  constructor(private http: HttpClient) { }

  getHotels(
    page: number,
    size: number,
    keyword?: string,
    star?: number,
    budgetTo?: number,
    budgetFrom?: number,
    sortBy?: string
  ): Observable<ApiResponse<Hotel>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (keyword) params = params.set('keyword', keyword);
    if (star !== undefined) params = params.set('star', star.toString());
    if (budgetTo !== undefined) params = params.set('budgetTo', budgetTo.toString());
    if (budgetFrom !== undefined) params = params.set('budgetFrom', budgetFrom.toString());
    if (sortBy) params = params.set('sortBy', sortBy);

    return this.http.get<ApiResponse<Hotel>>(`${environment.apiUrl}public/list-hotel`, { params });
  }


  getRestaurants(
    page: number,
    size: number,
    keyword?: string,
    star?: number,
    budgetTo?: number,
    budgetFrom?: number,
    sortBy?: string
  ): Observable<ApiResponse<Hotel>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (keyword) params = params.set('keyword', keyword);
    if (star !== undefined) params = params.set('star', star.toString());
    if (budgetTo !== undefined) params = params.set('budgetTo', budgetTo.toString());
    if (budgetFrom !== undefined) params = params.set('budgetFrom', budgetFrom.toString());
    if (sortBy) params = params.set('sortBy', sortBy);

    return this.http.get<ApiResponse<Hotel>>(`${environment.apiUrl}public/list-restaurant`, { params });
  }

  getHotelDetail(id: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}public/hotel-detail/${id}`);
  }

  getRestaurantDetail(id: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}public/restaurant-detail/${id}`);
  }

  getLocations(): Observable<any> {
    return this.http.get(`${environment.apiUrl}public/list-location`);
  }

  addRoom(roomId: number, userId: number, quantity: number = 1): Observable<any> {
    return this.http.post(`${environment.apiUrl}public/cart/add`, {
      userId: userId,
      serviceId: roomId,
      quantity: quantity
    });
  }


}
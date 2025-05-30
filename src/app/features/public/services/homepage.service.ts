import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '../../../core/models/homepage.model';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HomepageService {

  constructor(private http: HttpClient) { }

  getHomepageData(numberTour: number, numberBlog: number, numberActivity: number, numberLocation: number): Observable<ApiResponse> {
    let params = new HttpParams()
      .set('numberTour', numberTour)
      .set('numberBlog', numberBlog)
      .set('numberActivity', numberActivity)
      .set('numberLocation', numberLocation);
    return this.http.get<ApiResponse>(`${environment.apiUrl}public/homepage`, { params });
  }

  getListLocation(): Observable<any> {
    return this.http.get(`${environment.apiUrl}public/list-location`);
  }

  getWishlist(): Observable<any> {
    return this.http.get(`${environment.apiUrl}wishlist/list-wishlist`);
  }

  deleteWishlist(wishlistId: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}wishlist/delete-wishlist?wishlistId=${wishlistId}`);
  }

  addWishlist(itemId: number): Observable<any> {
    return this.http.put(`${environment.apiUrl}wishlist/add-wishlist?itemId=${itemId}`, {});
  }

  searchTours(keyword: string): Observable<any> {
    const params = { keyword };
    return this.http.get(`${environment.apiUrl}public/search`, { params });
  }
}

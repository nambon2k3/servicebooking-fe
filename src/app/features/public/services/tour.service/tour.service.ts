import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TourService {
  constructor(private http: HttpClient) { }

  getTours(
    page: number,
    size: number,
    keyword?: string,
    budgetFrom?: number,
    budgetTo?: number,
    duration?: number,
    fromDate?: Date,
    departLocationId?: number
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (keyword) params = params.set('keyword', keyword);
    if (budgetFrom !== undefined) params = params.set('budgetFrom', budgetFrom.toString());
    if (budgetTo !== undefined) params = params.set('budgetTo', budgetTo.toString());
    if (duration !== undefined) params = params.set('duration', duration.toString());
    if (fromDate) params = params.set('fromDate', fromDate.toISOString().split('T')[0]);
    if (departLocationId) params = params.set('departLocationId', departLocationId);

    return this.http.get(`${environment.apiUrl}public/list-tour`, { params });
  }

  getLocations(): Observable<any> {
    return this.http.get(`${environment.apiUrl}public/list-location`);
  }
}
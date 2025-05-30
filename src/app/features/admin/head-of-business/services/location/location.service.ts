import { Injectable } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  constructor(private http: HttpClient) { }

  getLocationByPage(
    page: number = 0,
    size: number = 10,
    keyword?: string,
    isDeleted?: boolean,
    orderDate: string = 'desc'
): Observable<any> {
    let params = new HttpParams()
        .set('page', page)
        .set('size', size)
        .set('orderDate', orderDate)

    if (keyword) {
        params = params.set('keyword', keyword);
    }
    if (isDeleted !== undefined) {
        params = params.set('isDeleted', isDeleted);
    }

    return this.http.get(`${environment.apiUrl}head-business/location/list`, { params });
}


  getLocationById(id: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}head-business/location/details/${id}`);
  }

  updateLocation(formData: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}head-business/location/update/${formData.id}`, formData);
  }

  createLocation(formData: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}head-business/location`, formData);
  }

  deleteLocation(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}head-business/location/change-status/${id}` + '?isDeleted=true');
  }

  recoverLocation(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}head-business/location/change-status/${id}` + '?isDeleted=false');
  }
}

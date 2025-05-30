import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TourService {

  constructor(private http: HttpClient) { }

  getListSettlementTourSchedule(
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
    return this.http.get(`${environment.apiUrl}accountant/tour-schedules/list-settlements`, { params });
  }



  getSettlementDetails(id: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}accountant/settlements/details`, { params: { tourScheduleId: id } });
  } 


  finishSettlement(tourScheduleId: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}accountant/settlements/finish`, tourScheduleId);
  }

}

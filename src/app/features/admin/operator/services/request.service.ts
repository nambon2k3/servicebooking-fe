import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RequestService {

  constructor(private http: HttpClient) { }

  getRequestByPage(
    page: number = 0,
    size: number = 10,
    keyword?: string,
    isDeleted?: boolean,
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)

    if (keyword) {
      params = params.set('keyword', keyword);
    }
    if (isDeleted !== undefined) {
      params = params.set('isDeleted', isDeleted);
    }

    return this.http.get(`${environment.apiUrl}operator/list-service-request`, { params });
  }

  updateRequestStatus(id : number): Observable<any> {
    return this.http.put(`${environment.apiUrl}operator/approve-service-request/${id}`, {});
  }

  rejectRequest(id : number): Observable<any> {
    return this.http.put(`${environment.apiUrl}operator/reject-service-request/${id}`, {});
  }

  getRequestDetail(id: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}operator/change-service-request-detail/${id}`);
  }
}

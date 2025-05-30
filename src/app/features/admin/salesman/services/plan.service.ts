import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlanService {


  constructor(private http: HttpClient) { }

  getPlansByUserId(userId: number): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}public/plans/list/${userId}`);
  }


  getPlanByPage(
    page: number = 0,
    size: number = 10,
    sortField: string,
    sortDirection: string = 'desc',
    keyword: string = '',
    planStatus: string = ''
  ): Observable<any> {


    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('keyword', keyword)
      .set('planStatus', planStatus)
      .set('sortField', sortField)
      .set('sortDirection', sortDirection);

    console.log(params.toString())


    return this.http.get(`${environment.apiUrl}salesman/plans/list`, { params });
  }


}
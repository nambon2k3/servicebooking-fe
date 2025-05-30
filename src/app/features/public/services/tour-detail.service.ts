import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '../../../core/models/homepage.model';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TourDetailService {

  constructor(private http: HttpClient) { }

  getTourDetails(id: number): Observable<any> {
    return this.http.get<any[]>(`${environment.apiUrl}public/tour-detail/${id}`);
  }
}
 
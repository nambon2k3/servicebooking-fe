import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Activity } from '../../../core/models/activity.model';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  constructor(private http: HttpClient) { }

  getAllActivity(
    page: number,
    size: number,
    keyword?: string,
    budgetFrom?: number,
    budgetTo?: number
  ): Observable<{ data: { items: Activity[]; total: number } }> { // Changed Blog to Activity
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (keyword) {
      params = params.set('keyword', keyword);
    }
    if (budgetFrom !== undefined && budgetFrom !== null) {
      params = params.set('budgetFrom', budgetFrom.toString());
    }
    if (budgetTo !== undefined && budgetTo !== null) {
      params = params.set('budgetTo', budgetTo.toString());
    }

    return this.http.get<{ data: { items: Activity[]; total: number } }>( // Changed Blog to Activity
      `${environment.apiUrl}public/list-activity`,
      { params }
    );
  }
}
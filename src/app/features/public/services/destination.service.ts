import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Locations } from '../../../core/models/location.model';

@Injectable({
  providedIn: 'root'
})
export class DestinationService {

  constructor(private http: HttpClient) { }

  getDestinationById(id: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}public/location-detail/${id}`);
  }
}

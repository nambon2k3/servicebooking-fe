import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserStorageService } from '../../../core/services/user-storage/user-storage.service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {

  constructor(private http: HttpClient, private userStorageService: UserStorageService) { }

  getUserProfile(): Observable<any> {
    return this.http.get<any>(environment.apiUrl + 'user-profile');
  }  

  updateUserProfile(userId: string, profileData: any): Observable<any> {
    return this.http.post(`${environment.apiUrl + 'user-profile/update'}/${userId}`, profileData);
  }

  changeAvatar(userId: string | null, avatar: FormData): Observable<any> {
    return this.http.post(`${environment.apiUrl}user-profile/avatar/${userId}`, avatar);
  }

  getHistoryBooking(
      page: number = 0,
      size: number = 10,
      keyword?: string,
      paymentStatus?: string,
      orderDate: string = 'desc'
    ): Observable<any> {
      let params = new HttpParams()
        .set('page', page)
        .set('size', size)
        .set('orderDate', orderDate);
      
      if (paymentStatus && paymentStatus.trim() !== '') {
        params = params.set('paymentStatus', paymentStatus);
      }
  
      if (keyword && keyword.trim() !== '') {
        params = params.set('keyword', keyword);
      }
  
      return this.http.get(`${environment.apiUrl}booking-history/list`, { params });
    }
}

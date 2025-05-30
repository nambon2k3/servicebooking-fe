import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CommonService {

  constructor(private http: HttpClient) { }

  forgotPassword(email: any): Observable<any> {
    return this.http.post(environment.apiUrl + 'forgot-password', email);
  }

  resetPassword(token: string, email: string, password: any) {
    return this.http.put(`${environment.apiUrl}reset-password?token=${token}&email=${email}`, password);
  }
  
  changePassword(passwordData: any): Observable<any> {
    return this.http.post(environment.apiUrl + 'user-profile/change-password', passwordData);
  }
}
